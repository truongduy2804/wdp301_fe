export type CollectorStatus =
  | "ONLINE_AVAILABLE"
  | "ONLINE_BUSY"
  | "OFFLINE"
  | "AVAILABLE"
  | "ON_TASK"
  | (string & {});

export type CollectorStatistics = {
  totalAssignments?: number;
  completedAssignments?: number;
  pendingAssignments?: number;
  totalTasks?: number;
  completedTasks?: number;
  successRate?: number;
  averageScore?: number;
};

export type CollectorUser = {
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
};

export type CollectorWorkingDay = {
  start?: string;
  end?: string;
  active?: boolean;
};

export type CollectorWorkingHours = Record<
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday",
  CollectorWorkingDay
>;

export type CollectorRuntimeStatus = {
  collectorId?: number;
  availability?: CollectorStatus;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  lastOnlineAt?: string;
  lastOfflineAt?: string;
  lastActivityAt?: string;
  lastAssignedAt?: string;
  deviceId?: string | null;
  queueLength?: number;
  consecutiveSkipCount?: number;
  updatedAt?: string;
};

export type Collector = {
  id: number;
  employeeCode?: string;

  email?: string;
  fullName?: string;
  phone?: string;
  avatar?: string | null;

  status: CollectorStatus;
  statusInfo?: CollectorRuntimeStatus;

  userId?: number;
  enterpriseId?: number;
  primaryZoneId?: number | null;
  secondaryZoneId?: number | null;
  workingHours?: CollectorWorkingHours;
  trustScore?: number;
  earnings?: number;
  skipCount?: number;
  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  statusUpdatedAt?: string;
  enterpriseName?: string;
  statistics?: CollectorStatistics;

  user?: CollectorUser;
};

export type CreateCollectorBody = {
  email: string;
  fullName: string;
  phone: string;
  workingHours: CollectorWorkingHours;
};

export type UpdateCollectorBody = {
  fullName: string;
  phone?: string;
  avatar?: File | Blob | null;
};

export type UpdateCollectorWorkingHoursBody = {
  workingHours: CollectorWorkingHours;
};

export type ApiResponse<T> = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: T;
};

export type CollectorListMeta = {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
};

export type CollectorListData =
  | Collector[]
  | {
      items?: Collector[];
      results?: Collector[];
      data?: Collector[];
      meta?: CollectorListMeta;
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };

export type GetCollectorsParams = {
  status?: CollectorStatus;
  search?: string;
  page?: number;
  limit?: number;
};
