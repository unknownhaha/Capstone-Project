import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/model/user";

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

    const user = await User.findOne({ "contact.email": email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { exists: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { exists: true, isEmailVerified: user.isEmailVerified },
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
