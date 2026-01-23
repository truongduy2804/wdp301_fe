// GoogleMapContainer.tsx
import React, { useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  name: string;
  address?: string;
  rating?: number;
}

const containerStyle = {
  width: "100%",
  height: "80vh",
  borderRadius: "12px",
};

const center = {
  lat: 10.7769, // mặc định HCM
  lng: 106.7009,
};

const GoogleMapContainer: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDW4_xuPmxKXS_-LN1Bcs0fdKPG6vOKxz4", // thay API key của bạn
    libraries: ["places"], // cần để search
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selected, setSelected] = useState<MarkerData | null>(null);

  const markers: MarkerData[] = [
    {
      id: "1",
      lat: 10.7769,
      lng: 106.7009,
      name: "Sân Cầu Lông Quận 1",
      address: "123 Nguyễn Huệ, Quận 1",
      rating: 4.5,
    },
    {
      id: "2",
      lat: 10.7905,
      lng: 106.6823,
      name: "Sân Cầu Lông Quận 3",
      address: "45 Trần Quang Khải, Quận 3",
      rating: 4.2,
    },
  ];

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
          onClick={() => setSelected(marker)}
        />
      ))}

      {selected && (
        <InfoWindow
          position={{ lat: selected.lat, lng: selected.lng }}
          onCloseClick={() => setSelected(null)}
        >
          <div style={{ maxWidth: "200px" }}>
            <h3 style={{ fontWeight: "bold" }}>{selected.name}</h3>
            <p style={{ fontSize: "14px", color: "#555" }}>
              {selected.address}
            </p>
            <p style={{ fontSize: "14px" }}>⭐ {selected.rating}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <p>Loading Map...</p>
  );
};

export default GoogleMapContainer;
