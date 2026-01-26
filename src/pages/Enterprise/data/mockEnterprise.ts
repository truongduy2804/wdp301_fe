// src/pages/enterprise/_mockEnterprise.ts
import dayjs from "dayjs";

export type Zone = "District 1" | "District 3" | "District 7" | "Thu Duc";
export type WasteType = "Plastic" | "Paper" | "Metal" | "Organic" | "Other";

export type RequestStatus =
  | "PENDING_REVIEW" // chờ duyệt
  | "WAITING_ASSIGN" // đã duyệt, chờ gán collector
  | "PROCESSING" // đang xử lý
  | "COMPLETED" // xong
  | "REJECTED"; // từ chối

export type RequestItem = {
  id: string;
  createdAt: string; // ISO
  address: string;
  zone: Zone;
  wasteType: WasteType;
  estKg: number;
  note?: string;
  status: RequestStatus;

  // workflow
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;

  collectorId?: string;
  collectorName?: string;

  // completion
  completedAt?: string;
  actualKg?: number;
};

export type CollectorItem = {
  id: string;
  name: string;
  zone: Zone;
  active: boolean;
  phone?: string;
  onTimeRate: number;
  avgMinutes: number;
};

export const ZONE_OPTIONS: Array<{ value: Zone | "ALL"; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "District 1", label: "Quận 1" },
  { value: "District 3", label: "Quận 3" },
  { value: "District 7", label: "Quận 7" },
  { value: "Thu Duc", label: "Thủ Đức" },
];

export const WASTE_OPTIONS: Array<{ value: WasteType | "ALL"; label: string }> =
  [
    { value: "ALL", label: "Tất cả" },
    { value: "Plastic", label: "Nhựa" },
    { value: "Paper", label: "Giấy" },
    { value: "Metal", label: "Kim loại" },
    { value: "Organic", label: "Hữu cơ" },
    { value: "Other", label: "Khác" },
  ];

export const mockCollectors: CollectorItem[] = [
  {
    id: "C-001",
    name: "Nguyễn Văn A",
    zone: "Thu Duc",
    active: true,
    phone: "0901 111 222",
    onTimeRate: 94,
    avgMinutes: 28,
  },
  {
    id: "C-002",
    name: "Trần Thị B",
    zone: "District 7",
    active: true,
    phone: "0902 333 444",
    onTimeRate: 92,
    avgMinutes: 31,
  },
  {
    id: "C-003",
    name: "Lê Văn C",
    zone: "District 1",
    active: true,
    phone: "0903 555 666",
    onTimeRate: 90,
    avgMinutes: 33,
  },
  {
    id: "C-004",
    name: "Phạm Thị D",
    zone: "District 3",
    active: false,
    phone: "0904 777 888",
    onTimeRate: 89,
    avgMinutes: 35,
  },
];

const now = dayjs();
export const mockRequests: RequestItem[] = [
  {
    id: "R-1001",
    createdAt: now.subtract(2, "day").toISOString(),
    address: "12 Lê Lợi, Quận 1",
    zone: "District 1",
    wasteType: "Plastic",
    estKg: 12,
    note: "Có chai nhựa + túi nilon",
    status: "PENDING_REVIEW",
  },
  {
    id: "R-1002",
    createdAt: now.subtract(1, "day").toISOString(),
    address: "98 Nguyễn Huệ, Quận 1",
    zone: "District 1",
    wasteType: "Paper",
    estKg: 18,
    status: "WAITING_ASSIGN",
    reviewedBy: "admin",
    reviewedAt: now.subtract(1, "day").toISOString(),
  },
  {
    id: "R-1003",
    createdAt: now.subtract(3, "day").toISOString(),
    address: "25 Phú Mỹ Hưng, Quận 7",
    zone: "District 7",
    wasteType: "Organic",
    estKg: 22,
    status: "PROCESSING",
    reviewedBy: "admin",
    reviewedAt: now.subtract(3, "day").toISOString(),
    collectorId: "C-002",
    collectorName: "Trần Thị B",
  },
  {
    id: "R-1004",
    createdAt: now.subtract(8, "day").toISOString(),
    address: "12 Võ Văn Ngân, Thủ Đức",
    zone: "Thu Duc",
    wasteType: "Metal",
    estKg: 9,
    status: "COMPLETED",
    collectorId: "C-001",
    collectorName: "Nguyễn Văn A",
    reviewedBy: "admin",
    reviewedAt: now.subtract(8, "day").toISOString(),
    completedAt: now.subtract(7, "day").toISOString(),
    actualKg: 10,
  },
  {
    id: "R-1005",
    createdAt: now.subtract(4, "day").toISOString(),
    address: "1 Pasteur, Quận 3",
    zone: "District 3",
    wasteType: "Other",
    estKg: 6,
    status: "REJECTED",
    reviewedBy: "admin",
    reviewedAt: now.subtract(4, "day").toISOString(),
    rejectReason: "Ngoài phạm vi thu gom doanh nghiệp.",
  },
];
