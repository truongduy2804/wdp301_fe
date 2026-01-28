// src/pages/Admin/Accounts.tsx
import React, { useMemo, useState } from "react";
import { KeyRound, Plus, Search, ShieldCheck, Users } from "lucide-react";

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

type Role = "ADMIN" | "ENTERPRISE" | "COLLECTOR" | "CITIZEN";
type Status = "ACTIVE" | "SUSPENDED";

type AccountRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastLogin: string;
};

const MOCK: AccountRow[] = [
  {
    id: "U-001",
    name: "Admin Root",
    email: "admin@econet.vn",
    role: "ADMIN",
    status: "ACTIVE",
    lastLogin: "07/12 10:21",
  },
  {
    id: "U-101",
    name: "Doanh nghiệp A",
    email: "enterpriseA@econet.vn",
    role: "ENTERPRISE",
    status: "ACTIVE",
    lastLogin: "07/12 09:05",
  },
  {
    id: "U-201",
    name: "Collector B",
    email: "collectorB@econet.vn",
    role: "COLLECTOR",
    status: "ACTIVE",
    lastLogin: "06/12 18:40",
  },
  {
    id: "U-301",
    name: "Citizen C",
    email: "citizenC@econet.vn",
    role: "CITIZEN",
    status: "SUSPENDED",
    lastLogin: "02/12 12:14",
  },
];

type RoleFilter = Role | "ALL";

export default function AdminAccounts() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [open, setOpen] = useState(false);

  // Modal form (demo)
  const [mName, setMName] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mRole, setMRole] = useState<Role>("ADMIN");
  const [mStatus, setMStatus] = useState<Status>("ACTIVE");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MOCK.filter((r) => {
      const matchQ =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query);
      const matchRole = role === "ALL" ? true : r.role === role;
      return matchQ && matchRole;
    });
  }, [q, role]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        {/* overflow-visible để dropdown không bị cắt */}
        <Card className="p-4 sm:p-5 overflow-visible">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <Users className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Tài khoản & phân quyền
                  </h1>
                  <p className="text-sm text-slate-600">
                    Quản lý tài khoản, role, trạng thái hoạt động.
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
                  placeholder="Tìm theo tên / email / ID..."
                  className="w-64 max-w-[65vw] bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Role dropdown (componentUI) */}
              <Dropdown<RoleFilter>
                icon={ShieldCheck}
                label="Role"
                value={role}
                onChange={setRole}
                options={[
                  { value: "ALL", label: "Tất cả role" },
                  { value: "ADMIN", label: "ADMIN" },
                  { value: "ENTERPRISE", label: "ENTERPRISE" },
                  { value: "COLLECTOR", label: "COLLECTOR" },
                  { value: "CITIZEN", label: "CITIZEN" },
                ]}
                minWidth={210}
              />

              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" />
                Tạo tài khoản
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <Card className="overflow-hidden" hover={false}>
          <CardHeader
            title="Danh sách tài khoản"
            sub={`Kết quả: ${rows.length}`}
            right={
              <Badge tone="slate">
                {role === "ALL" ? "All roles" : `Role: ${role}`}
              </Badge>
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
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Last login</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const statusTone =
                      r.status === "ACTIVE" ? "emerald" : "rose";
                    return (
                      <tr
                        key={r.id}
                        className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {r.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {r.email}
                          </div>
                          <div className="text-xs text-slate-400">{r.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone="blue">{r.role}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={statusTone as any}>{r.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {r.lastLogin}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">
                              <KeyRound className="h-4 w-4" />
                              Đổi role
                            </Button>
                            <Button
                              variant={
                                r.status === "ACTIVE" ? "danger" : "outline"
                              }
                            >
                              {r.status === "ACTIVE" ? "Khoá" : "Mở khoá"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal: tạo tài khoản (đồng bộ dropdown) */}
        <Modal
          open={open}
          title="Tạo tài khoản"
          sub="Demo UI (bạn nối API sau)"
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Huỷ
              </Button>
              <Button
                onClick={() => {
                  // demo: reset
                  setMName("");
                  setMEmail("");
                  setMRole("ADMIN");
                  setMStatus("ACTIVE");
                  setOpen(false);
                }}
              >
                Tạo
              </Button>
            </>
          }
          widthClass="max-w-3xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-600">Họ tên</div>
              <input
                value={mName}
                onChange={(e) => setMName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-300"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">Email</div>
              <input
                value={mEmail}
                onChange={(e) => setMEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-300"
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-600">Role</div>
                <div className="mt-1">
                  <Dropdown<Role>
                    icon={ShieldCheck}
                    label="Chọn role"
                    value={mRole}
                    onChange={setMRole}
                    options={[
                      { value: "ADMIN", label: "ADMIN" },
                      { value: "ENTERPRISE", label: "ENTERPRISE" },
                      { value: "COLLECTOR", label: "COLLECTOR" },
                      { value: "CITIZEN", label: "CITIZEN" },
                    ]}
                    minWidth={260}
                  />
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600">
                  Trạng thái
                </div>
                <div className="mt-1">
                  <Dropdown<Status>
                    label="Trạng thái"
                    value={mStatus}
                    onChange={setMStatus}
                    options={[
                      { value: "ACTIVE", label: "ACTIVE" },
                      { value: "SUSPENDED", label: "SUSPENDED" },
                    ]}
                    minWidth={260}
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
