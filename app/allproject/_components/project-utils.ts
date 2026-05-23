import { findCatalogSection, findCatalogItem } from "@/lib/standards/catalog";
import type { ProjectSectionView } from "./SectionPicker";

export type ApiProject = {
  _id: string;
  projectName: string;
  coverImg?: string;
  description?: string;
  institution?: { address?: string };
  completionRate?: number;
  sections: {
    code: string;
    selectedGroups?: string[];
    criteria: {
      criteriaId: string;
      score: number | null;
      note?: string;
      img?: string;
      imgs?: string[];
    }[];
  }[];
};

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
  scoreCounts: { pass: number; partial: number; fail: number };
};

export function getProjectPreviewStats(project: ApiProject): ProjectPreviewStats {
  let totalItems = 0;
  let scoredCount = 0;
  let pass = 0;
  let partial = 0;
  let fail = 0;

  for (const section of project.sections) {
    for (const criterion of section.criteria) {
      totalItems++;
      if (criterion.score === null || criterion.score === undefined) continue;

      scoredCount++;
      if (criterion.score === 2) pass++;
      else if (criterion.score === 1) partial++;
      else if (criterion.score === 0) fail++;
    }
  }

  return {
    totalItems,
    scoredCount,
    sectionCount: project.sections.length,
    completionRate: Math.round(project.completionRate ?? 0),
    scoreCounts: { pass, partial, fail },
  };
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
