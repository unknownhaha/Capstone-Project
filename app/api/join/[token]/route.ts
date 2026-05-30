import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/lib/model/project";
import ProjectInvite from "@/lib/model/project-invite";
import { isOwner, isMember } from "@/lib/project-access";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const invite = await ProjectInvite.findOne({ token });
    if (!invite || invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invite link is invalid or expired" },
        { status: 404 }
      );
    }

    const project = await Project.findById(invite.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.collaborationEnabled) {
      return NextResponse.json(
        { error: "Collaboration is not enabled for this project" },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    if (isOwner(project, userId)) {
      return NextResponse.json({
        projectId: project._id.toString(),
        role: "owner",
        alreadyMember: true,
      });
    }

    if (isMember(project, userId)) {
      return NextResponse.json({
        projectId: project._id.toString(),
        role: "editor",
        alreadyMember: true,
      });
    }

    project.members = project.members ?? [];
    project.members.push({
      userId,
      role: "editor",
      joinedAt: new Date(),
    });

    await project.save();

    return NextResponse.json({
      projectId: project._id.toString(),
      role: "editor",
      alreadyMember: false,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
