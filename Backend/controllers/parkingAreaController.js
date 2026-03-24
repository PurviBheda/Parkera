import ParkingArea from "../models/ParkingArea.js";

// GET ALL
export const getParkingAreas = async (req, res) => {
    try {
        const areas = await ParkingArea.find();
        res.status(200).json(areas);
    } catch (error) {
        console.log("GET PARKING AREAS ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ADD NEW LOT
export const addParkingArea = async (req, res) => {
    try {
        const { name, address, lat, lng, rating, pricePerHour, totalSlots, availableSlots } = req.body;

        const newArea = new ParkingArea({
            name, address, lat, lng, rating, pricePerHour, totalSlots, availableSlots
        });

        await newArea.save();
        res.status(201).json({ message: "Parking Area added successfully", area: newArea });
    } catch (error) {
        console.log("ADD PARKING AREA ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// DELETE LOT
export const deleteParkingArea = async (req, res) => {
    try {
        const { id } = req.params;
        await ParkingArea.findByIdAndDelete(id);
        res.status(200).json({ message: "Parking Area deleted successfully" });
    } catch (error) {
        console.log("DELETE PARKING AREA ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
