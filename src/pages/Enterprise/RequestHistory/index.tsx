import React, { useMemo, useState } from "react";
import { ClipboardCheck, RefreshCw } from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import {
  Card,
  Button,
  Badge,
  EmptyState,
  formatNumber,
} from "@/components/ui/page/componentUI";

import ReportsHistoryTable from "../components/reportsHistoryTable";
import ReportDetailModal from "../AcceptedRequests/detailPage";

import { useGetAcceptedReportsQuery } from "@/redux/api/enterprise/reports";

import type {
  AcceptedEnterpriseReport,
  EnterpriseReport,
} from "@/redux/api/enterprise/reports/types";

function mapAcceptedToEnterpriseReport(
  item: AcceptedEnterpriseReport,
): EnterpriseReport {
  return {
    id: item.id,
    reportId: item.reportId,
    address: item.address,
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    provinceCode: item.provinceCode ?? null,
    districtCode: item.districtCode ?? null,
    wardCode: item.wardCode ?? null,
    description: item.description ?? null,
    status: item.status,
    createdAt: item.assignedAt ?? null,
    updatedAt: item.completedAt ?? null,
    assignedAt: item.assignedAt ?? null,
    completedAt: item.completedAt ?? null,
    wasteItems: item.wasteItems ?? [],
    actualWasteItems: item.actualWasteItems ?? [],
    actualWeight: item.actualWeight ?? null,
    accuracyBucket: item.accuracyBucket ?? null,
    images: item.images ?? [],
    evidenceImages: item.evidenceImages ?? [],
    citizen: item.citizen
      ? {
          id: item.citizen.id ?? null,
          fullName: item.citizen.fullName,
          phone: item.citizen.phone ?? null,
          email: item.citizen.email ?? null,
          avatar: item.citizen.avatar ?? null,
        }
      : null,
    collector: item.collector
      ? {
          id: item.collector.id,
          employeeCode: item.collector.employeeCode ?? null,
          fullName: item.collector.fullName,
          phone: item.collector.phone ?? null,
          avatar: item.collector.avatar ?? null,
        }
      : null,
  };
}

export default function EnterpriseApprovedRequestsPage() {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetAcceptedReportsQuery(undefined, {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  const rows: AcceptedEnterpriseReport[] = data?.data ?? [];

  const filtered = useMemo(() => {
    return rows.filter(
      (r) =>
        String(r.status ?? "")
          .trim()
          .toUpperCase() === "COMPLETED",
    );
  }, [rows]);

  const tableData = useMemo<EnterpriseReport[]>(() => {
    return filtered.map(mapAcceptedToEnterpriseReport);
  }, [filtered]);

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedReport, setSelectedReport] =
    useState<AcceptedEnterpriseReport | null>(null);

  const onView = (id: number) => {
    const found = filtered.find((x) => x.id === id) ?? null;
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
                  <ClipboardCheck className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                    Đơn đã hoàn thành
                  </h1>
                  <p className="text-sm text-slate-600">
                    Danh sách đơn doanh nghiệp đã hoàn thành xử lý
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge tone="emerald">{formatNumber(filtered.length)} đơn</Badge>

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
                  {isFetching ? "Đang tải..." : "Tải lại"}
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
              <div className="font-semibold text-rose-600">Lỗi tải dữ liệu</div>
              <pre className="mt-2 whitespace-pre-wrap text-left text-xs text-slate-600">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          ) : tableData.length === 0 ? (
            <EmptyState
              title="Không có đơn đã hoàn thành"
              desc="Hiện chưa có đơn nào ở trạng thái hoàn thành."
            />
          ) : (
            <ReportsHistoryTable
              data={tableData}
              onView={onView}
              onPrefetchDetail={() => undefined}
            />
          )}
        </Card>
      </div>

      <ReportDetailModal
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
