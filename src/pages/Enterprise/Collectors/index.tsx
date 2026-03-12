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
  CollectorWorkingHours,
  CreateCollectorBody,
  GetCollectorsParams,
} from "@/redux/api/enterprise/collectors/types";

import CollectorsTable from "./collectorsTable";
import CollectorDetailModal from "./collectorDetailModal";
import CollectorCreateModal from "./collectorCreateModal";
import CollectorEditModal from "./collectorEditModal";
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
  { value: "ONLINE_AVAILABLE", label: "Sẵn sàng" },
  // { value: "ONLINE_BUSY", label: "Đang bận" },
  { value: "OFFLINE", label: "Ngoại tuyến" },
];

type UpsertValues = {
  email?: string;
  fullName: string;
  phone: string;
  avatar?: File | Blob | null;
  workingHours?: CollectorWorkingHours;
};

export default function EnterpriseCollectorsPage() {
  const [status, setStatus] = useState<StatusFilter>("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search.trim(), 350);

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

  const [createCollector, { isLoading: creating }] =
    useCreateCollectorMutation();
  const [updateCollector, { isLoading: updating }] =
    useUpdateCollectorMutation();
  const [deleteCollector, { isLoading: deleting }] =
    useDeleteCollectorMutation();

  const [viewOpen, setViewOpen] = useState(false);
  const [fetchDetail, detail] = useLazyGetCollectorByIdQuery();

  const onView = (id: number) => {
    setViewOpen(true);
    fetchDetail(id);
  };

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

  const onSubmitUpsert = async (values: UpsertValues) => {
    try {
      if (!editing) {
        const payload: CreateCollectorBody = {
          email: values.email ?? "",
          fullName: values.fullName,
          phone: values.phone,
          workingHours: values.workingHours as CollectorWorkingHours,
        };

        await createCollector(payload).unwrap();
        toast.success("Đã tạo nhân sự thu gom", { autoClose: 1400 });
      } else {
        await updateCollector({
          id: editing.id,
          body: {
            fullName: values.fullName,
            phone: values.phone,
            avatar: values.avatar ?? undefined,
          },
        }).unwrap();

        toast.success("Đã cập nhật nhân sự thu gom", { autoClose: 1400 });
      }

      setUpsertOpen(false);
      setEditing(null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Thao tác thất bại");
    }
  };

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
      toast.success("Đã xoá nhân sự thu gom", { autoClose: 1400 });
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Xoá thất bại");
    }
  };

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
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Card hover={false} className="overflow-visible">
          <CardHeader
            title={
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <Users className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
                    Quản lý nhân sự thu gom
                  </h1>
                  <p className="text-sm font-normal text-slate-600">
                    Tạo, chỉnh sửa, xoá nhân sự; tìm kiếm và lọc theo trạng thái
                  </p>
                </div>
              </div>
            }
            right={
              <div className="relative z-[20] flex w-full flex-wrap items-center justify-start gap-2 sm:justify-end">
                <div className="inline-flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:w-auto">
                  <span className="shrink-0 text-xs font-medium text-slate-600">
                    Tìm kiếm
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tên hoặc email…"
                    className="w-full bg-transparent text-sm font-normal outline-none placeholder:text-slate-400 sm:w-[180px]"
                  />
                </div>

                <div className="w-full sm:min-w-0 sm:w-auto">
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
                  className="!rounded-2xl !border !border-slate-200 !bg-white !px-3 !py-2 !font-medium !text-slate-800 shadow-sm transition-all duration-200 ease-out hover:!border-emerald-300 hover:!bg-emerald-50/60 hover:!text-emerald-800 hover:shadow active:!bg-emerald-100/60 disabled:!cursor-not-allowed disabled:!opacity-70"
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
                  className="w-full !rounded-2xl !bg-emerald-600 !px-3 !py-2 !font-medium !text-white shadow-sm transition-all duration-200 ease-out hover:!bg-emerald-700 hover:shadow active:!bg-emerald-800 disabled:!opacity-70 sm:w-auto"
                >
                  + Tạo nhân sự
                </Button>
              </div>
            }
          />
        </Card>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Card className="overflow-hidden" hover={false}>
          {isLoading ? (
            <div className="py-10">
              <LoadingSpinner color="blue" size="10" />
            </div>
          ) : isError ? (
            <div className="p-6 text-center">
              <div className="font-semibold text-rose-600">Lỗi tải dữ liệu</div>
              <pre className="mt-2 whitespace-pre-wrap text-left text-xs text-slate-600">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="Danh sách nhân sự thu gom đang trống"
              desc="Thử đổi bộ lọc hoặc tạo nhân sự thu gom mới."
            />
          ) : (
            <>
              <CollectorsTable
                data={items}
                busy={creating || updating || deleting}
                onView={onView}
                onEdit={onEditOpen}
                onDelete={onAskDelete}
              />

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
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

      <CollectorDetailModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        loading={detail.isFetching}
        detail={detail.data?.data ?? null}
      />

      {editing ? (
        <CollectorEditModal
          open={upsertOpen}
          initial={editing}
          submitting={creating || updating}
          onClose={() => {
            if (creating || updating) return;
            setUpsertOpen(false);
            setEditing(null);
          }}
          onSubmit={onSubmitUpsert}
        />
      ) : (
        <CollectorCreateModal
          open={upsertOpen}
          submitting={creating || updating}
          onClose={() => {
            if (creating || updating) return;
            setUpsertOpen(false);
          }}
          onSubmit={onSubmitUpsert}
        />
      )}

      <ConfirmDeleteModal
        open={deleteOpen}
        loading={deleting}
        title={
          deleteTarget
            ? `Xoá nhân sự thu gom "${deleteTarget.fullName}"?`
            : "Xoá nhân sự thu gom?"
        }
        desc={
          deleteTarget
            ? "Bạn có chắc chắn muốn xoá nhân sự này?"
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
