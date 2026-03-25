import User from "../models/User.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/emailService.js";

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

    /* ================= EMAIL OTP ================= */

    const subject = "Your OTP Code - Parkera";
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background-color: #6366f1; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; color: white;">
                <h1 style="margin: 0; font-size: 24px;">Email Verification</h1>
            </div>
            <div style="padding: 20px; color: #1e293b; line-height: 1.6;">
                <p>Hello,</p>
                <p>To complete your registration at <strong>Parkera</strong>, please use the following One-Time Password (OTP):</p>
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <h1 style="margin: 0; letter-spacing: 5px; color: #6366f1; font-size: 32px;">${otp}</h1>
                </div>
                <p style="color: #64748b; font-size: 14px;">This OTP will expire in <strong>5 minutes</strong>. If you did not request this code, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="text-align: center; font-size: 12px; color: #94a3b8;">&copy; 2026 Parkera Team. All rights reserved.</p>
            </div>
        </div>
    `;

    await sendEmail(email, subject, html);
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
