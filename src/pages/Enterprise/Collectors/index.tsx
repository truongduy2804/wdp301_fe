import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Users, RefreshCw } from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Dropdown,
  EmptyState,
  formatNumber,
} from "@/components/ui/page/componentUI";

import {
  useCreateCollectorMutation,
  useDeleteCollectorMutation,
  useGetCollectorsQuery,
  useLazyGetCollectorByIdQuery,
  useUpdateCollectorMutation,
} from "@/redux/api/enterprise/collectors";

import type {
  Collector,
  CollectorStatus,
  CreateCollectorBody,
  GetCollectorsParams,
  UpdateCollectorBody,
} from "@/redux/api/enterprise/collectors/types";

import CollectorsTable from "./collectorsTable";
import CollectorDetailModal from "./collectorDetailModal";
import CollectorUpsertModal from "./collectorUpsertModal";
import ConfirmDeleteModal from "./confirmDeleteModal";

/* ================= Helpers ================= */
function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return v;
}

type ListMeta = {
  totalItems?: number;
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
};

function parseList(listRes: any): { items: Collector[]; meta: ListMeta } {
  const data = listRes?.data;

  // legacy array
  if (Array.isArray(data)) {
    return {
      items: data,
      meta: { totalItems: data.length, currentPage: 1, totalPages: 1 },
    };
  }

  const items: Collector[] = data?.items ?? data?.results ?? [];
  const metaRaw = data?.meta ?? {};

  return {
    items,
    meta: {
      totalItems: metaRaw.totalItems ?? data?.total ?? undefined,
      currentPage: metaRaw.currentPage ?? undefined,
      totalPages: metaRaw.totalPages ?? undefined,
      itemsPerPage: metaRaw.itemsPerPage ?? undefined,
      hasNextPage: metaRaw.hasNextPage ?? undefined,
      hasPrevPage: metaRaw.hasPrevPage ?? undefined,
    },
  };
}

type StatusFilter = CollectorStatus | "";

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "AVAILABLE", label: "Sẵn sàng" },
  { value: "ON_TASK", label: "Đang làm" },
  { value: "OFFLINE", label: "Ngoại tuyến" },
];

export default function EnterpriseCollectorsPage() {
  // filters
  const [status, setStatus] = useState<StatusFilter>("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search.trim(), 350);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch, limit]);

  const listArgs = useMemo<GetCollectorsParams>(
    () => ({
      status: status ? (status as CollectorStatus) : undefined,
      search: debouncedSearch || undefined,
      page,
      limit,
    }),
    [status, debouncedSearch, page, limit],
  );

  const {
    data: listRes,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetCollectorsQuery(listArgs);

  const { items, meta } = useMemo(() => parseList(listRes), [listRes]);

  const countForBadge =
    typeof meta.totalItems === "number" ? meta.totalItems : items.length;

  // ===== Mutations =====
  const [createCollector, { isLoading: creating }] =
    useCreateCollectorMutation();
  const [updateCollector, { isLoading: updating }] =
    useUpdateCollectorMutation();
  const [deleteCollector, { isLoading: deleting }] =
    useDeleteCollectorMutation();

  // ===== View detail =====
  const [viewOpen, setViewOpen] = useState(false);
  const [fetchDetail, detail] = useLazyGetCollectorByIdQuery();

  const onView = (id: number) => {
    setViewOpen(true);
    fetchDetail(id);
  };

  // ===== Create/Edit modal =====
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editing, setEditing] = useState<Collector | null>(null);

  const onCreateOpen = () => {
    setEditing(null);
    setUpsertOpen(true);
  };

  const onEditOpen = (row: Collector) => {
    setEditing(row);
    setUpsertOpen(true);
  };

  const onSubmitUpsert = async (
    values: CreateCollectorBody &
      UpdateCollectorBody & { status?: CollectorStatus },
  ) => {
    try {
      if (!editing) {
        const payload: CreateCollectorBody = {
          email: values.email!,
          fullName: values.fullName!,
          phone: values.phone!,
        };

        await createCollector(payload).unwrap();
        toast.success("Đã tạo collector", { autoClose: 1400 });
      } else {
        const body: UpdateCollectorBody = {
          fullName: values.fullName,
          phone: values.phone,
          status: values.status,
        };

        await updateCollector({ id: editing.id, body }).unwrap();
        toast.success("Đã cập nhật collector", { autoClose: 1400 });
      }

      setUpsertOpen(false);
      setEditing(null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Thao tác thất bại");
    }
  };

  // ===== Delete confirm =====
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Collector | null>(null);

  const onAskDelete = (row: Collector) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCollector(deleteTarget.id).unwrap();
      toast.success("Đã xoá collector", { autoClose: 1400 });
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Xoá thất bại");
    }
  };

  // ===== Pagination UI =====
  const computedTotalPages =
    typeof meta.totalPages === "number"
      ? meta.totalPages
      : typeof meta.totalItems === "number" && meta.totalItems > 0
        ? Math.ceil(meta.totalItems / limit)
        : null;

  const canPrev = page > 1;
  const canNext =
    typeof meta.hasNextPage === "boolean"
      ? meta.hasNextPage
      : computedTotalPages != null
        ? page < computedTotalPages
        : items.length === limit;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Card hover={false} className="overflow-visible">
          <CardHeader
            title={
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <Users className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">
                    Quản lí nhân sự thu gom
                  </h1>
                  <p className="text-sm font-normal text-slate-600">
                    Tạo / sửa / xoá collector, tìm kiếm & lọc theo trạng thái
                  </p>
                </div>
              </div>
            }
            right={
              <div className="relative z-[20] flex flex-wrap items-center justify-start sm:justify-end gap-2 w-full">
                <div className="w-full sm:w-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <span className="text-xs font-medium text-slate-600 shrink-0">
                    Tìm kiếm
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tên hoặc email…"
                    className="w-full sm:w-[180px] bg-transparent text-sm font-normal outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="w-full sm:w-auto sm:min-w-0">
                  <Dropdown<StatusFilter>
                    label="Trạng thái"
                    value={status}
                    options={STATUS_FILTER_OPTIONS}
                    onChange={(v) => setStatus(v)}
                    minWidth={140}
                  />
                </div>

                <Badge tone="emerald">
                  {formatNumber(countForBadge)} người
                </Badge>

                <Button
                  variant="ghost"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="!rounded-2xl !px-3 !py-2 !bg-white !border !border-slate-200 !text-slate-800 !font-medium
                    hover:!border-emerald-300 hover:!bg-emerald-50/60 hover:!text-emerald-800
                    active:!bg-emerald-100/60 disabled:!opacity-70 disabled:!cursor-not-allowed transition-all duration-200 ease-out shadow-sm hover:shadow"
                >
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isFetching
                          ? "animate-spin text-emerald-700"
                          : "text-slate-600"
                      }`}
                    />
                    {isFetching ? "Đang tải..." : "Tải lại"}
                  </span>
                </Button>

                <Button
                  onClick={onCreateOpen}
                  disabled={creating || updating || deleting}
                  className="!rounded-2xl !px-3 !py-2 !bg-emerald-600 !text-white !font-medium
                    hover:!bg-emerald-700 active:!bg-emerald-800 disabled:!opacity-70 transition-all duration-200 ease-out shadow-sm hover:shadow w-full sm:w-auto"
                >
                  + Tạo collector
                </Button>
              </div>
            }
          />
        </Card>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Card className="overflow-hidden" hover={false}>
          {isLoading ? (
            <div className="py-10">
              <LoadingSpinner color="blue" size="10" />
            </div>
          ) : isError ? (
            <div className="p-6 text-center">
              <div className="text-rose-600 font-semibold">Lỗi tải dữ liệu</div>
              <pre className="mt-2 text-xs text-slate-600 text-left whitespace-pre-wrap">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="Danh sách collector đang trống"
              desc="Thử đổi bộ lọc hoặc tạo collector mới."
            />
          ) : (
            <>
              {/* ✅ NHỚ: CollectorsTable phải rowKey = id (antd Table: rowKey={(r)=>r.id}) */}
              <CollectorsTable
                data={items}
                busy={creating || updating || deleting}
                onView={onView}
                onEdit={onEditOpen}
                onDelete={onAskDelete}
              />

              <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-100">
                <div className="text-sm text-slate-600">
                  Trang{" "}
                  <span className="font-semibold text-slate-900">{page}</span>
                  {computedTotalPages ? (
                    <>
                      {" "}
                      /{" "}
                      <span className="font-semibold">
                        {computedTotalPages}
                      </span>
                    </>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={!canPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="!rounded-xl !px-3 !py-1.5"
                  >
                    Trước
                  </Button>

                  <Button
                    variant="outline"
                    disabled={!canNext}
                    onClick={() => setPage((p) => p + 1)}
                    className="!rounded-xl !px-3 !py-1.5"
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* View Modal */}
      <CollectorDetailModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        loading={detail.isFetching}
        detail={detail.data?.data ?? null}
      />

      {/* Create/Edit Modal */}
      <CollectorUpsertModal
        open={upsertOpen}
        mode={editing ? "edit" : "create"}
        initial={editing}
        submitting={creating || updating}
        onClose={() => {
          if (creating || updating) return;
          setUpsertOpen(false);
          setEditing(null);
        }}
        onSubmit={onSubmitUpsert}
      />

      {/* Delete Confirm */}
      <ConfirmDeleteModal
        open={deleteOpen}
        loading={deleting}
        title={
          deleteTarget
            ? `Xoá người thu gom rác "${deleteTarget.fullName}"?`
            : "Xoá collector?"
        }
        desc={
          deleteTarget
            ? `Bạn có chắc chắn muốn xoá người này ?`
            : "Bạn chắc chắn muốn xoá?"
        }
        onClose={() => {
          if (deleting) return;
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
