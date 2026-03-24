import express from "express";
import { sendOTP, verifyOTP, login, getAllUsers, updateUserName, uploadProfilePhoto, removeProfilePhoto, setActivePhoto } from "../controllers/authController.js";

const router = express.Router();

/* ================= SEND OTP ================= */
router.post("/send-otp", sendOTP);

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", verifyOTP);

/* ================= LOGIN ================= */
router.post("/login", login);

/* ================= USERS (ADMIN) ================= */
router.get("/users", getAllUsers);

/* ================= PROFILE ================= */
router.put("/update-name", updateUserName);
router.post("/profile-photo/upload", uploadProfilePhoto);
router.post("/profile-photo/remove", removeProfilePhoto);
router.put("/profile-photo/set-active", setActivePhoto);

export default router;
