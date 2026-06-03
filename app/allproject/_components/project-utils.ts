import { findCatalogSection, findCatalogItem } from "@/lib/standards/catalog";
import type { ProjectSectionView } from "./SectionPicker";

export type ApiProject = {
  _id: string;
  projectName: string;
  coverImg?: string;
  description?: string;
  institution?: { address?: string };
  completionRate?: number;
  scorePercent?: number;
  totalScore?: number;
  maxScore?: number;
  status?: "draft" | "completed";
  completedAt?: string;
  role?: "owner" | "editor";
  ownerFirstName?: string;
  collaborationEnabled?: boolean;
  totalCriteria?: number;
  sections: {
    code: string;
    title?: string;
    selectedGroups?: string[];
    scorePercent?: number;
    totalScore?: number;
    maxScore?: number;
    completionRate?: number;
    criteria: {
      criteriaId: string;
      score: number | null;
      note?: string;
      img?: string;
      imgs?: string[];
      updatedAt?: string;
    }[];
  }[];
};

export function filterProjects(projects: ApiProject[], query: string): ApiProject[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return projects;

  return projects.filter((project) => {
    const name = project.projectName?.toLowerCase() ?? "";
    const address = project.institution?.address?.toLowerCase() ?? "";
    return name.includes(normalized) || address.includes(normalized);
  });
}

export function getCriterionImages(criterion: {
  img?: string;
  imgs?: string[];
}): string[] {
  if (Array.isArray(criterion.imgs) && criterion.imgs.length > 0) {
    return criterion.imgs.filter(Boolean);
  }
  if (criterion.img) return [criterion.img];
  return [];
}

/** Cover image explicitly set on the project card. */
export function getProjectCoverImage(project: ApiProject): string | null {
  return project.coverImg?.trim() || null;
}

export function getProjectInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
}

export type ProjectPreviewStats = {
  totalItems: number;
  scoredCount: number;
  sectionCount: number;
  completionRate: number;
  scorePercent: number;
  totalScore: number;
  maxScore: number;
  scoreCounts: { pass: number; partial: number; fail: number };
};

export type SectionReportRow = {
  code: string;
  title: string;
  totalItems: number;
  scoredCount: number;
  completionRate: number;
  scorePercent: number;
  totalScore: number;
  maxScore: number;
  scoreCounts: { pass: number; partial: number; fail: number };
};

export function getProjectPreviewStats(project: ApiProject): ProjectPreviewStats {
  let totalItems = 0;
  let scoredCount = 0;
  let pass = 0;
  let partial = 0;
  let fail = 0;
  let totalScore = 0;

  for (const section of project.sections) {
    for (const criterion of section.criteria) {
      totalItems++;
      if (criterion.score === null || criterion.score === undefined) continue;

      scoredCount++;
      totalScore += criterion.score;
      if (criterion.score === 2) pass++;
      else if (criterion.score === 1) partial++;
      else if (criterion.score === 0) fail++;
    }
  }

  const maxScore = totalItems * 2;
  const scorePercent =
    project.scorePercent ??
    (maxScore > 0 ? Math.round((totalScore / maxScore) * 1000) / 10 : 0);

  return {
    totalItems,
    scoredCount,
    sectionCount: project.sections.length,
    completionRate: Math.round(project.completionRate ?? 0),
    scorePercent: Math.round(scorePercent * 10) / 10,
    totalScore: project.totalScore ?? totalScore,
    maxScore: project.maxScore ?? maxScore,
    scoreCounts: { pass, partial, fail },
  };
}

export function getProjectSectionReports(project: ApiProject): SectionReportRow[] {
  return project.sections.map((section) => {
    const catalog = findCatalogSection(section.code);
    let totalItems = 0;
    let scoredCount = 0;
    let pass = 0;
    let partial = 0;
    let fail = 0;
    let totalScore = 0;

    for (const criterion of section.criteria) {
      totalItems++;
      if (criterion.score === null || criterion.score === undefined) continue;

      scoredCount++;
      totalScore += criterion.score;
      if (criterion.score === 2) pass++;
      else if (criterion.score === 1) partial++;
      else if (criterion.score === 0) fail++;
    }

    const maxScore = totalItems * 2;
    const scorePercent =
      section.scorePercent ??
      (maxScore > 0 ? Math.round((totalScore / maxScore) * 1000) / 10 : 0);

    return {
      code: section.code,
      title: catalog?.title ?? section.code,
      totalItems,
      scoredCount,
      completionRate: Math.round(section.completionRate ?? 0),
      scorePercent: Math.round(scorePercent * 10) / 10,
      totalScore: section.totalScore ?? totalScore,
      maxScore: section.maxScore ?? maxScore,
      scoreCounts: { pass, partial, fail },
    };
  });
}

export function buildSectionViews(project: ApiProject): ProjectSectionView[] {
  return project.sections.map((section) => {
    const catalog = findCatalogSection(section.code);
    const itemIds = new Set(section.criteria.map((c) => c.criteriaId));

    let groupIds = section.selectedGroups ?? [];
    if (groupIds.length === 0 && catalog) {
      groupIds = catalog.groups
        .filter((group) => group.items.some((item) => itemIds.has(item.item_id)))
        .map((group) => group.id);
    }

    return {
      code: section.code,
      title: catalog?.title ?? section.code,
      groupIds,
    };
  });
}
