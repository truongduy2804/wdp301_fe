import React, { useState, useRef } from "react";
import { Clock, Users, Shield, Send, ChevronDown } from "lucide-react";
import LoadingSpinner from "@components/Loading_Spinner";
import { useClickOutside } from "@hooks/useClickOutSide";
import { areas, contactInfo } from "./data";
import type { InfoCardProps, ContactFormData, Area } from "./data";
import endPoint from "@routes/router";

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, children }) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden transform transition-transform duration-300">
    <div className="bg-teal-600/80 p-2">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
          {icon}
        </div>
        <h3 className="font-semibold text-white text-lg">{title}</h3>
      </div>
    </div>
    <div className="px-4 py-2 text-center text-slate-700 text-sm md:text-base">
      {children}
    </div>
  </div>
);

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    area: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [open, setOpen] = useState(false);
  useClickOutside(dropdownRef, () => setOpen(false));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        area: "",
      });
      setSelectedArea(null);
    }, 3000);
  };

  return (
    <div className="bg-gray-100">
      <div className="mx-auto px-4 sm:px-6 lg:px-50 py-8 sm:pt-8 sm:pb-10">
        <div className="grid lg:grid-cols-[1.75fr_4.25fr] gap-8">
          {/* Left Contact Info */}
          <div className="space-y-4">
            {contactInfo.map((info, idx) => (
              <InfoCard key={idx} icon={info.icon} title={info.title}>
                {info.content}
              </InfoCard>
            ))}

            {/* Working Hours */}
            <div className="bg-white rounded-xl shadow-lg px-6 py-3">
              <h3 className="font-semibold text-lg text-slate-800 mb-3 flex items-center">
                <Clock className="w-5 h-5 text-teal-500 mr-2" />
                Giờ Làm Việc
              </h3>
              <div className="space-y-2 text-sm ">
                {[
                  { day: "Thứ Hai - Thứ Sáu", time: "8:00 - 18:00" },
                  { day: "Thứ Bảy", time: "9:00 - 17:00" },
                  { day: "Chủ Nhật", time: "Nghỉ" },
                ].map((d, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-slate-600">{d.day}</span>
                    <span className="text-slate-800 font-medium">{d.time}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-3">
                  <span className="text-slate-600">Hotline Hỗ Trợ</span>
                  <span className="text-teal-600 font-medium">
                    8:00 - 22:00 (Hàng ngày)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden grid md:grid-cols-10">
            {/* Left Panel */}
            <div className="bg-teal-600 p-6 flex flex-col md:col-span-4 justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2.5">
                  Gửi Thông Tin Liên Hệ
                </h2>
                <p className="text-teal-100 mb-4">
                  Hãy điền thông tin vào form bên cạnh, chúng tôi sẽ liên hệ lại
                  với bạn trong thời gian sớm nhất.
                </p>

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">
                        Hỗ Trợ Khách Hàng
                      </h4>
                      <p className="text-teal-100 text-sm">
                        Chúng tôi luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-14 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">
                        Phản Hồi Nhanh Chóng
                      </h4>
                      <p className="text-teal-100 text-sm">
                        Chúng tôi sẽ phản hồi trong vòng 24h làm việc.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-14 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">
                        Bảo Mật Thông Tin
                      </h4>
                      <p className="text-teal-100 text-sm">
                        Thông tin của bạn sẽ được bảo mật tuyệt đối.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hình minh họa */}
              <div className="mt-8">
                <img
                  src="https://media.istockphoto.com/id/1141639313/photo/contact-us-woman-hand-holding-icon-customer-support-concept-copy-space.webp?a=1&b=1&s=612x612&w=0&k=20&c=uHMhTY07k5rIjtT03ep9MXH9zZqXDU2WtsgyOP1vl2I="
                  alt="Contact"
                  className="w-full rounded-lg"
                />
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="p-6 sm:p-8 md:col-span-6">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Họ tên + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <span className="text-red-500">*</span> Họ và tên
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 sm:px-4 sm:py-1.5 border border-slate-300 rounded-lg focus:ring-1 hover:border-teal-500/50 focus:ring-teal-500 focus:outline-none text-sm sm:text-base"
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <span className="text-red-500">*</span> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 sm:px-4 sm:py-1.5 border border-slate-300 rounded-lg focus:ring-1 hover:border-teal-500/50 focus:ring-teal-500 focus:outline-none text-sm sm:text-base"
                      placeholder="Nhập địa chỉ email"
                      required
                    />
                  </div>
                </div>

                {/* Số điện thoại + Khu vực */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 sm:px-4 sm:py-1.5 border border-slate-300 rounded-lg focus:ring-1 hover:border-teal-500/50 focus:ring-teal-500 focus:outline-none text-sm sm:text-base"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  {/* Dropdown Khu Vực */}
                  <div className="relative w-full" ref={dropdownRef}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Chủ đề
                    </label>
                    <button
                      type="button"
                      onClick={() => setOpen(!open)}
                      className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm  hover:border-teal-500/50 focus:ring-1 focus:outline-none focus:ring-teal-500 transition-all"
                    >
                      <span>
                        {selectedArea ? selectedArea.label : "Chọn chủ đề"}
                      </span>
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
                            setFormData((prev) => ({
                              ...prev,
                              area: area.value,
                            }));
                            setOpen(false);
                          }}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                            selectedArea?.value === area.value
                              ? "bg-[#1e9ea1]/20 text-[#1e9ea1] font-medium"
                              : "text-gray-800"
                          }`}
                        >
                          {area.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Nội dung */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <span className="text-red-500">*</span> Nội dung
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-slate-300 rounded-lg focus:ring-1 hover:border-teal-500/50 focus:ring-teal-500 focus:border-teal-500 focus:outline-none text-sm sm:text-base"
                    placeholder="Nhập nội dung tin nhắn"
                    required
                  />
                </div>

                {/* Checkbox */}
                <div className="flex items-center text-sm text-slate-600">
                  <input
                    type="checkbox"
                    required
                    className="mr-2 mb-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <p>
                    Tôi đồng ý với{" "}
                    <a
                      href={endPoint.PRIVACYPOLICY}
                      className="text-teal-600 hover:brightness-75 font-medium hover:underline"
                    >
                      chính sách bảo mật
                    </a>{" "}
                    của Get Sport!
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:brightness-90 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 hover:scale-[1.02] disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner color="white" size="6" inline />
                      <span>Đang gửi...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Gửi Tin Nhắn
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
