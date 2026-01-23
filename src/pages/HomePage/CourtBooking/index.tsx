import React, { useState, useRef, useEffect } from "react";
import { Search, Calendar, ChevronDown } from "lucide-react";
import { useClickOutside } from "@hooks/useClickOutSide";
import CalendarModal from "./calendarModal";
import { motion, LayoutGroup } from "framer-motion";
import { formatDateShort } from "@utils/dateFormat";
import dayjs from "dayjs";
import { courts, amenitiesList, areas } from "./data";
import CourtCard from "./CourtCard";
import Pagination from "@components/Pagination";
import MapView from "./GoogleMap/modernMapInterFace";
import { useGetCourtsQuery } from "@redux/api/court/courtApi";
import type { ListParams, Court } from "@redux/api/court/type";
import { useNavigate } from "react-router-dom";

const BadmintonBooking: React.FC = () => {
  // Calendar State
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const [openCalendarModal, setOpenCalendarModal] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = dayjs().add(i, "day");
    return {
      day: d.format("dd").toUpperCase(),
      date: d.format("DD"),
      label: i === 0 ? "Hôm nay" : i === 1 ? "Ngày mai" : d.format("ddd"),
      fullDate: d.format("YYYY-MM-DD"),
    };
  });

  // Sidebar Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedUtilities, setSelectedUtilities] = useState<string[]>([]);
  const [showUtilitiesAll, setShowUtilitiesAll] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [isList, setIsList] = useState(true);
  const [selectedArea, setSelectedArea] = useState(areas[0]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Price Range
  const [priceRange, setPriceRange] = useState(500000);
  const [isDragging, setIsDragging] = useState(false);
  const min = 50000;
  const max = 500000;
  const step = 1000;
  const markers = [50000, 200000, 350000, 500000];

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Sorting
  const [sortBy, setSortBy] = useState<string>("pricePerHour");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // API Integration
  const navigate = useNavigate();

  const listParams: ListParams = {
    status: "Approved",
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    pageSize,
    minPrice: min,
    maxPrice: priceRange
    };

  const { data: courtData, isLoading, isError } = useGetCourtsQuery(listParams, {
    skip: !selectedDate,
  });

  const courtsFromApi = courtData?.data
    ? Array.isArray(courtData.data)
      ? courtData.data
      : courtData.data.items
    : [];
  const totalItems = courtData?.pagination?.totalCount || 0;
const totalPages = courtData?.pagination?.totalPages || 1;
  const filteredCourts = courtsFromApi.filter((court: Court) => {
    if (rating > 0 && (court.averageRating === undefined || court.averageRating < rating)) {
      return false;
    }

    if (
      selectedUtilities.length > 0 &&
      (!court.utilities ||
        !selectedUtilities.every((utility) => court.utilities?.includes(utility)))
    ) {
      return false;
    }

    if (showAvailableOnly && !court.isActive) {
      return false;
    }

    if (selectedArea.value !== "all" && court.location !== selectedArea.value) {
      return false;
    }

    return true;
  });

  const paginatedCourts = filteredCourts;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, rating, selectedUtilities, showAvailableOnly, selectedArea, priceRange, selectedDate]);

  useClickOutside(dropdownRef, () => setOpen(false));

  const handleBooking = (courtId: number) => {
    const court = courtsFromApi.find((c) => c.id === courtId);
    if (court) {
      navigate(`/Court/detail/${courtId}`);
    }
  };

  const toggleUtility = (utility: string): void => {
    setSelectedUtilities((prev) =>
      prev.includes(utility)
        ? prev.filter((a) => a !== utility)
        : [...prev, utility]
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setRating(0);
    setSelectedUtilities([]);
    setShowUtilitiesAll(false);
    setShowAvailableOnly(true);
    setShowNewOnly(false);
    setSelectedArea(areas[0]);
    setPriceRange(max);
    setSortBy("pricePerHour");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-100/60">
      <div className="mx-auto w-full px-5 md:px-25 pt-6 pb-10 grid grid-cols-1 lg:grid-cols-4 gap-5 md:gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-5">
            {/* Search */}
            <div>
              <h2 className="font-semibold text-lg text-gray-800/90 mb-2.5">
                Tìm kiếm sân
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tên sân, địa chỉ hoặc tiện ích"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm hover:border-teal-500/80 focus:ring-1 focus:outline-none focus:border-teal-500/60 focus:ring-[#1e9ea1] transition-all duration-200"
                />
              </div>
            </div>

            {/* Area */}
            <div className="relative w-full" ref={dropdownRef}>
              <h2 className="font-semibold text-gray-800/90 mb-2.5">Khu Vực</h2>
              <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm hover:border-teal-500/80 focus:ring-1 focus:outline-none focus:ring-[#1e9ea1] transition-all"
              >
                <span>{selectedArea.label}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ease-in-out ${
                    open ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              <div
                className={`absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transform transition-all duration-200 origin-top ${
                  open
                    ? "scale-y-100 opacity-100"
                    : "scale-y-0 opacity-0 pointer-events-none"
                }`}
              >
                {areas.map((area) => (
                  <div
                    key={area.value}
                    onClick={() => {
                      setSelectedArea(area);
                      setOpen(false);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                      selectedArea.value === area.value
                        ? "bg-[#1e9ea1]/20 text-[#1e9ea1] font-medium"
                        : "text-gray-800"
                    }`}
                  >
                    {area.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="p-3.5 bg-white shadow-sm w-full rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">
                Khoảng Giá (VNĐ/giờ)
              </h3>
              <div className="relative h-8">
                <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 -translate-y-1/2">
                  <div
                    className="h-1.5 bg-teal-500/90 rounded"
                    style={{
                      width: `${((priceRange - min) / (max - min)) * 100}%`,
                    }}
                  />
                  {markers.map((val) => (
                    <div
                      key={val}
                      className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2 bg-gray-400"
                      style={{ left: `${((val - min) / (max - min)) * 100}%` }}
                    />
                  ))}
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onTouchStart={() => setIsDragging(true)}
                  onTouchEnd={() => setIsDragging(false)}
                  className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-auto custom-thumb"
                />
                {isDragging && (
                  <div
                    className="absolute -top-3.5 w-14 text-center text-xs font-semibold text-white bg-teal-500 rounded shadow-md pointer-events-none"
                    style={{
                      left: `calc(${
                        ((priceRange - min) / (max - min)) * 100
                      }% - 28px)`,
                    }}
                  >
                    {priceRange.toLocaleString()}₫
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                {markers.map((val) => (
                  <span key={val}>{val.toLocaleString()}₫</span>
                ))}
              </div>
            </div>

            {/* Utilities */}
            <div>
              <h3 className="font-semibold text-gray-800/90 mb-2.5">
                Tiện Ích
                {selectedUtilities.length > 0 && (
                  <>
                    {" "}
                    ({selectedUtilities.length}/{amenitiesList.length})
                  </>
                )}
              </h3>
              <div className="grid grid-cols-1 gap-x-5 gap-y-2.5">
                {(showUtilitiesAll
                  ? amenitiesList
                  : amenitiesList.slice(0, 6)
                ).map((utility) => (
                  <label
                    key={utility.key}
                    className="flex items-center space-x-2 cursor-pointer text-[13px]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUtilities.includes(utility.key)}
                      onChange={() => toggleUtility(utility.key)}
                      className="w-4 h-4 text-[#1e9ea1] border-gray-300 rounded focus:ring-[#1e9ea1]"
                    />
                    {utility.icon}
                    <span className="text-gray-700">{utility.label}</span>
                  </label>
                ))}
              </div>
              {amenitiesList.length > 6 && (
                <button
                  onClick={() => setShowUtilitiesAll(!showUtilitiesAll)}
                  className="mt-2 text-[#1e9ea1] text-sm font-medium hover:underline hover:brightness-75"
                >
                  {showUtilitiesAll ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </div>

            {/* Rating */}
            <div>
              <h3 className="font-semibold text-gray-800/90 mb-2.5">
                Xếp Hạng {rating > 0 ? `(${rating}/5)` : ""}
              </h3>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(rating === star ? 0 : star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-5 h-5 transition-all duration-200 ${
                        star <= (hoverRating || rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      } hover:scale-110 hover:text-yellow-400`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="text-sm text-gray-600 ml-1.5">trở lên</span>
              </div>
            </div>

            {/* Special Options */}
            <div>
              <h3 className="font-semibold text-gray-800/90 mb-2.5">
                Chỉ Hiển Thị
              </h3>
              <div className="space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Sân đang mở cửa</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showAvailableOnly}
                      onChange={(e) => setShowAvailableOnly(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-5 rounded-full transition-colors ${
                        showAvailableOnly ? "bg-[#1e9ea1]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                          showAvailableOnly
                            ? "translate-x-5"
                            : "translate-x-0.5"
                        } translate-y-0.5`}
                      />
                    </div>
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">
                    Có khung giờ trống
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showNewOnly}
                      onChange={(e) => setShowNewOnly(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-5 rounded-full transition-colors ${
                        showNewOnly ? "bg-[#1e9ea1]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                          showNewOnly ? "translate-x-5" : "translate-x-0.5"
                        } translate-y-0.5`}
                      />
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={resetFilters}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:border-[#1bb4b7] hover:text-[#1e9ea1] hover:shadow-md transition"
              >
                Đặt Lại
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className="flex-1 bg-gradient-to-r from-[#2ebabc] to-[#21a5a9] hover:brightness-95 text-white py-2 rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition"
              >
                Áp Dụng
              </button>
            </div>

            {/* AI Button */}
            <button className="w-full bg-[#1e9ea1] text-white py-2 rounded-lg hover:brightness-95 font-medium">
              Sử Dụng AI Get Sport!
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 max-h-[90vh] overflow-y-auto">
          {/* Date Selector / Header */}
          <div
            className={`bg-white rounded-lg shadow-sm p-5 ${
              isList ? "mb-5" : "mb-0"
            }`}
          >
            <div
              className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
                isList ? "mb-3.5" : "mb-0"
              }`}
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                {isList ? "Danh Sách Sân Cầu Lông" : "Bản Đồ Sân Cầu Lông"}
              </h2>
              <LayoutGroup>
                <div
                  role="tablist"
                  aria-label="Chế độ hiển thị"
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") setIsList(true);
                    if (e.key === "ArrowRight") setIsList(false);
                  }}
                  className="relative grid grid-cols-2 w-40 sm:w-44 rounded-full border border-slate-200 bg-white/80 backdrop-blur shadow-inner p-0.5 select-none"
                >
                  <button
                    role="tab"
                    aria-selected={isList}
                    onClick={() => setIsList(true)}
                    className="relative rounded-full px-2.5 py-2.5 text-xs leading-none font-semibold whitespace-nowrap"
                  >
                    {isList && (
                      <motion.div
                        layoutId="toggle-pill"
                        className="absolute inset-0 rounded-full shadow-md ring-1 ring-teal-300/40 bg-[#21a5a9]"
                        transition={{
                          type: "spring",
                          stiffness: 600,
                          damping: 38,
                          mass: 0.6,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 inline-flex items-center gap-1 ${
                        isList
                          ? "text-white"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      Danh sách
                    </span>
                  </button>
                  <button
                    role="tab"
                    aria-selected={!isList}
                    onClick={() => setIsList(false)}
                    className="relative rounded-full px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs leading-none font-semibold whitespace-nowrap"
                  >
                    {!isList && (
                      <motion.div
                        layoutId="toggle-pill"
                        className="absolute inset-0 rounded-full shadow-md ring-1 ring-teal-300/40 bg-[#21a5a9]"
                        transition={{
                          type: "spring",
                          stiffness: 600,
                          damping: 38,
                          mass: 0.6,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 inline-flex items-center gap-1 ${
                        !isList
                          ? "text-white"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      Bản đồ
                    </span>
                  </button>
                </div>
              </LayoutGroup>
            </div>

            {/* Calendar Buttons */}
            {/* {isList && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2.5 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1e9ea1]" />
                  Chọn ngày
                </p>
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {dates.map((date) => (
                    <button
                      key={date.date}
                      onClick={() => setSelectedDate(date.fullDate)}
                      className={`flex flex-col items-center min-w-[68px] py-2 px-3.5 rounded-xl border transition-all shadow-sm hover:shadow ${
                        selectedDate === date.fullDate
                          ? "bg-gradient-to-r from-[#25b1b3] to-[#1a9498] text-white border-transparent scale-[1.03]"
                          : "bg-white text-gray-600 border-gray-300 hover:border-[#1e9ea1] hover:text-[#1e9ea1]"
                      }`}
                    >
                      <span className="text-[11px] font-medium">
                        {date.day}
                      </span>
                      <span className="text-lg font-bold">{date.date}</span>
                      <span className="text-[11px]">{date.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setOpenCalendarModal(true)}
                    className="flex flex-col items-center justify-center min-w-[68px] py-2.5 px-3.5 rounded-xl border border-gray-300 text-gray-600 transition-all hover:border-[#1e9ea1] hover:text-[#1e9ea1] hover:shadow"
                  >
                    <Calendar className="w-5 h-5 mb-0.5" />
                    <span className="text-xs font-medium">Khác</span>
                  </button>
                  <CalendarModal
                    open={openCalendarModal}
                    onClose={() => setOpenCalendarModal(false)}
                    onSelectDate={(date) => {
                      setSelectedDate(date);
                      setOpenCalendarModal(false);
                    }}
                  />
                </div>
                {selectedDate && (
                  <p className="mt-3 text-sm text-gray-700">
                    <span className="font-medium text-[#1e9ea1]">
                      Ngày đã chọn:
                    </span>{" "}
                    {formatDateShort(selectedDate)}
                  </p>
                )}
              </div>
            )} */}
          </div>

          {/* List view or Map */}
          {isList ? (
            <>
              {isLoading && <div className="text-center">Đang tải...</div>}
              {isError && (
                <div className="text-center text-red-500">
                  Lỗi khi tải danh sách sân
                </div>
              )}
              {!isLoading && !isError && filteredCourts.length === 0 && (
                <div className="text-center text-gray-600">
                  Không tìm thấy sân phù hợp
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {paginatedCourts.map((court) => (
                  <CourtCard
                    key={court.id}
                    court={court}
                    onBooking={handleBooking}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="mt-2">
              <MapView courts={filteredCourts} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadmintonBooking;