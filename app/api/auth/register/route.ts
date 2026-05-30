import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/model/user";
import OTP from "@/lib/model/otp";
import { OTP_EMAIL_NOT_CONFIGURED, sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    
    const existing = await User.findOne({ "contact.email": email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }


    const hashed = await bcrypt.hash(password, 12);

    // Create user with isEmailVerified: false
    await User.create({
      firstName,
      lastName,
      password: hashed,
      contact: { email },
      isEmailVerified: false,
    });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await OTP.create({
      email,
      code: otpCode,
      expiresAt,
    });

    const emailResult = await sendOTPEmail(email, otpCode);

    return NextResponse.json(
      {
        message: emailResult.success
          ? "User created. Please verify your email with the OTP sent to your inbox."
          : "Account created, but the verification email could not be sent. Use Resend on the verify page.",
        email,
        emailSent: emailResult.success,
        emailError: emailResult.success
          ? undefined
          : typeof emailResult.error === "string"
            ? emailResult.error
            : OTP_EMAIL_NOT_CONFIGURED,
      },
      { status: 201 }
    );

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}