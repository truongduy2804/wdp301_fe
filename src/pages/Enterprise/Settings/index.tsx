import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Factory,
  ShieldCheck,
  Pencil,
  MapIcon,
  Layers,
} from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import CenterPinMap from "./centerPinMap";

import {
  useGetEnterpriseProfileQuery,
  useUpdateEnterpriseProfileMutation,
} from "@/redux/api/enterprise/profile";
import type { EnterpriseProfile } from "@/redux/api/enterprise/profile/types";

import {
  getAllProvinces,
  getProvinceName,
  getDistrictName,
  getWardName,
  getWardsByDistrict,
} from "@/utils/vnAdmin";

import EnterpriseProfileUpsertModal from "./Modal/modal";

/* ─── helpers ─────────────────────────────────────────────── */
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
  if (!name) return "DN";
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "D";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "N";
  return (a + b).toUpperCase();
}

function toStatusVi(status?: string | null) {
  const s = (status ?? "").toUpperCase();
  if (s.includes("ACTIVE")) return "Đang hoạt động";
  if (s.includes("INACTIVE")) return "Không hoạt động";
  if (s.includes("BLOCK")) return "Bị khóa";
  if (s.includes("PENDING")) return "Chờ duyệt";
  return status ?? "—";
}

function toWasteTypeVi(code?: string | null) {
  const c = (code ?? "").toUpperCase();
  if (c === "ORGANIC") return "Hữu cơ";
  if (c === "RECYCLABLE") return "Tái chế";
  if (c === "INORGANIC") return "Vô cơ";
  if (c === "HAZARDOUS") return "Nguy hại";
  if (c === "OTHER") return "Khác";
  return code ?? "—";
}

function formatKg(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(n);
}

type AreaLabel = {
  raw: {
    provinceCode: string;
    districtCode?: string | null;
    wardCode?: string | null;
  };
  label: string;
};

async function safeWardName(wardCode: string, districtCode?: string | null) {
  try {
    const name = await getWardName(wardCode);
    if (name) return name;
  } catch {
    // ignore
  }
  if (districtCode) {
    try {
      const ws = await getWardsByDistrict(String(districtCode));
      const found = ws.find((x: any) => String(x.code) === String(wardCode));
      if (found?.name) return found.name;
    } catch {
      // ignore
    }
  }
  return "";
}

async function buildAreaLabel(sa: any): Promise<string> {
  const provinceCode = sa?.provinceCode == null ? "" : String(sa.provinceCode);
  const districtCode = sa?.districtCode == null ? "" : String(sa.districtCode);
  const wardCode = sa?.wardCode == null ? "" : String(sa.wardCode);

  const [p, d, w] = await Promise.all([
    provinceCode ? getProvinceName(provinceCode) : Promise.resolve(""),
    districtCode ? getDistrictName(districtCode) : Promise.resolve(""),
    wardCode ? safeWardName(wardCode, districtCode) : Promise.resolve(""),
  ]);

  // Nếu chỉ có province -> vẫn hiện province
  return [w, d, p].filter(Boolean).join(", ") || "—";
}

/* ─── micro ──────────────────────────────────────────────── */
function SectionHead({
  icon: Icon,
  title,
  sub,
  badge,
}: {
  icon: React.FC<{ className?: string }>;
  title: string;
  sub?: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
          {sub ? <p className="text-[12px] text-slate-500">{sub}</p> : null}
        </div>
      </div>

      {badge ? (
        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function MiniInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </div>
        <div className="mt-0.5 truncate text-[13px] font-semibold text-slate-800">
          {value}
        </div>
      </div>
    </div>
  );
}

/* ─── main ──────────────────────────────────────────────── */
export default function EnterpriseProfilePage() {
  const q = useGetEnterpriseProfileQuery();
  const [update, u] = useUpdateEnterpriseProfileMutation();
  const profile: EnterpriseProfile | null = q.data ?? null;

  useEffect(() => {
    getAllProvinces().catch(() => {});
  }, []);

  const avatarUrl = useMemo(
    () => resolveAvatarUrl(profile?.avatar ?? null),
    [profile?.avatar],
  );

  const defaultCenter = useMemo(
    () => ({ lat: 10.762622, lng: 106.660172 }),
    [],
  );
  const hasLocation = profile?.latitude != null && profile?.longitude != null;

  const [viewCenter, setViewCenter] = useState(defaultCenter);
  const [locationDirty, setLocationDirty] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setLocationDirty(false);

    if (profile.latitude != null && profile.longitude != null) {
      setViewCenter({ lat: profile.latitude, lng: profile.longitude });
    } else {
      setViewCenter(defaultCenter);
    }
  }, [profile, defaultCenter]);

  const [areaLabels, setAreaLabels] = useState<AreaLabel[]>([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      const sa = profile?.serviceAreas ?? [];
      const next = await Promise.all(
        sa.map(async (x) => ({
          raw: {
            provinceCode: String(x.provinceCode),
            districtCode:
              x.districtCode == null ? null : String(x.districtCode),
            wardCode: x.wardCode == null ? null : String(x.wardCode),
          },
          label: await buildAreaLabel(x),
        })),
      );
      if (alive) setAreaLabels(next);
    })();
    return () => {
      alive = false;
    };
  }, [profile?.serviceAreas]);

  const [open, setOpen] = useState(false);

  const onSubmit = async (body: any) => {
    await update(body).unwrap();
    setOpen(false);
  };

  if (q.isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-100">
        <LoadingSpinner color="blue" size="10" />
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="mt-3 text-[15px] font-semibold text-slate-800">
            Lỗi tải dữ liệu
          </div>
          <div className="mt-1 text-[13px] text-slate-500">
            Vui lòng thử lại sau.
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const wasteBadges = (profile.wasteTypes ?? []).slice(0, 4);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-6">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 right-28 h-56 w-56 rounded-full bg-white/5" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-2xl border-[3px] border-white/30 bg-white/10 shadow-lg">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/10">
                        <span className="text-3xl font-semibold text-white">
                          {initials(profile.name)}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setOpen(true)}
                    className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-full bg-white text-emerald-700 shadow-md hover:shadow-lg hover:brightness-75 active:scale-[0.98] transition"
                    aria-label="Cập nhật hồ sơ"
                    type="button"
                  >
                    <Pencil className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-semibold text-white truncate">
                    {profile.name}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white ring-1 ring-white/20">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
                      {toStatusVi(profile.status)}
                    </span>

                    {wasteBadges.map((w, i) => (
                      <span
                        key={`${w.wasteType}-${i}`}
                        className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/90 ring-1 ring-white/15"
                      >
                        {toWasteTypeVi(w.wasteType)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex md:justify-end">
                <button
                  onClick={() => setOpen(true)}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white hover:brightness-90 px-5 py-2.5 text-[13px] font-semibold text-emerald-700 shadow-md hover:shadow-lg active:scale-[0.98] transition"
                  type="button"
                >
                  <Building2 className="h-4 w-4" />
                  Cập nhật hồ sơ
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 bg-white">
            <div className="grid gap-3 md:grid-cols-3">
              <MiniInfo
                icon={Mail}
                label="Email"
                value={profile.email ?? "—"}
              />
              <MiniInfo
                icon={Phone}
                label="Điện thoại"
                value={profile.phone ?? "—"}
              />
              <MiniInfo
                icon={Factory}
                label="Công suất"
                value={`${formatKg(profile.capacityKg)} kg`}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHead
                icon={MapPin}
                title="Địa chỉ"
                sub="Địa chỉ đăng ký của doanh nghiệp"
              />
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-[14px] font-semibold text-slate-800">
                  {profile.address || "Chưa thiết lập địa chỉ"}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHead
                icon={MapIcon}
                title="Vị trí trên bản đồ"
                sub="Kéo bản đồ để chọn điểm ghim"
                badge={
                  locationDirty
                    ? "Chưa lưu"
                    : hasLocation
                      ? "Đã thiết lập"
                      : "Chưa có vị trí"
                }
              />

              <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-100">
                <CenterPinMap
                  value={viewCenter}
                  onChange={(v) => {
                    setViewCenter(v);
                    setLocationDirty(true);
                  }}
                  height={360}
                  zoom={15}
                />
              </div>

              <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-slate-500">
                  Tọa độ hiện tại:{" "}
                  <span className="font-semibold text-slate-700">
                    {viewCenter.lat.toFixed(6)}, {viewCenter.lng.toFixed(6)}
                  </span>
                </p>
                <span className="text-[11px] text-slate-400">
                  (Nhấn “Cập nhật hồ sơ” để lưu)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHead
                icon={Layers}
                title="Khu vực phục vụ"
                sub="Hiển thị theo tên (tỉnh/quận/phường)"
                badge={
                  areaLabels.length ? `${areaLabels.length} khu vực` : undefined
                }
              />
              <div
                className="
    mt-4
    max-h-[260px] overflow-y-auto
    rounded-2xl border border-slate-200 bg-white/60
    p-2
    custom-scrollbar
  "
              >
                {areaLabels.length ? (
                  <div className="flex flex-wrap items-start gap-2">
                    {areaLabels.map((a, i) => (
                      <span
                        key={`${a.raw.provinceCode}-${a.raw.districtCode ?? ""}-${a.raw.wardCode ?? ""}-${i}`}
                        className="inline-flex items-center rounded-xl bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-100"
                      >
                        <MapPin className="mr-1.5 h-3.5 w-3.5 opacity-70" />
                        {a.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="px-2 py-3 text-[13px] text-slate-500">
                    Chưa thiết lập khu vực phục vụ.
                  </p>
                )}
              </div>

              {u.isError ? (
                <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700">
                  Cập nhật thất bại — vui lòng thử lại.
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHead
                icon={Building2}
                title="Tóm tắt"
                sub="Thông tin cơ bản"
              />
              <div className="mt-4 flex flex-col divide-y divide-slate-100">
                {[
                  { label: "Tên doanh nghiệp", value: profile.name },
                  { label: "Email", value: profile.email ?? "—" },
                  { label: "Điện thoại", value: profile.phone ?? "—" },
                  {
                    label: "Công suất",
                    value: `${formatKg(profile.capacityKg)} kg`,
                  },
                  { label: "Trạng thái", value: toStatusVi(profile.status) },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <span className="text-[12px] text-slate-500">
                      {item.label}
                    </span>
                    <span className="text-[13px] font-semibold text-slate-800 text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EnterpriseProfileUpsertModal
        open={open}
        initial={profile}
        submitting={u.isLoading}
        draftLocation={locationDirty ? viewCenter : null}
        onClose={() => {
          if (u.isLoading) return;
          setOpen(false);
        }}
        onSubmit={onSubmit}
      />
    </div>
  );
}
