export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  durationMonths: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanDto {
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
  isActive?: boolean;
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  description?: string;
  price?: number;
  durationMonths?: number;
  isActive?: boolean;
}

export interface BackendEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}
