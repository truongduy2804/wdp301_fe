// src/pages/Admin/Complaints.tsx
import dayjs from "dayjs";
import {
  CheckCircle2,
  Clock3,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Eye,
  Filter,
  Images,
  Loader2,
  MapPin,
  MessageSquareWarning,
  Phone,
  Search,
  Truck,
  X,
  XCircle,
  User,
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

  const selectedMapUrl = selected?.context.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(selected.context.address)}`
    : null;
  const contextImages = selected
    ? [
      ...(selected.context.images?.citizen ?? []),
      ...(selected.context.images?.collector ?? []),
    ]
    : [];

  const handleRespond = async (nextStatus: AdminComplaintStatus) => {
    if (!selected) return;
    if (!responseText.trim()) {
      toast.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      setIsResponding(true);
      const updated = await respondAdminComplaint(complaintId, {
        status: nextStatus,
        response: message.trim(),
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

      // Nếu đang mở modal cho chính complaint này thì cập nhật state selected
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
      const msg =
        err instanceof Error ? err.message : "Phản hồi khiếu nại thất bại";
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
                                disabled={isResponding}
                                onClick={() => {
                                  handleRespond(
                                    r.id,
                                    "REJECTED",
                                    "Yêu cầu khiếu nại của bạn không được chấp nhận sau khi kiểm tra",
                                  );
                                }}
                                title="Từ chối nhanh"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                className="h-8 w-8 !p-0 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                disabled={isResponding}
                                onClick={() => {
                                  handleRespond(
                                    r.id,
                                    "PROCESSED",
                                    "Báo cáo của bạn đã được chấp nhận và xử lý",
                                  );
                                }}
                                title="Chấp nhận nhanh"
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

        {selected && (
          <div
            className="fixed inset-0 z-[1400] bg-black/50 backdrop-blur-[2px]"
            onClick={() => setSelected(null)}
          >
            <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 flex items-start justify-center">
              <div
                className="w-full max-w-5xl max-h-[94vh] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 px-5 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="m-0 text-lg sm:text-xl font-extrabold text-white">
                          Chi tiết khiếu nại {selected.id ? `#${selected.id}` : ""}
                        </h2>
                        <span className="inline-flex items-center rounded-full border border-white/30 bg-white px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {statusLabel(selected.status)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-emerald-50">
                        <span className="truncate">{selected.context.address || "Không có địa chỉ"}</span>
                        {selectedMapUrl && (
                          <a
                            href={selectedMapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Maps
                          </a>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 hover:bg-white/20"
                      onClick={() => setSelected(null)}
                      aria-label="Đóng"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 bg-slate-50 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <DetailSectionCard
                      className="lg:col-span-8"
                      title="Tóm tắt"
                      icon={<Clock3 className="h-4 w-4 text-emerald-700" />}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <DetailInfoRow
                          icon={<Clock3 className="h-4 w-4" />}
                          label="Tạo lúc"
                          value={dayjs(selected.createdAt).format("HH:mm · DD/MM/YYYY")}
                        />
                        <DetailInfoRow
                          icon={<CheckCircle2 className="h-4 w-4" />}
                          label="Phản hồi lúc"
                          value={selected.resolvedAt ? dayjs(selected.resolvedAt).format("HH:mm · DD/MM/YYYY") : "Chưa xử lý"}
                        />
                        <DetailInfoRow
                          icon={<FileText className="h-4 w-4" />}
                          label="Báo cáo liên quan"
                          value={`#${selected.context.reportId}`}
                        />
                      </div>
                    </DetailSectionCard>

                    <DetailSectionCard
                      className="lg:col-span-4"
                      title="Người tạo đơn"
                      icon={<User className="h-4 w-4 text-indigo-700" />}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          {selected.citizen.avatar ? (
                            <img src={selected.citizen.avatar} alt="citizen-avatar" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full grid place-items-center text-slate-400 font-bold text-lg">
                              {selected.citizen.fullName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xl font-bold text-slate-900 truncate">{selected.citizen.fullName}</div>
                          <div className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600">
                            <Phone className="h-4 w-4" />
                            {selected.citizen.phone || "Không có"}
                          </div>
                        </div>
                      </div>
                    </DetailSectionCard>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <DetailSectionCard title="Thông tin đơn" icon={<MapPin className="h-4 w-4 text-emerald-700" />}>
                      <div className="space-y-3">
                        <DetailInfoRow
                          icon={<MapPin className="h-4 w-4" />}
                          label="Địa chỉ"
                          value={<span className="leading-relaxed break-words">{selected.context.address || "Không có"}</span>}
                        />
                        <DetailInfoRow
                          icon={<FileText className="h-4 w-4" />}
                          label="Nội dung khiếu nại"
                          value={<span className="leading-relaxed break-words">{selected.content || "—"}</span>}
                        />
                      </div>
                    </DetailSectionCard>

                    <DetailSectionCard title="Thông tin tài xế được gán" icon={<Truck className="h-4 w-4 text-indigo-700" />}>
                      {selected.collector ? (
                        <div className="space-y-3">
                          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
                            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">Đơn đã được gán cho tài xế</div>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full overflow-hidden border border-slate-200 bg-white shrink-0">
                                {selected.collector.avatar ? (
                                  <img src={selected.collector.avatar} alt="collector-avatar" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full grid place-items-center text-slate-400 font-bold text-lg">
                                    {selected.collector.fullName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xl font-bold text-slate-900 truncate">{selected.collector.fullName}</div>
                                <div className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-700">
                                  <Phone className="h-4 w-4" />
                                  {selected.collector.employeeCode}
                                </div>
                              </div>
                            </div>
                          </div>
                          <DetailInfoRow
                            icon={<User className="h-4 w-4" />}
                            label="Mã nhân viên"
                            value={selected.collector.employeeCode || "Không có"}
                          />
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                          Chưa có tài xế liên quan.
                        </div>
                      )}
                    </DetailSectionCard>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <DetailSectionCard title="Danh sách rác khai báo" icon={<FileText className="h-4 w-4 text-emerald-700" />}>
                      {selected.context.weightAction ? (
                        <div className="space-y-2">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">Khối lượng ước tính</span>
                            <span className="text-sm font-bold text-emerald-700">{selected.context.weightAction.estimated} kg</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500">—</div>
                      )}
                    </DetailSectionCard>

                    <DetailSectionCard title="Danh sách rác thực tế" icon={<FileText className="h-4 w-4 text-indigo-700" />}>
                      {selected.context.weightAction ? (
                        <div className="space-y-2">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">Khối lượng thực tế</span>
                            <span className="text-sm font-bold text-emerald-700">{selected.context.weightAction.actual} kg</span>
                          </div>
                          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 flex items-center justify-between">
                            <span className="text-sm font-semibold text-rose-700">Chênh lệch</span>
                            <span className="text-sm font-bold text-rose-700">+{selected.context.weightAction.diff} kg</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500">—</div>
                      )}
                    </DetailSectionCard>

                    <DetailSectionCard title="Hình ảnh" icon={<Images className="h-4 w-4 text-indigo-700" />}>
                      {contextImages.length ? (
                        <div className="grid grid-cols-2 gap-3 overflow-auto custom-scrollbar pr-1 max-h-72">
                          {contextImages.map((url, i) => (
                            <button
                              key={`${url}-${i}`}
                              onClick={() => openLightbox(contextImages, i)}
                              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                            >
                              <img
                                src={url}
                                alt={`context-${selected.id}-${i}`}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-[150px] object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                              />
                              <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500">—</div>
                      )}
                    </DetailSectionCard>
                  </div>

                  <DetailSectionCard title={`Ảnh bằng chứng khiếu nại (${selected.evidenceImages?.length || 0})`} icon={<Images className="h-4 w-4 text-emerald-700" />}>
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
                              className="h-52 w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
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
                  </DetailSectionCard>

                  <DetailSectionCard title="Nội dung phản hồi của Admin" icon={<MessageSquareWarning className="h-4 w-4 text-emerald-700" />}>
                    <div className="space-y-3">
                      {selected.status === "OPEN" && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setResponseText("Báo cáo của bạn đã bị đánh dấu sự cố, vui lòng vô phần Lịch sử khiếu nại để theo dõi thêm")}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-tight bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 transition-colors"
                          >
                            Sử dụng mẫu hệ thống
                          </button>
                        </div>
                      )}
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder={
                          selected.status === "OPEN"
                            ? "Nhập nội dung phản hồi cho người khiếu nại..."
                            : "Khiếu nại đã được xử lý, chỉ xem nội dung phản hồi."
                        }
                        rows={4}
                        disabled={selected.status !== "OPEN"}
                        className={cx(
                          "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base text-slate-800 outline-none transition-shadow",
                          selected.status === "OPEN"
                            ? "bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            : "bg-slate-50 text-slate-600 cursor-not-allowed",
                        )}
                      />
                    </div>
                  </DetailSectionCard>
                </div>

                <div className="border-t border-slate-200 bg-white px-5 py-3 flex items-center justify-end gap-2">
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
                </div>
              </div>
            </div>
          </div>
        )}
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

function DetailSectionCard({
  title,
  icon,
  className,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cx("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        {icon ? (
          <span className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-slate-50">
            {icon}
          </span>
        ) : null}
        <div className="font-extrabold text-slate-900 truncate">{title}</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function DetailInfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500">
        <span className="text-slate-500">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-sm font-extrabold text-slate-900">{value}</div>
    </div>
  );
}
