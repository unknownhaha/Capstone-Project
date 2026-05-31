import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/lib/model/project";
import User from "@/lib/model/user";
import { buildProjectSectionsFromSelection } from "@/lib/project-sections";
import { serializeProjectForUser } from "@/lib/project-serialize";
import { getMissingProfileFields, isProfileComplete } from "@/lib/profile-complete";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!isProfileComplete(user)) {
      return NextResponse.json(
        {
          error: "Complete your profile before creating a project",
          missingFields: getMissingProfileFields(user),
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { projectName, location, description, criteriaGroupIds } = body;

    if (!projectName?.trim()) {
      return NextResponse.json({ error: "projectName is required" }, { status: 400 });
    }

    if (!location?.trim()) {
      return NextResponse.json({ error: "location is required" }, { status: 400 });
    }

    if (!Array.isArray(criteriaGroupIds) || criteriaGroupIds.length === 0) {
      return NextResponse.json(
        { error: "Select at least one criteria group" },
        { status: 400 }
      );
    }

    let builtSections;
    try {
      builtSections = buildProjectSectionsFromSelection(criteriaGroupIds);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid selection";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const project = await Project.create({
      userId: session.user.id,
      projectName: projectName.trim(),
      description: description?.trim() ?? "",
      institution: {
        address: location.trim(),
      },
      sections: builtSections,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = session.user.id;

    const [owned, shared] = await Promise.all([
      Project.find({ userId }).sort({ createdAt: -1 }),
      Project.find({ "members.userId": userId })
        .populate("userId", "firstName lastName")
        .sort({ createdAt: -1 }),
    ]);

    const seen = new Set<string>();
    const merged = [];

    for (const project of owned) {
      const id = project._id.toString();
      if (seen.has(id)) continue;
      seen.add(id);
      merged.push(serializeProjectForUser(project, userId));
    }

    for (const project of shared) {
      const id = project._id.toString();
      if (seen.has(id)) continue;
      seen.add(id);
      merged.push(serializeProjectForUser(project, userId));
    }

    return NextResponse.json(merged);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
