import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/lib/model/project";
import { canShareProject } from "@/lib/project-access";
import { getOrCreateInvite } from "@/lib/project-invite";
import { getRequestBaseUrl } from "@/lib/api-base-url";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!canShareProject(project, session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!project.collaborationEnabled) {
      return NextResponse.json(
        { error: "Collaboration is not enabled" },
        { status: 400 }
      );
    }

    const invite = await getOrCreateInvite(projectId, session.user.id);
    const baseUrl = getRequestBaseUrl(req);
    const inviteUrl = `${baseUrl}/join/${invite.token}`;

    return NextResponse.json({
      collaborationEnabled: true,
      inviteUrl,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
