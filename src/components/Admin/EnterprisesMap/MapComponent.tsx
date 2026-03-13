// src/components/Admin/EnterprisesMap/MapComponent.tsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { EnterpriseMapLocation } from "@/api/admin/enterprise-map";
import { fetchEnterprisesMap } from "@/api/admin/enterprise-map";
import { toast } from "react-toastify";
import { translateStatus } from "@/utils/statusTranslation";

// Fix Leaflet marker icons issues with Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Helper to get colors based on enterprise status
const getStatusClasses = (status?: string) => {
  switch (status) {
    case "ACTIVE": return { border: "border-emerald-500", triangle: "border-t-emerald-500" };
    case "OFFLINE": return { border: "border-slate-500", triangle: "border-t-slate-500" };
    case "BANNED": return { border: "border-rose-500", triangle: "border-t-rose-500" };
    case "EXPIRED": return { border: "border-amber-500", triangle: "border-t-amber-500" };
    case "PENDING": return { border: "border-blue-500", triangle: "border-t-blue-500" };
    default: return { border: "border-emerald-500", triangle: "border-t-emerald-500" };
  }
};

// Custom Icon for Project Enterprises
const getEnterpriseIcon = (avatar?: string, status?: string) => {
  const styles = getStatusClasses(status);

  return L.divIcon({
    html: `
      <div class="relative drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] cursor-pointer group-hover:scale-110 transition-transform origin-bottom duration-200 flex flex-col items-center">
        <!-- Circular avatar frame with dynamic status color -->
        <div class="w-[46px] h-[46px] rounded-full overflow-hidden border-[3px] ${styles.border} bg-white flex items-center justify-center relative z-10">
          ${avatar
        ? `<img src="${avatar}" alt="Avatar" class="w-full h-full object-cover rounded-full" />`
        : `<div class="w-full h-full bg-slate-100 text-slate-400 flex items-center justify-center rounded-full">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
               </div>`
      }
        </div>
        <!-- Triangle pointer with dynamic status color -->
        <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] ${styles.triangle} -mt-[2px] relative z-0"></div>
      </div>
    `,
    className: "custom-enterprise-icon bg-transparent border-none outline-none",
    iconSize: [46, 54],
    iconAnchor: [23, 54], // Bottom tip of the triangle
    popupAnchor: [0, -48], // Just above the circle
  });
};

interface MapComponentProps {
  enterprises: EnterpriseMapLocation[];
  isLoading: boolean;
  onSelectEnterprise: (id: number, lat: number, lng: number) => void;
  flyTo: { lat: number; lng: number } | null;
}

// Internal component to handle programmatic map movements
const MapController: React.FC<{
  flyTo: { lat: number; lng: number } | null;
}> = ({ flyTo }) => {
  const map = useMap();

  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], 16, {
        duration: 2,
      });
    }
  }, [flyTo, map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
  enterprises,
  isLoading,
  onSelectEnterprise,
  flyTo,
}) => {
  console.log(
    "MapComponent Rendering with markers count:",
    (enterprises || []).length,
  );

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[10.7769, 106.7009]} // Default Ho Chi Minh City
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false} // Customizing zoom control location or hiding it
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController flyTo={flyTo} />

        {(enterprises || []).map((ent) => (
          <Marker
            key={ent.id}
            position={[ent.latitude, ent.longitude]}
            icon={getEnterpriseIcon(ent.avatar, ent.status)}
            eventHandlers={{
              click: () =>
                onSelectEnterprise(ent.id, ent.latitude, ent.longitude),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <h4 className="font-bold text-slate-900">{ent.name}</h4>
                <p className="text-[12px] text-slate-500 mt-1">{ent.address}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ent.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                      }`}
                  >
                    {translateStatus(ent.status)}
                  </span>
                  <button
                    className="text-emerald-600 text-[11px] font-bold hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEnterprise(ent.id, ent.latitude, ent.longitude);
                    }}
                  >
                    Xem chi tiết &rarr;
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
