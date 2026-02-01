import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Building2,
  MapPinned,
  X,
  Phone,
  MapPin,
  Trash2,
  Check,
  ChevronDown,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import CenterPinMap from "./centerPinMap";
import { reverseGeocodeOSM } from "@/utils/osm";
import {
  getAllProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
  getProvinceName,
  getDistrictName,
  getWardName,
  type Province,
  type District,
  type Ward,
} from "@/utils/vnAdmin";

import type {
  EnterpriseProfile,
  EnterpriseWasteTypeCode,
  UpdateEnterpriseProfileBody,
} from "@/redux/api/enterprise/profile/types";

/* =================== types =================== */
type Props = {
  open: boolean;
  initial?: EnterpriseProfile | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (body: UpdateEnterpriseProfileBody) => Promise<void> | void;
};

type FieldErrors = {
  name?: string;
  phone?: string;
  capacityKg?: string;
  address?: string;
  serviceAreas?: string;
  wasteTypes?: string;
};

type ServiceArea = {
  provinceCode: string;
  districtCode: string;
  wardCode?: string | null;
};

type Option = { value: string; label: string; subLabel?: string };

/* =================== hooks =================== */
function useLockBodyScroll(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);
}

function useDebounced<T>(value: T, delay = 600) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return v;
}

/* =================== helpers =================== */
function toStatusVi(status?: string | null) {
  const s = (status ?? "").toUpperCase();
  if (s.includes("ACTIVE")) return "Đang hoạt động";
  if (s.includes("INACTIVE")) return "Không hoạt động";
  if (s.includes("BLOCK")) return "Bị khóa";
  if (s.includes("PENDING")) return "Chờ duyệt";
  return status ?? "—";
}

function getStatusColor(status?: string | null) {
  const s = (status ?? "").toUpperCase();
  if (s.includes("ACTIVE"))
    return "bg-emerald-100 text-emerald-700 ring-emerald-200";
  if (s.includes("INACTIVE"))
    return "bg-slate-100 text-slate-600 ring-slate-200";
  if (s.includes("BLOCK")) return "bg-rose-100 text-rose-700 ring-rose-200";
  if (s.includes("PENDING"))
    return "bg-amber-100 text-amber-700 ring-amber-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function toWasteTypeVi(w: EnterpriseWasteTypeCode) {
  switch (w) {
    case "ORGANIC":
      return "Hữu cơ";
    case "RECYCLABLE":
      return "Tái chế";
    case "INORGANIC":
      return "Vô cơ";
    case "HAZARDOUS":
      return "Nguy hại";
    default:
      return "Khác";
  }
}

function getWasteTypeIcon(w: EnterpriseWasteTypeCode) {
  switch (w) {
    case "ORGANIC":
      return "🌱";
    case "RECYCLABLE":
      return "♻️";
    case "INORGANIC":
      return "🗑️";
    case "HAZARDOUS":
      return "☢️";
    default:
      return "📦";
  }
}

/* =================== styles =================== */
const inputClass =
  "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-800 " +
  "placeholder:text-slate-400 outline-none transition-all duration-200 " +
  "hover:border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 " +
  "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";

/* =================== UI blocks =================== */
function FormField({
  label,
  required,
  children,
  error,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      {children}

      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs font-medium text-rose-600"
        >
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}

/* =================== Searchable Select =================== */
const SearchSelect = memo(function SearchSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selectedLabel = useMemo(
    () => options.find((x) => x.value === value)?.label ?? "",
    [options, value],
  );

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return options;
    return options.filter((x) => x.label.toLowerCase().includes(t));
  }, [options, q]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as any)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((s) => !s)}
        className={[
          "w-full h-12 rounded-xl border bg-white px-4 text-left",
          "transition-all duration-200 flex items-center justify-between gap-3",
          open ? "border-blue-500 ring-1 ring-blue-100" : "border-slate-200",
          "hover:border-blue-300 focus:outline-none",
          disabled ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <span className={selectedLabel ? "text-slate-800" : "text-slate-400"}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={[
            "h-4 w-4 text-slate-400 transition",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16 }}
            className="absolute z-[50] mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
          >
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none
                             hover:border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                  placeholder="Nhập để tìm..."
                />
              </div>
            </div>

            <div className="max-h-[160px] overflow-auto custom-scrollbar p-2">
              {filtered.length ? (
                filtered.map((opt) => {
                  const active = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={[
                        "w-full rounded-xl px-3 py-2 text-left transition flex items-start gap-3",
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-slate-50 text-slate-800",
                      ].join(" ")}
                    >
                      <span className="mt-0.5 h-2 w-2 rounded-full bg-current opacity-40" />
                      <span className="min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {opt.label}
                        </div>
                        {opt.subLabel ? (
                          <div className="text-xs text-slate-500 truncate">
                            {opt.subLabel}
                          </div>
                        ) : null}
                      </span>
                      {active ? (
                        <Check className="ml-auto h-4 w-4 text-blue-600" />
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <div className="py-10 text-center text-sm text-slate-500">
                  Không có kết quả phù hợp
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* =================== constants =================== */
const WASTE_OPTIONS: EnterpriseWasteTypeCode[] = [
  "ORGANIC",
  "RECYCLABLE",
  "INORGANIC",
  "HAZARDOUS",
  "OTHER",
];

/* =================== Map block (memo) =================== */
const MapBlock = memo(function MapBlock({
  picked,
  onChange,
  pinColor,
}: {
  picked: { lat: number; lng: number };
  onChange: (v: { lat: number; lng: number }) => void;
  pinColor: "green" | "red";
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <CenterPinMap
        value={picked}
        onChange={onChange}
        height={520}
        pinColor={pinColor}
      />
    </div>
  );
});

/* =================== main =================== */
export default function EnterpriseProfileUpsertModal({
  open,
  initial,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  useLockBodyScroll(open);
  const reduceMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, submitting]);

  const defaultCenter = useMemo(
    () => ({ lat: 10.762622, lng: 106.660172 }),
    [],
  );

  // form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string>("");
  const [capacityKg, setCapacityKg] = useState<string>("");
  const [address, setAddress] = useState("");

  // map picked
  const [picked, setPicked] = useState(defaultCenter);
  const debouncedPicked = useDebounced(picked, 850);

  // admin data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // editor select (for editing existing area)
  const [provinceCode, setProvinceCode] = useState<string>("");
  const [districtCode, setDistrictCode] = useState<string>("");
  const [wardCode, setWardCode] = useState<string>("");

  // service areas (existing)
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [serviceAreaLabels, setServiceAreaLabels] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number>(0);

  // waste types
  const [wasteTypes, setWasteTypes] = useState<EnterpriseWasteTypeCode[]>([]);

  const [errors, setErrors] = useState<FieldErrors>({});

  // pin color
  const pinColor = useMemo<"green" | "red">(() => {
    const hasCoords = initial?.latitude != null && initial?.longitude != null;
    if (!hasCoords) return "red";
    const s = (initial?.status ?? "").toUpperCase();
    return s.includes("ACTIVE") ? "green" : "red";
  }, [initial?.latitude, initial?.longitude, initial?.status]);

  // init form
  useEffect(() => {
    if (!open) return;

    setName(initial?.name ?? "");
    setPhone(initial?.phone ?? "");
    setCapacityKg(String(initial?.capacityKg ?? ""));
    setAddress(initial?.address ?? "");

    const lat = initial?.latitude ?? null;
    const lng = initial?.longitude ?? null;
    setPicked(lat != null && lng != null ? { lat, lng } : defaultCenter);

    const sa = (initial?.serviceAreas ?? []).map((x) => ({
      provinceCode: x.provinceCode,
      districtCode: x.districtCode,
      wardCode: x.wardCode ?? null,
    }));
    setServiceAreas(sa);

    const wt = initial?.wasteTypes ?? [];
    setWasteTypes(wt.map((x) => x.wasteType));

    // mặc định edit khu vực đầu tiên (nếu có)
    if (sa.length > 0) {
      setEditingIndex(0);
      setProvinceCode(sa[0].provinceCode);
      setDistrictCode(sa[0].districtCode);
      setWardCode(sa[0].wardCode ?? "");
    } else {
      setEditingIndex(0);
      setProvinceCode("");
      setDistrictCode("");
      setWardCode("");
    }

    setDistricts([]);
    setWards([]);
    setErrors({});
  }, [open, initial, defaultCenter]);

  // fetch provinces
  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        const ps = await getAllProvinces();
        if (alive) setProvinces(ps);
      } catch {
        if (alive) setProvinces([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open]);

  // load districts
  useEffect(() => {
    if (!open) return;
    if (!provinceCode) {
      setDistricts([]);
      setDistrictCode("");
      setWards([]);
      setWardCode("");
      return;
    }
    let alive = true;
    (async () => {
      try {
        const ds = await getDistrictsByProvince(provinceCode);
        if (alive) setDistricts(ds);
      } catch {
        if (alive) setDistricts([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, provinceCode]);

  // load wards
  useEffect(() => {
    if (!open) return;
    if (!districtCode) {
      setWards([]);
      setWardCode("");
      return;
    }
    let alive = true;
    (async () => {
      try {
        const ws = await getWardsByDistrict(districtCode);
        if (alive) setWards(ws);
      } catch {
        if (alive) setWards([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, districtCode]);

  // labels for service areas
  useEffect(() => {
    if (!open) return;
    let alive = true;

    (async () => {
      const next = await Promise.all(
        serviceAreas.map(async (sa) => {
          const [p, d, w] = await Promise.all([
            getProvinceName(sa.provinceCode),
            getDistrictName(sa.districtCode),
            sa.wardCode ? getWardName(sa.wardCode) : Promise.resolve(""),
          ]);
          return [w, d, p].filter(Boolean).join(", ") || "—";
        }),
      );
      if (alive) setServiceAreaLabels(next);
    })();

    return () => {
      alive = false;
    };
  }, [open, serviceAreas]);

  // reverse geocode
  const [addrHint, setAddrHint] = useState<string>("");
  const [loadingHint, setLoadingHint] = useState(false);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    const reqId = ++reqIdRef.current;
    setLoadingHint(true);

    (async () => {
      try {
        const text = await reverseGeocodeOSM(
          debouncedPicked.lat,
          debouncedPicked.lng,
        );
        if (reqId !== reqIdRef.current) return;
        setAddrHint(text || "");
      } catch {
        if (reqId !== reqIdRef.current) return;
        setAddrHint("");
      } finally {
        if (reqId !== reqIdRef.current) return;
        setLoadingHint(false);
      }
    })();
  }, [open, debouncedPicked.lat, debouncedPicked.lng]);

  const provinceOptions = useMemo<Option[]>(
    () => provinces.map((p) => ({ value: String(p.code), label: p.name })),
    [provinces],
  );
  const districtOptions = useMemo<Option[]>(
    () => districts.map((d) => ({ value: String(d.code), label: d.name })),
    [districts],
  );
  const wardOptions = useMemo<Option[]>(
    () => wards.map((w) => ({ value: String(w.code), label: w.name })),
    [wards],
  );

  const startEditArea = useCallback(
    (idx: number) => {
      const sa = serviceAreas[idx];
      if (!sa) return;
      setEditingIndex(idx);
      setProvinceCode(sa.provinceCode);
      setDistrictCode(sa.districtCode);
      setWardCode(sa.wardCode ?? "");
      setErrors((p) => ({ ...p, serviceAreas: undefined }));
    },
    [serviceAreas],
  );

  const applyEditArea = useCallback(() => {
    if (!provinceCode || !districtCode) {
      setErrors((p) => ({
        ...p,
        serviceAreas: "Vui lòng chọn tối thiểu Tỉnh/Thành và Quận/Huyện",
      }));
      return;
    }
    setErrors((p) => ({ ...p, serviceAreas: undefined }));

    const next: ServiceArea = {
      provinceCode,
      districtCode,
      wardCode: wardCode || null,
    };

    // check trùng (trừ chính nó)
    const key = `${next.provinceCode}-${next.districtCode}-${next.wardCode ?? ""}`;
    const exists = serviceAreas.some((x, i) => {
      if (i === editingIndex) return false;
      return `${x.provinceCode}-${x.districtCode}-${x.wardCode ?? ""}` === key;
    });
    if (exists) {
      toast.info("Khu vực này đã tồn tại");
      return;
    }

    setServiceAreas((arr) => {
      if (!arr.length) return [next];
      return arr.map((x, i) => (i === editingIndex ? next : x));
    });

    toast.success("Đã cập nhật khu vực phục vụ", { autoClose: 900 });
  }, [provinceCode, districtCode, wardCode, serviceAreas, editingIndex]);

  const removeServiceArea = useCallback(
    (idx: number) => {
      if (serviceAreas.length <= 1) {
        toast.info("Cần ít nhất 1 khu vực phục vụ");
        return;
      }
      setServiceAreas((arr) => arr.filter((_, i) => i !== idx));
      const nextIdx = Math.max(
        0,
        Math.min(editingIndex, serviceAreas.length - 2),
      );
      // update editor theo item còn lại
      const next = serviceAreas.filter((_, i) => i !== idx)[nextIdx];
      if (next) {
        setEditingIndex(nextIdx);
        setProvinceCode(next.provinceCode);
        setDistrictCode(next.districtCode);
        setWardCode(next.wardCode ?? "");
      }
    },
    [serviceAreas, editingIndex],
  );

  const toggleWaste = useCallback((w: EnterpriseWasteTypeCode) => {
    setWasteTypes((arr) =>
      arr.includes(w) ? arr.filter((x) => x !== w) : [...arr, w],
    );
  }, []);

  const validate = useCallback(() => {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Vui lòng nhập tên doanh nghiệp";

    if (phone.trim() && !/^0\d{9}$/.test(phone.trim()))
      next.phone = "Số điện thoại sai định dạng (0xxxxxxxxx)";

    const cap = Number(capacityKg);
    if (!capacityKg.trim()) next.capacityKg = "Vui lòng nhập công suất";
    else if (Number.isNaN(cap) || cap <= 0)
      next.capacityKg = "Công suất phải lớn hơn 0";

    if (!address.trim()) next.address = "Vui lòng nhập địa chỉ";

    if (serviceAreas.length === 0)
      next.serviceAreas = "Vui lòng có ít nhất 1 khu vực phục vụ";

    if (wasteTypes.length === 0)
      next.wasteTypes = "Vui lòng chọn ít nhất 1 loại rác";

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [
    name,
    phone,
    capacityKg,
    address,
    serviceAreas.length,
    wasteTypes.length,
  ]);

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim() || null,
        capacityKg: Number(capacityKg),
        latitude: picked.lat,
        longitude: picked.lng,
        serviceAreas,
        wasteTypes: wasteTypes.map((w) => ({ wasteType: w })),
      });

      toast.success("Cập nhật hồ sơ doanh nghiệp thành công!", {
        autoClose: 1400,
      });
      onClose();
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Cập nhật thất bại");
    }
  };

  const statusVi = toStatusVi(initial?.status);
  const statusColor = getStatusColor(initial?.status);

  const overlayAnim = reduceMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };

  const panelAnim = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 18 },
        transition: { duration: 0.22, ease: "easeOut" as any },
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[1600] bg-black/55"
          {...overlayAnim}
          onClick={(e) => {
            if (e.target === overlayRef.current && !submitting) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="
              fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              w-[calc(100vw-2rem)] max-w-[980px]
              max-h-[calc(100vh-4rem)]
              flex flex-col overflow-hidden
              rounded-3xl shadow-2xl transform-gpu
            "
            {...panelAnim}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 px-8 py-6">
              <button
                onClick={onClose}
                disabled={submitting}
                className="
                  absolute right-5 top-5 grid h-11 w-11 place-items-center
                  rounded-full bg-white/10 hover:bg-white/20
                  text-white transition active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ring-1 ring-white/20
                "
                aria-label="Đóng"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-start gap-4 pr-16">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center ring-1 ring-white/20">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold text-white">
                    Cập nhật hồ sơ doanh nghiệp
                  </h2>
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    <p className="text-sm text-emerald-50 truncate">
                      {initial?.name || "Thông tin doanh nghiệp"}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ${statusColor}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {statusVi}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-slate-100">
              <div className="p-8 space-y-6">
                {/* ROW 1 */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Basic Info */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      Thông tin cơ bản
                    </h3>

                    <div className="space-y-5">
                      <FormField
                        label="Tên doanh nghiệp"
                        required
                        error={errors.name}
                      >
                        <input
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name)
                              setErrors((p) => ({ ...p, name: undefined }));
                          }}
                          disabled={submitting}
                          className={inputClass}
                          placeholder="Ví dụ: Công ty Môi Trường Xanh"
                        />
                      </FormField>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          label="Số điện thoại"
                          error={errors.phone}
                          hint="Tuỳ chọn"
                        >
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                              value={phone}
                              onChange={(e) => {
                                setPhone(e.target.value);
                                if (errors.phone)
                                  setErrors((p) => ({
                                    ...p,
                                    phone: undefined,
                                  }));
                              }}
                              disabled={submitting}
                              className={`${inputClass} pl-12`}
                              placeholder="0xxxxxxxxx"
                            />
                          </div>
                        </FormField>

                        <FormField
                          label="Công suất (kg)"
                          required
                          error={errors.capacityKg}
                        >
                          <input
                            value={capacityKg}
                            onChange={(e) => {
                              setCapacityKg(e.target.value);
                              if (errors.capacityKg)
                                setErrors((p) => ({
                                  ...p,
                                  capacityKg: undefined,
                                }));
                            }}
                            disabled={submitting}
                            className={inputClass}
                            placeholder="1000"
                            inputMode="decimal"
                          />
                        </FormField>
                      </div>

                      <FormField
                        label="Địa chỉ"
                        required
                        error={errors.address}
                      >
                        <div className="relative">
                          <MapPin className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                          <textarea
                            value={address}
                            onChange={(e) => {
                              setAddress(e.target.value);
                              if (errors.address)
                                setErrors((p) => ({
                                  ...p,
                                  address: undefined,
                                }));
                            }}
                            disabled={submitting}
                            className="
                              w-full min-h-[110px] rounded-xl border border-slate-200 bg-white
                              pl-12 pr-4 py-3 text-[15px] text-slate-800 placeholder:text-slate-400
                              outline-none transition-all duration-200
                              hover:border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100
                              disabled:bg-slate-50 disabled:text-slate-500 resize-none
                            "
                            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
                          />
                        </div>

                        {addrHint && (
                          <div className="mt-3 rounded-xl bg-blue-50 border border-blue-200 p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-blue-900 mb-1">
                                  Gợi ý từ bản đồ
                                </div>
                                <div className="text-sm text-blue-700 mb-3">
                                  {loadingHint ? (
                                    <span className="flex items-center gap-2">
                                      <LoadingSpinner size="4" inline />
                                      Đang tải...
                                    </span>
                                  ) : (
                                    addrHint
                                  )}
                                </div>

                                <button
                                  type="button"
                                  disabled={submitting || loadingHint}
                                  onClick={() => setAddress(addrHint)}
                                  className="
                                    inline-flex items-center gap-2 rounded-lg
                                    bg-white border border-blue-200 px-3 py-1.5
                                    text-xs font-semibold text-blue-700
                                    hover:bg-blue-50 hover:border-blue-300
                                    active:scale-[0.98] transition
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                  "
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Sử dụng địa chỉ này
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </FormField>
                    </div>
                  </section>

                  {/* Map */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-1">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-rose-600" />
                          </div>
                          Vị trí trên bản đồ
                        </h3>
                        <p className="text-xs text-slate-500 ml-10">
                          Kéo bản đồ để chọn vị trí chính xác
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                        <MapPin className="h-3.5 w-3.5" />
                        {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
                      </div>
                    </div>

                    <MapBlock
                      picked={picked}
                      onChange={setPicked}
                      pinColor={pinColor}
                    />
                  </section>
                </div>

                {/* ROW 2: Service LEFT - Waste RIGHT */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Service Areas - LEFT */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <MapPinned className="w-4 h-4 text-blue-600" />
                      </div>
                      Khu vực phục vụ
                    </h3>

                    {/* existing areas */}
                    <div className="mb-4">
                      {serviceAreas.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {serviceAreas.map((_, i) => {
                            const active = i === editingIndex;
                            return (
                              <button
                                key={i}
                                type="button"
                                disabled={submitting}
                                onClick={() => startEditArea(i)}
                                className={[
                                  "px-3 py-2 rounded-xl text-xs font-semibold ring-1 transition",
                                  active
                                    ? "bg-blue-50 text-blue-700 ring-blue-200"
                                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                                  "max-w-full",
                                ].join(" ")}
                                title={serviceAreaLabels[i] || "—"}
                              >
                                <span className="truncate block max-w-[320px]">
                                  {serviceAreaLabels[i] || `Khu vực #${i + 1}`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          Chưa có khu vực phục vụ.
                        </div>
                      )}
                    </div>

                    {/* editor (each select 1 line) */}
                    <div className="space-y-3">
                      <SearchSelect
                        value={provinceCode}
                        onChange={(v) => {
                          setProvinceCode(v);
                          setDistrictCode("");
                          setWardCode("");
                          setWards([]);
                          if (errors.serviceAreas)
                            setErrors((p) => ({
                              ...p,
                              serviceAreas: undefined,
                            }));
                        }}
                        options={provinceOptions}
                        placeholder="Chọn Tỉnh/Thành"
                        disabled={submitting}
                      />

                      <SearchSelect
                        value={districtCode}
                        onChange={(v) => {
                          setDistrictCode(v);
                          setWardCode("");
                          if (errors.serviceAreas)
                            setErrors((p) => ({
                              ...p,
                              serviceAreas: undefined,
                            }));
                        }}
                        options={districtOptions}
                        placeholder={
                          provinceCode
                            ? "Chọn Quận/Huyện"
                            : "Chọn Tỉnh/Thành trước"
                        }
                        disabled={submitting || !provinceCode}
                      />

                      <SearchSelect
                        value={wardCode}
                        onChange={(v) => setWardCode(v)}
                        options={wardOptions}
                        placeholder={
                          districtCode
                            ? "Chọn Phường/Xã"
                            : "Chọn Quận/Huyện trước"
                        }
                        disabled={submitting || !districtCode}
                      />

                      {errors.serviceAreas && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.serviceAreas}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={applyEditArea}
                          disabled={
                            submitting || !provinceCode || !districtCode
                          }
                          className="
                            flex-1 h-11 rounded-xl font-semibold text-white
                            bg-blue-600 hover:brightness-95 active:scale-[0.99] transition
                            disabled:opacity-50 disabled:cursor-not-allowed
                            inline-flex items-center justify-center gap-2
                          "
                        >
                          <Check className="w-4 h-4" />
                          Cập nhật khu vực
                        </button>

                        <button
                          type="button"
                          disabled={submitting || serviceAreas.length <= 1}
                          onClick={() => removeServiceArea(editingIndex)}
                          className="
                            w-11 h-11 rounded-xl border border-slate-200 bg-white
                            text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition flex items-center justify-center
                          "
                          aria-label="Xoá khu vực"
                          title={
                            serviceAreas.length <= 1
                              ? "Cần ít nhất 1 khu vực"
                              : "Xoá khu vực"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Waste Types - RIGHT */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <span className="text-base">♻️</span>
                      </div>
                      Loại rác nhận
                    </h3>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {WASTE_OPTIONS.map((w) => {
                          const active = wasteTypes.includes(w);
                          return (
                            <button
                              key={w}
                              type="button"
                              disabled={submitting}
                              onClick={() => {
                                toggleWaste(w);
                                if (errors.wasteTypes)
                                  setErrors((p) => ({
                                    ...p,
                                    wasteTypes: undefined,
                                  }));
                              }}
                              className={`
                                relative h-20 rounded-xl border-2 transition-all duration-150
                                flex flex-col items-center justify-center gap-1.5
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${
                                  active
                                    ? "bg-emerald-50 border-emerald-500 shadow-sm"
                                    : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                }
                              `}
                            >
                              {active && (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <span className="text-2xl">
                                {getWasteTypeIcon(w)}
                              </span>
                              <span
                                className={`text-xs font-semibold ${
                                  active ? "text-emerald-700" : "text-slate-700"
                                }`}
                              >
                                {toWasteTypeVi(w)}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {errors.wasteTypes && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.wasteTypes}
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-white px-8 py-5 flex items-center justify-between gap-4">
              <div />
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  disabled={submitting}
                  className="
                    px-6 h-11 rounded-xl font-semibold
                    text-slate-700 bg-white border border-slate-200
                    hover:bg-slate-50 hover:border-slate-300
                    active:scale-[0.99] transition
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  type="button"
                >
                  Huỷ
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="
                    px-4 h-11 rounded-xl font-semibold text-white
                    bg-emerald-600 hover:brightness-90
                    active:scale-[0.99] transition
                    disabled:opacity-50 disabled:cursor-not-allowed
                    inline-flex items-center gap-2
                    shadow-sm hover:shadow
                  "
                  type="button"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner color="white" size="5" inline />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
