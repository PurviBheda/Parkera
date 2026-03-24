// routes/bookingRoutes.js

import express from "express";
import { confirmExit, createBooking, addFeedback, getBookingHistory, getAllBookings, payBookingPenalty } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/all", getAllBookings);
router.post("/confirm-exit", confirmExit);
router.post("/pay-penalty", payBookingPenalty);
router.post("/feedback", addFeedback);
router.get("/history/:userId", getBookingHistory);

export default router;
