import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/lib/model/project";
import {
  canDeleteProject,
  canEditProject,
  canViewProject,
  isOwner,
} from "@/lib/project-access";
import { serializeProjectForUser } from "@/lib/project-serialize";
import { validateProjectPatchBody } from "@/lib/project-patch";
import { canMarkProjectComplete, getIncompleteCompletionMessage } from "@/lib/project-complete";

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

    if (!canViewProject(project, session.user.id))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json(
      serializeProjectForUser(project, session.user.id)
    );
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

    const patchError = validateProjectPatchBody(body);
    if (patchError) {
      return NextResponse.json(
        { error: patchError.error },
        { status: patchError.status }
      );
    }

    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!canEditProject(project, session.user.id))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (body.coverImg !== undefined) {
      if (!isOwner(project, session.user.id)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      project.coverImg = body.coverImg;
    }

    if (body.projectName !== undefined) {
      project.projectName = String(body.projectName).trim();
    }

    if (body.description !== undefined) {
      project.description = String(body.description).trim();
    }

    if (body.status !== undefined) {
      const nextStatus = String(body.status);

      if (nextStatus === "completed") {
        if (!canMarkProjectComplete(project)) {
          return NextResponse.json(
            { error: getIncompleteCompletionMessage() },
            { status: 400 }
          );
        }
        project.completedAt = new Date();
      }

      if (nextStatus === "draft") {
        project.completedAt = null;
      }

      project.status = nextStatus;
    }

    if (body.buildingType !== undefined) {
      project.buildingType = body.buildingType;
    }

    if (body.institution !== undefined) {
      const inst = body.institution as { name?: string; address?: string };
      if (inst.name !== undefined) project.institution.name = inst.name;
      if (inst.address !== undefined) project.institution.address = inst.address;
    }

    await project.save();

    return NextResponse.json(
      serializeProjectForUser(project, session.user.id)
    );
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

    if (!canDeleteProject(project, session.user.id))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await Project.findByIdAndDelete(projectId);

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}