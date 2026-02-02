import React, { useEffect, useRef, memo } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";

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

    // Chỉ animate nhẹ khi value đổi từ ngoài
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

/** Pin SVG solid (full nền), có điểm trắng giữa */
const SolidPin = memo(function SolidPin({ size = 44 }: { size?: number }) {
  const color = "#E11D48"; // rose-600

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{
        filter: "drop-shadow(0 10px 14px rgba(0,0,0,.28))",
      }}
    >
      <path
        d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"
        fill={color}
      />
      <circle cx="12" cy="9" r="2.6" fill="white" opacity="0.95" />
    </svg>
  );
});

export default function CenterPinMap({
  value,
  onChange,
  height = 380,
  zoom = 15,
}: {
  value: LatLng;
  onChange: (v: LatLng) => void;
  height?: number;
  zoom?: number;
}) {
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
        <div className="relative -translate-y-7">
          <div className="absolute left-1/2 top-[44px] -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-black/30 blur-[2px]" />
          <SolidPin size={44} />
        </div>
      </div>

      <div className="pointer-events-none absolute left-3 top-3 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm ring-1 ring-rose-200">
        Kéo bản đồ để chọn vị trí
      </div>
    </div>
  );
}
