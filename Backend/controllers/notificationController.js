import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (!transporter) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ CRITICAL ERROR: EMAIL_USER or EMAIL_PASS environment variables are missing!");
      return { sendMail: () => Promise.reject(new Error("Email credentials missing")) };
    }

    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      family: 4, // Force IPv4 to avoid ENETUNREACH on cloud environments
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,   // 10 seconds
      socketTimeout: 15000,     // 15 seconds
    });

    // Verify connection once
    transporter.verify((error) => {
      if (error) {
        console.error("❌ SMTP Connection Error Details:", error);
      } else {
        console.log("🚀 SMTP Server is ready and authenticated for:", process.env.EMAIL_USER);
      }
    });
  }
  return transporter;
};


// ==========================================
// INTERNAL EMAIL FUNCTIONS (For Cron Jobs)
// ==========================================

const BASE_STYLE = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 600px;
  margin: auto;
  padding: 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
`;

const HEADER_STYLE = (color) => `
  background-color: ${color};
  padding: 30px 20px;
  text-align: center;
  color: white;
`;

const CONTENT_STYLE = `
  padding: 30px;
  background-color: #ffffff;
  color: #1e293b;
  line-height: 1.6;
`;

const CARD_STYLE = (borderColor) => `
  background-color: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
  border-left: 5px solid ${borderColor};
`;

const BUTTON_STYLE = (color) => `
  display: inline-block;
  padding: 12px 24px;
  background-color: ${color};
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  margin-top: 10px;
`;

export const sendBookingConfirmationInternal = async (email, areaName, slotId, vehicleType, startTime, endTime) => {
  console.log(`📧 Attempting to send Booking Confirmation to: ${email}`);
  try {
    if (!email) {
      console.warn("⚠️ sendBookingConfirmationInternal: No email provided");
      return;
    }
    await getTransporter().sendMail({
      from: `"Parkera" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Booking Confirmed - Parkera",
      html: `
        <div style="${BASE_STYLE}">
          <div style="${HEADER_STYLE('#10B981')}">
            <h1 style="margin:0; font-size: 24px;">Booking Confirmed!</h1>
          </div>
          <div style="${CONTENT_STYLE}">
            <p>Hello,</p>
            <p>Your parking spot is ready! We've successfully processed your booking at <strong>${areaName}</strong>.</p>
            <div style="${CARD_STYLE('#10B981')}">
              <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${areaName}</p>
              <p style="margin: 5px 0;"><strong>🔢 Slot:</strong> ${slotId}</p>
              <p style="margin: 5px 0;"><strong>🚗 Vehicle:</strong> ${vehicleType}</p>
              <p style="margin: 5px 0;"><strong>🕒 Entry:</strong> ${new Date(startTime).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>⌛ Expected Exit:</strong> ${new Date(endTime).toLocaleString()}</p>
            </div>
            <p>Please ensure you arrive on time. You can manage your booking via the dashboard below.</p>
            <div style="text-align: center;">
              <a href="https://parkera.vercel.app/dashboard" style="${BUTTON_STYLE('#10B981')}">View Dashboard</a>
            </div>
            <p style="margin-top: 30px; font-size: 13px; color: #64748b; text-align: center;">
              Safe Travels,<br>The Parkera Team
            </p>
          </div>
        </div>
      `,
    });
    console.log("✅ Confirmation Email Sent Successfully To:", email);
  } catch (error) {
    console.error("❌ CONFIRMATION EMAIL ERROR:", error.message, error.stack);
  }
};

export const sendReservationConfirmationInternal = async (email, areaName, slotId, vehicleType, expiryTime) => {
  console.log(`📧 Attempting to send Reservation Confirmation to: ${email}`);
  try {
    if (!email) {
      console.warn("⚠️ sendReservationConfirmationInternal: No email provided");
      return;
    }
    await getTransporter().sendMail({
      from: `"Parkera" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎫 Reservation Confirmed - Parkera",
      html: `
        <div style="${BASE_STYLE}">
          <div style="${HEADER_STYLE('#4F46E5')}">
            <h1 style="margin:0; font-size: 24px;">Spot Reserved!</h1>
          </div>
          <div style="${CONTENT_STYLE}">
            <p>Hello,</p>
            <p>We've reserved a slot for you. Please reach the parking area before your reservation expires.</p>
            <div style="${CARD_STYLE('#4F46E5')}">
              <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${areaName || "Selected Mall"}</p>
              <p style="margin: 5px 0;"><strong>🔢 Slot:</strong> ${slotId}</p>
              <p style="margin: 5px 0;"><strong>🚗 Vehicle:</strong> ${vehicleType}</p>
              <p style="margin: 5px 0; color: #ef4444;"><strong>⏰ Arrive Before:</strong> ${new Date(expiryTime).toLocaleString()}</p>
            </div>
            <p>Once you arrive, please check-in via the app to start your parking session.</p>
            <div style="text-align: center;">
              <a href="https://parkera.vercel.app/dashboard" style="${BUTTON_STYLE('#4F46E5')}">Check-In Now</a>
            </div>
            <p style="margin-top: 30px; font-size: 13px; color: #64748b; text-align: center;">
              Thank you for choosing Parkera!
            </p>
          </div>
        </div>
      `,
    });
    console.log("✅ Reservation Email Sent To:", email);
  } catch (error) {
    console.error("RESERVATION EMAIL ERROR:", error);
  }
};

export const sendWarningEmailInternal = async (email, info) => {
  console.log(`📧 Attempting to send Warning Email to: ${email}`);
  try {
    if (!email) {
      console.warn("⚠️ sendWarningEmailInternal: No email provided");
      return;
    }
    const { areaName, slotId, expectedExit, isReservation } = info;
    
    await getTransporter().sendMail({
      from: `"Parkera" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "⚠️ Time Almost Up - Parkera",
      html: `
        <div style="${BASE_STYLE}">
          <div style="${HEADER_STYLE('#F59E0B')}">
            <h1 style="margin:0; font-size: 24px;">Time Warning</h1>
          </div>
          <div style="${CONTENT_STYLE}">
            <p>Hello,</p>
            <p>This is a quick reminder that your ${isReservation ? 'reservation' : 'parking session'} at <strong>${areaName}</strong> is about to expire.</p>
            <div style="${CARD_STYLE('#F59E0B')}">
              <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${areaName}</p>
              <p style="margin: 5px 0;"><strong>🔢 Slot:</strong> ${slotId}</p>
              <p style="margin: 15px 0; color: #ef4444; font-weight: bold; font-size: 18px;">Remaining: ~5 Minutes</p>
              <p style="margin: 5px 0;"><strong>Deadline:</strong> ${new Date(expectedExit).toLocaleTimeString()}</p>
            </div>
            <p>Please ${isReservation ? 'arrive at your slot' : 'return to your vehicle'} immediately to avoid late penalties (₹2/min).</p>
            <div style="text-align: center;">
              <a href="https://parkera.vercel.app/dashboard" style="${BUTTON_STYLE('#F59E0B')}">Manage Session</a>
            </div>
          </div>
        </div>
      `,
    });
    console.log("✅ Warning Email Sent To:", email);
  } catch (error) {
    console.error("WARNING EMAIL ERROR:", error);
  }
};

export const sendPenaltyEmailInternal = async (email, info) => {
  console.log(`📧 Attempting to send Penalty Email to: ${email}`);
  try {
    if (!email) {
      console.warn("⚠️ sendPenaltyEmailInternal: No email provided");
      return;
    }
    const { areaName, slotId, isReservation } = info;

    await getTransporter().sendMail({
      from: `"Parkera" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🚨 Penalty Applied - Parkera",
      html: `
        <div style="${BASE_STYLE}">
          <div style="${HEADER_STYLE('#EF4444')}">
            <h1 style="margin:0; font-size: 24px;">Penalty Active</h1>
          </div>
          <div style="${CONTENT_STYLE}">
            <p>Hello,</p>
            <p>Your ${isReservation ? 'reservation' : 'parking session'} has expired and a late penalty is now being applied.</p>
            <div style="${CARD_STYLE('#EF4444')}">
              <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${areaName}</p>
              <p style="margin: 5px 0;"><strong>🔢 Slot:</strong> ${slotId}</p>
              <p style="margin: 15px 0; color: #ef4444; font-weight: bold; font-size: 18px;">Rate: ₹2 per minute</p>
            </div>
            <p>Please complete your session immediately to stop further charges.</p>
            <div style="text-align: center;">
              <a href="https://parkera.vercel.app/dashboard" style="${BUTTON_STYLE('#EF4444')}">End Session Now</a>
            </div>
          </div>
        </div>
      `,
    });
    console.log("✅ Penalty Email Sent To:", email);
  } catch (error) {
    console.error("PENALTY EMAIL ERROR:", error);
  }
};

export const sendPassReceiptEmailInternal = async (email, passType, price, slotId, startDate, endDate) => {
  console.log(`📧 Attempting to send Pass Receipt to: ${email}`);
  try {
    if (!email) {
      console.warn("⚠️ sendPassReceiptEmailInternal: No email provided");
      return;
    }
    await getTransporter().sendMail({
      from: `"Parkera" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎫 Parking Pass Receipt - Parkera",
      html: `
        <div style="${BASE_STYLE}">
          <div style="${HEADER_STYLE('#8B5CF6')}">
            <h1 style="margin:0; font-size: 24px;">Pass Confirmed!</h1>
          </div>
          <div style="${CONTENT_STYLE}">
            <p>Hello,</p>
            <p>Your premium parking pass has been successfully issued.</p>
            <div style="${CARD_STYLE('#8B5CF6')}">
              <p style="margin: 5px 0;"><strong>🎟️ Pass Type:</strong> ${passType}</p>
              <p style="margin: 5px 0;"><strong>🔢 Reserved Slot:</strong> ${slotId}</p>
              <p style="margin: 5px 0;"><strong>💰 Amount:</strong> ₹${price}</p>
              <p style="margin: 5px 0;"><strong>📅 Valid From:</strong> ${new Date(startDate).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>📅 Valid Until:</strong> ${new Date(endDate).toLocaleDateString()}</p>
            </div>
            <p>This slot is now dedicated to you for the duration of the pass.</p>
            <div style="text-align: center;">
              <a href="https://parkera.vercel.app/dashboard" style="${BUTTON_STYLE('#8B5CF6')}">View Pass</a>
            </div>
          </div>
        </div>
      `,
    });
    console.log("✅ Pass Receipt Email Sent To:", email);
  } catch (error) {
    console.error("PASS RECEIPT EMAIL ERROR:", error);
  }
};

// Legacy Public Wrappers (Updated to use new design implicitly via internal call triggers)
export const sendWarningEmail = async (req, res) => {
  const { email, areaName, slotId, expectedExit } = req.body;
  await sendWarningEmailInternal(email, { areaName, slotId, expectedExit, isReservation: false });
  res.status(200).json({ message: "Warning email sent" });
};

export const sendPenaltyEmail = async (req, res) => {
  const { email, areaName, slotId } = req.body;
  await sendPenaltyEmailInternal(email, { areaName, slotId, isReservation: false });
  res.status(200).json({ message: "Penalty email sent" });
};
// ==========================================
// TEST EMAIL FUNCTION (FOR DEBUGGING)
// ==========================================

export const sendTestEmail = async (req, res) => {
  const { email } = req.query;
  const targetEmail = email || process.env.EMAIL_USER;

  console.log(`⚠️ [TEST] Manual test-email triggered for: ${targetEmail}`);
  
  try {
    const tp = getTransporter();
    
    // Check if transporter is a dummy (missing credentials)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(500).json({ 
            status: "FAILED", 
            error: "Email credentials missing (EMAIL_USER or EMAIL_PASS not in env)" 
        });
    }

    const mailOptions = {
      from: `"Parkera Test" <${process.env.EMAIL_USER}>`,
      to: targetEmail,
      subject: "🚀 Parkera System Test Email",
      text: "If you are reading this, your Parkera email notification system is working correctly!",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 2px solid #EAB308; border-radius: 10px;">
          <h2 style="color: #EAB308;">🚀 System Test Successful!</h2>
          <p>Your Parkera email notification system is now <strong>fully operational</strong> on Render.</p>
          <hr />
          <p style="font-size: 11px; color: #999;">Test triggered at ${new Date().toLocaleString()}</p>
        </div>
      `,
    };

    const info = await tp.sendMail(mailOptions);
    console.log("✅ [TEST] Test email sent successfully:", info.messageId);
    
    res.json({
      status: "SUCCESS",
      message: `Test email sent to ${targetEmail}`,
      messageId: info.messageId,
      user: process.env.EMAIL_USER
    });
  } catch (error) {
    console.error("❌ [TEST] Manual test-email FAILED:", error);
    res.status(500).json({
      status: "FAILED",
      error: error.message,
      stack: error.stack
    });
  }
};
