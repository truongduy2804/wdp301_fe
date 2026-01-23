import { MapPin, Phone, Mail } from "lucide-react";

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  area?: string;
}

export interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export interface Area {
  value: string;
  label: string;
}

export const areas: Area[] = [
  { value: "support", label: "Hỗ trợ khách hàng" },
  { value: "business", label: "Hợp tác kinh doanh" },
  { value: "technical", label: "Hỗ trợ kỹ thuật" },
  { value: "feedback", label: "Góp ý/Phản hồi" },
  { value: "other", label: "Khác" },
];

export const contactInfo = [
  {
    icon: <MapPin className="w-4.5 h-4.5 text-white" />,
    title: "Địa Chỉ Văn Phòng",
    content: (
      <>
        <p className="text-slate-700 text-sm md:text-base leading-relaxed">
          123 Đường Long Thành Mỹ, Thủ Đức, TP Hồ Chí Minh
        </p>
        <button className="mt-1 text-teal-500 text-sm md:text-base font-medium hover:brightness-75 hover:underline hover:translate-x-1 transition-transform duration-200">
          Xem Bản Đồ →
        </button>
      </>
    ),
  },
  {
    icon: <Phone className="w-4.5 h-4.5 text-white" />,
    title: "Điện Thoại",
    content: (
      <>
        <p className="text-slate-700 text-sm md:text-base mb-1">
          Tổng đài CSKH: 098 320 642 85
        </p>
        <p className="text-slate-700 text-sm md:text-base mb-1">
          Hotline: 0902 967 285
        </p>
      </>
    ),
  },
  {
    icon: <Mail className="w-4.5 h-4.5 text-white" />,
    title: "Email",
  content: (
  <div className="text-center">
    <div className="flex justify-center items-center gap-2 text-sm md:text-base">
      <p className="text-slate-700">CSKH:</p>
      <p className="text-teal-600 font-medium">GSSupport@gmail.com</p>
    </div>
    <div className="flex justify-center items-center gap-2 text-sm md:text-base mt-2 mb-1">
      <p className="text-slate-700">Hợp tác:</p>
      <p className="text-teal-600 font-medium">GSBusiness@gmail.com</p>
    </div>
    <p className="text-xs md:text-sm text-slate-500 mt-2">
      Phản hồi trong 24h làm việc
    </p>
  </div>
),

  },
];
