import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/lib/model/project";
import { canShareProject } from "@/lib/project-access";
import {
  getOrCreateInvite,
  revokeProjectInvites,
  rotateProjectInvite,
} from "@/lib/project-invite";
import { getRequestBaseUrl } from "@/lib/api-base-url";

type CollaborationAction = "enable" | "disable" | "rotate_invite";

function buildInviteUrl(req: NextRequest, token: string) {
  const baseUrl = getRequestBaseUrl(req);
  return `${baseUrl}/join/${token}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action as CollaborationAction;

    if (!["enable", "disable", "rotate_invite"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connectDB();

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!canShareProject(project, session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "disable") {
      project.collaborationEnabled = false;
      await project.save();
      await revokeProjectInvites(projectId);

      return NextResponse.json({
        collaborationEnabled: false,
        inviteUrl: null,
      });
    }

    if (action === "rotate_invite") {
      if (!project.collaborationEnabled) {
        return NextResponse.json(
          { error: "Collaboration is not enabled" },
          { status: 400 }
        );
      }

      const invite = await rotateProjectInvite(projectId, session.user.id);

      return NextResponse.json({
        collaborationEnabled: true,
        inviteUrl: buildInviteUrl(req, invite.token),
      });
    }

    project.collaborationEnabled = true;
    await project.save();

    const invite = await getOrCreateInvite(projectId, session.user.id);

    return NextResponse.json({
      collaborationEnabled: true,
      inviteUrl: buildInviteUrl(req, invite.token),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
