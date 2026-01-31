export type CollectorStatus = "AVAILABLE" | "ON_TASK" | "OFFLINE";

export type CollectorStatistics = {
  totalAssignments?: number;
  completedAssignments?: number;
  pendingAssignments?: number;

  // nếu backend có fields khác thì cứ optional thêm
  totalTasks?: number;
  completedTasks?: number;
  successRate?: number;
  averageScore?: number;
};

export type Collector = {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  status: CollectorStatus;

  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;

  statusUpdatedAt?: string;
  enterpriseName?: string;
  statistics?: CollectorStatistics;
};

/** body */
export type CreateCollectorBody = {
  email: string;
  fullName: string;
  phone: string;
};

export type UpdateCollectorBody = {
  fullName?: string;
  phone?: string;
  status?: CollectorStatus;
};

/** backend wrap */
export type ApiResponse<T> = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: T;
};

/** list meta chuẩn theo screenshot */
export type CollectorListMeta = {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type CollectorListData =
  | Collector[] // fallback legacy
  | {
      items: Collector[];
      meta: CollectorListMeta;

      // fallback nếu backend đổi tên (optional)
      results?: Collector[];
      total?: number;
    };

export type GetCollectorsParams = {
  status?: CollectorStatus;
  search?: string;
  page?: number;
  limit?: number;
};
