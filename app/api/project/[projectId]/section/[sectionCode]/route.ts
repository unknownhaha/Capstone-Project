import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/lib/model/project";

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; sectionCode: string }>;
  }
) {
  try {
    const { projectId, sectionCode } = await params;

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ remove section
    project.sections = project.sections.filter(
      (s: any) => s.code !== sectionCode
    );

    await project.save();

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}