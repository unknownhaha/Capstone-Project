import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/lib/model/project";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (project.userId.toString() !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json(project);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();

    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (project.userId.toString() !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    
    project.sections = body.sections ?? project.sections;

    await project.save();

    return NextResponse.json(project);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (project.userId.toString() !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await Project.findByIdAndDelete(projectId);

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}