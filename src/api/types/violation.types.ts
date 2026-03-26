import type { ApiResponse } from "./common.types";

export interface FakeReportViolatorsQuery {
  page?: number;
  limit?: number;
}

export interface FakeReportViolator {
  userId: number;
  fullName: string;
  email: string;
  avatar?: string | null;
  status: "ACTIVE" | "BANNED" | string;
  violationCount: number;
}

export interface FakeReportViolatorsPayload {
  data: FakeReportViolator[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ViolationActor {
  fullName: string;
  email: string;
  avatar?: string | null;
  role: string;
  employeeCode?: string | null;
  enterpriseName?: string | null;
}

export interface OriginalReportWasteItem {
  type: string;
  weight: number;
}

export interface ViolationOriginalReport {
  id: number;
  address: string;
  citizenDescription: string;
  citizenImages: string[];
  estimatedWaste: OriginalReportWasteItem[];
  status: string;
}

export interface FakeReportViolationDetail {
  id: number;
  timestamp: string;
  collectorReason?: string | null;
  collectorEvidence: string[];
  reporter: ViolationActor;
  violator: ViolationActor;
  originalReport: ViolationOriginalReport;
}

export type FakeReportViolatorsResponse = ApiResponse<FakeReportViolatorsPayload>;
export type FakeReportViolationDetailsResponse = ApiResponse<
  FakeReportViolationDetail[]
>;
export type BanViolationUserResponse = ApiResponse<null>;
export type UnbanViolationUserResponse = ApiResponse<null>;
