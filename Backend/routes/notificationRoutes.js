import express from "express";
import { sendWarningEmail, sendPenaltyEmail } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/send-warning", sendWarningEmail);
router.post("/send-penalty", sendPenaltyEmail);

export default router;
