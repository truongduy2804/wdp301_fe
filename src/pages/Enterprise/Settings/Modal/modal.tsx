import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Building2,
  Check,
  ChevronDown,
  MapPin,
  MapPinned,
  Search,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import LoadingSpinner from "@/components/ui/loadingSpinner";
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

import MapPickerSection from "./mapPickerSection";
import ServiceAreaSection from "./serviceAreaSection";

/* =================== types =================== */
type Props = {
  open: boolean;
  initial?: EnterpriseProfile | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (body: UpdateEnterpriseProfileBody) => Promise<void> | void;
  draftLocation?: { lat: number; lng: number } | null;
};

type FieldErrors = {
  name?: string;
  capacityKg?: string;
  address?: string;
  serviceAreas?: string;
  wasteTypes?: string;
};

type ServiceAreaPayload = {
  provinceCode: string;
  districtCode: string | null;
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
const uniq = (arr: string[]) => Array.from(new Set(arr.map(String)));

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

async function safeWardName(code: string, districtCode?: string | null) {
  try {
    const name = await getWardName(code);
    if (name) return name;
  } catch {}
  if (districtCode) {
    try {
      const ws = await getWardsByDistrict(String(districtCode));
      const found = (ws as any[]).find((x) => String(x.code) === String(code));
      if (found?.name) return String(found.name);
    } catch {}
  }
  return "";
}

function getDistrictProvinceCode(d: any): string | null {
  const v =
    d?.provinceCode ??
    d?.province_code ??
    d?.provinceCodeId ??
    d?.province_id ??
    d?.parent_code ??
    null;
  return v == null ? null : String(v);
}

function getWardDistrictCode(w: any): string | null {
  const v =
    w?.districtCode ??
    w?.district_code ??
    w?.districtCodeId ??
    w?.district_id ??
    w?.parent_code ??
    null;
  return v == null ? null : String(v);
}

/* =================== styles =================== */
const inputClass =
  "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-800 " +
  "placeholder:text-slate-400 outline-none transition-all duration-200 " +
  "hover:border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 " +
  "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";

/* =================== FormField =================== */
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

/* =================== MultiSearchSelect (giữ nguyên) =================== */
const MultiSearchSelect = memo(function MultiSearchSelect({
  values,
  onToggle,
  options,
  placeholder,
  disabled,
}: {
  values: string[];
  onToggle: (v: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const valuesSet = useMemo(() => new Set(values.map(String)), [values]);

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
        onClick={() => setOpen(true)}
        className={[
          "w-full h-12 rounded-xl border bg-white px-4 text-left",
          "transition-all duration-200 flex items-center justify-between gap-3",
          open ? "border-blue-500 ring-1 ring-blue-100" : "border-slate-200",
          "hover:border-blue-300 focus:outline-none",
          disabled ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <span className="text-slate-400">{placeholder}</span>
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
            className="absolute z-[90] mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
            onMouseDown={(e) => e.stopPropagation()}
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

            <div className="max-h-[160px] overflow-auto custom-scrollbar p-2 space-y-[2px]">
              {filtered.length ? (
                filtered.map((opt) => {
                  const id = String(opt.value);
                  const active = valuesSet.has(id);

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onToggle(id)}
                      className={[
                        "w-full rounded-xl px-3 py-2 text-left transition flex gap-3 items-center",
                        active
                          ? "bg-blue-50 text-blue-800"
                          : "hover:bg-blue-50/60 text-slate-800",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "h-2 w-2 rounded-full shrink-0",
                          active ? "bg-blue-500" : "bg-slate-400",
                        ].join(" ")}
                      />

                      <span className="min-w-0 flex-1">
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
                        <Check className="h-4 w-4 text-blue-600 shrink-0" />
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
  "HAZARDOUS",
];

/* =================== main =================== */
export default function EnterpriseProfileUpsertModal({
  open,
  initial,
  submitting,
  onClose,
  onSubmit,
  draftLocation,
}: Props) {
  useLockBodyScroll(open);
  const reduceMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement | null>(null);

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

  // form
  const [name, setName] = useState("");
  const [capacityKg, setCapacityKg] = useState<string>("");

  // address auto from map/search only
  const [address, setAddress] = useState("");

  // map
  const [picked, setPicked] = useState(defaultCenter);
  const debouncedPicked = useDebounced(picked, 850);

  // admin data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // selections
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedWards, setSelectedWards] = useState<string[]>([]);

  // stable name maps (code -> name)
  const [provinceNameById, setProvinceNameById] = useState<
    Record<string, string>
  >({});
  const [districtNameById, setDistrictNameById] = useState<
    Record<string, string>
  >({});
  const [wardNameById, setWardNameById] = useState<Record<string, string>>({});

  // stable parent maps
  const [districtProvinceById, setDistrictProvinceById] = useState<
    Record<string, string>
  >({});
  const [wardDistrictById, setWardDistrictById] = useState<
    Record<string, string>
  >({});

  // waste
  const [wasteTypes, setWasteTypes] = useState<EnterpriseWasteTypeCode[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  /* ===== load provinces ===== */
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

  /* ===== sync name maps from option lists ===== */
  useEffect(() => {
    if (!provinces.length) return;
    setProvinceNameById((prev) => {
      const next = { ...prev };
      for (const p of provinces as any[]) next[String(p.code)] = String(p.name);
      return next;
    });
  }, [provinces]);

  useEffect(() => {
    if (!districts.length) return;
    setDistrictNameById((prev) => {
      const next = { ...prev };
      for (const d of districts as any[]) next[String(d.code)] = String(d.name);
      return next;
    });

    setDistrictProvinceById((prev) => {
      const next = { ...prev };
      for (const d of districts as any[]) {
        const did = String(d.code);
        const pid = getDistrictProvinceprovinceCode(d);
        if (pid) next[did] = String(pid);
      }
      return next;
    });
  }, [districts]);

  function getDistrictProvinceprovinceCode(d: any): string | null {
    return getDistrictProvinceCode(d);
  }

  useEffect(() => {
    if (!wards.length) return;
    setWardNameById((prev) => {
      const next = { ...prev };
      for (const w of wards as any[]) next[String(w.code)] = String(w.name);
      return next;
    });

    setWardDistrictById((prev) => {
      const next = { ...prev };
      for (const w of wards as any[]) {
        const wid = String(w.code);
        const did = getWardDistrictCode(w);
        if (did) next[wid] = String(did);
      }
      return next;
    });
  }, [wards]);

  /* ===== union fetch with race guard ===== */
  const districtRunRef = useRef(0);
  const wardRunRef = useRef(0);

  const fetchAndMergeDistricts = useCallback(async (provinceIds: string[]) => {
    const runId = ++districtRunRef.current;

    const list = await Promise.all(
      provinceIds.map(async (p) => {
        try {
          return await getDistrictsByProvince(String(p));
        } catch {
          return [] as District[];
        }
      }),
    );

    if (runId !== districtRunRef.current) return;

    const map = new Map<string, District>();
    for (const arr of list)
      for (const d of arr as any[]) map.set(String(d.code), d);

    const merged = Array.from(map.values());
    merged.sort((a: any, b: any) =>
      String(a.name).localeCompare(String(b.name), "vi"),
    );
    setDistricts(merged);
  }, []);

  const fetchAndMergeWards = useCallback(async (districtIds: string[]) => {
    const runId = ++wardRunRef.current;

    const list = await Promise.all(
      districtIds.map(async (d) => {
        try {
          return await getWardsByDistrict(String(d));
        } catch {
          return [] as Ward[];
        }
      }),
    );

    if (runId !== wardRunRef.current) return;

    const map = new Map<string, Ward>();
    for (const arr of list)
      for (const w of arr as any[]) map.set(String(w.code), w);

    const merged = Array.from(map.values());
    merged.sort((a: any, b: any) =>
      String(a.name).localeCompare(String(b.name), "vi"),
    );
    setWards(merged);
  }, []);

  const warmNamesFromInitial = useCallback(async (areas: any[]) => {
    const pIds = uniq(
      areas.map((x) => String(x?.provinceCode ?? "")).filter(Boolean),
    );
    const dIds = uniq(
      areas
        .map((x) => (x?.districtCode == null ? "" : String(x.districtCode)))
        .filter(Boolean),
    );
    const wPairs = uniq(
      areas
        .map((x) => {
          const w = x?.wardCode == null ? "" : String(x.wardCode);
          const d = x?.districtCode == null ? "" : String(x.districtCode);
          return w ? `${w}::${d}` : "";
        })
        .filter(Boolean),
    );

    await Promise.all([
      Promise.all(
        pIds.map(async (id) => {
          const nm = await getProvinceName(id).catch(() => "");
          if (nm)
            setProvinceNameById((m) => ({ ...m, [String(id)]: String(nm) }));
        }),
      ),
      Promise.all(
        dIds.map(async (id) => {
          const nm = await getDistrictName(id).catch(() => "");
          if (nm)
            setDistrictNameById((m) => ({ ...m, [String(id)]: String(nm) }));
        }),
      ),
      Promise.all(
        wPairs.map(async (pair) => {
          const [wId, dId] = pair.split("::");
          const nm = await safeWardName(wId, dId || null);
          if (nm) setWardNameById((m) => ({ ...m, [String(wId)]: String(nm) }));
        }),
      ),
    ]);
  }, []);

  /* ===== INIT on open ===== */
  useEffect(() => {
    if (!open) return;

    setName(initial?.name ?? "");
    setCapacityKg(String(initial?.capacityKg ?? ""));

    setAddress(initial?.address ?? "");

    if (draftLocation?.lat != null && draftLocation?.lng != null) {
      setPicked({ lat: draftLocation.lat, lng: draftLocation.lng });
    } else {
      const lat = initial?.latitude ?? null;
      const lng = initial?.longitude ?? null;
      setPicked(lat != null && lng != null ? { lat, lng } : defaultCenter);
    }

    const sa = (initial?.serviceAreas ?? []) as any[];

    const pIds = uniq(
      sa.map((x) => String(x?.provinceCode ?? "")).filter(Boolean),
    );
    const dIds = uniq(
      sa
        .map((x) => (x?.districtCode == null ? "" : String(x.districtCode)))
        .filter(Boolean),
    );
    const wIds = uniq(
      sa
        .map((x) => (x?.wardCode == null ? "" : String(x.wardCode)))
        .filter(Boolean),
    );

    setSelectedProvinces(pIds);
    setSelectedDistricts(dIds);
    setSelectedWards(wIds);

    setDistrictProvinceById((prev) => {
      const next = { ...prev };
      for (const x of sa) {
        const pid = x?.provinceCode == null ? "" : String(x.provinceCode);
        const did = x?.districtCode == null ? "" : String(x.districtCode);
        if (pid && did) next[did] = pid;
      }
      return next;
    });

    setWardDistrictById((prev) => {
      const next = { ...prev };
      for (const x of sa) {
        const wid = x?.wardCode == null ? "" : String(x.wardCode);
        const did = x?.districtCode == null ? "" : String(x.districtCode);
        if (wid && did) next[wid] = did;
      }
      return next;
    });

    const wt = initial?.wasteTypes ?? [];
    setWasteTypes(wt.map((x) => x.wasteType));
    setErrors({});

    (async () => {
      await warmNamesFromInitial(sa);
      await fetchAndMergeDistricts(pIds);
      await fetchAndMergeWards(dIds);
    })();
  }, [
    open,
    initial,
    defaultCenter,
    draftLocation,
    warmNamesFromInitial,
    fetchAndMergeDistricts,
    fetchAndMergeWards,
  ]);

  useEffect(() => {
    if (!open) return;
    fetchAndMergeDistricts(selectedProvinces);
  }, [open, selectedProvinces, fetchAndMergeDistricts]);

  useEffect(() => {
    if (!open) return;
    fetchAndMergeWards(selectedDistricts);
  }, [open, selectedDistricts, fetchAndMergeWards]);

  const provinceOptions = useMemo<Option[]>(() => {
    const arr = (provinces as any[]).map((p) => ({
      value: String(p.code),
      label: String(p.name),
    }));
    arr.sort((a, b) => a.label.localeCompare(b.label, "vi"));
    return arr;
  }, [provinces]);

  const districtOptions = useMemo<Option[]>(() => {
    const arr = (districts as any[]).map((d) => ({
      value: String(d.code),
      label: String(d.name),
    }));
    arr.sort((a, b) => a.label.localeCompare(b.label, "vi"));
    return arr;
  }, [districts]);

  const wardOptions = useMemo<Option[]>(() => {
    const arr = (wards as any[]).map((w) => ({
      value: String(w.code),
      label: String(w.name),
    }));
    arr.sort((a, b) => a.label.localeCompare(b.label, "vi"));
    return arr;
  }, [wards]);

  /* ===== reverse geocode -> always write into address ===== */
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

        const t = (text || "").trim();
        if (t) {
          setAddress(t);
          setErrors((p) => (p.address ? { ...p, address: undefined } : p));
        }
      } catch {
        // ignore
      } finally {
        if (reqId !== reqIdRef.current) return;
        setLoadingHint(false);
      }
    })();
  }, [open, debouncedPicked.lat, debouncedPicked.lng]);

  const toggleWaste = useCallback((w: EnterpriseWasteTypeCode) => {
    setWasteTypes((arr) =>
      arr.includes(w) ? arr.filter((x) => x !== w) : [...arr, w],
    );
  }, []);

  /* ===== toggles (giữ nguyên của bạn) ===== */
  const toggleProvince = useCallback(
    (id: string) => {
      const pid = String(id);
      setSelectedProvinces((prev) => {
        const s = new Set(prev.map(String));
        if (s.has(pid)) s.delete(pid);
        else s.add(pid);
        return Array.from(s);
      });
      if (errors.serviceAreas)
        setErrors((p) => ({ ...p, serviceAreas: undefined }));
    },
    [errors.serviceAreas],
  );

  const toggleDistrict = useCallback(
    (id: string) => {
      const did = String(id);

      setSelectedDistricts((prev) => {
        const s = new Set(prev.map(String));
        if (s.has(did)) s.delete(did);
        else s.add(did);
        return Array.from(s);
      });

      setSelectedWards((prev) =>
        prev.filter((w) => wardDistrictById[String(w)] !== did),
      );

      const pid = districtProvinceById[did];
      if (pid) {
        setSelectedProvinces((prev) => {
          const s = new Set(prev.map(String));
          s.add(String(pid));
          return Array.from(s);
        });
      }

      if (errors.serviceAreas)
        setErrors((p) => ({ ...p, serviceAreas: undefined }));
    },
    [errors.serviceAreas, wardDistrictById, districtProvinceById],
  );

  const toggleWard = useCallback(
    (id: string) => {
      const wid = String(id);

      setSelectedWards((prev) => {
        const s = new Set(prev.map(String));
        if (s.has(wid)) s.delete(wid);
        else s.add(wid);
        return Array.from(s);
      });

      const did = wardDistrictById[wid];
      if (did) {
        setSelectedDistricts((prev) => {
          const s = new Set(prev.map(String));
          s.add(String(did));
          return Array.from(s);
        });

        const pid = districtProvinceById[String(did)];
        if (pid) {
          setSelectedProvinces((prev) => {
            const s = new Set(prev.map(String));
            s.add(String(pid));
            return Array.from(s);
          });
        }
      }

      if (errors.serviceAreas)
        setErrors((p) => ({ ...p, serviceAreas: undefined }));
    },
    [errors.serviceAreas, wardDistrictById, districtProvinceById],
  );

  const removeProvinceCascade = useCallback(
    (pid0: string) => {
      const pid = String(pid0);

      setSelectedProvinces((prev) => prev.filter((x) => String(x) !== pid));

      setSelectedDistricts((prev) =>
        prev.filter((did0) => districtProvinceById[String(did0)] !== pid),
      );

      setSelectedWards((prev) =>
        prev.filter((wid0) => {
          const did = wardDistrictById[String(wid0)];
          const p2 = did ? districtProvinceById[String(did)] : null;
          return p2 !== pid;
        }),
      );
    },
    [districtProvinceById, wardDistrictById],
  );

  const removeDistrictCascade = useCallback(
    (did0: string) => {
      const did = String(did0);
      setSelectedDistricts((prev) => prev.filter((x) => String(x) !== did));
      setSelectedWards((prev) =>
        prev.filter((w) => wardDistrictById[String(w)] !== did),
      );
    },
    [wardDistrictById],
  );

  const removeWard = useCallback((wid0: string) => {
    const wid = String(wid0);
    setSelectedWards((prev) => prev.filter((x) => String(x) !== wid));
  }, []);

  const validate = useCallback(() => {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Vui lòng nhập tên doanh nghiệp";

    const cap = Number(capacityKg);
    if (!capacityKg.trim()) next.capacityKg = "Vui lòng nhập công suất";
    else if (Number.isNaN(cap) || cap <= 0)
      next.capacityKg = "Công suất phải lớn hơn 0";

    if (!address.trim()) next.address = "Chưa có địa chỉ từ bản đồ";

    if (selectedProvinces.length === 0)
      next.serviceAreas = "Vui lòng chọn tối thiểu 1 Tỉnh/Thành";
    if (wasteTypes.length === 0)
      next.wasteTypes = "Vui lòng chọn ít nhất 1 loại rác";

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [name, capacityKg, address, selectedProvinces.length, wasteTypes.length]);

  const buildServiceAreasPayload = useCallback((): ServiceAreaPayload[] => {
    const items: ServiceAreaPayload[] = [];

    const wardDistrictSet = new Set<string>();
    const wardProvinceSet = new Set<string>();

    for (const wid0 of selectedWards) {
      const wid = String(wid0);
      const did = wardDistrictById[wid] ?? null;
      const pid = did ? (districtProvinceById[String(did)] ?? null) : null;

      if (did) wardDistrictSet.add(String(did));
      if (pid) wardProvinceSet.add(String(pid));

      const provinceCode =
        pid ??
        (selectedProvinces.length === 1
          ? selectedProvinces[0]
          : (selectedProvinces[0] ?? ""));

      if (!provinceCode) continue;

      items.push({
        provinceCode: String(provinceCode),
        districtCode: did ? String(did) : null,
        wardCode: wid,
      });
    }

    const districtProvinceSet = new Set<string>();
    for (const did0 of selectedDistricts) {
      const did = String(did0);
      if (wardDistrictSet.has(did)) continue;

      const pid =
        districtProvinceById[did] ??
        (selectedProvinces.length === 1
          ? selectedProvinces[0]
          : (selectedProvinces[0] ?? ""));

      if (!pid) continue;

      districtProvinceSet.add(String(pid));
      items.push({
        provinceCode: String(pid),
        districtCode: did,
        wardCode: null,
      });
    }

    const provincesCoveredByDeeper = new Set<string>([
      ...Array.from(wardProvinceSet),
      ...Array.from(districtProvinceSet),
    ]);

    for (const pid0 of selectedProvinces) {
      const pid = String(pid0);
      if (provincesCoveredByDeeper.has(pid)) continue;
      items.push({ provinceCode: pid, districtCode: null, wardCode: null });
    }

    const key = (x: ServiceAreaPayload) =>
      `${x.provinceCode}::${x.districtCode ?? ""}::${x.wardCode ?? ""}`;
    const map = new Map<string, ServiceAreaPayload>();
    for (const x of items) {
      if (!x.provinceCode) continue;
      map.set(key(x), {
        provinceCode: String(x.provinceCode),
        districtCode: x.districtCode ?? null,
        wardCode: x.wardCode ?? null,
      });
    }
    return Array.from(map.values());
  }, [
    selectedWards,
    selectedDistricts,
    selectedProvinces,
    wardDistrictById,
    districtProvinceById,
  ]);

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const serviceAreas = buildServiceAreasPayload();

      await onSubmit({
        name: name.trim(),
        address: address.trim(),
        latitude: picked.lat,
        longitude: picked.lng,
        capacityKg: Number(capacityKg),
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
              w-[calc(100vw-2rem)] max-w-[1000px]
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
                {/* 1–1 */}
                <div className="grid gap-6 lg:grid-cols-2 items-start">
                  {/* INFO (trái) */}
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

                      {/* ✅ Đưa “địa chỉ theo bản đồ” vào INFO */}
                      <FormField
                        label="Địa chỉ theo bản đồ"
                        required
                        error={errors.address}
                      >
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                              <MapPinned className="w-5 h-5 text-slate-700" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-sm font-bold text-slate-900">
                                  Tự động theo vị trí
                                </div>
                                <div className="text-xs font-semibold text-slate-500">
                                  {loadingHint ? "Đang cập nhật..." : "Tự động"}
                                </div>
                              </div>

                              <div className="mt-2 text-[14px] text-slate-800 break-words">
                                {loadingHint ? (
                                  <span className="inline-flex items-center gap-2 text-slate-500">
                                    <LoadingSpinner size="4" inline />
                                    Đang lấy địa chỉ...
                                  </span>
                                ) : address ? (
                                  address
                                ) : (
                                  <span className="text-slate-500">
                                    Chưa có địa chỉ — hãy tìm kiếm hoặc kéo bản
                                    đồ
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </FormField>
                    </div>
                  </section>

                  {/* MAP (phải) */}
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
                          Tìm kiếm hoặc kéo bản đồ để cập nhật địa chỉ tự động
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                        <MapPin className="h-3.5 w-3.5" />
                        {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
                      </div>
                    </div>

                    <MapPickerSection
                      picked={picked}
                      onChange={setPicked}
                      disabled={submitting}
                      embedded
                      showHeader={false}
                      mapHeight={250} // map ngắn hơn
                      onSuggestAddress={(text) => {
                        const t = (text || "").trim();
                        if (!t) return;

                        // chọn gợi ý => update ngay address (reverse geocode sẽ sync lại sau)
                        setAddress(t);
                        setErrors((p) =>
                          p.address ? { ...p, address: undefined } : p,
                        );
                      }}
                    />
                  </section>
                </div>

                {/* Service area */}
                <ServiceAreaSection
                  selectedProvinces={selectedProvinces}
                  selectedDistricts={selectedDistricts}
                  selectedWards={selectedWards}
                  provinceNameById={provinceNameById}
                  districtNameById={districtNameById}
                  wardNameById={wardNameById}
                  districtProvinceById={districtProvinceById}
                  wardDistrictById={wardDistrictById}
                  provinceOptions={provinceOptions}
                  districtOptions={districtOptions}
                  wardOptions={wardOptions}
                  toggleProvince={toggleProvince}
                  toggleDistrict={toggleDistrict}
                  toggleWard={toggleWard}
                  removeProvinceCascade={removeProvinceCascade}
                  removeDistrictCascade={removeDistrictCascade}
                  removeWard={removeWard}
                  submitting={submitting}
                  error={errors.serviceAreas}
                  MultiSearchSelect={MultiSearchSelect}
                />

                {/* Waste Types */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <span className="text-base">♻️</span>
                    </div>
                    Loại rác nhận
                  </h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
