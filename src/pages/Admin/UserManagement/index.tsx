import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  Users,
  Search,
  AlertCircle,
  Loader2,
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
import { banUser, fetchUsers, unbanUser, type User, type UsersQuery } from "@/api/admin/users";
import { toast } from "react-toastify";

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmActionUser, setConfirmActionUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [searchQuery, roleFilter, statusFilter, currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const query: UsersQuery = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery) query.search = searchQuery;
      if (roleFilter !== "ALL") query.role = roleFilter as any;
      if (statusFilter !== "ALL") query.status = statusFilter as any;

      const result = await fetchUsers(query);
      setUsers(result.data || []);
      setTotalUsers(result.meta?.total || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách người dùng";
      setError(message);
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (userId: number) => {
    try {
      setActionLoading(true);
      await unbanUser(userId);

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: "ACTIVE" } : u))
      );
      setSelectedUser(null);
      toast.success("Mở khóa tài khoản thành công!", { autoClose: 1400 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi khi mở khóa tài khoản";
      console.error("Error unbanning user:", err);
      toast.error(message, { autoClose: 1800 });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = async (userId: number) => {
    try {
      setActionLoading(true);
      await banUser(userId);

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: "BANNED" } : u))
      );
      setSelectedUser((prev) =>
        prev && prev.id === userId ? { ...prev, status: "BANNED" } : prev
      );
      setSelectedUser(null);
      toast.success("Khóa tài khoản thành công!", { autoClose: 1400 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi khi khóa tài khoản";
      console.error("Error banning user:", err);
      toast.error(message, { autoClose: 1800 });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!confirmActionUser) return;
    if (confirmActionUser.status === "BANNED") {
      await handleUnban(confirmActionUser.id);
    } else {
      await handleBan(confirmActionUser.id);
    }
    setConfirmActionUser(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700";
      case "ENTERPRISE":
        return "bg-blue-100 text-blue-700";
      case "COLLECTOR":
        return "bg-green-100 text-green-700";
      case "CITIZEN":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700";
      case "BANNED":
        return "bg-red-100 text-red-700";
      case "DELETED":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Hoạt động";
      case "BANNED":
        return "Bị khóa";
      case "DELETED":
        return "Đã xóa";
      default:
        return status;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "ENTERPRISE":
        return "Doanh nghiệp";
      case "COLLECTOR":
        return "Nhân viên thu gom";
      case "CITIZEN":
        return "Người dân";
      default:
        return role;
    }
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <Card className="p-3 sm:p-4 overflow-visible">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-2.5">
                  <Users className="h-5 w-5 text-blue-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Quản lí người dùng
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Quản lý tài khoản, vai trò và trạng thái người dùng.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 overflow-visible">
              <div className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors focus-within:ring-2 focus-within:ring-emerald-200">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, số điện thoại..."
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
                onClick={loadUsers}
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

          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end">
            <div className="w-full md:max-w-[240px]">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Vai trò
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                disabled={loading}
              >
                <option value="ALL">Tất cả</option>
                <option value="CITIZEN">Người dân</option>
                <option value="COLLECTOR">Thu gom</option>
                <option value="ENTERPRISE">Doanh nghiệp</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="w-full md:max-w-[240px]">
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
                <option value="ACTIVE">Hoạt động</option>
                <option value="BANNED">Bị khóa</option>
                <option value="DELETED">Đã xóa</option>
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
                onClick={loadUsers}
                className="mt-2 text-sm font-semibold text-red-700 hover:text-red-800 underline"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <Card className="p-4 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              <span className="ml-3 text-slate-600 font-semibold">Đang tải...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Không có người dùng nào</p>
              <p className="text-sm text-slate-500 mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Tên
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Số điện thoại
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Vai trò
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Trạng thái
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">
                      Số dư
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
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-900 font-medium">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-slate-900">
                        {user.fullName || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-900">
                        {user.phone || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                            user.status
                          )}`}
                        >
                          {getStatusLabel(user.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-medium">
                        {formatNumber(Math.floor(user.balance))} đ
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            className="h-8 w-8 !p-0"
                            onClick={() => setSelectedUser(user)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {user.role !== "ADMIN" && (
                            user.status === "BANNED" ? (
                              <button
                                onClick={() => setConfirmActionUser(user)}
                                disabled={actionLoading}
                                className="inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-emerald-500 px-2.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                              >
                                <LockOpen className="h-3.5 w-3.5" />
                                Mở
                              </button>
                            ) : (
                              <button
                                onClick={() => setConfirmActionUser(user)}
                                disabled={actionLoading || user.status === "DELETED"}
                                className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2.5 text-xs font-medium text-red-700 hover:bg-red-100 hover:border-red-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                              >
                                <Lock className="h-3.5 w-3.5" />
                                Khóa
                              </button>
                            )
                          )}
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
                Tổng người dùng: {formatNumber(totalUsers)}
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

        {selectedUser && (
          <div
            className="fixed inset-0 z-[1400] bg-black/45"
            onClick={() => setSelectedUser(null)}
          >
            <div className="fixed left-1/2 top-1/2 z-[1401] w-[94vw] max-w-4xl max-h-[92vh] -translate-x-1/2 -translate-y-1/2 flex flex-col overflow-hidden rounded-2xl bg-emerald-600 shadow-2xl">
              <div
                className="flex h-full flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-emerald-500 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-extrabold text-white truncate">
                        Chi tiết người dùng #{selectedUser.id}
                      </h2>
                      <p className="text-sm text-emerald-100 truncate">{selectedUser.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
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
                        <Users className="h-4 w-4 text-emerald-700" />
                      </span>
                      <div className="font-extrabold text-slate-900 truncate">Thông tin người dùng</div>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-500">Họ tên</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{selectedUser.fullName || "-"}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-500">Email</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 break-all">{selectedUser.email || "-"}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-500">Số điện thoại</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{selectedUser.phone || "-"}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-500">Vai trò</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{getRoleLabel(selectedUser.role)}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-500">Trạng thái</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{getStatusLabel(selectedUser.status)}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-500">Số dư</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{formatNumber(Math.floor(selectedUser.balance || 0))} đ</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-500">Số lần bị báo cáo</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{selectedUser.reportCount ?? 0}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-500">Số lần khiếu nại</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{selectedUser.complaintCount ?? 0}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
                        <p className="text-xs font-semibold text-slate-500">Ngày tạo</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(selectedUser.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-white px-5 py-3 flex items-center justify-end gap-2">
                  {selectedUser.role !== "ADMIN" && selectedUser.status === "BANNED" && (
                    <button
                      onClick={() => setConfirmActionUser(selectedUser)}
                      disabled={actionLoading}
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-emerald-500 px-3 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <LockOpen className="h-4 w-4" />
                      Mở khóa
                    </button>
                  )}
                  {selectedUser.role !== "ADMIN" && selectedUser.status !== "BANNED" && (
                    <button
                      onClick={() => setConfirmActionUser(selectedUser)}
                      disabled={actionLoading || selectedUser.status === "DELETED"}
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 hover:bg-red-100 hover:border-red-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Lock className="h-4 w-4" />
                      Khóa
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="rounded-xl border border-slate-200 bg-emerald-600 px-4 py-2 font-extrabold text-white hover:brightness-90 transition"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {confirmActionUser && (
          <div
            className="fixed inset-0 z-[1500] bg-black/45"
            onClick={() => !actionLoading && setConfirmActionUser(null)}
          >
            <div className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl">
              <div onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-900">
                  {confirmActionUser.status === "BANNED"
                    ? "Xác nhận mở khóa"
                    : "Xác nhận khóa tài khoản"}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {confirmActionUser.status === "BANNED"
                    ? "Bạn có chắc muốn mở khóa tài khoản này?"
                    : "Bạn có chắc muốn khóa tài khoản này?"}
                </p>
                <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 break-all">
                  {confirmActionUser.email}
                </p>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setConfirmActionUser(null)}
                    disabled={actionLoading}
                    className="h-9 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmToggle}
                    disabled={actionLoading}
                    className={`inline-flex h-9 items-center justify-center gap-1 rounded-xl px-3 text-sm font-semibold text-white disabled:opacity-60 ${
                      confirmActionUser.status === "BANNED"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {confirmActionUser.status === "BANNED" ? "Mở khóa" : "Khóa"}
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
