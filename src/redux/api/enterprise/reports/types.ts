export type ApiEnvelope<T> = {
  success?: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export type CitizenSummary = {
  id: number;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  avatar?: string | null;
};

export type EnterpriseReport = {
  // list /waiting trả về
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
  status?: string | null; // "PENDING"
  sentAt?: string | null;
  expiredAt?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;

  cancelReason?: string | null;
  deletedAt?: string | null;

  attemptId?: number | null;

  citizen?: CitizenSummary | null; // list có citizen
};

export type WasteItem = {
  wasteType: string;
  weightKg: number;
};

export type ReportDetail = {
  // detail /waiting/:id trả về nằm trong data.report
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
