import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, DollarSign, MapPin, CreditCard, Wallet } from "lucide-react";
import { useGetCourtQuery } from "@redux/api/court/courtApi";
import { useGetSlotsByCourtAndDateQuery } from "@redux/api/courtSlot/courtSlotApi";
import { useCreateCourtBookingMutation } from "@redux/api/booking/courtBookingApi";
import type { Court } from "@redux/api/court/type";
import type { CourtSlot } from "@redux/api/courtSlot/type";
import LoadingSpinner from "@components/Loading_Spinner";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/features/auth/authSlice";
import { toast } from "react-toastify";

const CourtBookingPay: React.FC = () => {
  const { courtId } = useParams<{ courtId: string }>();
  const { accessToken } = useSelector(selectAuth);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<'PayOS' | 'Wallet'>('PayOS'); 

  useEffect(() => {
    if (!accessToken) {
      const redirectUrl = `/Court/booking/${courtId}`;
      navigate(`/auth?view=login&redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [accessToken, courtId, navigate]);

  const { data: courtData, isLoading: courtLoading, isError: courtError } = useGetCourtQuery(Number(courtId), {
    skip: !courtId || !accessToken,
  });
  const { data: slotsData, isLoading: slotsLoading } = useGetSlotsByCourtAndDateQuery(
    { courtId: Number(courtId), date: selectedDate },
    { skip: !courtId || !selectedDate || !accessToken }
  );
  const [createCourtBooking, { isLoading: bookingLoading, error: bookingError }] = useCreateCourtBookingMutation();

  const court: Court | undefined = courtData?.data;
  const slots: CourtSlot[] = Array.isArray(slotsData?.data) ? slotsData.data : (slotsData?.data as any)?.items || [];

  if (!courtId || isNaN(Number(courtId))) {
    return (
      <div className="min-h-screen bg-slate-100/60 flex items-center justify-center">
        <div className="text-center text-red-500 text-lg">ID sân không hợp lệ.</div>
      </div>
    );
  }

  if (courtLoading) {
    return (
      <div className="min-h-screen bg-slate-100/60 flex items-center justify-center">
        <div className="text-center text-gray-600 text-lg">
          <LoadingSpinner inline />
          Đang tải thông tin sân...
        </div>
      </div>
    );
  }

  if (courtError || !court) {
    return (
      <div className="min-h-screen bg-slate-100/60 flex items-center justify-center">
        <div className="text-center text-red-500 text-lg">Lỗi khi tải thông tin sân.</div>
      </div>
    );
  }

  const formatPrice = (price: number): string => new Intl.NumberFormat("vi-VN").format(price);
  const formatTime = (time: string): string => dayjs(time).format("HH:mm");

  const handleBooking = async () => {
    if (!accessToken) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!selectedSlotId) {
      toast.error("Vui lòng chọn khung giờ.");
      return;
    }

    const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
    if (!selectedSlot) {
      toast.error("Khung giờ không hợp lệ.");
      return;
    }

    const duration = (new Date(selectedSlot.endTime).getTime() - new Date(selectedSlot.startTime).getTime()) / 3600000;
    const amount = duration * court.pricePerHour;

    try {
      const bookingData = {
        courtId: Number(courtId),
        slotId: selectedSlotId,
        bookingdate: selectedDate, // ✅ Gửi string YYYY-MM-DD
        amount,
        voucherCode: voucherCode || undefined,
        paymentMethod, // ✅ GỬI PHƯƠNG THỨC THANH TOÁN
      };

      const response = await createCourtBooking(bookingData).unwrap();

      if (paymentMethod === 'PayOS' && response.paymentLink) {
        // ✅ PAYOS: Chuyển hướng
        toast.success("Chuyển đến PayOS để thanh toán!");
        window.location.href = response.paymentLink;
      } else {
        // ✅ WALLET: Thành công ngay
        toast.success("Đặt sân thành công bằng ví!");
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error?.data?.message || "Lỗi khi đặt sân. Vui lòng thử lại.");
    }
  };

  const selectedSlot = selectedSlotId ? slots.find((slot) => slot.id === selectedSlotId) : null;
  const totalAmount = selectedSlot 
    ? ((new Date(selectedSlot.endTime).getTime() - new Date(selectedSlot.startTime).getTime()) / 3600000) * court.pricePerHour 
    : 0;

  return (
    <div className="min-h-screen bg-slate-100/60 py-10">
      <div className="mx-auto max-w-5xl px-5">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Đặt Sân: {court.location}</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column: Court Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thông Tin Sân</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#1e9ea1]" />
                    <div>
                      <p className="text-sm text-gray-600">Vị trí</p>
                      <p className="font-medium">{court.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-[#1e9ea1]" />
                    <div>
                      <p className="text-sm text-gray-600">Giá mỗi giờ</p>
                      <p className="font-medium">{formatPrice(court.pricePerHour)} ₫</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Chọn Ngày</h2>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#1e9ea1]" />
                  <input
                    type="date"
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1e9ea1] focus:border-[#1e9ea1]"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={dayjs().format("YYYY-MM-DD")}
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Chọn Khung Giờ</h2>
                {slotsLoading ? (
                  <div className="text-gray-600"><LoadingSpinner inline /> Đang tải khung giờ...</div>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`p-3 rounded-lg border text-center transition ${
                          slot.id === selectedSlotId
                            ? "bg-teal-100 border-teal-500 text-teal-700"
                            : slot.isAvailable
                            ? "border-gray-300 hover:bg-teal-50"
                            : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!slot.isAvailable}
                      >
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Không có khung giờ khả dụng cho ngày này.</p>
                )}
              </div>

              {/* Voucher Code */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mã Giảm Giá</h2>
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá (nếu có)"
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1e9ea1] focus:border-[#1e9ea1]"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                />
              </div>
            </div>

            {/* Right Column: Booking Summary */}
            <div className="md:col-span-1">
              <div className="sticky top-6 bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Tóm Tắt Đặt Sân</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Sân</span>
                    <span className="font-medium">{court.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ngày</span>
                    <span className="font-medium">{dayjs(selectedDate).format("DD/MM/YYYY")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Khung giờ</span>
                    <span className="font-medium">
                      {selectedSlotId
                        ? slots.find((s) => s.id === selectedSlotId)
                          ? `${formatTime(slots.find((s) => s.id === selectedSlotId)!.startTime)} - ${formatTime(slots.find((s) => s.id === selectedSlotId)!.endTime)}`
                          : "Chưa chọn"
                        : "Chưa chọn"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-lg">
                    <span>Tổng tiền</span>
                    <span className="text-[#1e9ea1]">
                      {totalAmount ? formatPrice(totalAmount) + " ₫" : "Chưa chọn"}
                    </span>
                  </div>

                  {/* ✅ PHƯƠNG THỨC THANH TOÁN */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Phương thức thanh toán</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => setPaymentMethod('PayOS')}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          paymentMethod === 'PayOS'
                            ? 'bg-gradient-to-r from-[#2ebabc] to-[#21a5a9] text-white border-[#1e9ea1]'
                            : 'border-gray-300 hover:border-[#1e9ea1]'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>PayOS (Thẻ, ví điện tử)</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('Wallet')}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          paymentMethod === 'Wallet'
                            ? 'bg-gradient-to-r from-[#2ebabc] to-[#21a5a9] text-white border-[#1e9ea1]'
                            : 'border-gray-300 hover:border-[#1e9ea1]'
                        }`}
                      >
                        <Wallet className="w-4 h-4" />
                        <span>Ví của tôi (Nhanh chóng)</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading || !selectedSlotId}
                    className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
                      bookingLoading || !selectedSlotId
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#2ebabc] to-[#21a5a9] hover:brightness-95 hover:shadow-lg"
                    }`}
                  >
                    {bookingLoading ? (
                      <LoadingSpinner inline />
                    ) : (
                      <>
                        {paymentMethod === 'PayOS' ? 'Thanh Toán Qua PayOS' : 'Đặt Sân Bằng Ví'}
                        <span className="ml-2 text-sm">({formatPrice(totalAmount)} ₫)</span>
                      </>
                    )}
                  </button>

                  {bookingError && (
                    <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                      {(bookingError as any)?.data?.message || "Lỗi khi đặt sân. Vui lòng thử lại."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtBookingPay;