import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/lib/model/project";
import { buildProjectSection } from "@/lib/project-sections";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Section code required" }, { status: 400 });
    }

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

    const exists = project.sections.some((s: any) => s.code === code);

    if (exists) {
      return NextResponse.json(
        { error: "Section already exists" },
        { status: 400 }
      );
    }

    let section;
    try {
      section = buildProjectSection(code);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid section";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    project.sections.push(section);

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