import express from "express";
import {
    calculateETA,
    createReservation,
    checkInArrival,
    getReservationsByArea,
    getActiveReservationForUser,
    payReservationPenalty,
    getPendingPenalty,
    getMissedReservations,
    getAllExpiredReservations
} from "../controllers/reservationController.js";

const router = express.Router();

router.get("/calculate-eta", calculateETA);
router.post("/create", createReservation);
router.post("/check-in", checkInArrival);
router.get("/area/:areaId", getReservationsByArea);
router.get("/user/:userId", getActiveReservationForUser);
router.post("/pay-penalty", payReservationPenalty);
router.get("/pending-penalty/:userId", getPendingPenalty);
router.get("/missed/:userId", getMissedReservations);
router.get("/all-expired", getAllExpiredReservations);

export default router;
