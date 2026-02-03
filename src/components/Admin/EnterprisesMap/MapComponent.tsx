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

// Custom Icon for Project Enterprises
const EnterpriseIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center w-10 h-10">
      <div class="absolute inset-0 bg-emerald-600 rounded-2xl shadow-lg ring-2 ring-white rotate-45 transform"></div>
      <div class="relative text-white z-10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      </div>
    </div>
  `,
  className: "custom-enterprise-icon",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

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
            icon={ent.roleId === 2 ? EnterpriseIcon : DefaultIcon}
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
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      ent.status === "ACTIVE"
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
