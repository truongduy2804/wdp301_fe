// src/pages/Admin/Complaints.tsx
import dayjs from "dayjs";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  MessageSquareWarning,
  Search,
  X,
  XCircle,
  ZoomIn,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  fetchAdminComplaints,
  respondAdminComplaint,
} from "@/api/admin/complaint";
import type {
  AdminComplaint,
  AdminComplaintStatus,
} from "@/api/types/complaint.types";
import Pagination from "@/components/Pagination";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  cx,
  Dropdown,
  EmptyState,
  Modal,
} from "@/components/ui/page/componentUI";

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

  // Lightbox state
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  function openLightbox(images: string[], startIdx = 0) {
    setLightboxImages(images);
    setLightboxIdx(startIdx);
    setLightboxOpen(true);
  }

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
                    <th className="px-4 py-3">Loại khiếu nại</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Người dân</th>
                    <th className="px-4 py-3">Tài xế</th>
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
                        <div className="font-semibold text-slate-800">
                          {r.typeLabel}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={toneStatus(r.status) as any}>
                          {statusLabel(r.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-900 leading-tight">
                          {r.citizen.fullName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {r.collector ? (
                          <div className="text-sm font-semibold text-slate-900 leading-tight">
                            {r.collector.fullName}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-700">
                          #{r.context.reportId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            className="h-8 w-8 !p-0"
                            onClick={() => setSelected(r)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {r.status === "OPEN" && (
                            <>
                              <Button
                                variant="outline"
                                className="h-8 w-8 !p-0 border-rose-200 text-rose-600 hover:bg-rose-50"
                                onClick={() => {
                                  setSelected(r);
                                }}
                                title="Từ chối"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                className="h-8 w-8 !p-0 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                onClick={() => {
                                  setSelected(r);
                                }}
                                title="Chấp nhận"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
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
                {selected.status === "OPEN" && (
                  <>
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
                )}
              </>
            ) : null
          }
          widthClass="max-w-3xl"
        >
          {selected ? (
            <div className="space-y-5 max-h-[58vh] overflow-y-auto pr-2 custom-scrollbar pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={toneStatus(selected.status) as any}>
                  Trạng thái: {statusLabel(selected.status)}
                </Badge>
                <Badge tone="slate">Loại: {selected.typeLabel}</Badge>
              </div>

              {/* Citizen & Collector Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Citizen Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Người dân báo cáo</div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                      {selected.citizen.avatar ? (
                        <img src={selected.citizen.avatar} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-lg">
                          {selected.citizen.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-base font-bold text-slate-900">{selected.citizen.fullName}</div>
                      <div className="text-base text-slate-500 font-medium">{selected.citizen.phone || "Không có"}</div>
                    </div>
                  </div>
                  {selected.citizen.trustStats && (
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase">Tổng khiếu nại</div>
                        <div className="text-base font-bold text-slate-700">{selected.citizen.trustStats.totalComplaints} lần</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase">Báo cáo giả</div>
                        <div className="text-base font-bold text-rose-500">{selected.citizen.trustStats.totalFakeReports} lần</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Collector Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Tài xế bị khiếu nại</div>
                  {selected.collector ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                          {selected.collector.avatar ? (
                            <img src={selected.collector.avatar} alt="avatar" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-lg">
                              {selected.collector.fullName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-base font-bold text-slate-900">{selected.collector.fullName}</div>
                          <div className="text-base text-slate-600 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block mt-0.5">
                            {selected.collector.employeeCode}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                        <div>
                          <div className="text-xs text-slate-400 font-bold uppercase">Điểm tin cậy</div>
                          <div className="text-base font-bold text-emerald-600">{selected.collector.trustScore} điểm</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 font-bold uppercase">Bỏ qua công việc</div>
                          <div className="text-base font-bold text-orange-500">{selected.collector.skipCount} lần</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 italic text-sm py-4">
                      Thông tin tài xế không khả dụng
                    </div>
                  )}
                </div>
              </div>

              {/* Complaint Content */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Nội dung khiếu nại</div>
                <div className="text-base font-medium text-slate-800 leading-relaxed bg-white border border-slate-200 rounded-xl p-3">
                  {selected.content}
                </div>
              </div>

              {/* Report Context Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Tổng quan báo cáo rác (Mã báo cáo #{selected.context.reportId})</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-400 font-bold uppercase">Địa chỉ</div>
                      <div className="text-sm text-slate-700 font-medium">{selected.context.address || "Không có"}</div>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase">Trạng thái báo cáo rác</div>
                        <Badge tone="emerald">
                          {selected.context.reportStatus === "COMPLETED" ? "Đã hoàn thành" : selected.context.reportStatus}
                        </Badge>
                      </div>
                    </div>
                    {selected.context.weightAction && (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="text-xs text-slate-500 font-bold uppercase mb-2">Thông tin khối lượng</div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-xs text-slate-400 lowercase italic">Ước tính</div>
                            <div className="text-base font-bold text-slate-600">{selected.context.weightAction.estimated}kg</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 lowercase italic">Thực tế</div>
                            <div className="text-base font-bold text-slate-900">{selected.context.weightAction.actual}kg</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 lowercase italic">Chênh lệch</div>
                            <div className="text-base font-bold text-rose-500">+{selected.context.weightAction.diff}kg</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selected.context.timing && (
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase mb-2">Thời gian xử lý</div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Hạn chót:</span>
                            <span className="font-semibold">{dayjs(selected.context.timing.deadline).format("DD/MM HH:mm")}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Hoàn thành:</span>
                            <span className="font-semibold">{dayjs(selected.context.timing.completedAt).format("DD/MM HH:mm")}</span>
                          </div>
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-slate-500">Trạng thái:</span>
                            <Badge tone={selected.context.timing.isLate ? "rose" : "emerald"}>
                              {selected.context.timing.isLate ? "Trễ hạn" : "Đúng hạn"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Report Images Comparison */}
                {selected.context.images && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-400 font-bold uppercase mb-3">Hình ảnh minh chứng tại Báo cáo</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-1.5 italic font-semibold">
                          Ảnh từ Người dân ({selected.context.images.citizen?.length || 0})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {selected.context.images.citizen?.map((img, i) => (
                            <button
                              key={i}
                              onClick={() => openLightbox(selected.context.images!.citizen ?? [], i)}
                              className="group relative h-48 w-full rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-300 transition-all"
                            >
                              <img src={img} alt="nguoi-dan-bao-cao" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ))}
                          {!selected.context.images.citizen?.length && <div className="col-span-2 text-xs text-slate-400 py-2">Không có ảnh</div>}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1.5 italic font-semibold">
                          Ảnh từ Tài xế ({selected.context.images.collector?.length || 0})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {selected.context.images.collector?.map((img, i) => (
                            <button
                              key={i}
                              onClick={() => openLightbox(selected.context.images!.collector ?? [], i)}
                              className="group relative h-48 w-full rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-300 transition-all"
                            >
                              <img src={img} alt="collector-report" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ))}
                          {!selected.context.images.collector?.length && <div className="col-span-2 text-xs text-slate-400 py-2">Không có ảnh</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Evidence Images for Complaint */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Ảnh bằng chứng khiếu nại ({selected.evidenceImages?.length || 0})
                </div>

                {selected.evidenceImages?.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selected.evidenceImages.map((imageUrl, idx) => (
                      <button
                        key={`${selected.id}-${idx}`}
                        onClick={() => openLightbox(selected.evidenceImages ?? [], idx)}
                        className="group relative block overflow-hidden rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-300 transition-all"
                      >
                        <img
                          src={imageUrl}
                          alt={`evidence-${idx + 1}`}
                          className="h-64 w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                          <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 text-center italic">
                    Không có ảnh bằng chứng khiếu nại
                  </div>
                )}
              </div>

              {/* Admin Response section */}
              <div className="flex items-center justify-between">
                <label className="block text-base font-bold text-slate-700">
                  Nội dung phản hồi của Admin
                </label>
                <button
                  type="button"
                  onClick={() => setResponseText("Báo cáo của bạn đã bị đánh dấu sự cố, vui lòng vô phần Lịch sử khiếu nại để theo dõi thêm")}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-tight bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 transition-colors"
                >
                  Sử dụng mẫu hệ thống
                </button>
              </div>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Nhập nội dung phản hồi cho người khiếu nại..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-shadow"
              />
            </div>
          ) : null}
        </Modal>
      </div>

      {/* Lightbox */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <div
          className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Prev */}
          {lightboxImages.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/25 transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i - 1 + lightboxImages.length) % lightboxImages.length); }}
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
          )}

          {/* Image */}
          <img
            src={lightboxImages[lightboxIdx]}
            alt={`Ảnh ${lightboxIdx + 1}`}
            className="max-h-[88vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {lightboxImages.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/25 transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i + 1) % lightboxImages.length); }}
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          )}

          {/* Counter + Close */}
          <div className="absolute top-4 right-4 flex items-center gap-3">
            {lightboxImages.length > 1 && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                {lightboxIdx + 1} / {lightboxImages.length}
              </span>
            )}
            <button
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/25 transition-colors"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Dots */}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
              {lightboxImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                  className={`h-2 rounded-full transition-all ${i === lightboxIdx ? "w-6 bg-white" : "w-2 bg-white/40"
                    }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
