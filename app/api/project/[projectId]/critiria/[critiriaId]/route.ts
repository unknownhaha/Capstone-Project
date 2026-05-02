import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/lib/model/project";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; criteriaId: string }>;
  }
) {
  try {
    const { projectId, criteriaId } = await params;
    const { score } = await req.json();

   
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

    const sectionCode = criteriaId.split("-")[0];

    const section = project.sections.find(
      (s: any) => s.code === sectionCode
    );

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const item = section.items.find(
      (i: any) => i.criteriaId === criteriaId
    );

    if (item) {
      
      item.score = score;
    } else {
      
      section.items.push({ criteriaId, score });
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