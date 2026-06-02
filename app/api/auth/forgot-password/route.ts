import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/model/user";
import OTP from "@/lib/model/otp";
import { sendOTPEmail, OTP_EMAIL_SEND_FAILED } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists
    const user = await User.findOne({ "contact.email": email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTP and create new one
    await OTP.deleteOne({ email: email.toLowerCase().trim() });
    await OTP.create({
      email: email.toLowerCase().trim(),
      code: otpCode,
      expiresAt,
    });

    const emailResult = await sendOTPEmail(email, otpCode);
    if (!emailResult.success) {
      return NextResponse.json(
        {
          error:
            typeof emailResult.error === "string"
              ? emailResult.error
              : OTP_EMAIL_SEND_FAILED,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "OTP sent to your email", success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("Forgot password route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
