import React, { useMemo, useState } from "react";
import { RefreshCw, XCircle } from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  formatNumber,
} from "@/components/ui/page/componentUI";
import { useGetCancelledReportsQuery } from "@/redux/api/enterprise/reports";
import type { CancelledEnterpriseReport } from "@/redux/api/enterprise/reports/types";

import CancelledReportsTable from "../components/cancelledReportsTable";
import CancelledReportDetailModal from "../components/cancelledReportDetailModal";

const TEXT = {
  title: "Đơn đã hủy",
  subtitle:
    "Theo dõi các đơn đã bị hủy, bên thực hiện hủy và chi tiết nguyên nhân liên quan",
  badgeSuffix: "đơn",
  refresh: "Tải lại",
  refreshing: "Đang tải...",
  error: "Lỗi tải dữ liệu",
  emptyTitle: "Chưa có đơn đã hủy",
  emptyDesc:
    "Khi có đơn bị hủy, danh sách sẽ hiển thị tại đây để doanh nghiệp tiện theo dõi.",
};

export default function EnterpriseCancelledRequestsPage() {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetCancelledReportsQuery(undefined, {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  const rows = useMemo<CancelledEnterpriseReport[]>(() => {
    const source = data?.data ?? [];

    return [...source].sort((a, b) => {
      const left = new Date(b.cancelledAt ?? b.createdAt ?? 0).getTime();
      const right = new Date(a.cancelledAt ?? a.createdAt ?? 0).getTime();
      return left - right;
    });
  }, [data?.data]);

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedReport, setSelectedReport] =
    useState<CancelledEnterpriseReport | null>(null);

  const onView = (id: number) => {
    const found = rows.find((report) => report.id === id) ?? null;
    setSelectedReport(found);
    setViewOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 text-center lg:text-left">
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <XCircle className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
                    {TEXT.title}
                  </h1>
                  <p className="text-sm text-slate-600">{TEXT.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
              <Badge tone="emerald">
                {formatNumber(rows.length)} {TEXT.badgeSuffix}
              </Badge>

              <Button
                variant="ghost"
                onClick={() => refetch()}
                disabled={isFetching}
                className="
                  !rounded-2xl !px-3 !py-2
                  !bg-white !border !border-slate-200
                  !text-slate-800 !font-medium
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
                  {isFetching ? TEXT.refreshing : TEXT.refresh}
                </span>
              </Button>
            </div>
          </div>
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
              <div className="font-semibold text-rose-600">{TEXT.error}</div>
              <pre className="mt-2 whitespace-pre-wrap text-left text-xs text-slate-600">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          ) : rows.length === 0 ? (
            <EmptyState title={TEXT.emptyTitle} desc={TEXT.emptyDesc} />
          ) : (
            <CancelledReportsTable data={rows} onView={onView} />
          )}
        </Card>
      </div>

      <CancelledReportDetailModal
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setSelectedReport(null);
        }}
        loading={false}
        report={viewOpen ? selectedReport : null}
      />
    </div>
  );
}
