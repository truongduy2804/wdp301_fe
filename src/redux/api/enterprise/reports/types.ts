export type ApiEnvelope<T> = {
  success?: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export type CitizenSummary = {
  id?: number | null;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  avatar?: string | null;
};

export type CollectorSummary = {
  id: number;
  employeeCode?: string | null;
  fullName: string;
  phone?: string | null;
  avatar?: string | null;
};

export type WasteItem = {
  wasteType: string;
  weightKg: number;
};

export type CollectorLog = {
  reason?: string | null;
  images?: string[];
};

export type CancelDetails = {
  reason?: string | null;
  collectorInfo?: CollectorSummary | null;
  collectorLogs?: CollectorLog[];
};

export type EnterpriseReport = {
  id: number;
  reportId?: number | null;

  citizenId?: number | null;
  currentEnterpriseId?: number | null;

  address: string;
  latitude?: number | null;
  longitude?: number | null;
  provinceCode?: string | null;
  districtCode?: string | null;
  wardCode?: string | null;

  description?: string | null;
  status?: string | null;
  sentAt?: string | null;
  expiredAt?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
  assignedAt?: string | null;
  completedAt?: string | null;

  cancelReason?: string | null;
  deletedAt?: string | null;

  attemptId?: number | null;

  wasteItems?: WasteItem[];
  actualWasteItems?: WasteItem[];
  actualWeight?: number | null;
  accuracyBucket?: string | null;
  images?: string[];
  evidenceImages?: string[];

  distanceKm?: number | null;

  citizen?: CitizenSummary | null;
  collector?: CollectorSummary | null;
};

export type ReportDetail = {
  id: number;
  status: string;

  address: string;
  latitude: number;
  longitude: number;

  provinceCode: string;
  districtCode: string;
  wardCode: string;

  description?: string | null;
  createdAt: string;

  wasteItems: WasteItem[];
  actualWasteItems?: WasteItem[];
  actualWeight?: number | null;
  accuracyBucket?: string | null;
  images: string[];
  evidenceImages?: string[];

  citizen: CitizenSummary;
  collector?: CollectorSummary | null;
};

export type WaitingReportDetail = {
  isCancelled: boolean;
  cancelReason: string | null;
  report: ReportDetail;
  distanceKm?: number | null;
};

/**
 * GET /enterprise/reports/accepted
 */
export type AcceptedEnterpriseReport = {
  id: number;
  reportId: number;
  status: string;

  address: string;
  latitude?: number | null;
  longitude?: number | null;

  provinceCode?: string | null;
  districtCode?: string | null;
  wardCode?: string | null;

  description?: string | null;

  assignedAt?: string | null;
  completedAt?: string | null;

  wasteItems: WasteItem[];
  actualWasteItems?: WasteItem[];
  actualWeight?: number | null;
  accuracyBucket?: string | null;

  images: string[];
  evidenceImages?: string[];

  distanceKm?: number | null;

  citizen: CitizenSummary;
  collector?: CollectorSummary | null;
};

export type CancelledEnterpriseReport = {
  id: number;
  status?: string | null;

  address: string;
  latitude?: number | null;
  longitude?: number | null;

  description?: string | null;
  createdAt?: string | null;
  cancelledAt?: string | null;

  wasteItems?: WasteItem[];
  images?: string[];

  citizen?: CitizenSummary | null;

  type?: string | null;
  cancelBy?: string | null;
  cancelDetails?: CancelDetails | null;
};
