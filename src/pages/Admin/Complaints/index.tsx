// src/pages/Admin/Complaints.tsx
import React, { useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  MessageSquareWarning,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import dayjs from "dayjs";

import {
  cx,
  Card,
  CardHeader,
  Button,
  Badge,
  Modal,
  EmptyState,
  Dropdown,
} from "@/components/ui/page/componentUI";
import {
  fetchAdminComplaints,
  respondAdminComplaint,
} from "@/api/admin/complaint";
import Pagination from "@/components/Pagination";
import type {
  AdminComplaint,
  AdminComplaintStatus,
} from "@/api/types/complaint.types";

function toneStatus(s: AdminComplaintStatus) {
  if (s === "OPEN") return "blue";
  if (s === "PROCESSED") return "emerald";
  return "rose";
}

function statusLabel(s: AdminComplaintStatus) {
  if (s === "OPEN") return "Đang mở";
  if (s === "PROCESSED") return "Đã chấp nhận";
  return "Đã từ chối";
}

type StatusFilter = AdminComplaintStatus | "ALL";

export default function AdminComplaints() {
  const PAGE_SIZE = 10;

  const [list, setList] = useState<AdminComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [selected, setSelected] = useState<AdminComplaint | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = await fetchAdminComplaints({
        status: status === "ALL" ? undefined : status,
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setList(payload.data || []);
      setTotalItems(payload.meta?.total || 0);
      setTotalPages(payload.meta?.totalPages || 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không thể tải danh sách khiếu nại";
      setError(msg);
      toast.error("Không thể tải danh sách khiếu nại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [status, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [status]);

  useEffect(() => {
    if (selected) {
      setResponseText(selected.adminResponse || "");
    } else {
      setResponseText("");
    }
  }, [selected]);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return list.filter((r) => {
      const matchQ =
        !query ||
        r.typeLabel.toLowerCase().includes(query) ||
        String(r.id).toLowerCase().includes(query) ||
        String(r.context?.reportId || "").toLowerCase().includes(query) ||
        r.citizen.fullName.toLowerCase().includes(query);

      const matchStatus = status === "ALL" ? true : r.status === status;
      return matchQ && matchStatus;
    });
  }, [q, status, list]);

  const handleRespond = async (nextStatus: AdminComplaintStatus) => {
    if (!selected) return;
    if (!responseText.trim()) {
      toast.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      setIsResponding(true);
      const updated = await respondAdminComplaint(selected.id, {
        status: nextStatus,
        response: responseText.trim(),
      });

      setList((prev) =>
        prev.map((item) =>
          item.id === updated.id
            ? {
              ...item,
              status: updated.status,
              adminResponse: updated.adminResponse,
              resolvedAt: updated.resolvedAt,
            }
            : item,
        ),
      );

      setSelected((prev) =>
        prev && prev.id === updated.id
          ? {
            ...prev,
            status: updated.status,
            adminResponse: updated.adminResponse,
            resolvedAt: updated.resolvedAt,
          }
          : prev,
      );

      toast.success("Phản hồi khiếu nại thành công", { autoClose: 1500 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Phản hồi khiếu nại thất bại";
      toast.error(msg);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        {/* overflow-visible để dropdown không bị cắt */}
        <Card className="p-4 sm:p-5 overflow-visible">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <MessageSquareWarning className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Khiếu nại / Tranh chấp
                  </h1>
                  <p className="text-sm text-slate-600">
                    Tiếp nhận, phân loại và xử lý khiếu nại.
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 overflow-visible">
              {/* Search */}
              <div
                className={cx(
                  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm",
                  "hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors",
                  "focus-within:ring-2 focus-within:ring-emerald-200",
                )}
              >
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo ID / tiêu đề / reporter / liên quan..."
                  className="w-72 max-w-[65vw] bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Status dropdown */}
              <Dropdown<StatusFilter>
                icon={Filter}
                label="Trạng thái"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "ALL", label: "Tất cả trạng thái" },
                  { value: "OPEN", label: "Đang mở" },
                  { value: "PROCESSED", label: "Đã chấp nhận" },
                  { value: "REJECTED", label: "Đã từ chối" },
                ]}
                minWidth={230}
              />

              <Button variant="outline" onClick={loadComplaints}>
                Làm mới
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <Card className="overflow-hidden" hover={false}>
          <CardHeader
            title="Danh sách khiếu nại"
            sub={`Kết quả: ${rows.length} · Cập nhật ${dayjs().format("DD/MM HH:mm")}`}
            right={
              <div className="inline-flex items-center gap-2">
                <Badge tone="slate">
                  {status === "ALL" ? "Tất cả trạng thái" : statusLabel(status)}
                </Badge>
              </div>
            }
          />

          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : error ? (
            <EmptyState title="Không thể tải dữ liệu" desc={error} />
          ) : rows.length === 0 ? (
            <EmptyState
              title="Không có dữ liệu"
              desc="Thử đổi bộ lọc hoặc từ khoá tìm kiếm."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Tiêu đề</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Citizen</th>
                    <th className="px-4 py-3">Báo cáo</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={String(r.id)}
                      className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        #{r.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {r.typeLabel}
                        </div>
                        <div className="text-xs text-slate-500">
                          {dayjs(r.createdAt).format("DD/MM/YYYY HH:mm")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={toneStatus(r.status) as any}>
                          {statusLabel(r.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {r.citizen.fullName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        #{r.context.reportId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setSelected(r)}
                          >
                            <Eye className="h-4 w-4" />
                            Xem
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
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </Card>

        <Modal
          open={!!selected}
            title={selected ? `#${selected.id} · ${selected.typeLabel}` : "Chi tiết"}
          sub={
            selected
                ? `Báo cáo #${selected.context.reportId} · ${dayjs(selected.createdAt).format("DD/MM/YYYY HH:mm")}`
              : undefined
          }
          onClose={() => setSelected(null)}
          footer={
            selected ? (
              <>
                <Button variant="ghost" onClick={() => setSelected(null)}>
                  Đóng
                </Button>
                <Button
                    variant="danger"
                    disabled={isResponding}
                    onClick={() => handleRespond("REJECTED")}
                  >
                    {isResponding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Từ chối
                  </Button>
                  <Button
                    disabled={isResponding}
                  onClick={() => {
                      handleRespond("PROCESSED");
                  }}
                >
                    {isResponding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Chấp nhận
                </Button>
              </>
            ) : null
          }
          widthClass="max-w-3xl"
        >
          {selected ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={toneStatus(selected.status) as any}>
                  Status: {statusLabel(selected.status)}
                </Badge>
                <Badge tone="slate">Citizen: {selected.citizen.fullName}</Badge>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold text-slate-600">
                  Nội dung
                </div>
                <div className="mt-2 text-sm font-medium text-slate-800 leading-relaxed">
                  {selected.content}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nội dung phản hồi
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Nhập nội dung phản hồi cho người khiếu nại..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600 mb-3">
                  Ảnh bằng chứng ({selected.evidenceImages?.length || 0})
                </div>

                {selected.evidenceImages?.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selected.evidenceImages.map((imageUrl, idx) => (
                      <a
                        key={`${selected.id}-${idx}`}
                        href={imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <img
                          src={imageUrl}
                          alt={`evidence-${idx + 1}`}
                          className="h-28 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 text-center">
                    Không có ảnh bằng chứng
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </div>
  );
}
