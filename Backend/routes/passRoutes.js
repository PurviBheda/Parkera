import express from "express";
import { getReservedSlots, purchasePass, getUserPass, getAllPasses } from "../controllers/passController.js";

const router = express.Router();

router.get("/slots", getReservedSlots);
router.get("/all", getAllPasses);
router.post("/purchase", purchasePass);
router.get("/my-pass/:userId", getUserPass);

export default router;
