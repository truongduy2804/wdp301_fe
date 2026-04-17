export interface BackendEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

export type AdminPaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";
export type AdminPaymentMethod = "BANK_TRANSFER";

export interface AdminPaymentParty {
  id: number;
  fullName?: string;
  email?: string;
  phone?: string;
  name?: string;
  status?: string;
  address?: string;
}

export interface AdminPaymentPlan {
  id: number;
  name: string;
  price: number;
  durationMonths: number;
}

export interface AdminPaymentListItem {
  id: number;
  referenceCode: string;
  amount: number;
  currency: string;
  description: string | null;
  method: string;
  status: AdminPaymentStatus;
  createdAt: string;
  paidAt: string | null;
  expiresAt: string | null;
  enterprise: AdminPaymentParty | null;
  user: AdminPaymentParty | null;
  plan: AdminPaymentPlan | null;
}

export interface AdminPaymentsMeta {
  total: number;
  page: number;
  limit: number;
}

export interface AdminPaymentsSummary {
  totalAmount: number;
  totalTransactions: number;
}

export interface AdminPaymentsResponse {
  data: AdminPaymentListItem[];
  meta: AdminPaymentsMeta;
  summary: AdminPaymentsSummary;
}

export interface AdminPaymentDetail extends AdminPaymentListItem {
  failedAt: string | null;
  cancelledAt: string | null;
  bankTransactionId: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  notes: string | null;
  webhookId: string | null;
  webhookData: unknown;
}

export interface AdminPaymentQuery {
  page?: number;
  limit?: number;
  status?: AdminPaymentStatus;
  method?: AdminPaymentMethod;
  planId?: number;
  enterpriseId?: number;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
  paidFrom?: string;
  paidTo?: string;
}

export interface AdminRevenueStats {
  totalRevenue: number;
  totalTransactions: number;
  monthlyRevenue: number;
  monthlyTransactions: number;
  yearlyRevenue: number;
  yearlyTransactions: number;
  byMethod: Array<{
    method: string;
    totalAmount: number;
    count: number;
  }>;
  byPlan: Array<{
    planName: string;
    totalAmount: number;
    count: number;
  }>;
}
