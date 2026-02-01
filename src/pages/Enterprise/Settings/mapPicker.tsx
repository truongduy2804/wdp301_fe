// src/pages/Enterprise/Profile/components/MapPicker.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

type LatLng = { lat: number; lng: number };

const DEFAULT_CENTER: LatLng = { lat: 10.7769, lng: 106.7009 }; // HCM

// Fix icon path (Vite + Leaflet)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickToMove({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapPicker({
  value,
  onChange,
  height = 320,
}: {
  value?: LatLng | null;
  onChange: (p: LatLng) => void;
  height?: number;
}) {
  const center = useMemo(() => value ?? DEFAULT_CENTER, [value]);

  const markerRef = useRef<L.Marker | null>(null);

  // keep marker in sync when value changes
  useEffect(() => {
    if (!value || !markerRef.current) return;
    markerRef.current.setLatLng([value.lat, value.lng]);
  }, [value]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div style={{ height }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={15}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickToMove onPick={onChange} />

          <Marker
            draggable
            position={[center.lat, center.lng]}
            eventHandlers={{
              dragend: () => {
                const m = markerRef.current;
                if (!m) return;
                const p = m.getLatLng();
                onChange({ lat: p.lat, lng: p.lng });
              },
            }}
            ref={(ref) => {
              markerRef.current = ref as any;
            }}
          />
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
        <div className="text-sm font-semibold text-slate-700">
          Chọn vị trí trên bản đồ
        </div>
        <div className="text-xs text-slate-600">
          {value
            ? `Lat: ${value.lat.toFixed(6)} · Lng: ${value.lng.toFixed(6)}`
            : "Chưa chọn"}
        </div>
      </div>
    </div>
  );
}
