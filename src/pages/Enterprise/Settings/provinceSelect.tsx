// src/pages/Enterprise/Profile/components/ProvinceSelect.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

type Opt = { value: string; label: string };

function cn(...s: Array<string | false | undefined | null>) {
  return s.filter(Boolean).join(" ");
}

export function SearchSelect({
  value,
  options,
  placeholder = "Chọn...",
  disabled,
  onChange,
}: {
  value: string;
  options: Opt[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return options;
    return options.filter((o) => o.label.toLowerCase().includes(t));
  }, [options, q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((s) => !s)}
        className={cn(
          "w-full h-11 px-4 rounded-xl text-left border bg-white transition",
          disabled
            ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            : "border-slate-200 hover:border-emerald-300 hover:shadow-sm",
        )}
      >
        <div className="truncate text-sm font-semibold text-slate-800">
          {selected?.label ?? (
            <span className="font-medium text-slate-400">{placeholder}</span>
          )}
        </div>
      </button>

      {open && !disabled ? (
        <div className="absolute z-[60] mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Gõ để tìm..."
              className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none
                         focus:border-emerald-300"
            />
          </div>

          <div className="max-h-56 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-sm text-slate-500">
                Không có dữ liệu
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQ("");
                  }}
                  className={cn(
                    "w-full px-3 py-2.5 text-left text-sm hover:bg-emerald-50 transition",
                    o.value === value ? "bg-emerald-50" : "",
                  )}
                >
                  <div className="font-semibold text-slate-800">{o.label}</div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

type Province = { code: number; name: string };
type District = { code: number; name: string; wards?: Ward[] };
type Ward = { code: number; name: string };

type ProvinceDetail = Province & { districts: District[] };

const API_BASE = "https://provinces.open-api.vn/api";

export function useProvinces(open: boolean) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (provinces.length) return;

    let alive = true;
    setLoading(true);

    fetch(`${API_BASE}/p/`)
      .then((r) => r.json())
      .then((json) => {
        if (!alive) return;
        setProvinces(
          Array.isArray(json)
            ? json.map((p: any) => ({ code: p.code, name: p.name }))
            : [],
        );
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [open, provinces.length]);

  return { provinces, loading };
}

export async function fetchProvinceDetailDepth3(code: string) {
  const r = await fetch(`${API_BASE}/p/${code}?depth=3`);
  const json = (await r.json()) as ProvinceDetail;

  // normalize wards maybe undefined
  const districts = (json?.districts ?? []).map((d: any) => ({
    code: d.code,
    name: d.name,
    wards: Array.isArray(d.wards)
      ? d.wards.map((w: any) => ({ code: w.code, name: w.name }))
      : [],
  }));

  return {
    code: json.code,
    name: json.name,
    districts,
  } as ProvinceDetail;
}

export function toOptions(list: Array<{ code: number; name: string }>): Opt[] {
  return list.map((x) => ({ value: String(x.code), label: x.name }));
}
