import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { MapPin } from "lucide-react";

type LatLng = { lat: number; lng: number };

function SetViewOnValue({
  value,
  minZoom = 15,
}: {
  value: LatLng;
  minZoom?: number;
}) {
  const map = useMap();
  const lastRef = useRef<LatLng | null>(null);

  useEffect(() => {
    const last = lastRef.current;

    // Nếu chưa có last -> setView luôn
    if (!last) {
      lastRef.current = value;
      map.setView([value.lat, value.lng], Math.max(map.getZoom(), minZoom), {
        animate: false,
      });
      return;
    }

    // Nếu gần như không đổi -> bỏ qua (giảm render/animate thừa)
    const same =
      Math.abs(last.lat - value.lat) < 1e-7 &&
      Math.abs(last.lng - value.lng) < 1e-7;
    if (same) return;

    lastRef.current = value;

    // Chỉ animate nhẹ khi value đổi từ ngoài (ví dụ init / setPicked)
    map.setView([value.lat, value.lng], Math.max(map.getZoom(), minZoom), {
      animate: true,
      duration: 0.25,
    });
  }, [value.lat, value.lng, minZoom, map]);

  return null;
}

function CenterWatcher({ onChange }: { onChange: (v: LatLng) => void }) {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter();
      onChange({ lat: c.lat, lng: c.lng });
    },
    zoomend(e) {
      const c = e.target.getCenter();
      onChange({ lat: c.lat, lng: c.lng });
    },
  });
  return null;
}

export default function CenterPinMap({
  value,
  onChange,
  height = 380,
  zoom = 15,
  pinColor = "green",
}: {
  value: LatLng;
  onChange: (v: LatLng) => void;
  height?: number;
  zoom?: number;
  pinColor?: "green" | "red";
}) {
  const pinClass = pinColor === "red" ? "text-rose-600" : "text-emerald-600";
  const haloClass = pinColor === "red" ? "bg-rose-500/20" : "bg-emerald-500/20";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
      style={{ height }}
    >
      <MapContainer
        center={[value.lat, value.lng]}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <SetViewOnValue value={value} minZoom={15} />
        <CenterWatcher onChange={onChange} />
      </MapContainer>

      {/* pin fixed center */}
      <div className="pointer-events-none absolute inset-0 z-[999] flex items-center justify-center">
        <div className="relative -translate-y-5">
          {/* halo (mềm hơn) */}
          <div
            className={`absolute left-1/2 top-[22px] -translate-x-1/2 h-10 w-10 rounded-full blur-[10px] ${haloClass}`}
          />
          {/* shadow */}
          <div className="absolute left-1/2 top-[34px] -translate-x-1/2 h-3 w-3 rounded-full bg-black/25 blur-[2px]" />
          {/* pin */}
          <MapPin className={`h-10 w-10 drop-shadow-lg ${pinClass}`} />
        </div>
      </div>

      <div className="pointer-events-none absolute left-3 top-3 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
        Kéo bản đồ để chọn vị trí
      </div>
    </div>
  );
}
