import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Download,
  BadgeCheck,
  Banknote,
  CalendarClock,
  CircleDollarSign,
  CreditCard,
  Loader2,
  RefreshCw,
  Search,
  Wallet,
  X,
  FileText,
} from "lucide-react";

import { Card, Button, Badge, StatCard } from "@/components/ui/page/componentUI";
import {
  fetchAdminPaymentByReference,
  fetchAdminPayments,
  fetchAdminRevenueStats,
} from "@/api/admin/payments";
import type {
  AdminPaymentDetail,
  AdminPaymentListItem,
  AdminPaymentStatus,
  AdminRevenueStats,
} from "@/api/types/adminPayment.types";
import { formatCurrency, formatDateTime, formatNumber } from "@/utils/format";

const PAGE_SIZE = 10;
const EXPORT_PAGE_SIZE = 200;

const PaymentsCharts = lazy(() => import("./PaymentsCharts"));

function csvEscape(value: unknown): string {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function makePaymentCsvRows(rows: AdminPaymentListItem[]): string {
  const header = [
    "id",
    "referenceCode",
    "enterprise",
    "userEmail",
    "plan",
    "amount",
    "currency",
    "method",
    "status",
    "createdAt",
    "paidAt",
    "expiresAt",
  ];

  const lines = rows.map((row) => {
    const cols = [
      row.id,
      row.referenceCode,
      row.enterprise?.name || "",
      row.user?.email || "",
      row.plan?.name || "",
      Number(row.amount || 0),
      row.currency || "",
      row.method || "",
      row.status || "",
      row.createdAt || "",
      row.paidAt || "",
      row.expiresAt || "",
    ];
    return cols.map(csvEscape).join(",");
  });

  return [header.join(","), ...lines].join("\n");
}

function triggerCsvDownload(filename: string, csvData: string): void {
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getStatusLabel(status: AdminPaymentStatus): string {
  switch (status) {
    case "PAID":
      return "Đã thanh toán";
    case "PENDING":
      return "Chờ thanh toán";
    case "FAILED":
      return "Thất bại";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
}

function getStatusTone(status: AdminPaymentStatus): "emerald" | "amber" | "rose" | "slate" {
  switch (status) {
    case "PAID":
      return "emerald";
    case "PENDING":
      return "amber";
    case "FAILED":
    case "CANCELLED":
      return "rose";
    default:
      return "slate";
  }
}

function StatSkeleton() {
  return (
    <div className="h-[120px] animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
      <div className="h-3 w-1/2 rounded bg-slate-200" />
      <div className="mt-4 h-7 w-3/4 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-1/3 rounded bg-slate-200" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] text-sm">
        <thead className="bg-slate-50">
          <tr>
            {Array.from({ length: 8 }).map((_, idx) => (
              <th key={idx} className="px-4 py-3 text-left">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-t border-slate-200">
              {Array.from({ length: 8 }).map((__, colIdx) => (
                <td key={colIdx} className="px-4 py-4">
                  <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyPaymentsState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-cyan-300 bg-gradient-to-b from-cyan-50 to-white px-4 py-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
        <FileText className="h-6 w-6" />
      </div>
      <p className="text-base font-bold text-slate-900">Không có giao dịch phù hợp</p>
      <p className="mt-1 text-sm text-slate-600">Thử nới bộ lọc hoặc đặt lại để xem toàn bộ dữ liệu.</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 text-sm font-semibold text-cyan-700 hover:bg-cyan-100"
      >
        <Search className="h-4 w-4" />
        Đặt lại bộ lọc
      </button>
    </div>
  );
}

export default function AdminPaymentsRevenue() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AdminPaymentStatus>("ALL");
  const [page, setPage] = useState(1);
  const [exportingCurrent, setExportingCurrent] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);

  const [payments, setPayments] = useState<AdminPaymentListItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: PAGE_SIZE });
  const [summary, setSummary] = useState({ totalAmount: 0, totalTransactions: 0 });
  const [revenueStats, setRevenueStats] = useState<AdminRevenueStats | null>(null);

  const [selectedReference, setSelectedReference] = useState<string>("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<AdminPaymentDetail | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchText(searchText.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchText]);

  const totalPages = Math.max(1, Math.ceil(meta.total / Math.max(1, meta.limit)));

  const queryFilters = useMemo(
    () => ({
      search: debouncedSearchText || undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
    }),
    [debouncedSearchText, statusFilter],
  );

  const loadMainData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [listResult, statsResult] = await Promise.all([
        fetchAdminPayments({
          page,
          limit: PAGE_SIZE,
          ...queryFilters,
        }),
        fetchAdminRevenueStats(),
      ]);

      setPayments(listResult.data || []);
      setMeta(listResult.meta || { total: 0, page, limit: PAGE_SIZE });
      setSummary(
        listResult.summary || {
          totalAmount: 0,
          totalTransactions: 0,
        },
      );
      setRevenueStats(statsResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tải dữ liệu doanh thu.";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMainData();
  }, [page, queryFilters]);

  const openPaymentDetail = async (referenceCode: string) => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      setSelectedReference(referenceCode);
      const detail = await fetchAdminPaymentByReference(referenceCode);
      setSelectedDetail(detail);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tải chi tiết thanh toán.";
      setDetailError(message);
      setSelectedDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closePanel = () => {
    setSelectedReference("");
    setSelectedDetail(null);
    setDetailError(null);
  };

  const resetFilters = () => {
    setSearchText("");
    setDebouncedSearchText("");
    setStatusFilter("ALL");
    setPage(1);
  };

  const handleExportCurrent = () => {
    if (!payments.length) return;
    try {
      setExportingCurrent(true);
      const csv = makePaymentCsvRows(payments);
      const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
      triggerCsvDownload(`payments-current-page-${stamp}.csv`, csv);
    } finally {
      setExportingCurrent(false);
    }
  };

  const handleExportAllFiltered = async () => {
    try {
      setExportingAll(true);
      let cursorPage = 1;
      let totalPagesToFetch = 1;
      const collected: AdminPaymentListItem[] = [];

      while (cursorPage <= totalPagesToFetch) {
        const res = await fetchAdminPayments({
          page: cursorPage,
          limit: EXPORT_PAGE_SIZE,
          ...queryFilters,
        });

        collected.push(...(res.data || []));
        totalPagesToFetch = Math.max(
          1,
          Math.ceil((res.meta?.total || 0) / Math.max(1, EXPORT_PAGE_SIZE)),
        );
        cursorPage += 1;
      }

      if (!collected.length) return;

      const csv = makePaymentCsvRows(collected);
      const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
      triggerCsvDownload(`payments-filtered-all-${stamp}.csv`, csv);
    } finally {
      setExportingAll(false);
    }
  };

  const pageStart = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const pageEnd = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <CircleDollarSign className="h-3.5 w-3.5" />
                Quản trị tài chính
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Doanh thu và thanh toán</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button
                variant="ghost"
                onClick={handleExportCurrent}
                disabled={exportingCurrent || !payments.length}
                className="!h-10 !min-w-[176px] !rounded-xl !bg-white/15 !px-4 !text-center !justify-center !text-white !border !border-white/35 hover:!bg-white/25 hover:!border-white/60 hover:!shadow-md disabled:!opacity-55"
              >
                <Download className={`h-4 w-4 ${exportingCurrent ? "animate-pulse" : ""}`} />
                Xuất trang hiện tại
              </Button>

              

              <Button
                variant="ghost"
                onClick={() => loadMainData(true)}
                disabled={refreshing}
                className="!h-10 !min-w-[150px] !rounded-xl !bg-white/15 !px-4 !text-center !justify-center !text-white !border !border-white/35 hover:!bg-white/25 hover:!border-white/60 hover:!shadow-md"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Đang làm mới" : "Làm mới"}
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading || !revenueStats ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Doanh thu toàn hệ thống"
                value={formatCurrency(Number(revenueStats.totalRevenue || 0))}
                sub={`${formatNumber(Number(revenueStats.totalTransactions || 0))} giao dịch đã thanh toán`}
                icon={Wallet}
              />
              <StatCard
                title="Doanh thu tháng này"
                value={formatCurrency(Number(revenueStats.monthlyRevenue || 0))}
                sub={`${formatNumber(Number(revenueStats.monthlyTransactions || 0))} giao dịch`}
                icon={CalendarClock}
              />
              <StatCard
                title="Doanh thu năm nay"
                value={formatCurrency(Number(revenueStats.yearlyRevenue || 0))}
                sub={`${formatNumber(Number(revenueStats.yearlyTransactions || 0))} giao dịch`}
                icon={Banknote}
              />
              <StatCard
                title="Tổng số giao dịch"
                value={formatNumber(Number(summary.totalTransactions || 0))}
                sub="Tổng "
                icon={CreditCard}
              />
            </>
          )}
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <Card className="h-[360px] animate-pulse xl:col-span-2">
                <div className="h-full w-full" />
              </Card>
              <Card className="h-[360px] animate-pulse">
                <div className="h-full w-full" />
              </Card>
            </div>
          }
        >
          <PaymentsCharts revenueStats={revenueStats} />
        </Suspense>

        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Danh sách giao dịch</h2>
              <p className="text-sm text-slate-600"></p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus-within:ring-2 focus-within:ring-cyan-200">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Tìm theo mã, doanh nghiệp, email..."
                  className="w-[280px] max-w-[65vw] bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as "ALL" | AdminPaymentStatus);
                  setPage(1);
                }}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PAID">Đã thanh toán</option>
                <option value="PENDING">Chờ thanh toán</option>
                <option value="FAILED">Thất bại</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : payments.length === 0 ? (
            <EmptyPaymentsState onReset={resetFilters} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã tham chiếu</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Doanh nghiệp</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Gói</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Số tiền</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Tạo lúc</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Thanh toán lúc</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((item) => (
                    <tr
                      key={item.id}
                      className="cursor-pointer border-t border-slate-200 hover:bg-cyan-50/40"
                      onClick={() => openPaymentDetail(item.referenceCode)}
                    >
                      <td className="px-4 py-3 font-semibold text-cyan-800">{item.referenceCode}</td>
                      <td className="px-4 py-3 text-slate-900">{item.enterprise?.name || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.plan?.name || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {formatCurrency(Number(item.amount || 0))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          tone={getStatusTone(item.status)}
                          className="min-w-[116px] justify-center whitespace-nowrap text-center"
                        >
                          {getStatusLabel(item.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(item.createdAt)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(item.paidAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPaymentDetail(item.referenceCode);
                          }}
                          className="inline-flex h-8 items-center rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-600">
              Hiển thị {formatNumber(pageStart)} - {formatNumber(pageEnd)} / {formatNumber(meta.total)} giao dịch
            </p>

            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Trang {meta.page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </Card>
      </div>

      {(selectedReference || selectedDetail || detailError) && (
        <div className="fixed inset-0 z-[1400] bg-black/35" onClick={closePanel}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Chi tiết thanh toán</h3>
                <p className="text-xs text-slate-600">Mã: {selectedReference || selectedDetail?.referenceCode || "-"}</p>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              {detailLoading ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-slate-700">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-semibold">Đang tải chi tiết...</span>
                </div>
              ) : detailError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {detailError}
                </div>
              ) : selectedDetail ? (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Card className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Số tiền</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {formatCurrency(Number(selectedDetail.amount || 0))}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{selectedDetail.currency || "VND"}</p>
                    </Card>

                    <Card className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</p>
                      <div className="mt-2">
                        <Badge tone={getStatusTone(selectedDetail.status)}>
                          <span className="inline-flex items-center gap-1">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            {getStatusLabel(selectedDetail.status)}
                          </span>
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Phương thức: {selectedDetail.method}</p>
                    </Card>
                  </div>

                  <Card className="p-4">
                    <h4 className="text-sm font-bold text-slate-900">Thông tin giao dịch</h4>
                    <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-slate-500">Mã tham chiếu</dt>
                        <dd className="font-semibold text-slate-900 break-all">{selectedDetail.referenceCode}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Ngân hàng</dt>
                        <dd className="font-semibold text-slate-900">{selectedDetail.bankName || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Tài khoản</dt>
                        <dd className="font-semibold text-slate-900">{selectedDetail.bankAccountNumber || "-"}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-slate-500">Tạo lúc</dt>
                        <dd className="font-semibold text-slate-900">{formatDateTime(selectedDetail.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Thanh toán lúc</dt>
                        <dd className="font-semibold text-slate-900">{formatDateTime(selectedDetail.paidAt)}</dd>
                      </div>
                    </dl>
                  </Card>

                  <Card className="p-4">
                    <h4 className="text-sm font-bold text-slate-900">Bên liên quan</h4>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Doanh nghiệp</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{selectedDetail.enterprise?.name || "-"}</p>
                        <p className="mt-1 text-xs text-slate-600">{selectedDetail.enterprise?.address || "-"}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Người dùng</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{selectedDetail.user?.fullName || "-"}</p>
                        <p className="mt-1 text-xs text-slate-600">{selectedDetail.user?.email || "-"}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="text-sm font-bold text-slate-900">Gói đăng ký</h4>
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm font-bold text-slate-900">{selectedDetail.plan?.name || "-"}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {selectedDetail.plan
                          ? `${formatCurrency(Number(selectedDetail.plan.price || 0))} / ${selectedDetail.plan.durationMonths} tháng`
                          : "-"}
                      </p>
                    </div>
                  </Card>

                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
