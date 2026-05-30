import nodemailer from "nodemailer";

function getEmailConfig() {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  const from = process.env.EMAIL_FROM?.trim() || user;

  if (!user || !pass) {
    return null;
  }

  return { user, pass, from };
}

export async function sendOTPEmail(email: string, code: string) {
  const config = getEmailConfig();
  if (!config) {
    console.error(
      "OTP email skipped: set EMAIL_USER and EMAIL_PASS in .env (see .env.example)"
    );
    return { success: false, error: "Email not configured" };
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE?.trim() || "gmail",
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  try {
    await transporter.sendMail({
      from: config.from,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Your OTP verification code is:</p>
          <h1 style="color: #5f9ea0; font-size: 32px; letter-spacing: 2px;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return { success: false, error };
  }
}
