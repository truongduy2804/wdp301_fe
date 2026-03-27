import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  Building2,
  Search,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  Ban,
  Zap,
  Eye,
  Lock,
  LockOpen,
  X,
} from "lucide-react";

import {
  Card,
  Button,
} from "@/components/ui/page/componentUI";
import { formatDateTime, formatNumber } from "@/utils/format";
import { fetchEnterprises, updateEnterpriseStatus, type Enterprise, type EnterprisesQuery } from "@/api/admin/enterprises";
import { toast } from "react-toastify";

export default function AdminEnterprisesManagement() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEnterprises, setTotalEnterprises] = useState(0);
  const [itemsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);

  useEffect(() => {
    loadEnterprises();
  }, [searchQuery, statusFilter, currentPage]);

  const loadEnterprises = async () => {
    try {
      setLoading(true);
      setError(null);

      const query: EnterprisesQuery = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery) query.search = searchQuery;
      if (statusFilter !== "ALL") query.status = statusFilter as any;

      const result = await fetchEnterprises(query);
      setEnterprises(result.data || []);
      setTotalEnterprises(result.meta?.total || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách doanh nghiệp";
      setError(message);
      console.error("Error loading enterprises:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (enterprise: Enterprise) => {
    const nextStatus = enterprise.status === "BANNED" ? "ACTIVE" : "BANNED";
    const actionLabel = nextStatus === "BANNED" ? "khóa" : "mở khóa";

    try {
      setActionLoading(true);
      await updateEnterpriseStatus(enterprise.id, nextStatus);

      setEnterprises((prev) =>
        prev.map((item) => (item.id === enterprise.id ? { ...item, status: nextStatus } : item))
      );
      setSelectedEnterprise((prev) =>
        prev && prev.id === enterprise.id ? { ...prev, status: nextStatus } : prev
      );
      setSelectedEnterprise(null);
      toast.success(
        `${nextStatus === "BANNED" ? "Khóa" : "Mở khóa"} doanh nghiệp thành công!`,
        { autoClose: 1400 },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : `Có lỗi khi ${actionLabel} doanh nghiệp`;
      console.error("Error toggling enterprise status:", err);
      toast.error(message, { autoClose: 1800 });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "OFFLINE":
        return "bg-slate-100 text-slate-700";
      case "BANNED":
        return "bg-red-100 text-red-700";
      case "EXPIRED":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Hoạt động";
      case "PENDING":
        return "Chờ xét duyệt";
      case "OFFLINE":
        return "Ngoại tuyến";
      case "BANNED":
        return "Bị khóa";
      case "EXPIRED":
        return "Hết hạn";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "OFFLINE":
        return <Zap className="h-4 w-4" />;
      case "BANNED":
        return <Ban className="h-4 w-4" />;
      case "EXPIRED":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(totalEnterprises / itemsPerPage);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <Card className="p-3 sm:p-4 overflow-visible">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-2.5">
                  <Building2 className="h-5 w-5 text-blue-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Quản lí doanh nghiệp
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Quản lý tài khoản doanh nghiệp, trạng thái và thông tin chi tiết.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 overflow-visible">
              <div className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors focus-within:ring-2 focus-within:ring-emerald-200">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên doanh nghiệp hoặc email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-56 max-w-[52vw] bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <Button
                variant="ghost"
                onClick={loadEnterprises}
                disabled={loading}
                className="!h-9 !rounded-xl !px-3 !bg-white !border !border-slate-200 !text-slate-800 !font-medium hover:!border-emerald-300 hover:!bg-emerald-50/60 hover:!text-emerald-800 active:!bg-emerald-100/60 disabled:!opacity-70 disabled:!cursor-not-allowed transition-all duration-200 ease-out shadow-sm hover:shadow"
              >
                <span className="inline-flex items-center gap-2">
                  <RefreshCw
                    className={`h-4 w-4 ${
                      loading ? "animate-spin text-emerald-700" : "text-slate-600"
                    }`}
                  />
                  {loading ? "Đang tải..." : "Tải lại"}
                </span>
              </Button>
            </div>
          </div>

          <div className="mt-3 max-w-[240px]">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                disabled={loading}
              >
                <option value="ALL">Tất cả</option>
                <option value="PENDING">Chờ xét duyệt</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="OFFLINE">Ngoại tuyến</option>
                <option value="BANNED">Bị khóa</option>
                <option value="EXPIRED">Hết hạn</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Lỗi</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={loadEnterprises}
                className="mt-2 text-sm font-semibold text-red-700 hover:text-red-800 underline"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Enterprises Table */}
        <Card className="p-4 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              <span className="ml-3 text-slate-600 font-semibold">Đang tải...</span>
            </div>
          ) : enterprises.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Không có doanh nghiệp nào</p>
              <p className="text-sm text-slate-500 mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Tên doanh nghiệp
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Người đại diện
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Điện thoại
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Trạng thái
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Nhân viên
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Dung tích (kg)
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Ngày tạo
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enterprises.map((enterprise) => (
                    <tr
                      key={enterprise.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-900 font-medium">
                        {enterprise.name}
                      </td>
                      <td className="px-4 py-3 text-slate-900">
                        {enterprise.owner?.fullName || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-900">
                        {enterprise.owner?.email || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-900">
                        {enterprise.owner?.phone || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                            enterprise.status
                          )}`}
                        >
                          {getStatusIcon(enterprise.status)}
                          {getStatusLabel(enterprise.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-900 text-center font-medium">
                        {enterprise.collectorsCount || 0}
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-medium">
                        {formatNumber(enterprise.capacityKg || 0)} kg
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {formatDateTime(enterprise.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            className="h-8 w-8 !p-0"
                            onClick={() => setSelectedEnterprise(enterprise)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          <button
                            onClick={() => handleToggleBan(enterprise)}
                            disabled={actionLoading}
                            className={`inline-flex h-8 items-center justify-center gap-1 rounded-xl px-2.5 text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-all ${
                              enterprise.status === "BANNED"
                                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300"
                            }`}
                          >
                            {enterprise.status === "BANNED" ? (
                              <>
                                <LockOpen className="h-3.5 w-3.5" />
                                Mở
                              </>
                            ) : (
                              <>
                                <Lock className="h-3.5 w-3.5" />
                                Khóa
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
              <div className="text-sm text-slate-600">
                Tổng doanh nghiệp: {formatNumber(totalEnterprises)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  ← Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, currentPage - 2),
                    Math.min(totalPages, currentPage + 1)
                  )
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
                        page === currentPage
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages || loading}
                  className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </Card>

        {selectedEnterprise && (
          <div
            className="fixed inset-0 z-[1400] bg-black/45"
            onClick={() => setSelectedEnterprise(null)}
          >
            <div className="fixed left-1/2 top-1/2 z-[1401] w-[94vw] max-w-5xl max-h-[92vh] -translate-x-1/2 -translate-y-1/2 flex flex-col overflow-hidden rounded-2xl bg-emerald-600 shadow-2xl">
              <div
                className="flex h-full flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-emerald-500 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-extrabold text-white truncate">
                        Chi tiết doanh nghiệp #{selectedEnterprise.id}
                      </h2>
                      <p className="text-sm text-emerald-100 truncate">{selectedEnterprise.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedEnterprise(null)}
                      className="grid h-9 w-9 place-items-center rounded-md hover:bg-emerald-500"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto custom-scrollbar max-h-[calc(92vh-150px)] p-5 sm:p-6 bg-slate-50 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-slate-50">
                        <Building2 className="h-4 w-4 text-emerald-700" />
                      </span>
                      <div className="font-extrabold text-slate-900 truncate">Thông tin doanh nghiệp</div>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Tên doanh nghiệp</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedEnterprise.name || "-"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Trạng thái</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{getStatusLabel(selectedEnterprise.status)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Người đại diện</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedEnterprise.owner?.fullName || "-"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Email</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 break-all">{selectedEnterprise.owner?.email || "-"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Điện thoại</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedEnterprise.owner?.phone || "-"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Địa chỉ</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedEnterprise.address || "-"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Nhân viên</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedEnterprise.collectorsCount ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Dung tích</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{formatNumber(selectedEnterprise.capacityKg || 0)} kg</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Số khu vực</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedEnterprise.zonesCount ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Tổng lượt phân công</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedEnterprise.totalAssignments ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Gói đang hoạt động</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedEnterprise.activeSubscription ? "Có" : "Không"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Ngày tạo</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(selectedEnterprise.createdAt)}</p>
                    </div>
                  </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-white px-5 py-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleToggleBan(selectedEnterprise)}
                    disabled={actionLoading}
                    className={`inline-flex h-9 items-center justify-center gap-1 rounded-xl px-3 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed ${
                      selectedEnterprise.status === "BANNED"
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300"
                    }`}
                  >
                    {selectedEnterprise.status === "BANNED" ? (
                      <>
                        <LockOpen className="h-4 w-4" />
                        Mở khóa
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Khóa
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedEnterprise(null)}
                    className="rounded-xl border border-slate-200 bg-emerald-600 px-4 py-2 font-extrabold text-white hover:brightness-90 transition"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
