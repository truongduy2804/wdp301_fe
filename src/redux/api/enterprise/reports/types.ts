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

export type EnterpriseReport = {
  id: number;
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

  cancelReason?: string | null;
  deletedAt?: string | null;

  attemptId?: number | null;

  citizen?: CitizenSummary | null;
};

export type WasteItem = {
  wasteType: string;
  weightKg: number;
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
  images: string[];

  citizen: CitizenSummary;
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
  description?: string | null;

  assignedAt?: string | null;
  completedAt?: string | null;

  wasteItems: WasteItem[];
  images: string[];

  citizen: CitizenSummary;
  collector?: CollectorSummary | null;
};
