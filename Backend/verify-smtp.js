import sendEmail from "./utils/emailService.js";
import dotenv from "dotenv";
dotenv.config();

// Get email from command line or use a dummy for testing
const testEmail = process.argv[2] || "pnuorg@gmail.com"; 

async function verify() {
  console.log(`🔍 Starting SMTP Verification for recipient: ${testEmail}...`);
  console.log("SENDER:", process.env.EMAIL_USER);

  try {
    const result = await sendEmail(
      testEmail, 
      "Parkera External Recipient Test", 
      `<h1>It works for external users too!</h1><p>Test sent to: ${testEmail}</p>`
    );
    console.log("✅ SUCCESS! Check the inbox of:", testEmail);
    console.log("Result:", result.messageId);
  } catch (error) {
    console.error("❌ VERIFICATION FAILED:", error);
  }
}

verify();
