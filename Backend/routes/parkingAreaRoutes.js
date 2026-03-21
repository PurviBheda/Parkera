import express from "express";
import { getParkingAreas, addParkingArea, deleteParkingArea } from "../controllers/parkingAreaController.js";

const router = express.Router();

router.get("/", getParkingAreas);
router.post("/", addParkingArea);
router.delete("/:id", deleteParkingArea);

export default router;
