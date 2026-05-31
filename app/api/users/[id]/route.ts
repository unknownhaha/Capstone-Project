import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/lib/model/user";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    
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


export async function PUT(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

   
    const updateFields: Record<string, string> = {
      ...(body.email !== undefined && { "contact.email": body.email }),
      ...(body.phone !== undefined && { "contact.phone": body.phone }),
      ...(body.address !== undefined && { "contact.address": body.address }),

      ...(body.jobTitle !== undefined && { "organization.jobTitle": body.jobTitle }),
      ...(body.department !== undefined && { "organization.department": body.department }),
      ...(body.organization !== undefined && { "organization.workPlace": body.organization }),
      ...(body.location !== undefined && { "organization.workAddress": body.location }),

      ...(body.firstName !== undefined && { firstName: body.firstName }),
      ...(body.lastName !== undefined && { lastName: body.lastName }),
      ...(body.profileImg !== undefined && { profileImg: body.profileImg }),
    };

   
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 }
      );
    }

    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      {
        returnDocument: 'after',
        runValidators: true 
      }
    ).select("-password"); 

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { user: updatedUser },
      { status: 200 }
    );

  } catch (error) {
    console.error("PUT error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}