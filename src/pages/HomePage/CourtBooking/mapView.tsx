import React, { useState, useEffect } from "react";
import {
  Search,
  Navigation,
  Star,
  Clock,
  Phone,
  Filter,
  X,
} from "lucide-react";
import { Tooltip } from "@mui/material";

interface SearchResult {
  id: string;
  name: string;
  address: string;
  type: "badminton" | "district" | "street" | "landmark" | "business";
  rating?: number;
  price?: string;
  phone?: string;
  openTime?: string;
  coordinates?: { lat: number; lng: number };
}

// Mock data TP.HCM
const searchData: SearchResult[] = [
  {
    id: "1",
    name: "Sân cầu lông Quận 1",
    address: "12 Lê Lợi, Quận 1, TP.HCM",
    type: "badminton",
    rating: 4.5,
    price: "100k/giờ",
    phone: "090 123 4567",
    openTime: "6:00 - 22:00",
    coordinates: { lat: 10.7769, lng: 106.7009 },
  },
  {
    id: "2",
    name: "Sân cầu lông Quận 3",
    address: "45 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
    type: "badminton",
    rating: 4.0,
    price: "80k/giờ",
    phone: "090 234 5678",
    openTime: "7:00 - 21:00",
    coordinates: { lat: 10.7755, lng: 106.6936 },
  },
  {
    id: "3",
    name: "Sân cầu lông Bình Thạnh",
    address: "123 Điện Biên Phủ, Bình Thạnh, TP.HCM",
    type: "badminton",
    rating: 4.2,
    price: "90k/giờ",
    phone: "090 345 6789",
    openTime: "6:30 - 22:30",
    coordinates: { lat: 10.8025, lng: 106.708 },
  },
];

const ModernMapInterface: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 10.7769, lng: 106.7009 });

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      return;
    }

    const fetchData = async () => {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          searchQuery
        )}&key=AIzaSyDW4_xuPmxKXS_-LN1Bcs0fdKPG6vOKxz4`
      );
      const data = await response.json();
      if (data.results) {
        setFilteredResults(
          data.results.map((item: any, idx: number) => ({
            id: item.place_id,
            name: item.name,
            address: item.formatted_address,
            type: "business", // hoặc tùy chỉnh theo kết quả
            rating: item.rating,
            coordinates: {
              lat: item.geometry.location.lat,
              lng: item.geometry.location.lng,
            },
          }))
        );
      }
    };

    fetchData();
  }, [searchQuery]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setMapCenter(location);
        },
        () => {
          const defaultLocation = { lat: 10.7769, lng: 106.7009 };
          setUserLocation(defaultLocation);
          setMapCenter(defaultLocation);
        }
      );
    }
  };

  return (
    <div className="relative w-full h-[80vh] overflow-hidden bg-gray-100">
      {/* Search Bar */}
      <div
        className={`absolute top-4 transition-all duration-300 z-30 w-full max-w-md px-2 ${
          selectedResult ? "left-6 transform-none" : "left-1/2 -translate-x-1/2"
        }`}
      >
        <div
          className={`relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 ${
            isSearchFocused
              ? "shadow-[0_15px_40px_rgba(30,158,161,0.15)] scale-105"
              : ""
          }`}
        >
          <div className="flex items-center px-4 py-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-[#1e9ea1] to-[#16a085] rounded-full mr-3">
              <Search className="w-4 h-4 text-white" />
            </div>
            <input
              type="text"
              placeholder="Tìm sân cầu lông, quận, đường..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm font-medium"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`ml-2 p-1.5 rounded-lg transition-all duration-200 ${
                showFilters
                  ? "bg-[#1e9ea1] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors text-lg"
              >
                ×
              </button>
            )}
          </div>

          {/* Search Results */}
          {filteredResults.length > 0 && searchQuery && (
            <div className="absolute top-14 w-full bg-white rounded-xl shadow-lg border border-gray-200 z-40 overflow-hidden">
              {filteredResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedResult(item);
                    if (item.coordinates) setMapCenter(item.coordinates);
                    setSearchQuery("");
                  }}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-700">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.address}</p>
                  </div>
                  {item.rating && (
                    <span className="text-yellow-500 font-semibold">
                      {item.rating}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="absolute top-3 right-4 z-20 space-y-3">
        <Tooltip title="Vị trí hiện tại" placement="left" arrow>
          <button
            onClick={handleGetCurrentLocation}
            className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md border border-gray-200/60 hover:bg-gray-50 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <Navigation
              className={`w-6 h-6 text-[#1e9ea1] transition-transform duration-300 ${
                userLocation ? "animate-pulse" : ""
              }`}
            />
          </button>
        </Tooltip>
      </div>

      {/* Google Maps Iframe */}
      <iframe
        title="Bản đồ TP.HCM"
        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15677.808878312244!2d${mapCenter.lng}!3d${mapCenter.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${mapCenter.lat},${mapCenter.lng}!5e0!3m2!1svi!2s!4v1700000000000`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full transition-all duration-500"
      />

      {/* Info Panel */}
      {selectedResult && selectedResult.type === "badminton" && (
        <div className="absolute bottom-6 right-6 z-20">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {selectedResult.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {selectedResult.address}
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedResult.rating && (
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Star
                    className="w-4 h-4 text-yellow-400 mr-1"
                    fill="currentColor"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedResult.rating}
                  </span>
                </div>
                {selectedResult.price && (
                  <div className="px-3 py-1 bg-gradient-to-r from-[#1e9ea1] to-[#16a085] rounded-full">
                    <span className="text-sm font-semibold text-white">
                      {selectedResult.price}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 mb-4">
              {selectedResult.openTime && (
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">{selectedResult.openTime}</span>
                </div>
              )}
              {selectedResult.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm">{selectedResult.phone}</span>
                </div>
              )}
            </div>

            <button className="w-full bg-gradient-to-r from-[#1e9ea1] to-[#16a085] text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
              Xem chi tiết & Đặt sân
            </button>
          </div>
        </div>
      )}

      {/* Map Attribution */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
        <span className="font-medium">
          {isSatelliteView ? "🛰️ Chế độ vệ tinh" : "🗺️ Chế độ bản đồ"} •{" "}
          {filteredResults.length} kết quả
        </span>
      </div>
    </div>
  );
};

export default ModernMapInterface;
