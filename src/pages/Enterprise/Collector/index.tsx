import React, { useMemo, useState } from "react";
import { Users, Phone, ShieldCheck, Activity, BadgeCheck } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Dropdown,
  EmptyState,
  cx,
  formatNumber,
  Modal,
} from "../ui/enterpriseUI";

type Zone = "District 1" | "District 3" | "District 7" | "Thu Duc";
type Status = "ONLINE" | "OFFLINE" | "SUSPENDED";

type Collector = {
  id: string;
  name: string;
  phone: string;
  zone: Zone;
  status: Status;
  completedJobs: number;
  onTimeRate: number; // %
  avgMinutes: number;
  lastSeen: string;
  note?: string;
};

const DATA: Collector[] = [
  {
    id: "C-001",
    name: "Nguyễn Văn A",
    phone: "0901***222",
    zone: "Thu Duc",
    status: "ONLINE",
    completedJobs: 312,
    onTimeRate: 94,
    avgMinutes: 28,
    lastSeen: "2 phút trước",
  },
  {
    id: "C-002",
    name: "Trần Thị B",
    phone: "0908***111",
    zone: "District 7",
    status: "ONLINE",
    completedJobs: 288,
    onTimeRate: 92,
    avgMinutes: 31,
    lastSeen: "5 phút trước",
  },
  {
    id: "C-003",
    name: "Lê Văn C",
    phone: "0933***888",
    zone: "District 1",
    status: "OFFLINE",
    completedJobs: 265,
    onTimeRate: 90,
    avgMinutes: 33,
    lastSeen: "Hôm qua",
  },
  {
    id: "C-004",
    name: "Phạm Thị D",
    phone: "0909***999",
    zone: "District 3",
    status: "ONLINE",
    completedJobs: 241,
    onTimeRate: 89,
    avgMinutes: 35,
    lastSeen: "12 phút trước",
    note: "Cần training route tối ưu",
  },
  {
    id: "C-005",
    name: "Võ Văn E",
    phone: "0902***333",
    zone: "Thu Duc",
    status: "SUSPENDED",
    completedJobs: 228,
    onTimeRate: 87,
    avgMinutes: 37,
    lastSeen: "3 ngày trước",
    note: "Tạm khóa do vi phạm quy trình",
  },
];

function toneByCollectorStatus(s: Status) {
  if (s === "ONLINE") return "emerald";
  if (s === "OFFLINE") return "slate";
  return "rose";
}
function labelCollectorStatus(s: Status) {
  if (s === "ONLINE") return "Đang hoạt động";
  if (s === "OFFLINE") return "Offline";
  return "Tạm khóa";
}

export default function EnterpriseCollectorsPage() {
  const [zone, setZone] = useState<Zone | "ALL">("ALL");
  const [status, setStatus] = useState<Status | "ALL">("ALL");
  const [q, setQ] = useState("");

  const [rows, setRows] = useState<Collector[]>(DATA);

  const [detailOpen, setDetailOpen] = useState(false);
  const [active, setActive] = useState<Collector | null>(null);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => (zone === "ALL" ? true : r.zone === zone))
      .filter((r) => (status === "ALL" ? true : r.status === status))
      .filter((r) => {
        const s = `${r.id} ${r.name} ${r.phone}`.toLowerCase();
        return s.includes(q.trim().toLowerCase());
      })
      .sort((a, b) => b.completedJobs - a.completedJobs);
  }, [rows, zone, status, q]);

  const kpi = useMemo(() => {
    const total = filtered.length;
    const online = filtered.filter((x) => x.status === "ONLINE").length;
    const avgOnTime = total
      ? Math.round(filtered.reduce((s, x) => s + x.onTimeRate, 0) / total)
      : 0;
    const avgMin = total
      ? Math.round(filtered.reduce((s, x) => s + x.avgMinutes, 0) / total)
      : 0;
    return { total, online, avgOnTime, avgMin };
  }, [filtered]);

  function openDetail(c: Collector) {
    setActive(c);
    setDetailOpen(true);
  }

  function toggleSuspend(id: string) {
    setRows((prev) =>
      prev.map((x) =>
        x.id === id
          ? x.status === "SUSPENDED"
            ? { ...x, status: "OFFLINE", note: "Mở khóa — chờ online" }
            : { ...x, status: "SUSPENDED", note: "Tạm khóa bởi doanh nghiệp" }
          : x,
      ),
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <Users className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                    Quản lý nhân sự thu gom
                  </h1>
                  <p className="text-sm text-slate-600">
                    Theo dõi hiệu suất, trạng thái online, và quản trị kỷ luật.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo mã / tên / số điện thoại..."
                  className="w-[min(92vw,320px)] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-emerald-400"
                />
                <Dropdown
                  label="Khu vực"
                  value={zone}
                  onChange={setZone}
                  options={[
                    { value: "ALL", label: "Tất cả" },
                    { value: "District 1", label: "Quận 1" },
                    { value: "District 3", label: "Quận 3" },
                    { value: "District 7", label: "Quận 7" },
                    { value: "Thu Duc", label: "Thủ Đức" },
                  ]}
                />
                <Dropdown
                  label="Trạng thái"
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "ALL", label: "Tất cả" },
                    { value: "ONLINE", label: "Online" },
                    { value: "OFFLINE", label: "Offline" },
                    { value: "SUSPENDED", label: "Tạm khóa" },
                  ]}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Badge tone="slate">Tổng: {kpi.total}</Badge>
              <Badge tone="emerald">Online: {kpi.online}</Badge>
              <Badge tone="emerald">On-time TB: {kpi.avgOnTime}%</Badge>
              <Badge tone="amber">Thời gian TB: {kpi.avgMin} phút</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Danh sách collectors"
            sub="Click một dòng để xem chi tiết & thao tác."
          />
          {filtered.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                    <th className="px-4 py-3">Collector</th>
                    <th className="px-4 py-3">Khu vực</th>
                    <th className="px-4 py-3">Hiệu suất</th>
                    <th className="px-4 py-3">On-time</th>
                    <th className="px-4 py-3">TB xử lý</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const good = c.onTimeRate >= 90;
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors cursor-pointer"
                        onClick={() => openDetail(c)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">
                            {c.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {c.id} • {c.phone}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                          {c.zone}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-900">
                          {formatNumber(c.completedJobs)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={cx(
                                  "h-full",
                                  good ? "bg-emerald-500" : "bg-amber-500",
                                )}
                                style={{
                                  width: `${Math.min(100, Math.max(0, c.onTimeRate))}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                              {c.onTimeRate}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                          {c.avgMinutes} phút
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={toneByCollectorStatus(c.status) as any}>
                            {labelCollectorStatus(c.status)}
                          </Badge>
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant={
                              c.status === "SUSPENDED" ? "outline" : "danger"
                            }
                            onClick={() => toggleSuspend(c.id)}
                          >
                            {c.status === "SUSPENDED" ? "Mở khóa" : "Tạm khóa"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Không có collectors"
              desc="Hãy thử đổi bộ lọc hoặc từ khóa."
            />
          )}
        </Card>

        <Modal
          open={detailOpen}
          title={
            active ? `Hồ sơ collector — ${active.name}` : "Hồ sơ collector"
          }
          sub={
            active
              ? `${active.id} • ${active.zone} • ${labelCollectorStatus(active.status)}`
              : undefined
          }
          onClose={() => setDetailOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDetailOpen(false)}>
                Đóng
              </Button>
              {active ? (
                <Button
                  variant="outline"
                  onClick={() => toggleSuspend(active.id)}
                >
                  {active.status === "SUSPENDED" ? "Mở khóa" : "Tạm khóa"}
                </Button>
              ) : null}
            </>
          }
        >
          {active ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-bold text-slate-500">
                    Hoàn tất
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900">
                    {formatNumber(active.completedJobs)}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-xs font-bold text-emerald-700">
                    On-time
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-emerald-900">
                    {active.onTimeRate}%
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-xs font-bold text-amber-700">
                    TB xử lý
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-amber-900">
                    {active.avgMinutes} phút
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Phone className="h-4 w-4 text-slate-500" />
                  Liên hệ
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {active.phone}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Last seen: {active.lastSeen}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  Ghi chú vận hành
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  {active.note ?? "Không có ghi chú."}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="slate">
                    <Activity className="h-3.5 w-3.5 mr-1" />
                    SLA theo dõi
                  </Badge>
                  <Badge tone="emerald">
                    <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                    Checklist quy trình
                  </Badge>
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </div>
  );
}
