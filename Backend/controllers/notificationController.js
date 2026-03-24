import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendWarningEmail = async (req, res) => {
  try {
    const { email, areaName, slotId, vehicleType, paidAmount, entryTime, expectedExit } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const transporter = createTransporter();
    const duration = entryTime && expectedExit
      ? `${new Date(entryTime).toLocaleTimeString()} — ${new Date(expectedExit).toLocaleTimeString()}`
      : "N/A";

    await transporter.sendMail({
      from: `"Parkera" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "⚠️ Parking Time Almost Up - Parkera",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #EAB308; text-align: center;">Parking Time Alert</h2>
          <p>Hello,</p>
          <p>This is a quick reminder from <strong>Parkera</strong> that your parking session is about to expire.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EAB308;">
            <p><strong>Parking Lot:</strong> ${areaName || "N/A"}</p>
            <p><strong>Slot:</strong> ${slotId || "N/A"}</p>
            <p><strong>Vehicle:</strong> ${vehicleType || "N/A"}</p>
            <p><strong>Amount Paid:</strong> ₹${paidAmount || 0}</p>
            <p><strong>Duration:</strong> ${duration}</p>
            <p style="color: red; font-weight: bold; font-size: 18px;">Time Remaining: ~5 Minutes</p>
          </div>
          <p>Please return to your vehicle or extend your session to avoid late penalties (₹2 per minute).</p>
          <p>Thank you for using Parkera!</p>
        </div>
      `,
    });

    console.log("✅ Warning Email Sent To:", email);
    res.status(200).json({ message: "Warning email sent successfully" });

  } catch (error) {
    console.error("SEND WARNING EMAIL ERROR:", error);
    res.status(500).json({ message: "Failed to send warning email" });
  }
};

export const sendPenaltyEmail = async (req, res) => {
  try {
    const { email, areaName, slotId, vehicleType, paidAmount, entryTime, expectedExit } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const transporter = createTransporter();
    const duration = entryTime && expectedExit
      ? `${new Date(entryTime).toLocaleTimeString()} — ${new Date(expectedExit).toLocaleTimeString()}`
      : "N/A";

    await transporter.sendMail({
      from: `"Parkera" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🚨 Late Penalty Applied - Parkera",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: red; text-align: center;">Penalty Active</h2>
          <p>Hello,</p>
          <p>Your parking session has officially expired and a late penalty is now active.</p>
          <div style="background: #fff5f5; border-left: 4px solid red; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Parking Lot:</strong> ${areaName || "N/A"}</p>
            <p><strong>Slot:</strong> ${slotId || "N/A"}</p>
            <p><strong>Vehicle:</strong> ${vehicleType || "N/A"}</p>
            <p><strong>Amount Paid:</strong> ₹${paidAmount || 0}</p>
            <p><strong>Duration:</strong> ${duration}</p>
            <p style="color: red; font-weight: bold; font-size: 16px;">Penalty: ₹2 per minute</p>
          </div>
          <p>Please return to your vehicle immediately to end your session, or you will continue to be charged.</p>
          <p>Thank you.</p>
        </div>
      `,
    });

    console.log("✅ Penalty Email Sent To:", email);
    res.status(200).json({ message: "Penalty email sent successfully" });

  } catch (error) {
    console.error("SEND PENALTY EMAIL ERROR:", error);
    res.status(500).json({ message: "Failed to send penalty email" });
  }
};

// ==========================================
// INTERNAL EMAIL FUNCTIONS (For Cron Jobs)
// ==========================================

export const sendBookingConfirmationInternal = async (email, areaName, slotId, vehicleType, startTime, endTime) => {
  try {
    if (!email) return;
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Parkera" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Booking Confirmed - Parkera",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4CAF50; text-align: center;">Booking Confirmed!</h2>
          <p>Hello,</p>
          <p>Thank you for booking with Parkera. Your parking slot has been successfully reserved.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <p><strong>Location:</strong> ${areaName}</p>
            <p><strong>Slot:</strong> ${slotId}</p>
            <p><strong>Vehicle:</strong> ${vehicleType}</p>
            <p><strong>Start Time:</strong> ${new Date(startTime).toLocaleString()}</p>
            <p><strong>Expected Exit:</strong> ${new Date(endTime).toLocaleString()}</p>
          </div>
          <p>Please ensure you exit before your expected time to avoid dynamic late penalties.</p>
          <p>Safe Travels,<br>The Parkera Team</p>
        </div>
      `,
    });
    console.log("✅ Confirmation Email Sent To:", email);
  } catch (error) {
    console.error("CONFIRMATION EMAIL ERROR (Internal):", error);
  }
};

export const sendWarningEmailInternal = async (email, bookingInfo) => {
  try {
    if (!email) return;
    const transporter = createTransporter();
    const { areaName, slotId, vehicleType, paidAmount, entryTime, expectedExit } = bookingInfo;
    const duration = entryTime && expectedExit
      ? `${new Date(entryTime).toLocaleTimeString()} — ${new Date(expectedExit).toLocaleTimeString()}`
      : "N/A";

    await transporter.sendMail({
      from: `"Parkera" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "⚠️ Parking Time Almost Up - Parkera",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #EAB308; text-align: center;">Parking Time Alert</h2>
          <p>Hello,</p>
          <p>This is a quick reminder from <strong>Parkera</strong> that your parking session is about to expire.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EAB308;">
             <p><strong>Parking Lot:</strong> ${areaName || "N/A"}</p>
             <p><strong>Slot:</strong> ${slotId || "N/A"}</p>
             <p><strong>Vehicle:</strong> ${vehicleType || "N/A"}</p>
             <p><strong>Amount Paid:</strong> ₹${paidAmount || 0}</p>
             <p><strong>Duration:</strong> ${duration}</p>
             <p style="color: red; font-weight: bold; font-size: 18px;">Time Remaining: ~5 Minutes</p>
          </div>
          <p>Please return to your vehicle or extend your session to avoid late penalties (₹2 per minute).</p>
          <p>Thank you for using Parkera!</p>
        </div>
      `,
    });
    console.log("✅ Warning Email Sent To:", email);
  } catch (error) {
    console.error("WARNING EMAIL ERROR (Internal):", error);
  }
};

export const sendPenaltyEmailInternal = async (email, bookingInfo) => {
  try {
    if (!email) return;
    const transporter = createTransporter();
    const { areaName, slotId, vehicleType, paidAmount, entryTime, expectedExit } = bookingInfo;
    const duration = entryTime && expectedExit
      ? `${new Date(entryTime).toLocaleTimeString()} — ${new Date(expectedExit).toLocaleTimeString()}`
      : "N/A";

    await transporter.sendMail({
      from: `"Parkera" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🚨 Late Penalty Applied - Parkera",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: red; text-align: center;">Penalty Active</h2>
          <p>Hello,</p>
          <p>Your parking session has officially expired and a late penalty is now active.</p>
          <div style="background: #fff5f5; border-left: 4px solid red; padding: 15px; border-radius: 8px; margin: 20px 0;">
             <p><strong>Parking Lot:</strong> ${areaName || "N/A"}</p>
             <p><strong>Slot:</strong> ${slotId || "N/A"}</p>
             <p><strong>Vehicle:</strong> ${vehicleType || "N/A"}</p>
             <p><strong>Amount Paid:</strong> ₹${paidAmount || 0}</p>
             <p><strong>Duration:</strong> ${duration}</p>
             <p style="color: red; font-weight: bold; font-size: 16px;">Penalty: ₹2 per minute</p>
          </div>
           <p>Please return to your vehicle immediately to end your session, or you will continue to be charged.</p>
           <p>Thank you.</p>
        </div>
      `,
    });
    console.log("✅ Penalty Email Sent To:", email);
  } catch (error) {
    console.error("PENALTY EMAIL ERROR (Internal):", error);
  }
};

export const sendPassReceiptEmailInternal = async (email, passType, price, slotId, startDate, endDate) => {
  try {
    if (!email) return;
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Parkera" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎫 Parking Pass Receipt - Parkera",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #EAB308; text-align: center;">Parking Pass Reserved!</h2>
          <p>Hello,</p>
          <p>Thank you for purchasing a reserved parking pass with Parkera.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EAB308;">
            <p><strong>Pass Type:</strong> ${passType}</p>
            <p><strong>Reserved Slot:</strong> ${slotId}</p>
            <p><strong>Amount Paid:</strong> ₹${price}</p>
            <p><strong>Valid From:</strong> ${new Date(startDate).toLocaleDateString()}</p>
            <p><strong>Valid Until:</strong> ${new Date(endDate).toLocaleDateString()}</p>
          </div>
          <p>Your slot is now exclusively reserved for you until the pass expires.</p>
          <p>Safe Travels,<br>The Parkera Team</p>
        </div>
      `,
    });
    console.log("✅ Pass Receipt Email Sent To:", email);
  } catch (error) {
    console.error("PASS RECEIPT EMAIL ERROR (Internal):", error);
  }
};
