/** ===== Types chung ===== */
export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/** ===== Payment =====
 * Bạn chỉnh fields theo backend sau (qrCodeUrl/qrCodeBase64/referenceCode/status...)
 */
export interface PendingPayment {
  referenceCode?: string;
  amount?: number;
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;

  // QR có thể là URL hoặc base64 hoặc raw string
  qrCodeUrl?: string;
  qrCodeBase64?: string;
  qrCode?: string;

  // trạng thái thanh toán
  status?: "PENDING" | "PAID" | "SUCCESS" | "FAILED" | "CANCELED" | string;

  // thêm gì backend có thì optional
  [k: string]: any;
}

export interface RenewSubscriptionRequest {
  subscriptionPlanConfigId: number;
}

/** Renew thường trả về pendingPayment/qr/referenceCode */
export type RenewSubscriptionResponse = ApiEnvelope<{
  pendingPayment?: PendingPayment;
  referenceCode?: string;
  qrCodeUrl?: string;
  qrCodeBase64?: string;
  qrCode?: string;
  [k: string]: any;
}>;
export interface EnterpriseTransactionItem {
  id: number;
  referenceCode: string;
  amount: number;
  currency: string;
  description: string;
  planName: string;
  paidAt: string;
  method: string;
  status: string;
}

export interface EnterpriseTransactionHistoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    transactions: EnterpriseTransactionItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
/** GET payment/{referenceCode} */
export type GetPaymentResponse = ApiEnvelope<PendingPayment>;
