import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/lib/model/project";
import { buildProjectSectionsFromSelection } from "@/lib/project-sections";
import { canEditProject } from "@/lib/project-access";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const { criteriaGroupIds } = body;

    if (!Array.isArray(criteriaGroupIds) || criteriaGroupIds.length === 0) {
      return NextResponse.json({ error: "criteriaGroupIds required" }, { status: 400 });
    }

    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let newSections;
    try {
      newSections = buildProjectSectionsFromSelection(criteriaGroupIds);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid selection";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    await connectDB();

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    if (!canEditProject(project, session.user.id))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Merge sections: if section exists, add missing criteria and selectedGroups; otherwise push
    for (const ns of newSections) {
      const exist = project.sections.find((s: any) => s.code === ns.code);
      if (exist) {
        // merge selectedGroups
        exist.selectedGroups = Array.from(new Set([...(exist.selectedGroups ?? []), ...(ns.selectedGroups ?? [])]));

        const existingIds = new Set(exist.criteria.map((c: any) => c.criteriaId));
        for (const c of ns.criteria) {
          if (!existingIds.has(c.criteriaId)) {
            exist.criteria.push({ criteriaId: c.criteriaId, score: null });
          }
        }
      } else {
        project.sections.push(ns);
      }
    }

    project.markModified("sections");
    await project.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
