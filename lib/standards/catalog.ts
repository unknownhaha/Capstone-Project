import general from "@/lib/standards/ทั่วไป.json";
import entrance from "@/lib/standards/ทางเข้าอาคาร ทางเดินระหว่างอาคาร ทางเชื่อมระหว่างอาคาร ทางลาด ลิฟต์ และบันได.json";
import doors from "@/lib/standards/ประตูและหน้าต่าง.json";
import parking from "@/lib/standards/ที่จอดรถและที่รับส่งผู้โดยสาร.json";
import residence from "@/lib/standards/ที่พักอาศัยและห้องนอน.json";
import occupation from "@/lib/standards/การครอบครองพิเศษ.json";
import signage from "@/lib/standards/ป้ายสัญลักษณ์.json";
import facilities from "@/lib/standards/อย่ายุ่งกับอันนี้.json";
import { getSectionCode } from "@/lib/project-sections";

/** All 8 main standard sections in display order */
const STANDARD_SOURCES = [
  general,
  entrance,
  doors,
  parking,
  residence,
  occupation,
  signage,
  facilities,
] as const;

export type CatalogItem = {
  item_id: string;
  display_text: string;
  source_text: string;
  notes: string | null;
  img?: string;
};

export type CatalogGroup = {
  id: string;
  title: string;
  items: CatalogItem[];
};

export type CatalogSection = {
  code: string;
  title: string;
  groups: CatalogGroup[];
};

type RawItem = {
  item_id?: string;
  display_text?: string;
  source_text?: string;
  notes?: string | null;
  img?: string;
};

type RawCriteriaNode = {
  id?: string;
  title?: string;
  label?: string;
  source_text?: string;
  notes?: string | null;
  img?: string;
  ref?: string;
  items?: RawItem[];
  criteria?: RawCriteriaNode[];
  group?: { key?: string; label?: string };
};

type FlatCriterion = {
  id: string;
  label?: string;
  ref?: string;
  group?: { key?: string; label?: string };
};

function normalizeItem(raw: RawItem, fallbackId: string, fallbackLabel: string): CatalogItem {
  return {
    item_id: raw.item_id ?? fallbackId,
    display_text: raw.display_text ?? fallbackLabel,
    source_text: raw.source_text ?? "",
    notes: raw.notes ?? null,
    img: raw.img,
  };
}

function normalizeGroup(node: RawCriteriaNode): CatalogGroup | null {
  if (!node.id) return null;

  const title = node.title ?? node.label ?? node.id;
  let items: CatalogItem[] = [];

  if (node.items?.length) {
    items = node.items.map((item) =>
      normalizeItem(item, item.item_id ?? node.id!, item.display_text ?? title)
    );
  } else {
    items = [
      normalizeItem(
        {
          item_id: node.id,
          display_text: node.label,
          source_text: node.source_text ?? node.ref,
          notes: node.notes,
          img: node.img,
        },
        node.id,
        title
      ),
    ];
  }

  return { id: node.id, title, items };
}

function isCriteriaGroup(node: RawCriteriaNode): boolean {
  if (!node.id) return false;
  if (node.title || node.label) return true;
  return Array.isArray(node.items);
}

function isFlatStandard(standard: Record<string, unknown>): boolean {
  const criteria = (standard.criteria ?? (standard.section as { criteria?: unknown })?.criteria) as
    | FlatCriterion[]
    | undefined;
  if (!Array.isArray(criteria) || criteria.length === 0) return false;
  const first = criteria[0] as FlatCriterion;
  return Boolean(first.label && !first.items);
}

function collectFlatCriteriaGroups(
  standard: Record<string, unknown>,
  sectionCode: string
): CatalogGroup[] {
  const criteria = (standard.criteria ??
    (standard.section as { criteria?: FlatCriterion[] })?.criteria ??
    []) as FlatCriterion[];

  const byGroup = new Map<string, CatalogGroup>();

  for (const c of criteria) {
    if (!c.id) continue;

    const groupKey = c.group?.key ?? c.id;
    const groupId = `${sectionCode}.${groupKey}`;
    const groupTitle = c.group?.label ?? "ทั่วไป";

    if (!byGroup.has(groupId)) {
      byGroup.set(groupId, { id: groupId, title: groupTitle, items: [] });
    }

    byGroup.get(groupId)!.items.push({
      item_id: c.id,
      display_text: c.label ?? c.id,
      source_text: c.ref ?? "",
      notes: null,
    });
  }

  return Array.from(byGroup.values());
}

function deepCollectGroups(
  value: unknown,
  groups: CatalogGroup[],
  seen: Set<string>,
  depth = 0
) {
  if (!value || typeof value !== "object" || depth > 24) return;

  if (Array.isArray(value)) {
    for (const entry of value) {
      deepCollectGroups(entry, groups, seen, depth + 1);
    }
    return;
  }

  const node = value as RawCriteriaNode;

  if (isCriteriaGroup(node) && !seen.has(node.id!)) {
    const group = normalizeGroup(node);
    if (group && group.items.length > 0) {
      seen.add(node.id!);
      groups.push(group);
    }
  }

  for (const child of Object.values(node)) {
    if (child && typeof child === "object") {
      deepCollectGroups(child, groups, seen, depth + 1);
    }
  }
}

function getSectionTitle(standard: Record<string, unknown>, code: string): string {
  const section = standard.section as { title?: string } | undefined;
  if (section?.title) return section.title;
  if (typeof standard.title === "string") return standard.title;
  const name = standard.name as { th?: string } | undefined;
  if (name?.th) return name.th;
  return code;
}

function buildCatalogSection(standard: Record<string, unknown>): CatalogSection {
  const code = getSectionCode(standard);
  const title = getSectionTitle(standard, code);

  let groups: CatalogGroup[] = [];

  if (isFlatStandard(standard)) {
    groups = collectFlatCriteriaGroups(standard, code);
  } else {
    const seen = new Set<string>();
    deepCollectGroups(standard, groups, seen);
    groups.sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true })
    );
  }

  return { code, title, groups };
}

export const STANDARDS_CATALOG: CatalogSection[] = STANDARD_SOURCES.map((standard) =>
  buildCatalogSection(standard as Record<string, unknown>)
);

export function findCatalogSection(sectionCode: string) {
  return STANDARDS_CATALOG.find((section) => section.code === sectionCode);
}

export function findCatalogGroup(groupId: string) {
  for (const section of STANDARDS_CATALOG) {
    const group = section.groups.find((g) => g.id === groupId);
    if (group) return { section, group };
  }
  return null;
}

export function getSectionCodeForGroupId(groupId: string) {
  return findCatalogGroup(groupId)?.section.code;
}
