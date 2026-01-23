import {
  Play,
  Users,
  MapPin,
  Smartphone,
  Globe,
  Award,
  Zap,
} from "lucide-react";

export interface TimelineItem {
  id: number;
  year: string;
  quarter?: string;
  title: string;
  description: string;
  highlight: string;
  icon: React.ReactNode;
  stats?: {
    label: string;
    value: string;
  }[];
  image?: string;
  achievements?: string[];
}

export const timelineData: TimelineItem[] = [
  {
    id: 1,
    year: "2025",
    quarter: "Q1",
    title: "Khởi Đầu Ý Tưởng",
    description:
      "Nhận thức được nhu cầu đặt sân cầu lông trực tuyến tại Việt Nam. Bắt đầu nghiên cứu thị trường và xây dựng kế hoạch phát triển sản phẩm.",
    highlight: "Ý tưởng ra đời",
    icon: <Play className="w-6 h-6" />,
    stats: [
      { label: "Nghiên cứu thị trường", value: "3 tháng" },
      { label: "Khảo sát người dùng", value: "500+" },
    ],
    achievements: [
      "Hoàn thành nghiên cứu thị trường",
      "Thu thập feedback từ 500+ người chơi",
      "Xây dựng bản kế hoạch sản phẩm đầu tiên",
    ],
  },
  {
    id: 2,
    year: "2025",
    quarter: "Q3",
    title: "Phát Triển MVP",
    description:
      "Xây dựng phiên bản đầu tiên của nền tảng với các tính năng cơ bản: tìm kiếm sân, đặt lịch trực tuyến và thanh toán điện tử.",
    highlight: "Sản phẩm đầu tiên",
    icon: <Smartphone className="w-6 h-6" />,
    stats: [
      { label: "Tính năng cốt lõi", value: "5" },
      { label: "Thời gian phát triển", value: "8 tháng" },
    ],
    achievements: [
      "Ra mắt MVP",
      "Tích hợp 3 phương thức thanh toán",
      "UI/UX thân thiện người dùng",
    ],
  },
  {
    id: 3,
    year: "2026",
    quarter: "Q2",
    title: "Mở Rộng Đối Tác",
    description:
      "Hợp tác với 50+ sân cầu lông đầu tiên tại TP.HCM và Hà Nội. Xây dựng mạng lưới đối tác vững chắc để phục vụ người dùng.",
    highlight: "Mở rộng mạng lưới",
    icon: <MapPin className="w-6 h-6" />,
    stats: [
      { label: "Đối tác sân", value: "50+" },
      { label: "Thành phố", value: "2" },
    ],
    achievements: [
      "50+ sân cầu lông tham gia",
      "Phủ sóng 2 thành phố lớn",
      "Hệ thống quản lý đối tác",
    ],
  },
  {
    id: 4,
    year: "2026",
    quarter: "Q4",
    title: "Cộng Đồng Phát Triển",
    description:
      "Đạt được 10,000+ người dùng đăng ký. Xây dựng tính năng cộng đồng, cho phép người chơi kết nối và tổ chức giải đấu.",
    highlight: "10K+ người dùng",
    icon: <Users className="w-6 h-6" />,
    stats: [
      { label: "Người dùng hoạt động", value: "10K+" },
      { label: "Lượt đặt sân/tháng", value: "5K+" },
    ],
    achievements: [
      "Cộng đồng 10K+ thành viên",
      "Tính năng tạo nhóm chơi",
      "Hệ thống rating người chơi",
    ],
  },
  {
    id: 5,
    year: "2027",
    quarter: "Q2",
    title: "Tính Năng Thông Minh",
    description:
      "Tích hợp AI để gợi ý sân phù hợp, dự đoán thời gian rảnh và tối ưu hóa trải nghiệm đặt sân dựa trên thói quen người dùng.",
    highlight: "AI & Machine Learning",
    icon: <Zap className="w-6 h-6" />,
    stats: [
      { label: "Độ chính xác gợi ý", value: "92%" },
      { label: "Tiết kiệm thời gian", value: "70%" },
    ],
    achievements: [
      "AI gợi ý thông minh",
      "Tối ưu trải nghiệm người dùng",
      "Học máy dự đoán nhu cầu",
    ],
  },
  {
    id: 6,
    year: "2027",
    quarter: "Q3",
    title: "Mở Rộng Toàn Quốc",
    description:
      "Phủ sóng 63 tỉnh thành với 1000+ sân đối tác. Trở thành nền tảng đặt sân cầu lông hàng đầu Việt Nam.",
    highlight: "Toàn quốc",
    icon: <Globe className="w-6 h-6" />,
    stats: [
      { label: "Sân đối tác", value: "1000+" },
      { label: "Tỉnh thành", value: "63" },
    ],
    achievements: [
      "Phủ sóng toàn quốc",
      "1000+ đối tác",
      "Thị phần #1 Việt Nam",
    ],
  },
  {
    id: 7,
    year: "2028",
    quarter: "Q1",
    title: "Tương Lai Số",
    description:
      "Ra mắt tính năng AR để xem sân 360°, tích hợp IoT theo dõi hoạt động chơi và phát triển hệ sinh thái thể thao toàn diện.",
    highlight: "Công nghệ tiên tiến",
    icon: <Award className="w-6 h-6" />,
    stats: [
      { label: "Công nghệ AR/VR", value: "100%" },
      { label: "IoT Integration", value: "50%" },
    ],
    achievements: [
      "Công nghệ AR/VR",
      "Hệ sinh thái IoT",
      "Nền tảng thể thao tương lai",
    ],
  },
];
