import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/lib/model/project";
import { findSectionForCriteriaId } from "@/lib/project-sections";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; critiriaId: string }>;
  }
) {
  try {
    const { projectId, critiriaId } = await params;
    const { score, note } = await req.json();

    if (![0, 1, 2].includes(score)) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
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

    const section = findSectionForCriteriaId(project.sections, critiriaId);

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const criterion = section.criteria.find(
      (c) => c.criteriaId === critiriaId
    );

    if (criterion) {
      criterion.score = score;
      if (note !== undefined) criterion.note = note;
    } else {
      section.criteria.push({
        criteriaId: critiriaId,
        score,
        ...(note !== undefined ? { note } : {}),
      });
    }

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
