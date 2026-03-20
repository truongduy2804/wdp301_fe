import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  ShieldBan,
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
  Modal,
  cx,
} from "@/components/ui/page/componentUI";

type LoadState = "idle" | "loading" | "error";

export default function AdminViolations() {
  const PAGE_SIZE = 10;

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [violators, setViolators] = useState<FakeReportViolator[]>([]);
  const [total, setTotal] = useState(0);
  const [listState, setListState] = useState<LoadState>("idle");
  const [listError, setListError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [details, setDetails] = useState<FakeReportViolationDetail[]>([]);
  const [detailState, setDetailState] = useState<LoadState>("idle");
  const [detailError, setDetailError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isBanningUserId, setIsBanningUserId] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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

  async function loadDetails(userId: number) {
    setSelectedUserId(userId);
    setDetailState("loading");
    setDetailError(null);

    try {
      const response = await fetchFakeReportViolationDetails(userId);
      setDetails(response);
      setDetailState("idle");
      setShowDetailModal(true);
    } catch (error) {
      setDetails([]);
      setDetailError(
        error instanceof Error ? error.message : "Không thể tải chi tiết vi phạm",
      );
      setDetailState("error");
      setShowDetailModal(true);
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

      if (selectedUserId === item.userId) {
        await loadDetails(item.userId);
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

  const limit = PAGE_SIZE;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Card className="p-4 sm:p-5 overflow-visible">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
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

            <div className="flex flex-wrap items-center gap-2 overflow-visible">
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
                  className="w-72 max-w-[65vw] bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <Button variant="outline" onClick={loadViolators}>
                <RefreshCw className="h-4 w-4" />
                Làm mới
              </Button>
            </div>
          </div>
        </Card>
      </div>

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
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredViolators.map((item) => (
                    <tr
                      key={item.userId}
                      className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{item.fullName}</div>
                        <div className="text-xs text-slate-500">ID: {item.userId}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.email}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                        {item.violationCount} lần
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => loadDetails(item.userId)}>
                            <Eye className="h-4 w-4" />
                            Xem
                          </Button>
                          <Button
                            variant={item.status === "BANNED" ? "outline" : "danger"}
                            onClick={() => handleToggleUser(item)}
                            disabled={isBanningUserId === item.userId}
                          >
                            {isBanningUserId === item.userId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ShieldBan className="h-4 w-4" />
                            )}
                            {item.status === "BANNED" ? "Mở khóa" : "Khóa user"}
                          </Button>
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

      <Modal
        open={showDetailModal}
        title={selectedUserId ? `Chi tiết vi phạm · User ${selectedUserId}` : "Chi tiết vi phạm"}
        sub={
          detailState === "loading"
            ? "Đang tải dữ liệu chi tiết"
            : `${details.length} bản ghi vi phạm`
        }
        onClose={() => setShowDetailModal(false)}
        widthClass="max-w-4xl"
      >
        {detailState === "loading" ? (
          <div className="py-10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : detailState === "error" ? (
          <EmptyState title="Không thể tải chi tiết" desc={detailError || undefined} />
        ) : details.length === 0 ? (
          <EmptyState title="Không có dữ liệu" desc="User này chưa có log vi phạm chi tiết." />
        ) : (
          <div className="space-y-3 max-h-[65vh] overflow-auto pr-1">
            {details.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-900">Log #{item.id}</p>
                  <p className="text-xs text-slate-500">
                    {dayjs(item.timestamp).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold">Lý do:</span>{" "}
                    {item.collectorReason || "Không có"}
                  </p>
                  <p>
                    <span className="font-semibold">Người báo:</span>{" "}
                    {item.reporter.fullName} ({item.reporter.role})
                  </p>
                  <p>
                    <span className="font-semibold">Người vi phạm:</span>{" "}
                    {item.violator.fullName} ({item.violator.role})
                  </p>
                  <p>
                    <span className="font-semibold">Report gốc:</span> #{item.originalReport.id} - {item.originalReport.address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
