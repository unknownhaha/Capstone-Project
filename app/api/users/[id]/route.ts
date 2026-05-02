import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/lib/model/user";

export async function GET(
  req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params;
    const session = await auth();

    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

   
    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // 3. Fetch user — password excluded by default (select: false)
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}