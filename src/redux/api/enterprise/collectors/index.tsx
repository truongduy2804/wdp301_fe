import { baseApi } from "@/redux/api/baseApi";
import type {
  ApiResponse,
  Collector,
  CollectorListData,
  CreateCollectorBody,
  GetCollectorsParams,
  UpdateCollectorBody,
} from "./types";

const TAG = "Collectors" as const;

/** ===== helper: lấy mảng items + meta từ draft.data ===== */
function getListBag(draft: any): {
  arr: Collector[];
  setArr: (next: Collector[]) => void;
  meta?: any;
} | null {
  if (!draft) return null;

  if (draft.data == null) {
    // tạo container tối thiểu nếu draft trống
    draft.data = { items: [] as Collector[], meta: undefined };
  }

  const data = draft.data;

  // dạng legacy array
  if (Array.isArray(data)) {
    return {
      arr: data,
      setArr: (next) => {
        data.splice(0, data.length, ...next);
      },
      meta: undefined,
    };
  }

  // dạng object
  const arr: Collector[] = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.results)
      ? data.results
      : [];

  // đảm bảo items tồn tại để mutate
  if (!Array.isArray(data.items) && !Array.isArray(data.results)) {
    data.items = arr;
  }

  const setArr = (next: Collector[]) => {
    if (Array.isArray(data.items)) data.items = next;
    else if (Array.isArray(data.results)) data.results = next;
    else data.items = next;
  };

  return { arr, setArr, meta: data.meta };
}

function matchesFilter(
  c: Collector,
  args: GetCollectorsParams | void,
): boolean {
  if (!args) return true;

  if (args.status && c.status !== args.status) return false;

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

function bumpMeta(meta: any, delta: number, limit: number) {
  if (!meta) return;
  if (typeof meta.totalItems === "number") {
    meta.totalItems = Math.max(0, meta.totalItems + delta);
    meta.totalPages = Math.max(1, Math.ceil(meta.totalItems / (limit || 10)));
  }
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
        params: params ?? undefined,
      }),
      keepUnusedDataFor: 120,
      providesTags: (res) => {
        const data = res?.data;
        const items = Array.isArray(data)
          ? data
          : (data?.items ?? data?.results ?? []);

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
      keepUnusedDataFor: 120,
      providesTags: (_res, _err, id) => [{ type: TAG, id }],
    }),

    createCollector: build.mutation<
      ApiResponse<Collector>,
      CreateCollectorBody
    >({
      query: (body) => ({
        url: "enterprise/collectors",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: TAG, id: "LIST" }], // đảm bảo list đúng nếu filter phức tạp
      async onQueryStarted(_body, { dispatch, getState, queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled;
          const created = res?.data;
          if (!created) return;

          // patch mọi cache list đang active (để UI cập nhật ngay)
          const state = getState();
          const targets = collectorsApi.util.selectInvalidatedBy(state, [
            { type: TAG, id: "LIST" },
          ]);

          for (const t of targets) {
            if (t.endpointName !== "getCollectors") continue;

            const args = t.originalArgs as GetCollectorsParams | void;
            const page = args?.page ?? 1;
            const limit = args?.limit ?? 10;

            // create: chỉ insert ở page 1 + match filter/search
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
        body,
      }),
      // update có thể làm đổi filter => invalidate LIST để chắc chắn đúng
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

          // patch detail cache
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

          // patch mọi list cache có tag id đó
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

                  // ✅ update: KHÔNG tự chèn nếu không thấy trong page hiện tại
                  if (idx < 0) return;

                  // nếu sau update không còn match filter/search => remove khỏi list hiện tại
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
  useDeleteCollectorMutation,
} = collectorsApi;
