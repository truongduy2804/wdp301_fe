import React, { useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { ClipboardCheck, RefreshCw } from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import {
  Card,
  Button,
  Badge,
  DateRangePill,
  EmptyState,
  formatNumber,
} from "@/components/ui/page/componentUI";

import ReportsHistoryTable from "../components/reportsHistoryTable";
import ReportDetailModal from "../PendingRequests/detailPage";

import {
  useGetWaitingReportsQuery,
  useLazyGetWaitingReportDetailQuery,
  enterpriseReportsApi,
} from "@/redux/api/enterprise/reports";

import type { EnterpriseReport } from "@/redux/api/enterprise/reports/types";

export default function EnterpriseApprovedRequestsPage() {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetWaitingReportsQuery(undefined, {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  const rows: EnterpriseReport[] = data?.data ?? [];

  //  chỉ lấy status APPROVED
  const approvedOnly = useMemo(() => {
    return rows.filter((r) => (r.status ?? "").toUpperCase() === "ACCEPTED");
  }, [rows]);

  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(14, "day"),
    dayjs(),
  ]);

  const filtered = useMemo(() => {
    const [a, b] = range;
    return approvedOnly.filter((r) => {
      const t = dayjs((r as any).createdAt ?? (r as any).sentAt);
      if (a && b) {
        if (t.isBefore(a.startOf("day")) || t.isAfter(b.endOf("day")))
          return false;
      }
      return true;
    });
  }, [approvedOnly, range]);

  // View modal + fetch detail
  const [viewOpen, setViewOpen] = useState(false);
  const [viewMeta, setViewMeta] = useState<EnterpriseReport | null>(null);
  const [fetchDetail, detail] = useLazyGetWaitingReportDetailQuery();

  const prefetchDetail = enterpriseReportsApi.usePrefetch(
    "getWaitingReportDetail",
  );

  const onView = (id: number) => {
    const meta = filtered.find((x) => x.id === id) ?? null;
    setViewMeta(meta);
    setViewOpen(true);
    fetchDetail(id);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <ClipboardCheck className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Đơn đã duyệt
                  </h1>
                  <p className="text-sm text-slate-600">
                    Danh sách đơn đã duyệt bởi doanh nghiệp
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <span className="text-xs font-semibold text-slate-600">
                  Khoảng ngày
                </span>
                <DateRangePill
                  value={range}
                  onChange={setRange}
                  className="!border-0 !shadow-none !bg-transparent !p-0 hover:!bg-transparent"
                />
              </div>

              <Badge tone="emerald">{formatNumber(filtered.length)} đơn</Badge>

              <Button
                variant="ghost"
                onClick={() => refetch()}
                disabled={isFetching}
                className="
                  !rounded-2xl !px-3 !py-2
                  !bg-white !border !border-slate-200
                  !text-slate-800 !font-semibold
                  hover:!border-emerald-300 hover:!bg-emerald-50/60
                  hover:!text-emerald-800
                  active:!bg-emerald-100/60
                  disabled:!opacity-70 disabled:!cursor-not-allowed
                  transition-all duration-200 ease-out
                  shadow-sm hover:shadow
                "
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
              title="Không có đơn đã duyệt"
              desc="Thử đổi khoảng ngày hoặc tải lại."
            />
          ) : (
            <ReportsHistoryTable
              data={filtered}
              onView={onView}
              onPrefetchDetail={(id) => prefetchDetail(id)}
            />
          )}
        </Card>
      </div>

      {/* View detail modal */}
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
