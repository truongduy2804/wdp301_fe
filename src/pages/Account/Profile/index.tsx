// AccountProfilePage.tsx
import React, { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Mail, Phone, Shield, User2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetAccountProfileQuery,
  useUpdateAccountProfileMutation,
} from "@/redux/api/account/profileApi";
import AccountProfileUpsertModal from "./modal";
import LoadingSpinner from "@/components/ui/loadingSpinner";

/* ---------- helpers ---------- */
function resolveAvatarUrl(avatar?: string | null) {
  if (!avatar) return "";
  if (/^https?:\/\//i.test(avatar)) return avatar;

  const origin =
    (import.meta as any).env?.VITE_API_ORIGIN ||
    (import.meta as any).env?.VITE_BACKEND_URL ||
    "";
  if (!origin) return avatar;

  const path = avatar.startsWith("/") ? avatar : `/${avatar}`;
  return `${origin}${path}`;
}

function initials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "U";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase();
}

function toRoleVi(role?: string | null) {
  const r = (role ?? "").toUpperCase();
  if (r.includes("ADMIN")) return "Quản trị";
  if (r.includes("ENTERPRISE")) return "Doanh nghiệp";
  if (r.includes("COLLECTOR")) return "Thu gom";
  if (r.includes("CITIZEN")) return "Người dân";
  return role ?? "—";
}

function toStatusVi(status?: string | null) {
  const s = (status ?? "").toUpperCase();
  if (s.includes("ACTIVE")) return "Đang hoạt động";
  if (s.includes("INACTIVE")) return "Không hoạt động";
  if (s.includes("BLOCK")) return "Bị khóa";
  if (s.includes("PENDING")) return "Chờ duyệt";
  return status ?? "—";
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </div>
        <div className="mt-0.5 text-sm font-semibold text-slate-800 break-all">
          {value}
        </div>
      </div>
    </div>
  );
}

export default function AccountProfilePage() {
  const navigate = useNavigate();
  const q = useGetAccountProfileQuery();
  const [updateProfile, u] = useUpdateAccountProfileMutation();

  // ✅ “khớp API” kiểu { success, data: {...} } hoặc trả thẳng {...}
  const profile: any = (q.data as any)?.data ?? q.data;

  const avatarUrl = useMemo(
    () => resolveAvatarUrl(profile?.avatar ?? null),
    [profile?.avatar],
  );

  const [open, setOpen] = useState(false);

  const roleVi = useMemo(
    () => toRoleVi(profile?.role ?? null),
    [profile?.role],
  );
  const statusVi = useMemo(
    () => toStatusVi(profile?.status ?? null),
    [profile?.status],
  );

  // toast theo mutation state
  useEffect(() => {
    if (u.isSuccess && !u.isLoading) {
      toast.success("Cập nhật hồ sơ thành công!");
    }
    if (u.isError && !u.isLoading) {
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    }
  }, [u.isSuccess, u.isError, u.isLoading]);

  const onSubmit = async (values: {
    fullName: string;
    phone: string;
    avatarFile?: File | null;
  }) => {
    await updateProfile(values).unwrap();
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-emerald-700 hover:border-emerald-300 hover:shadow-sm transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800">
              Hồ sơ cá nhân
            </div>
            <div className="text-xs text-slate-500">
              Thông tin gắn với tài khoản
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/*  LoadingSpinner */}
        {q.isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex items-center justify-center gap-3 text-slate-700">
              <LoadingSpinner color="blue" size="6" inline />
              <span className="text-sm font-semibold">Đang tải hồ sơ...</span>
            </div>
          </div>
        ) : q.isError ? (
          <div className="rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
            <div className="text-rose-700 font-semibold">
              Không tải được hồ sơ.
            </div>
            <div className="text-sm text-slate-500 mt-1">
              Vui lòng thử lại sau.
            </div>
          </div>
        ) : profile ? (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Top section */}
            <div className="px-6 py-8 md:px-10 md:py-10 bg-white">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-28 w-28 overflow-hidden rounded-full bg-emerald-50 ring-2 ring-emerald-200 shadow-sm">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-emerald-700">
                        {initials(profile?.fullName)}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setOpen(true)}
                    className="absolute -bottom-0.5 -right-0.5 grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-white shadow-lg  hover:bg-emerald-700 active:scale-[0.98] transition"
                    aria-label="edit"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                </div>

                {/* Name */}
                <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                  {profile?.fullName ?? "—"}
                </h1>

                {/* ✅ badges VI */}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  {profile?.role ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      {roleVi}
                    </span>
                  ) : null}

                  {profile?.status ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-1 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {statusVi}
                    </span>
                  ) : null}
                </div>

                {/* CTA */}
                <button
                  onClick={() => setOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99] transition disabled:opacity-60"
                  disabled={u.isLoading}
                >
                  {u.isLoading ? (
                    <>
                      <LoadingSpinner color="blue" size="5" inline />
                      Đang lưu...
                    </>
                  ) : (
                    "Cập nhật hồ sơ"
                  )}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* Bottom section (info in same card) */}
            <div className="px-6 py-6 md:px-10 md:py-8 bg-slate-50/40">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={profile?.email ?? "—"}
                />
                <InfoRow
                  icon={User2}
                  label="Họ và tên"
                  value={profile?.fullName ?? "—"}
                />
                <InfoRow
                  icon={Phone}
                  label="Số điện thoại"
                  value={profile?.phone ?? "—"}
                />
                <InfoRow
                  icon={Shield}
                  label="Vai trò / trạng thái"
                  value={`${roleVi} • ${statusVi}`}
                />
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Modal */}
      <AccountProfileUpsertModal
        open={open}
        initial={{
          ...profile,
          // nếu profile.role/profile.status đang là raw BE thì vẫn ok,
          // modal sẽ hiển thị pill VI phần "Thông tin hệ thống".
        }}
        submitting={u.isLoading}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
