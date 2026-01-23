import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, MapPin, User, Clock, DollarSign, Image as ImageIcon, Star, List } from "lucide-react";
import { useGetCourtQuery } from "@redux/api/court/courtApi";
import { useGetAverageRatingByCourtQuery, useGetFeedbacksByCourtQuery } from "@redux/api/feedback/feedbackApi";
import { formatDateShort } from "@utils/dateFormat";
import LoadingSpinner from "@components/Loading_Spinner";
import dayjs from "dayjs";
import type { Court } from "@redux/api/court/type";
import type { Feedback } from "@redux/api/feedback/type";

const CourtDetail: React.FC = () => {
  const navigate = useNavigate();
  const { courtId } = useParams<{ courtId: string }>();
  const courtIdNum = Number(courtId);

  const { data: courtEnvelope, isLoading, isError, error } = useGetCourtQuery(courtId || "", {
    skip: !courtId || isNaN(courtIdNum) || courtIdNum <= 0,
  });

  const court: Court | undefined = courtEnvelope?.data;

  const { data: ratingData, isLoading: ratingLoading, isError: ratingError, error: ratingErrorDetails } = useGetAverageRatingByCourtQuery(
    {
      courtId: courtIdNum,
      params: { Page: 1, PageSize: 5, SortBy: "createat", SortOrder: "desc" },
    },
    { skip: !courtId || isNaN(courtIdNum) || courtIdNum <= 0 }
  );

  const averageRating = ratingData?.data?.averageRating ?? 0;
  const totalFeedbacks = ratingData?.data?.totalFeedbacks ?? 0;

  const { data: feedbackData, isLoading: feedbackLoading, isError: feedbackError, error: feedbackErrorDetails } = useGetFeedbacksByCourtQuery(
    {
      courtId: courtIdNum,
      params: { Page: 1, PageSize: 5, SortBy: "createat", SortOrder: "desc" },
    },
    { skip: !courtId || isNaN(courtIdNum) || courtIdNum <= 0 }
  );

  React.useEffect(() => {
    if (ratingError && ratingErrorDetails) {
      console.error("Rating Error:", ratingErrorDetails);
    }
    if (feedbackError && feedbackErrorDetails) {
      console.error("Feedback Error:", feedbackErrorDetails);
    }
  }, [courtIdNum, ratingData, feedbackData, ratingError, ratingErrorDetails, feedbackError, feedbackErrorDetails]);

  const feedbacks: Feedback[] = Array.isArray(feedbackData?.data)
    ? feedbackData.data
    : (feedbackData?.data as any)?.items || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100/60 flex items-center justify-center">
        <div className="text-center text-gray-600 text-lg">
          <LoadingSpinner inline size="6" />
          Đang tải thông tin sân...
        </div>
      </div>
    );
  }

  if (isError || !court) {
    return (
      <div className="min-h-screen bg-slate-100/60 flex items-center justify-center">
        <div className="text-center text-red-500 text-lg">
          Lỗi khi tải thông tin sân hoặc sân không tồn tại.{" "}
          {isError && error && "status" in error
            ? `Mã lỗi: ${error.status}`
            : "Vui lòng thử lại."}
        </div>
      </div>
    );
  }

  const formatPrice = (price: number): string =>
    new Intl.NumberFormat("vi-VN").format(price);

  const generateTimeSlots = (startDate?: string, endDate?: string): string[] => {
    if (!startDate || !endDate) return [];
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const slots: string[] = [];
    let current = start;

    while (current.isBefore(end)) {
      const next = current.add(1, "hour");
      slots.push(`${current.format("HH:mm")} - ${next.format("HH:mm")}`);
      current = next;
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(court.startDate, court.endDate);

  const handleBookNow = () => {
    navigate(`/Court/booking/${courtId}`);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 py-10">
      <div className="mx-auto max-w-5xl px-5 max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header with Images */}
          <div className="relative h-64 md:h-96">
            {court.imageUrls && court.imageUrls.length > 0 ? (
              <img
                src={court.imageUrls[0]}
                alt={court.name ?? court.location}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/300x150";
                  console.log("Image failed to load, using fallback");
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <ImageIcon className="w-20 h-20 text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {court.name ?? court.location}
              </h1>
              <p className="text-lg text-gray-200 flex items-center gap-2 mt-2">
                <MapPin className="w-5 h-5" />
                {court.location}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
            {/* Left Column: Details */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Thông Tin Chi Tiết
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <List className="w-5 h-5 text-[#1e9ea1]" />
                    <div>
                      <p className="text-sm text-gray-600">Tên sân</p>
                      <p className="font-medium">{court.name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#1e9ea1]" />
                    <div>
                      <p className="text-sm text-gray-600">Chủ sở hữu</p>
                      <p className="font-medium">{court.ownerName || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#1e9ea1]" />
                    <div>
                      <p className="text-sm text-gray-600">Vị trí</p>
                      <p className="font-medium">{court.location || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <List className="w-5 h-5 text-[#1e9ea1]" />
                    <div>
                      <p className="text-sm text-gray-600">Tiện ích</p>
                      <div className="flex flex-wrap gap-2">
                        {court.utilities && court.utilities.length > 0 ? (
                          court.utilities.map((util, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700"
                            >
                              {util}
                            </span>
                          ))
                        ) : (
                          <p className="font-medium text-gray-600">N/A</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-[#1e9ea1]" />
                    <div>
                      <p className="text-sm text-gray-600">Giá mỗi giờ</p>
                      <p className="font-medium">
                        {court.pricePerHour ? formatPrice(court.pricePerHour) : "N/A"} ₫
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#1e9ea1]" />
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái</p>
                      <p className="font-medium capitalize">{court.status || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#1e9ea1]" />
                    <div>
                      <p className="text-sm text-gray-600">Thời gian hoạt động</p>
                      <p className="font-medium">
                        {court.startDate ? formatDateShort(court.startDate) : "N/A"} -{" "}
                        {court.endDate ? formatDateShort(court.endDate) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Mô Tả</h3>
                <p className="text-gray-600">
                  Sân cầu lông chất lượng cao với vị trí thuận tiện.{" "}
                  {court.isActive ? "Hiện đang mở cửa." : "Tạm thời đóng cửa."} Ưu tiên:{" "}
                  {court.priority || "N/A"}.
                </p>
              </div>

              {/* Feedback Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Đánh Giá</h3>
                {ratingLoading || feedbackLoading ? (
                  <div className="text-center text-gray-600">
                    <LoadingSpinner inline size="6" />
                    Đang tải đánh giá...
                  </div>
                ) : ratingError || feedbackError ? (
                  <p className="text-red-500">
                    Lỗi khi tải đánh giá.{" "}
                    {ratingError && ratingErrorDetails && "status" in ratingErrorDetails
                      ? `Mã lỗi (Rating): ${ratingErrorDetails.status}`
                      : feedbackError && feedbackErrorDetails && "status" in feedbackErrorDetails
                      ? `Mã lỗi (Feedback): ${feedbackErrorDetails.status}`
                      : "Vui lòng thử lại."}
                  </p>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      <p className="text-lg font-medium text-gray-800">
                        {averageRating.toFixed(1)} / 5 ({totalFeedbacks} đánh giá)
                      </p>
                    </div>
                    {feedbacks.length > 0 ? (
                      <div className="space-y-4">
                        {feedbacks.map((feedback) => (
                          <div key={feedback.id} className="border-b border-gray-200 pb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-800">
                                {feedback.userName || "Ẩn danh"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <p className="text-sm text-gray-600">{feedback.rating} / 5</p>
                            </div>
                            <p className="text-sm text-gray-600">{feedback.comment}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {dayjs(feedback.createat).format("DD/MM/YYYY HH:mm")}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">Chưa có đánh giá nào cho sân này.</p>
                    )}
                  </>
                )}
              </div>

              {/* Images Gallery */}
              {court.imageUrls && court.imageUrls.length > 1 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Hình Ảnh</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {court.imageUrls.slice(1).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Hình ảnh sân ${index + 1}`}
                        className="w-full h-32 md:h-40 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/150";
                          console.log(`Gallery image ${index + 1} failed to load`);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Booking */}
            <div className="md:col-span-1">
              <div className="sticky top-6 bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Đặt Sân</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Tổng giá</span>
                    <span className="font-medium">
                      {court.pricePerHour ? formatPrice(court.pricePerHour) : "N/A"} ₫
                    </span>
                  </div>
                  <button
                    onClick={handleBookNow}
                    className="w-full bg-gradient-to-r from-[#2ebabc] to-[#21a5a9] text-white py-3 rounded-lg font-medium hover:brightness-95 transition"
                  >
                    Đặt Ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtDetail;