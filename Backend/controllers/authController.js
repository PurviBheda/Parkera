import User from "../models/User.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

/* ================= SEND OTP ================= */
export const sendOTP = async (req, res) => {
  try {

    console.log("sendOTP API called");
    console.log("Request Body:", req.body);

    const { name, email, password, phone, vehicle } = req.body;

    // Check if user already exists based on email
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if phone or vehicle is already registered
    const duplicateUser = await User.findOne({
      $or: [{ phone }, { vehicle }],
    });

    if (duplicateUser && duplicateUser.email !== email) {
      return res.status(400).json({ message: "This number is already registered" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save or update user with OTP
    const user = await User.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password: hashedPassword,
        phone,
        vehicle,
        otp,
        otpExpire: Date.now() + 5 * 60 * 1000, // 5 minutes
        isVerified: false,
        role: email === "admin@parkera.com" ? "admin" : "user",
      },
      { upsert: true, new: true }
    );

    /* ================= NODEMAILER ================= */

    console.log("EMAIL USER:", process.env.EMAIL_USER);
    console.log("EMAIL PASS:", process.env.EMAIL_PASS ? "Loaded" : "Not Loaded");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Parkera" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code - Parkera",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    console.log("✅ OTP Email Sent To:", email);

    res.status(200).json({ message: "OTP sent to your email" });

  } catch (error) {
    console.log("SEND OTP ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= VERIFY OTP ================= */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Account verified successfully" });

  } catch (error) {
    console.log("VERIFY OTP ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email via OTP before logging in." });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Success response
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        profilePhotos: user.profilePhotos || [],
        activePhoto: user.activePhoto || null,
      },
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= GET ALL USERS (ADMIN) ================= */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpire");
    res.status(200).json(users);
  } catch (error) {
    console.log("GET ALL USERS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= UPDATE USER NAME ================= */
export const updateUserName = async (req, res) => {
  try {
    const { userId, name } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name;
    await user.save();

    res.status(200).json({ message: "Name updated successfully", name: user.name });
  } catch (error) {
    console.log("UPDATE NAME ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= UPLOAD PROFILE PHOTO ================= */
export const uploadProfilePhoto = async (req, res) => {
  try {
    const { userId, photo } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profilePhotos.length >= 3) {
      return res.status(400).json({ message: "You can only keep up to 3 profile photos. Remove one to upload a new photo." });
    }

    user.profilePhotos.push(photo);
    user.activePhoto = photo;
    await user.save();

    res.status(200).json({
      message: "Photo uploaded successfully",
      profilePhotos: user.profilePhotos,
      activePhoto: user.activePhoto,
    });
  } catch (error) {
    console.log("UPLOAD PHOTO ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= REMOVE PROFILE PHOTO ================= */
export const removeProfilePhoto = async (req, res) => {
  try {
    const { userId, photoIndex } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (photoIndex < 0 || photoIndex >= user.profilePhotos.length) {
      return res.status(400).json({ message: "Invalid photo index" });
    }

    const removedPhoto = user.profilePhotos[photoIndex];
    user.profilePhotos.splice(photoIndex, 1);

    // If removed photo was the active one, switch to first remaining or null
    if (user.activePhoto === removedPhoto) {
      user.activePhoto = user.profilePhotos.length > 0 ? user.profilePhotos[0] : null;
    }

    await user.save();

    res.status(200).json({
      message: "Photo removed successfully",
      profilePhotos: user.profilePhotos,
      activePhoto: user.activePhoto,
    });
  } catch (error) {
    console.log("REMOVE PHOTO ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= SET ACTIVE PHOTO ================= */
export const setActivePhoto = async (req, res) => {
  try {
    const { userId, photoIndex } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (photoIndex < 0 || photoIndex >= user.profilePhotos.length) {
      return res.status(400).json({ message: "Invalid photo index" });
    }

    user.activePhoto = user.profilePhotos[photoIndex];
    await user.save();

    res.status(200).json({
      message: "Active photo updated",
      profilePhotos: user.profilePhotos,
      activePhoto: user.activePhoto,
    });
  } catch (error) {
    console.log("SET ACTIVE PHOTO ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
