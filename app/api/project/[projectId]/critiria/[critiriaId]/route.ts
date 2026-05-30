import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/lib/model/project";
import { findSectionForCriteriaId } from "@/lib/project-sections";
import { canEditProject } from "@/lib/project-access";

function normalizeImageUrls(imgs: unknown): string[] {
  if (!Array.isArray(imgs)) return [];
  return imgs.filter(
    (url): url is string => typeof url === "string" && url.trim().length > 0
  );
}

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
    const { score, note, img, imgs } = await req.json();

    if (score !== undefined && ![0, 1, 2].includes(score)) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    if (
      score === undefined &&
      note === undefined &&
      img === undefined &&
      imgs === undefined
    ) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    if (imgs !== undefined && !Array.isArray(imgs)) {
      return NextResponse.json({ error: "Invalid imgs" }, { status: 400 });
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

    if (!canEditProject(project, session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const section = findSectionForCriteriaId(project.sections, critiriaId);
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    let criterion = section.criteria.find((c) => c.criteriaId === critiriaId);

    if (!criterion) {
      section.criteria.push({
        criteriaId: critiriaId,
        score: score ?? null,
        imgs: [],
      });
      criterion = section.criteria[section.criteria.length - 1];
    }

    if (score !== undefined) criterion.score = score;
    if (note !== undefined) criterion.note = note;

    const normalizedImgs =
      imgs !== undefined ? normalizeImageUrls(imgs) : undefined;

    if (normalizedImgs !== undefined) {
      criterion.imgs = normalizedImgs;
      criterion.img = normalizedImgs[normalizedImgs.length - 1];
    } else if (img !== undefined) {
      const nextImgs = img ? [img] : [];
      criterion.imgs = nextImgs;
      criterion.img = img || undefined;
    }

    project.markModified("sections");
    await project.save();

    const saved = section.criteria.find((c) => c.criteriaId === critiriaId);
    const savedImgs = Array.isArray(saved?.imgs)
      ? saved!.imgs.filter(Boolean)
      : saved?.img
        ? [saved.img]
        : [];

    return NextResponse.json({
      success: true,
      imgs: savedImgs,
      img: savedImgs[savedImgs.length - 1] ?? null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
