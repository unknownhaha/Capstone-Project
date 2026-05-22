import general from "@/lib/standards/ทั่วไป.json";
import entrance from "@/lib/standards/ทางเข้าอาคาร ทางเดินระหว่างอาคาร ทางเชื่อมระหว่างอาคาร ทางลาด ลิฟต์ และบันได.json";
import doors from "@/lib/standards/ประตูและหน้าต่าง.json";
import parking from "@/lib/standards/ที่จอดรถและที่รับส่งผู้โดยสาร.json";
import residence from "@/lib/standards/ที่พักอาศัยและห้องนอน.json";
import occupation from "@/lib/standards/การครอบครองพิเศษ.json";
import signage from "@/lib/standards/ป้ายสัญลักษณ์.json";
import facilities from "@/lib/standards/อย่ายุ่งกับอันนี้.json";
import { findCatalogGroup, getSectionCodeForGroupId } from "@/lib/standards/catalog";

const AVAILABLE_STANDARDS = [
  general,
  entrance,
  doors,
  parking,
  residence,
  occupation,
  signage,
  facilities,
] as const;

type CriteriaNode = {
  id?: string;
  items?: { item_id: string }[];
  criteria?: CriteriaNode[];
};

export type ProjectCriterion = {
  criteriaId: string;
  score: number | null;
  note?: string;
};

export type ProjectSection = {
  code: string;
  criteria: ProjectCriterion[];
  selectedGroups?: string[];
};

export function getSectionCode(standard: Record<string, unknown>): string {
  const section = standard.section as { id?: string } | undefined;
  if (section?.id) return section.id;
  if (typeof standard.id === "string") return standard.id;
  if (typeof standard.code === "string") return standard.code;
  throw new Error("Invalid standard format");
}

function collectCriteriaIds(criteriaList: CriteriaNode[]): string[] {
  const ids: string[] = [];

  for (const node of criteriaList) {
    if (node.items?.length) {
      for (const item of node.items) {
        if (item.item_id) ids.push(item.item_id);
      }
    } else if (node.id) {
      ids.push(node.id);
    }

    if (node.criteria?.length) {
      ids.push(...collectCriteriaIds(node.criteria));
    }
  }

  return ids;
}

export function findStandardByCode(sectionCode: string) {
  return AVAILABLE_STANDARDS.find((standard) => {
    try {
      return getSectionCode(standard as Record<string, unknown>) === sectionCode;
    } catch {
      return false;
    }
  });
}

export function buildProjectSectionsFromSelection(criteriaGroupIds: string[]) {
  const bySection = new Map<string, string[]>();

  for (const groupId of criteriaGroupIds) {
    const sectionCode = getSectionCodeForGroupId(groupId);
    if (!sectionCode) {
      throw new Error(`Unknown criteria group: ${groupId}`);
    }
    const existing = bySection.get(sectionCode) ?? [];
    existing.push(groupId);
    bySection.set(sectionCode, existing);
  }

  const sections: ProjectSection[] = [];

  for (const [sectionCode, groupIds] of bySection) {
    const itemIds: string[] = [];

    for (const groupId of groupIds) {
      const found = findCatalogGroup(groupId);
      if (!found) {
        throw new Error(`Unknown criteria group: ${groupId}`);
      }
      itemIds.push(...found.group.items.map((item) => item.item_id));
    }

    const uniqueIds = [...new Set(itemIds)];
    if (uniqueIds.length === 0) continue;

    sections.push({
      code: sectionCode,
      selectedGroups: groupIds,
      criteria: uniqueIds.map((criteriaId) => ({
        criteriaId,
        score: null,
      })),
    });
  }

  if (sections.length === 0) {
    throw new Error("No criteria items found for selection");
  }

  return sections;
}

export function buildProjectSection(sectionCode: string) {
  const standard = findStandardByCode(sectionCode);
  if (!standard) {
    throw new Error(`Unknown section code: ${sectionCode}`);
  }

  const root = (standard as { section?: { criteria?: CriteriaNode[] }; criteria?: CriteriaNode[] }).section ?? standard;
  const criteriaList = root.criteria ?? [];
  const criteriaIds = collectCriteriaIds(criteriaList);

  return {
    code: sectionCode,
    criteria: criteriaIds.map((criteriaId) => ({
      criteriaId,
      score: null as null,
    })),
  };
}

export function findSectionForCriteriaId(
  sections: ProjectSection[],
  criteriaId: string
): ProjectSection | undefined {
  const sorted = [...sections].sort((a, b) => b.code.length - a.code.length);

  return sorted.find(
    (section) =>
      criteriaId.startsWith(`${section.code}.`) ||
      criteriaId.startsWith(`${section.code}-`)
  );
}
