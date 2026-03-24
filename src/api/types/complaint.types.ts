import type { ApiResponse } from "./common.types";

export type AdminComplaintStatus = "OPEN" | "PROCESSED" | "REJECTED";
export type ComplaintType =
  | "ATTITUDE"
  | "WEIGHT_MISMATCH"
  | "UNAUTHORIZED_FEE"
  | "NO_SHOW"
  | "OTHER";

export interface AdminComplaintCitizen {
  id: number;
  fullName: string;
  phone?: string | null;
  trustStats?: {
    totalComplaints: number;
    totalFakeReports: number;
  };
}

export interface AdminComplaintCollector {
  id: number;
  fullName: string;
  employeeCode: string;
  trustScore: number;
  skipCount: number;
}

export interface AdminComplaintContext {
  reportId: number;
  address?: string;
  reportStatus?: string;
}

export interface AdminComplaint {
  id: number;
  type: ComplaintType;
  typeLabel: string;
  status: AdminComplaintStatus;
  content: string;
  evidenceImages: string[];
  createdAt: string;
  resolvedAt?: string | null;
  adminResponse?: string | null;
  citizen: AdminComplaintCitizen;
  collector: AdminComplaintCollector | null;
  context: AdminComplaintContext;
}

export interface AdminComplaintsQuery {
  status?: AdminComplaintStatus;
  page?: number;
  limit?: number;
}

export interface AdminComplaintsPayload {
  data: AdminComplaint[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RespondComplaintDto {
  status: AdminComplaintStatus;
  response: string;
}

// Backend PATCH /admin/complaints/:id/respond returns updated Complaint entity (flat fields)
export interface RespondComplaintResult {
  id: number;
  status: AdminComplaintStatus;
  adminResponse?: string | null;
  resolvedAt?: string | null;
}

export type AdminComplaintsResponse = ApiResponse<AdminComplaintsPayload>;
export type AdminComplaintResponse = ApiResponse<AdminComplaint>;
