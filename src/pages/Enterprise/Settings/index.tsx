// src/pages/enterprise/EnterpriseSettingsPage.tsx
import React, { useMemo, useState } from "react";
import {
  Bell,
  Building2,
  Copy,
  KeyRound,
  Link2,
  MapPinned,
  Pencil,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
  Webhook,
} from "lucide-react";

// ✅ đổi path import theo project bạn
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Dropdown,
  EmptyState,
  Modal,
  cx,
} from "../../../components/ui/page/componentUI";

/* ===================== Types ===================== */
type Zone = "District 1" | "District 3" | "District 7" | "Thu Duc";
type WasteType = "Plastic" | "Paper" | "Metal" | "Organic" | "Other";

type EnterpriseUserRole = "OWNER" | "MANAGER" | "ANALYST";

type Branch = {
  id: string;
  name: string;
  zone: Zone;
  address: string;
  hotline?: string;
  active: boolean;
};

type EnterpriseUser = {
  id: string;
  name: string;
  email: string;
  role: EnterpriseUserRole;
  active: boolean;
};

type NotificationChannel = "IN_APP" | "EMAIL" | "SMS";
type NotificationEvent =
  | "NEW_REQUEST"
  | "REQUEST_CANCELLED"
  | "REQUEST_OVERDUE"
  | "ASSIGNMENT_CREATED"
  | "COLLECTOR_OFFLINE"
  | "WEEKLY_REPORT";

type NotificationSettings = Record<
  NotificationEvent,
  Record<NotificationChannel, boolean>
>;

type SLASettings = {
  responseMinutesTarget: number;
  pickupMinutesTarget: number;
  maxPendingPerCollector: number;
  autoAssignEnabled: boolean;
  autoAssignStrategy: "NEAREST" | "BALANCED" | "FASTEST";
};

type IntegrationSettings = {
  webhookEnabled: boolean;
  webhookUrl: string;
  webhookSecretMasked: string;
  apiKeyMasked: string;
};

type EnterpriseProfile = {
  displayName: string;
  legalName: string;
  taxCode: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  timezone: string;
  acceptedWasteTypes: WasteType[];
  note?: string;
};

/* ===================== Mock Data ===================== */
const ZONE_OPTIONS: Array<{ value: Zone; label: string }> = [
  { value: "District 1", label: "Quận 1" },
  { value: "District 3", label: "Quận 3" },
  { value: "District 7", label: "Quận 7" },
  { value: "Thu Duc", label: "Thủ Đức" },
];

const WASTE_OPTIONS: Array<{ value: WasteType; label: string }> = [
  { value: "Plastic", label: "Nhựa" },
  { value: "Paper", label: "Giấy" },
  { value: "Metal", label: "Kim loại" },
  { value: "Organic", label: "Hữu cơ" },
  { value: "Other", label: "Khác" },
];

const ROLE_OPTIONS: Array<{ value: EnterpriseUserRole; label: string }> = [
  { value: "OWNER", label: "Chủ doanh nghiệp" },
  { value: "MANAGER", label: "Quản lý vận hành" },
  { value: "ANALYST", label: "Phân tích / Báo cáo" },
];

/* ===================== Small UI helpers ===================== */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <div className="text-sm font-semibold text-slate-800">{label}</div>
        {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm",
        "outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all",
        props.className,
      )}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm",
        "outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all",
        props.className,
      )}
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cx(
        "w-full rounded-2xl border border-slate-200 bg-white p-4 text-left",
        "hover:shadow-md transition-shadow",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-900">{label}</div>
          {desc ? (
            <div className="mt-1 text-sm text-slate-600">{desc}</div>
          ) : null}
        </div>

        <div
          className={cx(
            "shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors",
            checked ? "bg-emerald-600" : "bg-slate-200",
          )}
          aria-hidden="true"
        >
          <div
            className={cx(
              "h-5 w-5 rounded-full bg-white shadow transition-transform",
              checked ? "translate-x-5" : "translate-x-0",
            )}
          />
        </div>
      </div>
    </button>
  );
}

function WasteChips({
  value,
  onChange,
}: {
  value: WasteType[];
  onChange: (next: WasteType[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {WASTE_OPTIONS.map((w) => {
        const active = value.includes(w.value);
        return (
          <button
            key={w.value}
            type="button"
            onClick={() => {
              if (active) onChange(value.filter((x) => x !== w.value));
              else onChange([...value, w.value]);
            }}
            className={cx(
              "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold transition-all",
              active
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
            )}
          >
            {w.label}
          </button>
        );
      })}
    </div>
  );
}

/* ===================== Page ===================== */
type TabKey =
  | "PROFILE"
  | "BRANCHES"
  | "OPS"
  | "NOTIFY"
  | "USERS"
  | "INTEGRATIONS"
  | "SECURITY";

export default function EnterpriseSettingsPage() {
  // Tabs
  const [tab, setTab] = useState<TabKey>("PROFILE");

  // Saving indicator
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<null | {
    tone: "emerald" | "rose";
    msg: string;
  }>(null);

  // Profile
  const [profile, setProfile] = useState<EnterpriseProfile>({
    displayName: "EcoNet Recycling Co.",
    legalName: "CÔNG TY TNHH EC0NET TÁI CHẾ",
    taxCode: "0312xxxxxx",
    email: "enterprise@econet.vn",
    phone: "0909 123 456",
    website: "https://econet.vn",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    timezone: "Asia/Ho_Chi_Minh",
    acceptedWasteTypes: ["Plastic", "Paper", "Metal", "Organic"],
    note: "Ưu tiên xử lý các yêu cầu có phân loại.",
  });

  // Branches
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: "B-001",
      name: "Trạm Quận 1",
      zone: "District 1",
      address: "12 Lê Lợi, Quận 1",
      hotline: "028 1234 5678",
      active: true,
    },
    {
      id: "B-002",
      name: "Trạm Quận 7",
      zone: "District 7",
      address: "99 Nguyễn Thị Thập, Quận 7",
      hotline: "028 2222 3333",
      active: true,
    },
    {
      id: "B-003",
      name: "Trạm Thủ Đức",
      zone: "Thu Duc",
      address: "45 Võ Văn Ngân, Thủ Đức",
      hotline: "028 7777 8888",
      active: false,
    },
  ]);

  // SLA / Ops
  const [sla, setSla] = useState<SLASettings>({
    responseMinutesTarget: 30,
    pickupMinutesTarget: 180,
    maxPendingPerCollector: 8,
    autoAssignEnabled: true,
    autoAssignStrategy: "BALANCED",
  });

  // Notifications
  const [notify, setNotify] = useState<NotificationSettings>({
    NEW_REQUEST: { IN_APP: true, EMAIL: true, SMS: false },
    REQUEST_CANCELLED: { IN_APP: true, EMAIL: false, SMS: false },
    REQUEST_OVERDUE: { IN_APP: true, EMAIL: true, SMS: true },
    ASSIGNMENT_CREATED: { IN_APP: true, EMAIL: false, SMS: false },
    COLLECTOR_OFFLINE: { IN_APP: true, EMAIL: true, SMS: false },
    WEEKLY_REPORT: { IN_APP: false, EMAIL: true, SMS: false },
  });

  // Users
  const [users, setUsers] = useState<EnterpriseUser[]>([
    {
      id: "U-001",
      name: "Xanh C. T. T. C.",
      email: "owner@econet.vn",
      role: "OWNER",
      active: true,
    },
    {
      id: "U-002",
      name: "Nguyễn Minh",
      email: "ops@econet.vn",
      role: "MANAGER",
      active: true,
    },
    {
      id: "U-003",
      name: "Trần Hà",
      email: "report@econet.vn",
      role: "ANALYST",
      active: true,
    },
  ]);

  // Integrations
  const [integrations, setIntegrations] = useState<IntegrationSettings>({
    webhookEnabled: true,
    webhookUrl: "https://api.econet.vn/webhooks/portal",
    webhookSecretMasked: "whsec_••••••••••••••••",
    apiKeyMasked: "ek_••••••••••••••••",
  });

  /* ===================== Modals ===================== */
  const [branchModal, setBranchModal] = useState<{
    open: boolean;
    mode: "CREATE" | "EDIT";
    id?: string;
  }>({ open: false, mode: "CREATE" });

  const editingBranch = useMemo(() => {
    if (!branchModal.open || branchModal.mode !== "EDIT") return null;
    return branches.find((b) => b.id === branchModal.id) ?? null;
  }, [branchModal, branches]);

  const [branchDraft, setBranchDraft] = useState<Branch>({
    id: "",
    name: "",
    zone: "District 1",
    address: "",
    hotline: "",
    active: true,
  });

  // Sync draft when opening edit
  React.useEffect(() => {
    if (!branchModal.open) return;
    if (branchModal.mode === "CREATE") {
      setBranchDraft({
        id: "",
        name: "",
        zone: "District 1",
        address: "",
        hotline: "",
        active: true,
      });
      return;
    }
    if (editingBranch) setBranchDraft(editingBranch);
  }, [branchModal.open, branchModal.mode, editingBranch]);

  const [userModal, setUserModal] = useState(false);
  const [userDraft, setUserDraft] = useState<{
    name: string;
    email: string;
    role: EnterpriseUserRole;
  }>({ name: "", email: "", role: "MANAGER" });

  const [dangerModal, setDangerModal] = useState(false);

  /* ===================== Actions ===================== */
  async function fakeSave(msg = "Đã lưu thay đổi") {
    setSaving(true);
    setFlash(null);
    await new Promise((r) => setTimeout(r, 450));
    setSaving(false);
    setFlash({ tone: "emerald", msg });
    window.setTimeout(() => setFlash(null), 2200);
  }

  function copyToClipboard(text: string, okMsg: string) {
    const safe = text ?? "";
    if (!safe) return;
    navigator.clipboard?.writeText(safe).then(
      () => setFlash({ tone: "emerald", msg: okMsg }),
      () => setFlash({ tone: "rose", msg: "Không thể copy. Hãy thử lại." }),
    );
    window.setTimeout(() => setFlash(null), 2000);
  }

  /* ===================== Render ===================== */
  const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
    { key: "PROFILE", label: "Hồ sơ", icon: <Building2 className="h-4 w-4" /> },
    {
      key: "BRANCHES",
      label: "Chi nhánh",
      icon: <MapPinned className="h-4 w-4" />,
    },
    {
      key: "OPS",
      label: "Vận hành & SLA",
      icon: <Settings2 className="h-4 w-4" />,
    },
    { key: "NOTIFY", label: "Thông báo", icon: <Bell className="h-4 w-4" /> },
    { key: "USERS", label: "Tài khoản", icon: <Users className="h-4 w-4" /> },
    {
      key: "INTEGRATIONS",
      label: "Tích hợp",
      icon: <Webhook className="h-4 w-4" />,
    },
    {
      key: "SECURITY",
      label: "Bảo mật",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-4">
        {/* Top header in Card */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-4 sm:p-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <div className="shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                <Settings2 className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  Cài đặt doanh nghiệp
                </div>
                <div className="text-sm text-slate-600">
                  Quản lý hồ sơ, chi nhánh, vận hành, thông báo và tích hợp hệ
                  thống.
                </div>

                {flash ? (
                  <div className="mt-2">
                    <Badge tone={flash.tone === "emerald" ? "emerald" : "rose"}>
                      {flash.msg}
                    </Badge>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => fakeSave("Đã lưu tất cả cài đặt")}
                disabled={saving}
              >
                <Save className="h-4 w-4" />
                {saving ? "Đang lưu..." : "Lưu tất cả"}
              </Button>

              <Button variant="danger" onClick={() => setDangerModal(true)}>
                <Trash2 className="h-4 w-4" />
                Vùng nguy hiểm
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 sm:px-5 pb-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => {
                const active = t.key === tab;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={cx(
                      "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all",
                      active
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    <span
                      className={cx(
                        active ? "text-emerald-700" : "text-slate-500",
                      )}
                    >
                      {t.icon}
                    </span>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* ===================== PROFILE ===================== */}
        {tab === "PROFILE" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
              <CardHeader
                title="Hồ sơ doanh nghiệp"
                sub="Thông tin hiển thị cho hệ thống & đối tác."
                right={<Badge tone="emerald">Đang hoạt động</Badge>}
              />
              <div className="px-4 sm:px-5 pb-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Tên hiển thị">
                    <Input
                      value={profile.displayName}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          displayName: e.target.value,
                        }))
                      }
                      placeholder="Ví dụ: EcoNet Recycling"
                    />
                  </Field>

                  <Field label="Tên pháp lý">
                    <Input
                      value={profile.legalName}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, legalName: e.target.value }))
                      }
                      placeholder="Tên theo đăng ký kinh doanh"
                    />
                  </Field>

                  <Field label="Mã số thuế">
                    <Input
                      value={profile.taxCode}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, taxCode: e.target.value }))
                      }
                      placeholder="0312xxxxxx"
                    />
                  </Field>

                  <Field label="Múi giờ" hint="Đồng bộ báo cáo & SLA">
                    <Input
                      value={profile.timezone}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, timezone: e.target.value }))
                      }
                      placeholder="Asia/Ho_Chi_Minh"
                    />
                  </Field>

                  <Field label="Email liên hệ">
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="enterprise@domain.com"
                    />
                  </Field>

                  <Field label="Số điện thoại">
                    <Input
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="0909 123 456"
                    />
                  </Field>

                  <Field label="Website">
                    <Input
                      value={profile.website ?? ""}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, website: e.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </Field>

                  <Field label="Địa chỉ trụ sở">
                    <Input
                      value={profile.address}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, address: e.target.value }))
                      }
                      placeholder="Số nhà, đường, quận/huyện..."
                    />
                  </Field>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-800">
                    Loại rác tiếp nhận
                  </div>
                  <WasteChips
                    value={profile.acceptedWasteTypes}
                    onChange={(next) =>
                      setProfile((p) => ({ ...p, acceptedWasteTypes: next }))
                    }
                  />
                  <div className="text-xs text-slate-500">
                    Tip: dùng list này để lọc yêu cầu & báo cáo theo loại rác.
                  </div>
                </div>

                <Field label="Ghi chú vận hành" hint="Tùy chọn">
                  <Textarea
                    rows={3}
                    value={profile.note ?? ""}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, note: e.target.value }))
                    }
                    placeholder="Ví dụ: ưu tiên yêu cầu đã phân loại, chỉ nhận từ 8:00-18:00..."
                  />
                </Field>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fakeSave("Đã lưu hồ sơ doanh nghiệp")}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                    Lưu hồ sơ
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader
                title="Tóm tắt cấu hình"
                sub="Thông tin nhanh để kiểm tra."
              />
              <div className="px-4 sm:px-5 pb-5 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Chi nhánh
                  </div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">
                    {branches.length}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {branches.filter((b) => b.active).length} đang hoạt động
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Auto-assign
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone={sla.autoAssignEnabled ? "emerald" : "slate"}>
                      {sla.autoAssignEnabled ? "Bật" : "Tắt"}
                    </Badge>
                    <span className="text-sm font-semibold text-slate-800">
                      {sla.autoAssignStrategy === "NEAREST"
                        ? "Gần nhất"
                        : sla.autoAssignStrategy === "FASTEST"
                          ? "Nhanh nhất"
                          : "Cân bằng"}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Mục tiêu phản hồi: {sla.responseMinutesTarget} phút
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tích hợp
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge
                      tone={integrations.webhookEnabled ? "emerald" : "slate"}
                    >
                      Webhook {integrations.webhookEnabled ? "ON" : "OFF"}
                    </Badge>
                    <Badge tone="slate">API</Badge>
                  </div>
                  <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                    {integrations.webhookUrl || "Chưa cấu hình URL webhook"}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ===================== BRANCHES ===================== */}
        {tab === "BRANCHES" && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader
              title="Chi nhánh & khu vực phục vụ"
              sub="Quản lý trạm vận hành theo địa bàn. Chi nhánh inactive sẽ không nhận phân công."
              right={
                <Button
                  variant="outline"
                  onClick={() => setBranchModal({ open: true, mode: "CREATE" })}
                >
                  <Plus className="h-4 w-4" />
                  Thêm chi nhánh
                </Button>
              }
            />

            <div className="px-4 sm:px-5 pb-5">
              {branches.length === 0 ? (
                <EmptyState
                  title="Chưa có chi nhánh"
                  desc="Tạo chi nhánh đầu tiên để bắt đầu nhận điều phối."
                  right={
                    <Button
                      variant="outline"
                      onClick={() =>
                        setBranchModal({ open: true, mode: "CREATE" })
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Thêm chi nhánh
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50 border-y border-slate-200">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        <th className="px-4 py-3">Chi nhánh</th>
                        <th className="px-4 py-3">Khu vực</th>
                        <th className="px-4 py-3">Địa chỉ</th>
                        <th className="px-4 py-3">Hotline</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches.map((b) => (
                        <tr
                          key={b.id}
                          className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">
                              {b.name}
                            </div>
                            <div className="text-xs text-slate-500">{b.id}</div>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                            {ZONE_OPTIONS.find((z) => z.value === b.zone)
                              ?.label ?? b.zone}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {b.address}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {b.hotline || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone={b.active ? "emerald" : "slate"}>
                              {b.active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                onClick={() =>
                                  setBranchModal({
                                    open: true,
                                    mode: "EDIT",
                                    id: b.id,
                                  })
                                }
                              >
                                <Pencil className="h-4 w-4" />
                                Sửa
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBranches((prev) =>
                                    prev.filter((x) => x.id !== b.id),
                                  );
                                  setFlash({
                                    tone: "emerald",
                                    msg: "Đã xoá chi nhánh",
                                  });
                                  window.setTimeout(() => setFlash(null), 2000);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                Xoá
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 flex items-center justify-end">
                <Button
                  variant="outline"
                  onClick={() => fakeSave("Đã lưu cấu hình chi nhánh")}
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ===================== OPS & SLA ===================== */}
        {tab === "OPS" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
              <CardHeader
                title="Vận hành & SLA"
                sub="Đặt mục tiêu phản hồi, pickup, và quy tắc auto-assign."
              />
              <div className="px-4 sm:px-5 pb-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Mục tiêu phản hồi (phút)"
                    hint="SLA phản hồi yêu cầu"
                  >
                    <Input
                      type="number"
                      min={5}
                      value={sla.responseMinutesTarget}
                      onChange={(e) =>
                        setSla((s) => ({
                          ...s,
                          responseMinutesTarget: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </Field>

                  <Field
                    label="Mục tiêu thu gom (phút)"
                    hint="Từ lúc nhận đến hoàn tất"
                  >
                    <Input
                      type="number"
                      min={15}
                      value={sla.pickupMinutesTarget}
                      onChange={(e) =>
                        setSla((s) => ({
                          ...s,
                          pickupMinutesTarget: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </Field>

                  <Field
                    label="Giới hạn pending / collector"
                    hint="Tránh quá tải"
                  >
                    <Input
                      type="number"
                      min={1}
                      value={sla.maxPendingPerCollector}
                      onChange={(e) =>
                        setSla((s) => ({
                          ...s,
                          maxPendingPerCollector: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </Field>

                  <Field
                    label="Chiến lược auto-assign"
                    hint="Áp dụng khi bật auto-assign"
                  >
                    <Dropdown
                      label="Strategy"
                      value={sla.autoAssignStrategy}
                      onChange={(v) =>
                        setSla((s) => ({ ...s, autoAssignStrategy: v }))
                      }
                      options={[
                        { value: "NEAREST", label: "Gần nhất" },
                        { value: "BALANCED", label: "Cân bằng" },
                        { value: "FASTEST", label: "Nhanh nhất" },
                      ]}
                      className="w-full"
                    />
                  </Field>
                </div>

                <Toggle
                  checked={sla.autoAssignEnabled}
                  onChange={(v) =>
                    setSla((s) => ({ ...s, autoAssignEnabled: v }))
                  }
                  label="Tự động phân công (Auto-assign)"
                  desc="Khi bật: hệ thống tự gán collector theo chiến lược và giới hạn pending."
                />

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fakeSave("Đã lưu SLA & vận hành")}
                  >
                    <Save className="h-4 w-4" />
                    Lưu cấu hình
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader
                title="Gợi ý vận hành"
                sub="Checklist nhanh để tối ưu SLA."
              />
              <div className="px-4 sm:px-5 pb-5 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-bold text-slate-900">
                    Khuyến nghị
                  </div>
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    <li>• Giữ phản hồi &lt; 30 phút để giảm tỷ lệ huỷ.</li>
                    <li>
                      • Bật auto-assign để giảm thời gian điều phối thủ công.
                    </li>
                    <li>• Giới hạn pending phù hợp năng lực từng collector.</li>
                    <li>• Cấu hình thông báo quá hạn cho quản lý vận hành.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Trạng thái hiện tại
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge
                      tone={
                        sla.responseMinutesTarget <= 30 ? "emerald" : "amber"
                      }
                    >
                      Response {sla.responseMinutesTarget}m
                    </Badge>
                    <Badge
                      tone={
                        sla.pickupMinutesTarget <= 240 ? "emerald" : "amber"
                      }
                    >
                      Pickup {sla.pickupMinutesTarget}m
                    </Badge>
                    <Badge tone={sla.autoAssignEnabled ? "emerald" : "slate"}>
                      Auto-assign {sla.autoAssignEnabled ? "ON" : "OFF"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ===================== NOTIFICATIONS ===================== */}
        {tab === "NOTIFY" && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader
              title="Thông báo"
              sub="Chọn kênh nhận thông báo theo từng sự kiện."
              right={<Badge tone="slate">Đồng bộ theo tài khoản</Badge>}
            />

            <div className="px-4 sm:px-5 pb-5 space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 border-y border-slate-200">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      <th className="px-4 py-3">Sự kiện</th>
                      <th className="px-4 py-3">In-app</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">SMS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ["NEW_REQUEST", "Có yêu cầu mới từ citizen"],
                        ["REQUEST_CANCELLED", "Yêu cầu bị huỷ"],
                        ["REQUEST_OVERDUE", "Yêu cầu quá hạn SLA"],
                        ["ASSIGNMENT_CREATED", "Tạo phân công mới"],
                        [
                          "COLLECTOR_OFFLINE",
                          "Collector OFFLINE / mất tín hiệu",
                        ],
                        ["WEEKLY_REPORT", "Báo cáo tuần"],
                      ] as Array<[NotificationEvent, string]>
                    ).map(([key, label]) => (
                      <tr
                        key={key}
                        className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">
                            {label}
                          </div>
                          <div className="text-xs text-slate-500">{key}</div>
                        </td>

                        {(
                          ["IN_APP", "EMAIL", "SMS"] as NotificationChannel[]
                        ).map((ch) => {
                          const checked = notify[key][ch];
                          return (
                            <td key={ch} className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setNotify((n) => ({
                                    ...n,
                                    [key]: { ...n[key], [ch]: !checked },
                                  }))
                                }
                                className={cx(
                                  "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold transition-all",
                                  checked
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
                                )}
                              >
                                {checked ? "Bật" : "Tắt"}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end">
                <Button
                  variant="outline"
                  onClick={() => fakeSave("Đã lưu thông báo")}
                >
                  <Save className="h-4 w-4" />
                  Lưu cấu hình
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ===================== USERS ===================== */}
        {tab === "USERS" && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader
              title="Tài khoản & phân quyền"
              sub="Quản lý người dùng nội bộ (quản lý, báo cáo)."
              right={
                <Button variant="outline" onClick={() => setUserModal(true)}>
                  <Plus className="h-4 w-4" />
                  Mời người dùng
                </Button>
              }
            />

            <div className="px-4 sm:px-5 pb-5 space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 border-y border-slate-200">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      <th className="px-4 py-3">Người dùng</th>
                      <th className="px-4 py-3">Quyền</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">
                            {u.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {u.email}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Dropdown
                            label="Role"
                            value={u.role}
                            onChange={(v) =>
                              setUsers((prev) =>
                                prev.map((x) =>
                                  x.id === u.id ? { ...x, role: v } : x,
                                ),
                              )
                            }
                            options={ROLE_OPTIONS}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={u.active ? "emerald" : "slate"}>
                            {u.active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              onClick={() =>
                                setUsers((prev) =>
                                  prev.map((x) =>
                                    x.id === u.id
                                      ? { ...x, active: !x.active }
                                      : x,
                                  ),
                                )
                              }
                            >
                              {u.active ? "Khoá" : "Mở"}
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setUsers((prev) =>
                                  prev.filter((x) => x.id !== u.id),
                                );
                                setFlash({
                                  tone: "emerald",
                                  msg: "Đã xoá người dùng",
                                });
                                window.setTimeout(() => setFlash(null), 2000);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Xoá
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end">
                <Button
                  variant="outline"
                  onClick={() => fakeSave("Đã lưu phân quyền")}
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ===================== INTEGRATIONS ===================== */}
        {tab === "INTEGRATIONS" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
              <CardHeader
                title="Tích hợp & Webhook"
                sub="Đẩy sự kiện sang hệ thống ngoài (ERP/CRM/BI)."
              />
              <div className="px-4 sm:px-5 pb-5 space-y-4">
                <Toggle
                  checked={integrations.webhookEnabled}
                  onChange={(v) =>
                    setIntegrations((s) => ({ ...s, webhookEnabled: v }))
                  }
                  label="Bật Webhook"
                  desc="Khi bật: hệ thống gửi sự kiện (yêu cầu mới, quá hạn, hoàn tất...) về endpoint."
                />

                <Field label="Webhook URL" hint="HTTPS recommended">
                  <Input
                    value={integrations.webhookUrl}
                    onChange={(e) =>
                      setIntegrations((s) => ({
                        ...s,
                        webhookUrl: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Webhook Secret" hint="Dùng để verify chữ ký">
                    <div className="flex items-center gap-2">
                      <Input
                        value={integrations.webhookSecretMasked}
                        readOnly
                      />
                      <Button
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(
                            "whsec_example_real_secret",
                            "Đã copy webhook secret",
                          )
                        }
                        title="Copy (demo)"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </Field>

                  <Field label="API Key" hint="Dùng cho gọi API nội bộ">
                    <div className="flex items-center gap-2">
                      <Input value={integrations.apiKeyMasked} readOnly />
                      <Button
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(
                            "ek_example_real_key",
                            "Đã copy API key",
                          )
                        }
                        title="Copy (demo)"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </Field>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fakeSave("Đã lưu tích hợp")}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                    Lưu cấu hình
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader
                title="Quick actions"
                sub="Thao tác nhanh cho tích hợp."
              />
              <div className="px-4 sm:px-5 pb-5 space-y-3">
                <button
                  type="button"
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left hover:shadow-md transition-shadow"
                  onClick={() => {
                    setIntegrations((s) => ({
                      ...s,
                      apiKeyMasked: "ek_••••••••••NEW••••",
                    }));
                    setFlash({
                      tone: "emerald",
                      msg: "Đã rotate API key (demo)",
                    });
                    window.setTimeout(() => setFlash(null), 2000);
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-emerald-700" />
                        Rotate API Key
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Tạo key mới và vô hiệu key cũ.
                      </div>
                    </div>
                    <Badge tone="slate">Demo</Badge>
                  </div>
                </button>

                <button
                  type="button"
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left hover:shadow-md transition-shadow"
                  onClick={() =>
                    copyToClipboard(
                      integrations.webhookUrl,
                      "Đã copy webhook URL",
                    )
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-emerald-700" />
                        Copy Webhook URL
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Dán vào hệ thống đối tác để test.
                      </div>
                    </div>
                    <Copy className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* ===================== SECURITY ===================== */}
        {tab === "SECURITY" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
              <CardHeader
                title="Bảo mật"
                sub="Các chính sách bảo mật khuyến nghị cho tài khoản doanh nghiệp."
              />
              <div className="px-4 sm:px-5 pb-5 space-y-3">
                <Toggle
                  checked={true}
                  onChange={() => { }}
                  label="Bắt buộc mật khẩu mạnh"
                  desc="Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số."
                />
                <Toggle
                  checked={false}
                  onChange={() => { }}
                  label="Bật 2FA (Two-factor Authentication)"
                  desc="Khuyến nghị bật cho OWNER/MANAGER."
                />
                <Toggle
                  checked={true}
                  onChange={() => { }}
                  label="Giới hạn đăng nhập theo thiết bị"
                  desc="Ghi nhớ thiết bị tin cậy và cảnh báo đăng nhập lạ."
                />

                <div className="flex items-center justify-end">
                  <Button
                    variant="outline"
                    onClick={() => fakeSave("Đã lưu cài đặt bảo mật")}
                  >
                    <Save className="h-4 w-4" />
                    Lưu thay đổi
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader title="Audit & Logs" sub="Nhật ký thao tác (demo)." />
              <div className="px-4 sm:px-5 pb-5 space-y-2">
                {[
                  "10:12 • ops@econet.vn cập nhật SLA",
                  "09:55 • owner@econet.vn rotate API key",
                  "Hôm qua • report@econet.vn tải báo cáo tuần",
                ].map((x) => (
                  <div
                    key={x}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {x}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ===================== Branch Modal ===================== */}
      <Modal
        open={branchModal.open}
        title={
          branchModal.mode === "CREATE"
            ? "Thêm chi nhánh"
            : "Cập nhật chi nhánh"
        }
        sub="Thông tin chi nhánh dùng cho điều phối theo khu vực."
        onClose={() => setBranchModal({ open: false, mode: "CREATE" })}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setBranchModal({ open: false, mode: "CREATE" })}
            >
              Huỷ
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const name = branchDraft.name.trim();
                const address = branchDraft.address.trim();
                if (!name || !address) {
                  setFlash({
                    tone: "rose",
                    msg: "Vui lòng nhập tên và địa chỉ chi nhánh.",
                  });
                  window.setTimeout(() => setFlash(null), 2000);
                  return;
                }

                if (branchModal.mode === "CREATE") {
                  const id = `B-${String(Math.floor(100 + Math.random() * 900))}`;
                  setBranches((prev) => [{ ...branchDraft, id }, ...prev]);
                  setFlash({ tone: "emerald", msg: "Đã thêm chi nhánh" });
                } else {
                  setBranches((prev) =>
                    prev.map((b) =>
                      b.id === branchDraft.id ? branchDraft : b,
                    ),
                  );
                  setFlash({ tone: "emerald", msg: "Đã cập nhật chi nhánh" });
                }

                window.setTimeout(() => setFlash(null), 2000);
                setBranchModal({ open: false, mode: "CREATE" });
              }}
            >
              <Save className="h-4 w-4" />
              {branchModal.mode === "CREATE" ? "Tạo chi nhánh" : "Lưu thay đổi"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tên chi nhánh">
              <Input
                value={branchDraft.name}
                onChange={(e) =>
                  setBranchDraft((d) => ({ ...d, name: e.target.value }))
                }
                placeholder="Ví dụ: Trạm Quận 1"
              />
            </Field>

            <Field label="Khu vực">
              <Dropdown
                label="Khu vực"
                value={branchDraft.zone}
                onChange={(v) => setBranchDraft((d) => ({ ...d, zone: v }))}
                options={ZONE_OPTIONS}
              />
            </Field>
          </div>

          <Field label="Địa chỉ">
            <Input
              value={branchDraft.address}
              onChange={(e) =>
                setBranchDraft((d) => ({ ...d, address: e.target.value }))
              }
              placeholder="Số nhà, đường, phường..."
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Hotline" hint="Tùy chọn">
              <Input
                value={branchDraft.hotline ?? ""}
                onChange={(e) =>
                  setBranchDraft((d) => ({ ...d, hotline: e.target.value }))
                }
                placeholder="028 ..."
              />
            </Field>

            <Field label="Trạng thái">
              <Dropdown
                label="Status"
                value={
                  (branchDraft.active ? "ACTIVE" : "INACTIVE") as
                  | "ACTIVE"
                  | "INACTIVE"
                }
                onChange={(v) =>
                  setBranchDraft((d) => ({ ...d, active: v === "ACTIVE" }))
                }
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                ]}
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Tip: set <b>Inactive</b> để tạm ngưng nhận điều phối khu vực này
            nhưng vẫn giữ dữ liệu.
          </div>
        </div>
      </Modal>

      {/* ===================== User Modal ===================== */}
      <Modal
        open={userModal}
        title="Mời người dùng"
        sub="Gửi lời mời qua email (demo UI)."
        onClose={() => setUserModal(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setUserModal(false)}>
              Huỷ
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const name = userDraft.name.trim();
                const email = userDraft.email.trim();
                if (!name || !email) {
                  setFlash({
                    tone: "rose",
                    msg: "Vui lòng nhập tên và email.",
                  });
                  window.setTimeout(() => setFlash(null), 2000);
                  return;
                }
                const id = `U-${String(Math.floor(100 + Math.random() * 900))}`;
                setUsers((prev) => [
                  { id, name, email, role: userDraft.role, active: true },
                  ...prev,
                ]);
                setUserDraft({ name: "", email: "", role: "MANAGER" });
                setUserModal(false);
                setFlash({ tone: "emerald", msg: "Đã thêm người dùng (demo)" });
                window.setTimeout(() => setFlash(null), 2000);
              }}
            >
              <Plus className="h-4 w-4" />
              Thêm
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Họ tên">
            <Input
              value={userDraft.name}
              onChange={(e) =>
                setUserDraft((d) => ({ ...d, name: e.target.value }))
              }
              placeholder="Nguyễn Văn A"
            />
          </Field>

          <Field label="Email">
            <Input
              type="email"
              value={userDraft.email}
              onChange={(e) =>
                setUserDraft((d) => ({ ...d, email: e.target.value }))
              }
              placeholder="user@econet.vn"
            />
          </Field>

          <Field label="Quyền">
            <Dropdown
              label="Role"
              value={userDraft.role}
              onChange={(v) => setUserDraft((d) => ({ ...d, role: v }))}
              options={ROLE_OPTIONS}
            />
          </Field>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Gợi ý phân quyền:
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>• OWNER: toàn quyền (hạn chế số lượng).</li>
              <li>• MANAGER: điều phối, SLA, xem báo cáo vận hành.</li>
              <li>• ANALYST: xem dashboard, xuất báo cáo.</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* ===================== Danger Zone Modal ===================== */}
      <Modal
        open={dangerModal}
        title="Vùng nguy hiểm"
        sub="Các thao tác ảnh hưởng lớn. Hãy chắc chắn trước khi thực hiện."
        onClose={() => setDangerModal(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDangerModal(false)}>
              Đóng
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setDangerModal(false);
                setFlash({
                  tone: "rose",
                  msg: "Đã gửi yêu cầu khoá doanh nghiệp (demo)",
                });
                window.setTimeout(() => setFlash(null), 2200);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Khoá doanh nghiệp
            </Button>
          </>
        }
        widthClass="max-w-xl"
      >
        <div className="space-y-3">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <div className="font-bold">Khoá doanh nghiệp</div>
            <div className="mt-1 text-rose-800">
              Hệ thống sẽ ngừng nhận yêu cầu mới và tạm dừng điều phối. Dữ liệu
              vẫn được lưu.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Quy trình gợi ý:
            <ol className="mt-2 list-decimal pl-5 space-y-1 text-slate-600">
              <li>Xuất báo cáo & dữ liệu cần thiết.</li>
              <li>Thông báo cho collector và citizen liên quan.</li>
              <li>Khoá, sau đó kiểm tra webhook và API key.</li>
            </ol>
          </div>
        </div>
      </Modal>

      {/* Animations (nếu project chưa có global animate-in) */}
      <style>{`
        @keyframes slide-in-from-top-4 {
          from { transform: translateY(-1rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-in { animation-fill-mode: both; }
        .fade-in { animation: fadeIn 0.18s ease-out; }
        .slide-in-from-top-4 { animation: slide-in-from-top-4 0.22s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
