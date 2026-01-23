import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/features/auth/authSlice";
import { useCheckPaymentStatusQuery } from "@redux/api/booking/courtBookingApi";
import LoadingSpinner from "@components/Loading_Spinner";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const BookingCallback: React.FC = () => {
  const { accessToken } = useSelector(selectAuth);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const bookingId = query.get("bookingId");
  const isCancel = location.pathname.includes("cancel");
  const courtId = localStorage.getItem("lastCourtId");

  useEffect(() => {
    if (!accessToken) {
      const redirectUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth?view=login&redirect=${redirectUrl}`);
    }
  }, [accessToken, navigate, location]);

  // Fetch payment status
  const {
    data: paymentStatusData,
    isLoading: statusLoading,
    error: statusError,
  } = useCheckPaymentStatusQuery(Number(bookingId), {
    skip: !bookingId || isNaN(Number(bookingId)) || !accessToken,
  });

  const paymentStatus = paymentStatusData?.status;

  if (!bookingId || isNaN(Number(bookingId))) {
    return (
      <div className="min-h-screen bg-slate-100/60 flex items-center justify-center">
        <div className="text-center text-red-500 text-lg">ID đặt sân không hợp lệ.</div>
      </div>
    );
  }

  // Handle loading state
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-slate-100/60 flex items-center justify-center">
        <div className="text-center text-gray-600 text-lg">
          <LoadingSpinner inline /> Đang kiểm tra trạng thái thanh toán...
        </div>
      </div>
    );
  }

  // Handle error state
  if (statusError) {
    return (
      <div className="min-h-screen bg-slate-100/60 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lỗi Thanh Toán</h2>
          <p className="text-gray-600 mb-6">
            {(statusError as any)?.data?.Message || "Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại."}
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate(courtId ? `/Court/booking/${courtId}` : "/")}
              className="w-full bg-gradient-to-r from-[#2ebabc] to-[#21a5a9] text-white py-3 rounded-lg font-medium hover:brightness-95 transition"
            >
              {courtId ? "Thử Lại" : "Về Trang Chủ"}
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle payment status
  const renderStatusContent = () => {
    if (isCancel || paymentStatus === "CANCELLED") {
      return (
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thanh Toán Bị Hủy</h2>
          <p className="text-gray-600 mb-6">Đặt sân của bạn đã bị hủy. Vui lòng thử lại nếu bạn muốn tiếp tục.</p>
          <div className="space-y-4">
            <button
              onClick={() => navigate(courtId ? `/Court/booking/${courtId}` : "/")}
              className="w-full bg-gradient-to-r from-[#2ebabc] to-[#21a5a9] text-white py-3 rounded-lg font-medium hover:brightness-95 transition"
            >
              {courtId ? "Thử Lại" : "Về Trang Chủ"}
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      );
    }

    if (paymentStatus === "Success") {
      return (
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thanh Toán Thành Công</h2>
          <p className="text-gray-600 mb-6">Đặt sân của bạn đã được xác nhận. Cảm ơn bạn đã sử dụng dịch vụ!</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-[#2ebabc] to-[#21a5a9] text-white py-3 rounded-lg font-medium hover:brightness-95 transition"
          >
            Về Trang Chủ
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Trạng Thái Không Xác Định</h2>
        <p className="text-gray-600 mb-6">Không thể xác định trạng thái thanh toán. Vui lòng liên hệ hỗ trợ.</p>
        <div className="space-y-4">
          <button
            onClick={() => navigate(courtId ? `/Court/booking/${courtId}` : "/")}
            className="w-full bg-gradient-to-r from-[#2ebabc] to-[#21a5a9] text-white py-3 rounded-lg font-medium hover:brightness-95 transition"
          >
            {courtId ? "Thử Lại" : "Về Trang Chủ"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Về Trang Chủ
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex items-center justify-center">
      {renderStatusContent()}
    </div>
  );
};

export default BookingCallback;