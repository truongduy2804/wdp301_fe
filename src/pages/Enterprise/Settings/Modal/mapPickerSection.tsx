import React, { memo, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Search } from "lucide-react";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import CenterPinMap from "../centerPinMap";

type PlaceSuggestion = {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
};

type Props = {
  picked: { lat: number; lng: number };
  onChange: (v: { lat: number; lng: number }) => void;
  disabled?: boolean;
  onSuggestAddress?: (text: string) => void;
};

function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return v;
}

/**
 * ✅ Search suggestions (FIX)
 * - Try Nominatim first
 * - Fallback Photon (komoot) when Nominatim blocked/empty
 */
async function searchPlaces(q: string): Promise<PlaceSuggestion[]> {
  const qs = q.trim();
  if (qs.length < 2) return [];

  // 1) Nominatim
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2` +
      `&addressdetails=1&limit=8&countrycodes=vn&accept-language=vi` +
      `&q=${encodeURIComponent(qs)}`;

    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: { "Accept-Language": "vi" },
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      const arr = Array.isArray(data) ? (data as PlaceSuggestion[]) : [];
      if (arr.length) return arr;
    }
  } catch {
    // ignore -> fallback
  }

  // 2) Photon fallback (bbox Vietnam)
  try {
    type PhotonFeature = {
      properties?: any;
      geometry?: { coordinates?: [number, number] };
    };
    type PhotonResp = { features?: PhotonFeature[] };

    const bboxVN = "102.144,8.179,109.469,23.393"; // lonmin,latmin,lonmax,latmax
    const url =
      `https://photon.komoot.io/api/?limit=8&lang=vi` +
      `&bbox=${encodeURIComponent(bboxVN)}` +
      `&q=${encodeURIComponent(qs)}`;

    const res = await fetch(url, { method: "GET", mode: "cors" });
    if (!res.ok) return [];
    const data = (await res.json()) as PhotonResp;

    const features = Array.isArray(data?.features) ? data.features : [];
    const out: PlaceSuggestion[] = features
      .map((f, idx) => {
        const p = f?.properties || {};
        const coords = f?.geometry?.coordinates;
        const lon = coords?.[0];
        const lat = coords?.[1];
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

        const name = p?.name || p?.street || p?.city || p?.state || "Địa điểm";
        const bits = [
          p?.housenumber && p?.street
            ? `${p.housenumber} ${p.street}`
            : p?.street || "",
          p?.district || "",
          p?.city || "",
          p?.state || "",
          p?.country || "",
        ].filter(Boolean);

        const display = bits.length
          ? `${name}, ${bits.join(", ")}`
          : String(name);

        return {
          place_id: String(p?.osm_id ?? p?.id ?? idx),
          display_name: display,
          lat: String(lat),
          lon: String(lon),
        };
      })
      .filter(Boolean) as PlaceSuggestion[];

    return out;
  } catch {
    return [];
  }
}

const MapBlock = memo(function MapBlock({
  picked,
  onChange,
}: {
  picked: { lat: number; lng: number };
  onChange: (v: { lat: number; lng: number }) => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <CenterPinMap value={picked} onChange={onChange} height={520} />
    </div>
  );
});

export default function MapPickerSection({
  picked,
  onChange,
  disabled,
  onSuggestAddress,
}: Props) {
  const [mapQ, setMapQ] = useState("");
  const debouncedMapQ = useDebounced(mapQ, 350);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reqRef = useRef(0);

  // click outside close
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as any)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // search
  useEffect(() => {
    const q = debouncedMapQ.trim();
    if (q.length < 2) {
      setResults([]);
      setEmpty(false);
      setLoading(false);
      return;
    }

    const rid = ++reqRef.current;
    setLoading(true);
    setEmpty(false);

    (async () => {
      try {
        const rs = await searchPlaces(q);
        if (rid !== reqRef.current) return;
        setResults(rs);
        setEmpty(rs.length === 0);
      } catch {
        if (rid !== reqRef.current) return;
        setResults([]);
        setEmpty(true);
      } finally {
        if (rid !== reqRef.current) return;
        setLoading(false);
      }
    })();
  }, [debouncedMapQ]);

  return (
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

      {/* Search */}
      <div ref={wrapRef} className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            value={mapQ}
            onChange={(e) => {
              setMapQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            disabled={disabled}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-12 pr-10 text-[14px] outline-none
                       hover:border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100
                       disabled:bg-slate-50 disabled:text-slate-500"
            placeholder="Tìm vị trí (gợi ý dần)..."
          />

          {loading ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <LoadingSpinner size="4" inline />
            </div>
          ) : null}
        </div>

        <AnimatePresence>
          {open && mapQ.trim().length >= 2 && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.16 }}
              className="absolute z-[100] mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="max-h-[260px] overflow-auto custom-scrollbar p-2 space-y-[2px]">
                {results.map((p) => (
                  <button
                    key={String(p.place_id)}
                    type="button"
                    onClick={() => {
                      const lat = Number(p.lat);
                      const lng = Number(p.lon);
                      if (!Number.isFinite(lat) || !Number.isFinite(lng))
                        return;

                      onChange({ lat, lng });
                      onSuggestAddress?.(p.display_name || "");
                      setMapQ(p.display_name || "");
                      setOpen(false);
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left transition flex items-start gap-3
                               hover:bg-blue-50 text-slate-800"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="min-w-0">
                      <div className="text-sm font-semibold truncate text-slate-900">
                        {p.display_name}
                      </div>
                    </span>
                  </button>
                ))}

                {!loading && empty ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Không tìm thấy địa điểm phù hợp
                    <div className="mt-1 text-xs text-slate-400">
                      Nếu production vẫn rỗng, nên proxy qua backend để tránh
                      policy/rate-limit của Nominatim.
                    </div>
                  </div>
                ) : null}

                {loading && results.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Đang tìm địa điểm...
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MapBlock picked={picked} onChange={onChange} />
    </section>
  );
}
