// src/pages/Admin/Complaints.tsx
import React, { useMemo, useState } from "react";
import {
  MessageSquareWarning,
  Search,
  Filter,
  Eye,
  CheckCircle2,
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

type Status = "NEW" | "PROCESSING" | "WAITING" | "RESOLVED";
type Priority = "LOW" | "MEDIUM" | "HIGH";

type ComplaintRow = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  createdAt: string;
  reporter: string;
  related: string;
  content: string;
};

const MOCK: ComplaintRow[] = [
  {
    id: "CP-001",
    title: "Tranh chấp điểm thưởng",
    status: "NEW",
    priority: "HIGH",
    createdAt: "07/12 09:10",
    reporter: "Citizen C",
    related: "REQ-8821",
    content: "Điểm thưởng không cộng đúng sau khi hoàn tất thu gom.",
  },
  {
    id: "CP-002",
    title: "Collector đến trễ",
    status: "PROCESSING",
    priority: "MEDIUM",
    createdAt: "06/12 16:40",
    reporter: "Citizen A",
    related: "REQ-8702",
    content: "Collector đến trễ 40 phút, cần đối soát.",
  },
  {
    id: "CP-003",
    title: "Sai phân loại rác",
    status: "WAITING",
    priority: "LOW",
    createdAt: "05/12 11:02",
    reporter: "Enterprise B",
    related: "REQ-8611",
    content: "Người dùng phân loại chưa chuẩn, cần hướng dẫn lại.",
  },
  {
    id: "CP-004",
    title: "Khiếu nại hệ thống báo sai trạng thái",
    status: "RESOLVED",
    priority: "MEDIUM",
    createdAt: "02/12 08:18",
    reporter: "Enterprise A",
    related: "INC-112",
    content: "Đơn đã hoàn tất nhưng app hiển thị đang xử lý.",
  },
];

function toneStatus(s: Status) {
  if (s === "NEW") return "blue";
  if (s === "PROCESSING") return "amber";
  if (s === "WAITING") return "slate";
  return "emerald";
}

function tonePriority(p: Priority) {
  if (p === "HIGH") return "rose";
  if (p === "MEDIUM") return "amber";
  return "slate";
}

type StatusFilter = Status | "ALL";
type PriorityFilter = Priority | "ALL";

export default function AdminComplaints() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [priority, setPriority] = useState<PriorityFilter>("ALL");
  const [selected, setSelected] = useState<ComplaintRow | null>(null);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MOCK.filter((r) => {
      const matchQ =
        !query ||
        r.title.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query) ||
        r.related.toLowerCase().includes(query) ||
        r.reporter.toLowerCase().includes(query);

      const matchStatus = status === "ALL" ? true : r.status === status;
      const matchPriority = priority === "ALL" ? true : r.priority === priority;

      return matchQ && matchStatus && matchPriority;
    });
  }, [q, status, priority]);

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
                  { value: "NEW", label: "NEW" },
                  { value: "PROCESSING", label: "PROCESSING" },
                  { value: "WAITING", label: "WAITING" },
                  { value: "RESOLVED", label: "RESOLVED" },
                ]}
                minWidth={230}
              />

              {/* Priority dropdown */}
              <Dropdown<PriorityFilter>
                icon={Filter}
                label="Ưu tiên"
                value={priority}
                onChange={setPriority}
                options={[
                  { value: "ALL", label: "Tất cả ưu tiên" },
                  { value: "LOW", label: "LOW" },
                  { value: "MEDIUM", label: "MEDIUM" },
                  { value: "HIGH", label: "HIGH" },
                ]}
                minWidth={210}
              />
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
                  {status === "ALL" ? "All status" : status}
                </Badge>
                <Badge tone="slate">
                  {priority === "ALL" ? "All priority" : priority}
                </Badge>
              </div>
            }
          />

          {rows.length === 0 ? (
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
                    <th className="px-4 py-3">Ưu tiên</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Reporter</th>
                    <th className="px-4 py-3">Liên quan</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {r.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {r.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {r.createdAt}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={tonePriority(r.priority) as any}>
                          {r.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={toneStatus(r.status) as any}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {r.reporter}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {r.related}
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
        </Card>

        <Modal
          open={!!selected}
          title={selected ? `${selected.id} · ${selected.title}` : "Chi tiết"}
          sub={
            selected
              ? `Liên quan: ${selected.related} · ${selected.createdAt}`
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
                  onClick={() => {
                    // demo: bạn nối API update status RESOLVED ở đây
                    setSelected(null);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Đánh dấu đã giải quyết
                </Button>
              </>
            ) : null
          }
          widthClass="max-w-3xl"
        >
          {selected ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={tonePriority(selected.priority) as any}>
                  Priority: {selected.priority}
                </Badge>
                <Badge tone={toneStatus(selected.status) as any}>
                  Status: {selected.status}
                </Badge>
                <Badge tone="slate">Reporter: {selected.reporter}</Badge>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold text-slate-600">
                  Nội dung
                </div>
                <div className="mt-2 text-sm font-medium text-slate-800 leading-relaxed">
                  {selected.content}
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Gợi ý: thêm lịch sử xử lý, file đính kèm, chat log… (nếu cần).
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </div>
  );
}
