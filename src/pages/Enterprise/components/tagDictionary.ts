// src/components/ui/tags/tagDictionary.ts
export type TagTone = "emerald" | "slate" | "amber" | "rose" | "blue";

export type TagMeta = {
  label: string;
  tone?: TagTone;
};

export type TagDict = Record<string, TagMeta>;

export type TagKind = "wasteType" | "reportStatus";

/** ===== Waste types ===== */
export const WASTE_TYPE_TAGS: TagDict = {
  ORGANIC: { label: "Rác hữu cơ", tone: "emerald" },
  RECYCLABLE: { label: "Rác tái chế", tone: "blue" },
  // nếu có thêm:
  // HAZARDOUS: { label: "Nguy hại", tone: "rose" },
  // OTHER: { label: "Khác", tone: "slate" },
};

/** ===== Report / Order status =====
 * Bạn có thể bổ sung theo enum backend của bạn.
 */
export const REPORT_STATUS_TAGS: TagDict = {
  PENDING: { label: "Đang chờ", tone: "amber" },
  ON_TASK: { label: "Đang thu gom", tone: "blue" },
  IN_PROGRESS: { label: "Đang xử lý", tone: "blue" },
  ASSIGNED: { label: "Đã phân công", tone: "slate" },
  ACCEPTED: { label: "Đã duyệt", tone: "emerald" },
  DONE: { label: "Đã duyệt", tone: "emerald" },
  CANCELLED: { label: "Đã huỷ", tone: "rose" },
  EXPIRED: { label: "Hết hạn", tone: "slate" },
};

export const TAG_DICTIONARY: Record<TagKind, TagDict> = {
  wasteType: WASTE_TYPE_TAGS,
  reportStatus: REPORT_STATUS_TAGS,
};

export function getTagMeta(kind: TagKind, value?: string | null): TagMeta {
  if (!value) return { label: "—", tone: "slate" };
  const dict = TAG_DICTIONARY[kind];
  return dict[value] ?? { label: value, tone: "slate" };
}
