import { baseApi } from "@/redux/api/baseApi";
import {
  normalizeCollectorWorkingHours,
  toApiWorkingHoursPayload,
} from "@/utils/collectorWorkingHours";
import type {
  ApiResponse,
  Collector,
  CollectorListData,
  CollectorListMeta,
  CreateCollectorBody,
  GetCollectorsParams,
  UpdateCollectorBody,
  UpdateCollectorWorkingHoursBody,
} from "./types";

const TAG = "Collectors" as const;

const LEGACY_TO_API_STATUS: Record<string, string> = {
  AVAILABLE: "ONLINE_AVAILABLE",
  ON_TASK: "ONLINE_BUSY",
};

function normalizeStatus(status: unknown): string {
  const raw =
    typeof status === "string"
      ? status
      : ((status as any)?.availability ??
        (status as any)?.status ??
        (status as any)?.value);

  const key = String(raw ?? "")
    .trim()
    .toUpperCase();
  if (!key) return "OFFLINE";
  return LEGACY_TO_API_STATUS[key] ?? key;
}

function statusToApi(status?: string): string | undefined {
  if (!status) return undefined;
  const key = String(status).trim().toUpperCase();
  if (!key) return undefined;
  return LEGACY_TO_API_STATUS[key] ?? key;
}

function normalizeCollector(raw: any): Collector {
  const user = raw?.user ?? {};
  const rawStatus = raw?.status;
  const statusInfo =
    rawStatus && typeof rawStatus === "object"
      ? {
          ...rawStatus,
          availability: normalizeStatus(rawStatus?.availability),
        }
      : undefined;
  const workingHours =
    normalizeCollectorWorkingHours(raw?.workingHours) ??
    normalizeCollectorWorkingHours(raw?.working_hours);

  return {
    ...raw,
    id: Number(raw?.id ?? 0),
    employeeCode:
      raw?.employeeCode ??
      raw?.employee_code ??
      raw?.collectorCode ??
      undefined,
    fullName: raw?.fullName ?? user?.fullName ?? raw?.name ?? "",
    email: raw?.email ?? user?.email ?? "",
    phone: raw?.phone ?? user?.phone ?? "",
    avatar: raw?.avatar ?? user?.avatar ?? null,
    status: normalizeStatus(rawStatus),
    statusInfo,
    workingHours,
    statusUpdatedAt: raw?.statusUpdatedAt ?? statusInfo?.updatedAt,
    user: raw?.user ?? undefined,
  };
}

function normalizeListMeta(metaRaw: any, listRaw: any): CollectorListMeta {
  const total =
    metaRaw?.total ?? metaRaw?.totalItems ?? listRaw?.total ?? undefined;
  const page =
    metaRaw?.page ?? metaRaw?.currentPage ?? listRaw?.page ?? undefined;
  const limit =
    metaRaw?.limit ?? metaRaw?.itemsPerPage ?? listRaw?.limit ?? undefined;

  const computedTotalPages =
    metaRaw?.totalPages ??
    listRaw?.totalPages ??
    (typeof total === "number" && typeof limit === "number" && limit > 0
      ? Math.max(1, Math.ceil(total / limit))
      : undefined);

  const hasNextPage =
    typeof metaRaw?.hasNextPage === "boolean"
      ? metaRaw.hasNextPage
      : typeof page === "number" && typeof computedTotalPages === "number"
        ? page < computedTotalPages
        : undefined;

  const hasPrevPage =
    typeof metaRaw?.hasPrevPage === "boolean"
      ? metaRaw.hasPrevPage
      : typeof page === "number"
        ? page > 1
        : undefined;

  return {
    total,
    page,
    limit,
    totalPages: computedTotalPages,
    totalItems: total,
    currentPage: page,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
  };
}

function normalizeListData(raw: any): CollectorListData {
  if (Array.isArray(raw)) {
    return raw.map(normalizeCollector);
  }

  const rows = Array.isArray(raw?.items)
    ? raw.items
    : Array.isArray(raw?.results)
      ? raw.results
      : Array.isArray(raw?.data)
        ? raw.data
        : [];

  const items = rows.map(normalizeCollector);
  const meta = normalizeListMeta(raw?.meta ?? {}, raw);

  return {
    items,
    meta,
    data: items,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
    totalPages: meta.totalPages,
  };
}

function toRequestParams(
  params: GetCollectorsParams | void,
): GetCollectorsParams | undefined {
  if (!params) return undefined;

  const search = params.search?.trim();

  return {
    ...params,
    status: statusToApi(params.status),
    search: search || undefined,
  };
}

function toUpdateCollectorFormData(body: UpdateCollectorBody): FormData {
  const fd = new FormData();

  fd.append("fullName", body.fullName ?? "");

  if (body.phone !== undefined) {
    fd.append("phone", body.phone ?? "");
  }

  if (body.avatar instanceof Blob) {
    fd.append("avatar", body.avatar);
  }

  return fd;
}

function getItemsFromListData(
  data: CollectorListData | undefined,
): Collector[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  return Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.results)
      ? data.results
      : Array.isArray(data.data)
        ? data.data
        : [];
}

function getListBag(draft: any): {
  arr: Collector[];
  setArr: (next: Collector[]) => void;
  meta?: any;
} | null {
  if (!draft) return null;

  if (draft.data == null) {
    draft.data = { items: [] as Collector[], meta: undefined };
  }

  const data = draft.data;

  if (Array.isArray(data)) {
    return {
      arr: data,
      setArr: (next) => {
        data.splice(0, data.length, ...next);
      },
      meta: undefined,
    };
  }

  const arr: Collector[] = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.results)
      ? data.results
      : Array.isArray(data.data)
        ? data.data
        : [];

  if (
    !Array.isArray(data.items) &&
    !Array.isArray(data.results) &&
    !Array.isArray(data.data)
  ) {
    data.items = arr;
  }

  const setArr = (next: Collector[]) => {
    if (Array.isArray(data.items)) data.items = next;
    else if (Array.isArray(data.results)) data.results = next;
    else if (Array.isArray(data.data)) data.data = next;
    else data.items = next;
  };

  return { arr, setArr, meta: data.meta };
}

function matchesFilter(
  c: Collector,
  args: GetCollectorsParams | void,
): boolean {
  if (!args) return true;

  if (args.status) {
    const target = statusToApi(args.status);
    if (target && normalizeStatus(c.status) !== target) return false;
  }

  if (args.search) {
    const s = args.search.trim().toLowerCase();
    if (s) {
      const hay =
        `${c.fullName ?? ""} ${c.email ?? ""} ${c.phone ?? ""}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
  }

  return true;
}

function bumpMeta(meta: any, delta: number, fallbackLimit: number) {
  if (!meta) return;

  const currentTotal =
    typeof meta.totalItems === "number"
      ? meta.totalItems
      : typeof meta.total === "number"
        ? meta.total
        : undefined;

  if (typeof currentTotal !== "number") return;

  const nextTotal = Math.max(0, currentTotal + delta);
  const limit =
    typeof meta.itemsPerPage === "number"
      ? meta.itemsPerPage
      : typeof meta.limit === "number"
        ? meta.limit
        : fallbackLimit;

  const totalPages = Math.max(1, Math.ceil(nextTotal / (limit || 10)));
  const page =
    typeof meta.currentPage === "number"
      ? meta.currentPage
      : typeof meta.page === "number"
        ? meta.page
        : 1;

  meta.totalItems = nextTotal;
  meta.total = nextTotal;
  meta.itemsPerPage = limit;
  meta.limit = limit;
  meta.totalPages = totalPages;
  meta.currentPage = page;
  meta.page = page;
  meta.hasNextPage = page < totalPages;
  meta.hasPrevPage = page > 1;
}

export const collectorsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCollectors: build.query<
      ApiResponse<CollectorListData>,
      GetCollectorsParams | void
    >({
      query: (params) => ({
        url: "enterprise/collectors",
        method: "GET",
        params: toRequestParams(params),
      }),
      transformResponse: (
        res: ApiResponse<any>,
      ): ApiResponse<CollectorListData> => ({
        ...res,
        data: normalizeListData(res?.data),
      }),
      keepUnusedDataFor: 120,
      providesTags: (res) => {
        const items = getItemsFromListData(res?.data);

        return [
          { type: TAG, id: "LIST" },
          ...items.map((c) => ({ type: TAG, id: c.id })),
        ];
      },
    }),

    getCollectorById: build.query<ApiResponse<Collector>, number>({
      query: (id) => ({
        url: `enterprise/collectors/${id}`,
        method: "GET",
      }),
      transformResponse: (res: ApiResponse<any>): ApiResponse<Collector> => ({
        ...res,
        data: normalizeCollector(res?.data),
      }),
      keepUnusedDataFor: 120,
      providesTags: (_res, _err, id) => [{ type: TAG, id }],
    }),

    createCollector: build.mutation<
      ApiResponse<Collector>,
      CreateCollectorBody
    >({
      query: (body) => ({
        url: "collectors",
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiResponse<any>): ApiResponse<Collector> => ({
        ...res,
        data: normalizeCollector(res?.data),
      }),
      invalidatesTags: [{ type: TAG, id: "LIST" }],
      async onQueryStarted(_body, { dispatch, getState, queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled;
          const created = res?.data;
          if (!created) return;

          const state = getState();
          const targets = collectorsApi.util.selectInvalidatedBy(state, [
            { type: TAG, id: "LIST" },
          ]);

          for (const t of targets) {
            if (t.endpointName !== "getCollectors") continue;

            const args = t.originalArgs as GetCollectorsParams | void;
            const page = args?.page ?? 1;
            const limit = args?.limit ?? 10;

            if (page !== 1) continue;
            if (!matchesFilter(created, args)) continue;

            dispatch(
              collectorsApi.util.updateQueryData(
                "getCollectors",
                t.originalArgs as any,
                (draft: any) => {
                  const bag = getListBag(draft);
                  if (!bag) return;

                  const idx = bag.arr.findIndex((x) => x.id === created.id);
                  if (idx >= 0) {
                    bag.arr[idx] = { ...bag.arr[idx], ...created };
                    return;
                  }

                  bag.arr.unshift(created);
                  if (bag.arr.length > limit) bag.arr.pop();
                  bumpMeta(bag.meta, +1, limit);
                },
              ),
            );
          }
        } catch {
          // ignore
        }
      },
    }),

    updateCollector: build.mutation<
      ApiResponse<Collector>,
      { id: number; body: UpdateCollectorBody }
    >({
      query: ({ id, body }) => ({
        url: `enterprise/collectors/${id}`,
        method: "PATCH",
        body: toUpdateCollectorFormData(body),
      }),
      transformResponse: (res: ApiResponse<any>): ApiResponse<Collector> => ({
        ...res,
        data: normalizeCollector(res?.data),
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: TAG, id: arg.id },
        { type: TAG, id: "LIST" },
      ],
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled;
          const updated = res?.data;
          if (!updated) return;

          const state = getState();

          dispatch(
            collectorsApi.util.updateQueryData(
              "getCollectorById",
              arg.id,
              (draftDetail: any) => {
                if (draftDetail?.data) {
                  draftDetail.data = { ...draftDetail.data, ...updated };
                }
              },
            ),
          );

          const targets = collectorsApi.util.selectInvalidatedBy(state, [
            { type: TAG, id: arg.id },
          ]);

          for (const t of targets) {
            if (t.endpointName !== "getCollectors") continue;

            const args = t.originalArgs as GetCollectorsParams | void;
            const limit = args?.limit ?? 10;

            dispatch(
              collectorsApi.util.updateQueryData(
                "getCollectors",
                t.originalArgs as any,
                (draft: any) => {
                  const bag = getListBag(draft);
                  if (!bag) return;

                  const idx = bag.arr.findIndex((x) => x.id === updated.id);
                  if (idx < 0) return;

                  if (!matchesFilter(updated, args)) {
                    const next = bag.arr.filter((x) => x.id !== updated.id);
                    bag.setArr(next);
                    bumpMeta(bag.meta, -1, limit);
                    return;
                  }

                  bag.arr[idx] = { ...bag.arr[idx], ...updated };
                },
              ),
            );
          }
        } catch {
          // ignore
        }
      },
    }),

    updateCollectorWorkingHours: build.mutation<
      ApiResponse<any>,
      { id: number; body: UpdateCollectorWorkingHoursBody }
    >({
      query: ({ id, body }) => ({
        url: `enterprise/collectors/${id}/working-hours`,
        method: "PATCH",
        body: {
          workingHours: toApiWorkingHoursPayload(body.workingHours),
        },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: TAG, id: arg.id },
        { type: TAG, id: "LIST" },
      ],
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled;
          const nextWorkingHours =
            normalizeCollectorWorkingHours(res?.data?.workingHours) ??
            normalizeCollectorWorkingHours(res?.data?.working_hours) ??
            arg.body.workingHours;

          const state = getState();

          dispatch(
            collectorsApi.util.updateQueryData(
              "getCollectorById",
              arg.id,
              (draftDetail: any) => {
                if (draftDetail?.data) {
                  draftDetail.data = {
                    ...draftDetail.data,
                    workingHours: nextWorkingHours,
                  };
                }
              },
            ),
          );

          const targets = collectorsApi.util.selectInvalidatedBy(state, [
            { type: TAG, id: arg.id },
          ]);

          for (const t of targets) {
            if (t.endpointName !== "getCollectors") continue;

            dispatch(
              collectorsApi.util.updateQueryData(
                "getCollectors",
                t.originalArgs as any,
                (draft: any) => {
                  const bag = getListBag(draft);
                  if (!bag) return;

                  const idx = bag.arr.findIndex((x) => x.id === arg.id);
                  if (idx < 0) return;

                  bag.arr[idx] = {
                    ...bag.arr[idx],
                    workingHours: nextWorkingHours,
                  };
                },
              ),
            );
          }
        } catch {
          // ignore
        }
      },
    }),

    deleteCollector: build.mutation<ApiResponse<unknown>, number>({
      query: (id) => ({
        url: `enterprise/collectors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: TAG, id },
        { type: TAG, id: "LIST" },
      ],
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        try {
          await queryFulfilled;

          const state = getState();
          const targets = collectorsApi.util.selectInvalidatedBy(state, [
            { type: TAG, id },
            { type: TAG, id: "LIST" },
          ]);

          for (const t of targets) {
            if (t.endpointName !== "getCollectors") continue;

            const args = t.originalArgs as GetCollectorsParams | void;
            const limit = args?.limit ?? 10;

            dispatch(
              collectorsApi.util.updateQueryData(
                "getCollectors",
                t.originalArgs as any,
                (draft: any) => {
                  const bag = getListBag(draft);
                  if (!bag) return;

                  const before = bag.arr.length;
                  const next = bag.arr.filter((x) => x.id !== id);
                  const removed = before - next.length;

                  if (removed > 0) {
                    bag.setArr(next);
                    bumpMeta(bag.meta, -removed, limit);
                  }
                },
              ),
            );
          }
        } catch {
          // ignore
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCollectorsQuery,
  useGetCollectorByIdQuery,
  useLazyGetCollectorByIdQuery,
  useCreateCollectorMutation,
  useUpdateCollectorMutation,
  useUpdateCollectorWorkingHoursMutation,
  useDeleteCollectorMutation,
} = collectorsApi;
