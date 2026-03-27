export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export type AccountProfile = {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};
