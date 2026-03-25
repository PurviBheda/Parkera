import express from "express";
import { sendWarningEmail, sendPenaltyEmail, sendTestEmail } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/send-warning", sendWarningEmail);
router.post("/send-penalty", sendPenaltyEmail);
router.get("/test-email", sendTestEmail); // GET for easy testing via browser

export default router;
