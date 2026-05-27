import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "theripper754@gmail.com",
    pass: "dviz xyqt fdvz qqjp",
  },
});

export async function sendOTPEmail(email: string, code: string) {
  try {
    await transporter.sendMail({
      from: "theripper754@gmail.com",
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
