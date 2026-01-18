import React, { useMemo, useState } from "react";
import { Gift, Plus, Calculator } from "lucide-react";
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

type WasteType = "Plastic" | "Paper" | "Metal" | "Organic" | "Other";
type RuleStatus = "ACTIVE" | "INACTIVE";

type RewardRule = {
  id: string;
  wasteType: WasteType;
  pointsPerKg: number;
  bonusThresholdKg?: number; // nếu >= threshold -> bonus
  bonusPoints?: number;
  status: RuleStatus;
  updatedAt: string;
  note?: string;
};

const INIT: RewardRule[] = [
  {
    id: "RR-001",
    wasteType: "Plastic",
    pointsPerKg: 12,
    bonusThresholdKg: 10,
    bonusPoints: 25,
    status: "ACTIVE",
    updatedAt: "18/01",
    note: "Khuyến khích nhựa sạch",
  },
  {
    id: "RR-002",
    wasteType: "Paper",
    pointsPerKg: 8,
    status: "ACTIVE",
    updatedAt: "17/01",
  },
  {
    id: "RR-003",
    wasteType: "Metal",
    pointsPerKg: 15,
    bonusThresholdKg: 5,
    bonusPoints: 20,
    status: "ACTIVE",
    updatedAt: "16/01",
  },
  {
    id: "RR-004",
    wasteType: "Organic",
    pointsPerKg: 6,
    status: "INACTIVE",
    updatedAt: "10/01",
    note: "Tạm ngưng do chất lượng",
  },
  {
    id: "RR-005",
    wasteType: "Other",
    pointsPerKg: 3,
    status: "ACTIVE",
    updatedAt: "12/01",
  },
];

function toneByRuleStatus(s: RuleStatus) {
  return s === "ACTIVE" ? "emerald" : "slate";
}
function labelRuleStatus(s: RuleStatus) {
  return s === "ACTIVE" ? "Đang áp dụng" : "Tạm tắt";
}

export default function EnterpriseRewardRulesPage() {
  const [type, setType] = useState<WasteType | "ALL">("ALL");
  const [status, setStatus] = useState<RuleStatus | "ALL">("ALL");
  const [rules, setRules] = useState<RewardRule[]>(INIT);

  // create/edit modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RewardRule | null>(null);

  const [wasteType, setWasteType] = useState<WasteType>("Plastic");
  const [ppk, setPpk] = useState<number>(10);
  const [threshold, setThreshold] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);
  const [note, setNote] = useState<string>("");

  // calculator
  const [kg, setKg] = useState<number>(10);

  const filtered = useMemo(() => {
    return rules
      .filter((r) => (type === "ALL" ? true : r.wasteType === type))
      .filter((r) => (status === "ALL" ? true : r.status === status));
  }, [rules, type, status]);

  function openCreate() {
    setEditing(null);
    setWasteType("Plastic");
    setPpk(10);
    setThreshold(0);
    setBonus(0);
    setNote("");
    setOpen(true);
  }

  function openEdit(r: RewardRule) {
    setEditing(r);
    setWasteType(r.wasteType);
    setPpk(r.pointsPerKg);
    setThreshold(r.bonusThresholdKg ?? 0);
    setBonus(r.bonusPoints ?? 0);
    setNote(r.note ?? "");
    setOpen(true);
  }

  function save() {
    const payload: RewardRule = {
      id: editing?.id ?? `RR-${String(Math.floor(Math.random() * 900 + 100))}`,
      wasteType,
      pointsPerKg: ppk,
      bonusThresholdKg: threshold > 0 ? threshold : undefined,
      bonusPoints: threshold > 0 ? bonus : undefined,
      status: editing?.status ?? "ACTIVE",
      updatedAt: "Hôm nay",
      note: note.trim() ? note.trim() : undefined,
    };

    setRules((prev) => {
      if (!editing) return [payload, ...prev];
      return prev.map((x) => (x.id === editing.id ? payload : x));
    });

    setOpen(false);
  }

  function toggleRule(id: string) {
    setRules((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              status: x.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
              updatedAt: "Hôm nay",
            }
          : x,
      ),
    );
  }

  const calculatorPoints = useMemo(() => {
    const rule = rules.find((r) => r.wasteType === wasteType);
    if (!rule) return 0;
    const base = kg * rule.pointsPerKg;
    const add =
      rule.bonusThresholdKg && rule.bonusPoints && kg >= rule.bonusThresholdKg
        ? rule.bonusPoints
        : 0;
    return Math.round(base + add);
  }, [rules, wasteType, kg]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <Gift className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                    Quy tắc điểm thưởng
                  </h1>
                  <p className="text-sm text-slate-600">
                    Định nghĩa điểm/khối lượng theo loại rác + bonus để kích
                    thích hành vi tốt.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Dropdown
                  label="Loại rác"
                  value={type}
                  onChange={setType}
                  options={[
                    { value: "ALL", label: "Tất cả" },
                    { value: "Plastic", label: "Nhựa" },
                    { value: "Paper", label: "Giấy" },
                    { value: "Metal", label: "Kim loại" },
                    { value: "Organic", label: "Hữu cơ" },
                    { value: "Other", label: "Khác" },
                  ]}
                />
                <Dropdown
                  label="Trạng thái"
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "ALL", label: "Tất cả" },
                    { value: "ACTIVE", label: "Đang áp dụng" },
                    { value: "INACTIVE", label: "Tạm tắt" },
                  ]}
                />
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Tạo rule
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardHeader
              title="Danh sách rules"
              sub="Toggle ON/OFF để áp dụng ngay (mock). Click row để edit."
            />
            {filtered.length ? (
              <div className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 sm:p-5 hover:bg-emerald-50/30 transition-colors"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-base font-extrabold text-slate-900">
                            {r.wasteType}
                          </div>
                          <Badge tone={toneByRuleStatus(r.status) as any}>
                            {labelRuleStatus(r.status)}
                          </Badge>
                          <Badge tone="slate">Cập nhật: {r.updatedAt}</Badge>
                        </div>

                        <div className="mt-2 text-sm text-slate-700">
                          <span className="font-bold text-slate-900">
                            {r.pointsPerKg}
                          </span>{" "}
                          điểm / kg
                          {r.bonusThresholdKg && r.bonusPoints ? (
                            <>
                              {" "}
                              • Bonus{" "}
                              <span className="font-bold text-slate-900">
                                {r.bonusPoints}
                              </span>{" "}
                              điểm nếu ≥{" "}
                              <span className="font-bold text-slate-900">
                                {r.bonusThresholdKg}kg
                              </span>
                            </>
                          ) : null}
                        </div>

                        {r.note ? (
                          <div className="mt-1 text-sm text-slate-600">
                            {r.note}
                          </div>
                        ) : null}

                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" onClick={() => openEdit(r)}>
                            Sửa
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => toggleRule(r.id)}
                          >
                            {r.status === "ACTIVE" ? "Tắt rule" : "Bật rule"}
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <div className="text-xs font-bold text-slate-500">
                          Rule ID
                        </div>
                        <div className="text-sm font-extrabold text-slate-900">
                          {r.id}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Không có rule" desc="Thử đổi bộ lọc." />
            )}
          </Card>

          <Card className="xl:col-span-1">
            <CardHeader
              title="Tính thử điểm"
              sub="Dành cho QA/PM kiểm nhanh logic point + bonus."
              right={
                <Badge tone="slate">
                  <Calculator className="h-3.5 w-3.5 mr-1" />
                  Preview
                </Badge>
              }
            />
            <div className="px-4 sm:px-5 pb-5 space-y-3">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1">
                  Loại rác
                </div>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value as WasteType)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-400"
                >
                  <option value="Plastic">Nhựa</option>
                  <option value="Paper">Giấy</option>
                  <option value="Metal">Kim loại</option>
                  <option value="Organic">Hữu cơ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1">
                  Khối lượng (kg)
                </div>
                <input
                  type="number"
                  value={kg}
                  onChange={(e) => setKg(Number(e.target.value || 0))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-400"
                />
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-xs font-bold text-emerald-700">
                  Điểm dự kiến
                </div>
                <div className="mt-1 text-3xl font-extrabold text-emerald-900">
                  {formatNumber(calculatorPoints)}
                </div>
                <div className="mt-1 text-xs text-emerald-800">
                  (Tính từ rule hiện tại + bonus nếu đạt ngưỡng)
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Modal
          open={open}
          title={editing ? "Cập nhật rule" : "Tạo rule mới"}
          sub="Script: thay đổi rule sẽ ảnh hưởng tính điểm cho các yêu cầu sau thời điểm áp dụng."
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button onClick={save}>Lưu</Button>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">
                Loại rác
              </div>
              <select
                value={wasteType}
                onChange={(e) => setWasteType(e.target.value as WasteType)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-400"
              >
                <option value="Plastic">Nhựa</option>
                <option value="Paper">Giấy</option>
                <option value="Metal">Kim loại</option>
                <option value="Organic">Hữu cơ</option>
                <option value="Other">Khác</option>
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">
                Điểm / kg
              </div>
              <input
                type="number"
                value={ppk}
                onChange={(e) => setPpk(Number(e.target.value || 0))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">
                Ngưỡng bonus (kg)
              </div>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value || 0))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-400"
                placeholder="0 nếu không bonus"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">
                Bonus points
              </div>
              <input
                type="number"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value || 0))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-400"
                placeholder="0 nếu không bonus"
                disabled={threshold <= 0}
              />
            </div>

            <div className="sm:col-span-2">
              <div className="text-xs font-semibold text-slate-600 mb-1">
                Ghi chú
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[92px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-emerald-400"
                placeholder="Ví dụ: ưu tiên nhựa sạch, áp dụng cho chiến dịch tháng 1..."
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
