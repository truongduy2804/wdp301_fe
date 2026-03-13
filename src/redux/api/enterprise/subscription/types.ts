export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
}

export type EnterpriseStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | string;

export interface SubscriptionInfo {
  id: number;
  planName: string;
  durationMonths: number;
  price: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive: boolean;
  isExpired: boolean;
  timeRemaining?: TimeRemaining;
}

/** BankInfo đi kèm QR (pendingPayment.qrCode.bankInfo) */
export interface BankInfo {
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  transferContent: string; // "Thanh toan <REF>"
}

/** QR code payload (pendingPayment.qrCode) */
export interface PendingPaymentQrCode {
  qrUrl: string;
  bankInfo: BankInfo;
}

/** PendingPayment trong GET /enterprise/subscription */
export interface SubscriptionPendingPayment {
  referenceCode: string;
  amount: number;
  planName: string;
  expiresAt: string; // ISO string
  status:
    | "PENDING"
    | "PAID"
    | "SUCCESS"
    | "COMPLETED"
    | "FAILED"
    | "CANCELED"
    | "CANCELLED"
    | "EXPIRED"
    | string;
  qrCode?: PendingPaymentQrCode; // ✅ có thể có hoặc không
}

export interface EnterpriseSubscriptionData {
  enterpriseId: number;
  enterpriseName: string;
  enterpriseStatus: EnterpriseStatus;
  subscription: SubscriptionInfo;
  pendingPayment: SubscriptionPendingPayment | null; // ✅ đúng type
}

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/** Request body cho renew */
export interface RenewSubscriptionRequest {
  subscriptionPlanConfigId: number;
}

/** Payment info trong response renew (data.payment) */
export interface RenewPaymentInfo {
  referenceCode: string;
  amount: number;
  currency: string; // "VND"
  description: string;
  planName: string;
  durationMonths: number;
  expiresAt: string;
  status:
    | "PENDING"
    | "PAID"
    | "SUCCESS"
    | "COMPLETED"
    | "FAILED"
    | "CANCELED"
    | "CANCELLED"
    | "EXPIRED"
    | string;
}

/** Renew response: data.qrCode */
export interface RenewQrCode {
  qrUrl: string;
  bankInfo: BankInfo;
}

/** Response renew: đúng theo backend bạn đưa */
export type RenewSubscriptionResponse = ApiEnvelope<{
  payment: RenewPaymentInfo;
  qrCode: RenewQrCode;
}>;
