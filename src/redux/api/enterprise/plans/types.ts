export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/** ✅ Type theo response bạn đưa */
export interface EnterprisePlan {
  id: number;
  name: string;
  description: string;
  price: string; // backend trả string
  durationMonths: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
