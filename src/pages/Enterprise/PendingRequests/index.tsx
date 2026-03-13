import React, { useCallback, useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { toast } from "react-toastify";
import { ClipboardList, RefreshCw } from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import {
  Card,
  Badge,
  Button,
  DateRangePill,
  EmptyState,
  formatNumber,
} from "@/components/ui/page/componentUI";

import WaitingReportsTable from "../components/waitingReportsTable";
import ReportDetailModal from "./detailPage";

import {
  useGetWaitingReportsQuery,
  useLazyGetWaitingReportDetailQuery,
  useAcceptReportMutation,
  useRejectReportMutation,
  enterpriseReportsApi,
} from "@/redux/api/enterprise/reports";

import type { EnterpriseReport } from "@/redux/api/enterprise/reports/types";

export default function EnterprisePendingRequestsPage() {
  // ✅ bỏ refetchOnFocus/refetchOnReconnect để tránh request “tự nhiên bắn”
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetWaitingReportsQuery();

  const rows: EnterpriseReport[] = data?.data ?? [];

  const pendingOnly = useMemo(
    () => rows.filter((r) => (r.status ?? "").toUpperCase() === "PENDING"),
    [rows],
  );

  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(14, "day"),
    dayjs(),
  ]);

  const filtered = useMemo(() => {
    const [a, b] = range;
    return pendingOnly.filter((r) => {
      const t = dayjs(r.createdAt ?? r.sentAt);
      if (a && b) {
        if (t.isBefore(a.startOf("day")) || t.isAfter(b.endOf("day")))
          return false;
      }
      return true;
    });
  }, [pendingOnly, range]);

  const [acceptReport] = useAcceptReportMutation();
  const [rejectReport] = useRejectReportMutation();
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // View modal + fetch detail
  const [viewOpen, setViewOpen] = useState(false);
  const [viewMeta, setViewMeta] = useState<EnterpriseReport | null>(null);
  const [fetchDetail, detail] = useLazyGetWaitingReportDetailQuery();

  const prefetchDetail = enterpriseReportsApi.usePrefetch(
    "getWaitingReportDetail",
  );

  const onView = useCallback(
    (id: number) => {
      const meta = filtered.find((x) => x.id === id) ?? null;
      setViewMeta(meta);
      setViewOpen(true);
      fetchDetail(id);
    },
    [filtered, fetchDetail],
  );

  const onAccept = useCallback(
    async (id: number) => {
      try {
        setActionLoadingId(id);
        await acceptReport(id).unwrap();
        toast.success(`Đã duyệt đơn #${id}`, { autoClose: 1400 });
      } catch (e: any) {
        toast.error(e?.data?.message ?? "Duyệt thất bại");
        throw e; // để confirm giữ modal nếu fail
      } finally {
        setActionLoadingId(null);
      }
    },
    [acceptReport],
  );

  const onReject = useCallback(
    async (id: number) => {
      try {
        setActionLoadingId(id);
        await rejectReport({ id }).unwrap();
        toast.success(`Đã từ chối đơn #${id}`, { autoClose: 1400 });
      } catch (e: any) {
        toast.error(e?.data?.message ?? "Từ chối thất bại");
        throw e;
      } finally {
        setActionLoadingId(null);
      }
    },
    [rejectReport],
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <ClipboardList className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Đơn chờ phản hồi
                  </h1>
                  <p className="text-sm text-slate-600">
                    Theo dõi đơn và thời gian hiệu lực còn lại
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
              <Badge tone="emerald">{formatNumber(filtered.length)} đơn</Badge>

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
            </div>
          </div>
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
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Danh sách đơn chờ đang trống"
              desc="Thử đổi khoảng ngày."
            />
          ) : (
            <WaitingReportsTable
              data={filtered}
              actionLoadingId={actionLoadingId}
              onView={onView}
              onPrefetchDetail={prefetchDetail}
              onAccept={onAccept}
              onReject={onReject}
            />
          )}
        </Card>
      </div>

      {/* Detail modal */}
      <ReportDetailModal
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setViewMeta(null);
        }}
        loading={detail.isFetching}
        detail={detail.data?.data ?? null}
        meta={viewMeta}
      />
    </div>
  );
}
