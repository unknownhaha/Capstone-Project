import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/model/user";
import OTP from "@/lib/model/otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and OTP code are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email: email.toLowerCase().trim() });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No OTP found for this email" },
        { status: 404 }
      );
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP code matches
    if (otpRecord.code !== code.toString()) {
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (otpRecord.attempts >= 5) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return NextResponse.json(
          { error: "Too many failed attempts. Please request a new OTP." },
          { status: 429 }
        );
      }

      await otpRecord.save();
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { "contact.email": email.toLowerCase().trim() },
      { isEmailVerified: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete the OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json(
      { message: "Email verified successfully. You can now login.", success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST_RESEND(req: NextRequest) {
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

    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete old OTP and create new one
    await OTP.deleteOne({ email: email.toLowerCase().trim() });
    await OTP.create({
      email: email.toLowerCase().trim(),
      code: otpCode,
      expiresAt,
    });

    const { sendOTPEmail, OTP_EMAIL_SEND_FAILED } = await import("@/lib/email");
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
      { message: "New OTP sent to your email", success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
