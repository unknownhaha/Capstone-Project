import { findCatalogSection } from "@/lib/standards/catalog";
import type { ProjectSectionView } from "./SectionPicker";

export type ApiProject = {
  _id: string;
  projectName: string;
  description?: string;
  institution?: { address?: string };
  completionRate?: number;
  sections: {
    code: string;
    selectedGroups?: string[];
    criteria: { criteriaId: string; score: number | null }[];
  }[];
};

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
