import React from "react";
import { MapPin, Star } from "lucide-react";
import type { Court } from "@redux/api/court/type";

interface CourtCardProps {
  court: Court;
  onBooking: (id: number) => void;
}

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("vi-VN").format(price);

const CourtCard: React.FC<CourtCardProps> = ({ court, onBooking }) => {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 border border-gray-100">
      {/* Court Image */}
      <div className="relative overflow-hidden">
        <img
          src={court.imageUrls[0] || "https://via.placeholder.com/300x150"}
          alt={court.location}
          className="w-full h-36 md:h-40 object-cover transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {court.isActive && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg">
              Đang mở cửa
            </span>
          </div>
        )}
      </div>

      {/* Court Info */}
      <div className="p-5">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1.5 group-hover:text-teal-700 transition-colors">
          {court.name}
        </h3>
        <div className="flex items-center gap-2 text-gray-600 mb-2.5">
          <MapPin className="w-4 h-4" />
          <span className="text-sm line-clamp-1">{court.location}</span>
        </div>

        {/* Price + Button */}
        <div className="flex items-center justify-between">
          <div className="text-base md:text-lg font-semibold text-teal-600">
            {formatPrice(court.pricePerHour)}{" "}
            <span className="text-xs text-gray-500">/giờ</span>
          </div>
          <button
            onClick={() => onBooking(court.id)}
            className="px-3 py-0.5 bg-gradient-to-br from-[#35b6b8] to-[#1e9ea1] text-white font-medium rounded-lg transition-transform duration-200 hover:scale-[1.02] hover:brightness-95"
          >
            Đặt Ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourtCard;