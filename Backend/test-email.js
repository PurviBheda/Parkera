import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // Since it's in the same directory as .env

async function test() {
  console.log("📧 Starting SMTP Test...");
  console.log("USER:", process.env.EMAIL_USER);
  console.log("PASS:", process.env.EMAIL_PASS ? "Loaded (Length: " + process.env.EMAIL_PASS.length + ")" : "NOT LOADED");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    console.log("⏳ Verifying connection...");
    await transporter.verify();
    console.log("✅ SMTP Connection Verified!");

    console.log("⏳ Sending test email to:", process.env.EMAIL_USER);
    const info = await transporter.sendMail({
      from: `"Parkera Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Parkera SMTP Test",
      text: "If you receive this, your SMTP configuration is working perfectly!",
      html: "<b>If you receive this, your SMTP configuration is working perfectly!</b>",
    });

    console.log("✅ Email Sent Successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ SMTP TEST FAILED:");
    console.error(error);
  }
}

test();
