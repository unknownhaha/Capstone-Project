import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/model/user";
import OTP from "@/lib/model/otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, password } = body;

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: "Email, OTP code, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
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
    if (otpRecord.code !== code.toString().trim()) {
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;

      // Lock / clear OTP after 5 failed attempts
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

    // Hash the new password
    const hashed = await bcrypt.hash(password, 12);

    // Update the password in MongoDB
    const user = await User.findOneAndUpdate(
      { "contact.email": email.toLowerCase().trim() },
      { password: hashed },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete the verified OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json(
      { message: "Password reset successfully. You can now login.", success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset password route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
