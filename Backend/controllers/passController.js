import ParkingPass from "../models/ParkingPass.js";
import { sendPassReceiptEmailInternal } from "./notificationController.js";

// @route   GET /api/passes/slots
// @desc    Get all reserved slots for a specific area to show availability on frontend
export const getReservedSlots = async (req, res) => {
    try {
        const { areaId } = req.query;
        let query = { status: "active" };
        if (areaId) {
            query.areaId = areaId;
        }

        // Fetch all active passes and return their slotIds
        const activePasses = await ParkingPass.find(query);
        const reservedSlots = activePasses.map(pass => pass.slotId);
        res.status(200).json({ reservedSlots });
    } catch (error) {
        console.error("GET RESERVED SLOTS ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @route   POST /api/passes/purchase
// @desc    Purchase a new parking pass
export const purchasePass = async (req, res) => {
    try {
        const { userId, userEmail, areaId, areaName, slotId, passType, price, durationDays } = req.body;

        // Check if slot is already reserved in that area
        const existingPass = await ParkingPass.findOne({ areaId, slotId, status: "active" });
        if (existingPass) {
            return res.status(400).json({ message: "Slot is already reserved by another pass in this area." });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + durationDays);

        const newPass = new ParkingPass({
            userId,
            userEmail,
            areaId,
            areaName,
            slotId,
            passType,
            price,
            startDate,
            endDate,
            status: "active"
        });

        const finalEmail = userEmail || userId;
        await newPass.save();

        // Send Email Receipt Async
        if (finalEmail) {
            setImmediate(() => {
                sendPassReceiptEmailInternal(finalEmail, passType, price, slotId, startDate, endDate)
                    .catch(err => console.error("📧 Background Pass Email Error:", err));
            });
        }

        res.status(201).json({ message: "Parking pass purchased successfully!", pass: newPass });
    } catch (error) {
        console.error("PURCHASE PASS ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @route   GET /api/passes/my-pass/:userId
// @desc    Get active parking pass for user
export const getUserPass = async (req, res) => {
    try {
        const { userId } = req.params;
        const activePass = await ParkingPass.findOne({ userId, status: "active" });

        res.status(200).json({ pass: activePass || null });
    } catch (error) {
        console.error("GET USER PASS ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @route   GET /api/passes/all
// @desc    Get all parking passes (for admin panel)
export const getAllPasses = async (req, res) => {
    try {
        const passes = await ParkingPass.find().sort({ createdAt: -1 });
        res.status(200).json({ passes });
    } catch (error) {
        console.error("GET ALL PASSES ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};
