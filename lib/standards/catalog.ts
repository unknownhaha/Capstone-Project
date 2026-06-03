import general from "@/lib/standards/ทั่วไป.json";
import entrance from "@/lib/standards/ทางเข้าอาคาร ทางเดินระหว่างอาคาร ทางเชื่อมระหว่างอาคาร ทางลาด ลิฟต์ และบันได.json";
import doors from "@/lib/standards/ประตูและหน้าต่าง.json";
import parking from "@/lib/standards/ที่จอดรถและที่รับส่งผู้โดยสาร.json";
import residence from "@/lib/standards/ที่พักอาศัยและห้องนอน.json";
import occupation from "@/lib/standards/การครอบครองพิเศษ.json";
import signage from "@/lib/standards/ป้ายสัญลักษณ์.json";
import facilities from "@/lib/standards/อย่ายุ่งกับอันนี้.json";
import figureMap from "@/lib/standards/figure-map.json";
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
  imgCaption?: string;
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
  source_clause?: string;
  notes?: string | null;
  img?: string;
  reference_images?: unknown[];
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
  items?: RawItem[];
  group?: { key?: string; label?: string };
};

type FigureMapEntry = {
  file: string;
  caption?: string;
  clauses?: string[];
};

type FigureRef = {
  file: string;
  caption?: string;
};

function normalizeClause(value: string): string {
  return value.trim().replace(/\s+/g, "");
}

const CLAUSE_TO_FIGURE = new Map<string, FigureRef>();
const FIGURE_BY_NUM = new Map<string, FigureRef>();

for (const entry of Object.values(figureMap.figures as Record<string, FigureMapEntry>)) {
  if (!entry.file) continue;
  const ref: FigureRef = {
    file: entry.file,
    caption: entry.caption?.trim() || undefined,
  };
  const numKey = entry.file.match(/figure_(\d+)\.png$/i)?.[1];
  if (numKey) {
    FIGURE_BY_NUM.set(String(parseInt(numKey, 10)), ref);
  }
  for (const clause of entry.clauses ?? []) {
    CLAUSE_TO_FIGURE.set(normalizeClause(clause), ref);
  }
}

function resolveFigureAssetPath(value: string): string | undefined {
  const trimmed = value.trim();
  const match = trimmed.match(/^figure[_-]?(\d+)$/i);
  if (match) {
    const num = parseInt(match[1], 10);
    return `/standards/figures/figure_${String(num).padStart(2, "0")}.png`;
  }
  if (trimmed.startsWith("/standards/figures/")) return trimmed;
  return undefined;
}

function lookupFigureByKey(value: string): FigureRef | undefined {
  const path = resolveFigureAssetPath(value);
  if (!path) return undefined;
  const num = path.match(/figure_(\d+)\.png$/i)?.[1];
  if (num && FIGURE_BY_NUM.has(String(parseInt(num, 10)))) {
    return FIGURE_BY_NUM.get(String(parseInt(num, 10)));
  }
  return { file: path };
}

function lookupClauseFigure(clause?: string): FigureRef | undefined {
  if (!clause?.trim()) return undefined;

  const normalized = normalizeClause(clause);
  const direct = CLAUSE_TO_FIGURE.get(normalized);
  if (direct) return direct;

  const withoutParen = normalized.replace(/\([^)]*\)$/, "");
  if (withoutParen !== normalized) {
    const parent = CLAUSE_TO_FIGURE.get(withoutParen);
    if (parent) return parent;
  }

  let parts = withoutParen.split(".");
  while (parts.length > 1) {
    parts = parts.slice(0, -1);
    const candidate = CLAUSE_TO_FIGURE.get(parts.join("."));
    if (candidate) return candidate;
  }

  return undefined;
}

function resolveItemFigure(raw: RawItem): FigureRef | undefined {
  if (raw.img) {
    return lookupFigureByKey(raw.img) ?? { file: raw.img };
  }

  if (Array.isArray(raw.reference_images) && raw.reference_images.length > 0) {
    const first = raw.reference_images[0];
    if (typeof first === "string" && first.trim()) {
      return lookupFigureByKey(first) ?? { file: first };
    }
    if (first && typeof first === "object" && "url" in first) {
      const url = (first as { url?: string }).url;
      if (url?.trim()) return { file: url };
    }
  }

  return lookupClauseFigure(raw.source_clause);
}


function normalizeItem(raw: RawItem, fallbackId: string, fallbackLabel: string): CatalogItem {
  const figure = resolveItemFigure(raw);
  return {
    item_id: raw.item_id ?? fallbackId,
    display_text: raw.display_text ?? fallbackLabel,
    source_text: raw.source_text ?? "",
    notes: raw.notes ?? null,
    img: figure?.file,
    imgCaption: figure?.caption,
  };
}

function normalizeGroup(node: RawCriteriaNode): CatalogGroup | null {
  if (!node.id) return null;

  const title = node.title ?? node.label ?? node.id;
  let items: CatalogItem[] = [];

  if (Array.isArray(node.items)) {
    if (node.items.length === 0) return null;
    items = node.items.map((item) =>
      normalizeItem(item, item.item_id ?? node.id!, item.display_text ?? title)
    );
  } else if (node.label) {
    items = [
      normalizeItem(
        {
          item_id: node.id,
          display_text: node.label,
          source_text: node.source_text ?? node.ref,
          notes: node.notes,
          img: node.img,
          reference_images: (node as RawItem).reference_images,
        },
        node.id,
        title
      ),
    ];
  } else {
    return null;
  }

  return { id: node.id, title, items };
}

/** Scope-only groups (e.g. "ทั่วไป") are not field-verification checklists. */
function isSelectableGroup(group: CatalogGroup, sectionTitle: string): boolean {
  if (group.title === "ทั่วไป") return false;
  if (group.title === sectionTitle) return false;
  return group.items.length > 0;
}

function filterSelectableGroups(
  groups: CatalogGroup[],
  sectionTitle: string
): CatalogGroup[] {
  return groups.filter((g) => isSelectableGroup(g, sectionTitle));
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

    const figure = lookupClauseFigure(c.ref ?? c.id);

    byGroup.get(groupId)!.items.push({
      item_id: c.id,
      display_text: c.label ?? c.id,
      source_text: c.ref ?? "",
      notes: null,
      img: figure?.file,
      imgCaption: figure?.caption,
    });
  }

  return filterSelectableGroups(
    Array.from(byGroup.values()),
    getSectionTitle(standard, sectionCode)
  );
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
    groups = filterSelectableGroups(groups, title);
  }

  return { code, title, groups };
}

export const STANDARDS_CATALOG: CatalogSection[] = STANDARD_SOURCES.map((standard) =>
  buildCatalogSection(standard as Record<string, unknown>)
);

/** All criteria group ids available when creating or extending a project. */
export function getAllSelectableGroupIds(): string[] {
  return STANDARDS_CATALOG.flatMap((section) =>
    section.groups.map((group) => group.id)
  );
}

const CATALOG_ITEM_BY_ID = new Map<string, CatalogItem>();

for (const section of STANDARDS_CATALOG) {
  for (const group of section.groups) {
    for (const item of group.items) {
      CATALOG_ITEM_BY_ID.set(item.item_id, item);
    }
  }
}

export function findCatalogItem(itemId: string) {
  return CATALOG_ITEM_BY_ID.get(itemId);
}

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
