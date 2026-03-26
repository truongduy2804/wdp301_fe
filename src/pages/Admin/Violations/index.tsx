import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Loader2,
  RefreshCw,
  Search,
  ShieldBan,
  Eye,
} from "lucide-react";
import dayjs from "dayjs";
import {
  banViolationUser,
  fetchFakeReportViolationDetails,
  fetchFakeReportViolators,
  unbanViolationUser,
} from "@/api/admin/violation";
import type {
  FakeReportViolationDetail,
  FakeReportViolator,
} from "@/api/types/violation.types";
import Pagination from "@/components/Pagination";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  cx,
  Badge,
} from "@/components/ui/page/componentUI";
import ViolationDetailModal from "./detailPage";

type LoadState = "idle" | "loading" | "error";

export default function AdminViolations() {
  const PAGE_SIZE = 10;

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [violators, setViolators] = useState<FakeReportViolator[]>([]);
  const [total, setTotal] = useState(0);
  const [listState, setListState] = useState<LoadState>("idle");
  const [listError, setListError] = useState<string | null>(null);

  const [selectedViolator, setSelectedViolator] = useState<FakeReportViolator | null>(null);
  const [details, setDetails] = useState<FakeReportViolationDetail[]>([]);
  const [detailState, setDetailState] = useState<LoadState>("idle");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isBanningUserId, setIsBanningUserId] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const limit = PAGE_SIZE;

  const filteredViolators = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return violators;
    return violators.filter((item) => {
      return (
        item.fullName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        String(item.userId).includes(q)
      );
    });
  }, [query, violators]);

  async function loadViolators() {
    setListState("loading");
    setListError(null);
    try {
      const response = await fetchFakeReportViolators({ page, limit });
      setViolators(response.data);
      setTotal(response.meta.total);
      setListState("idle");
    } catch (error) {
      setListError(
        error instanceof Error ? error.message : "Không thể tải dữ liệu vi phạm",
      );
      setListState("error");
      toast.error("Không thể tải danh sách vi phạm");
    }
  }

  async function openDetails(item: FakeReportViolator) {
    setSelectedViolator(item);
    setDetailState("loading");
    setShowDetailModal(true);
    setDetails([]);
    try {
      const response = await fetchFakeReportViolationDetails(item.userId);
      setDetails(response);
      setDetailState("idle");
    } catch (error) {
      setDetailState("error");
      toast.error("Không thể tải chi tiết vi phạm");
    }
  }

  async function handleToggleUser(item: FakeReportViolator) {
    const isBanned = item.status === "BANNED";
    const actionLabel = isBanned ? "mở khóa" : "khóa";
    const confirmed = window.confirm(`Bạn có chắc muốn ${actionLabel} tài khoản này?`);
    if (!confirmed) return;

    try {
      setIsBanningUserId(item.userId);
      if (isBanned) {
        await unbanViolationUser(item.userId);
      } else {
        await banViolationUser(item.userId);
      }
      await loadViolators();
      toast.success(
        isBanned ? "Đã mở khóa tài khoản thành công" : "Đã khóa tài khoản thành công",
        { autoClose: 1500 },
      );

      // Cập nhật selectedViolator trong modal nếu đang mở
      if (selectedViolator?.userId === item.userId) {
        setSelectedViolator((prev) =>
          prev ? { ...prev, status: isBanned ? "ACTIVE" : "BANNED" } : prev,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isBanned
            ? "Mở khóa tài khoản thất bại"
            : "Khóa tài khoản thất bại",
      );
    } finally {
      setIsBanningUserId(null);
    }
  }

  useEffect(() => {
    loadViolators();
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Card className="p-4 sm:p-5 overflow-visible">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <AlertTriangle className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Vi phạm báo cáo giả
                  </h1>
                  <p className="text-sm text-slate-600">
                    Quản trị danh sách user bị tố cáo report giả, xem chi tiết và khóa tài khoản.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 overflow-visible">
              <Badge tone="emerald">{filteredViolators.length} người vi phạm</Badge>

              <div
                className={cx(
                  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm",
                  "hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors",
                  "focus-within:ring-2 focus-within:ring-emerald-200",
                )}
              >
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo tên, email hoặc userId"
                  className="w-64 max-w-[55vw] bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <Button
                variant="ghost"
                onClick={loadViolators}
                disabled={listState === "loading"}
                className="!rounded-2xl !px-3 !py-2 !bg-white !border !border-slate-200 !text-slate-800 !font-medium
                  hover:!border-emerald-300 hover:!bg-emerald-50/60 hover:!text-emerald-800
                  active:!bg-emerald-100/60 disabled:!opacity-70 disabled:!cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <RefreshCw
                    className={`h-4 w-4 ${listState === "loading" ? "animate-spin text-emerald-700" : "text-slate-600"
                      }`}
                  />
                  {listState === "loading" ? "Đang tải..." : "Tải lại"}
                </span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <Card className="overflow-hidden" hover={false}>
          <CardHeader
            title="Danh sách vi phạm"
            sub={`Kết quả: ${filteredViolators.length} · Tổng: ${total} · Cập nhật ${dayjs().format("DD/MM HH:mm")}`}
          />

          {listState === "loading" ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : listState === "error" ? (
            <EmptyState title="Không thể tải dữ liệu" desc={listError || undefined} />
          ) : filteredViolators.length === 0 ? (
            <EmptyState
              title="Không có dữ liệu"
              desc="Thử đổi từ khoá tìm kiếm hoặc làm mới danh sách."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Số lần vi phạm</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredViolators.map((item) => (
                    <tr
                      key={item.userId}
                      className="border-b border-slate-100 hover:bg-emerald-50/40 transition-colors"
                    >
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-200 border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm">
                            {item.avatar ? (
                              <img src={item.avatar} className="h-full w-full object-cover" alt={item.fullName} />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold text-sm">
                                {item.fullName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate tracking-tight">{item.fullName}</div>
                            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">ID: {item.userId}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-slate-600">{item.email}</div>
                      </td>

                      {/* Violation count – bỏ animate-pulse */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cx(
                            "h-2 w-2 rounded-full",
                            item.violationCount >= 5 ? "bg-rose-500" :
                              item.violationCount >= 3 ? "bg-orange-500" : "bg-emerald-500"
                          )} />
                          <span className="text-sm font-bold text-slate-800">
                            {item.violationCount} lần
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={cx(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          item.status === "BANNED"
                            ? "bg-rose-50 border-rose-200 text-rose-700"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700"
                        )}>
                          {item.status === "BANNED" ? "Bị khóa" : "Hoạt động"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openDetails(item)}
                            className="
                              inline-flex items-center justify-center gap-1 rounded-xl
                              border border-slate-200 bg-white px-3 py-1.5
                              text-xs font-medium text-slate-700
                              transition-all duration-200
                              hover:-translate-y-[1px] hover:shadow-sm
                              hover:border-emerald-200 hover:bg-emerald-50/60
                            "
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Chi tiết
                          </button>

                          <button
                            disabled={isBanningUserId === item.userId}
                            onClick={() => handleToggleUser(item)}
                            className={cx(
                              "inline-flex items-center justify-center gap-1 rounded-xl px-3 py-1.5",
                              "text-xs font-medium text-white",
                              "transition-all duration-200",
                              "hover:-translate-y-[1px] hover:shadow-sm",
                              "disabled:opacity-60 disabled:cursor-not-allowed",
                              item.status === "BANNED"
                                ? "bg-slate-500 hover:bg-slate-600"
                                : "bg-rose-600 hover:bg-rose-700"
                            )}
                          >
                            {isBanningUserId === item.userId ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ShieldBan className="h-3.5 w-3.5" />
                            )}
                            {item.status === "BANNED" ? "Mở khóa" : "Khóa ngay"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={limit}
            totalItems={total}
            onPageChange={setPage}
          />
        </Card>
      </div>

      {/* Detail Modal */}
      <ViolationDetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedViolator(null);
          setDetails([]);
        }}
        loading={detailState === "loading"}
        details={details}
        violator={selectedViolator}
      />
    </div>
  );
}
