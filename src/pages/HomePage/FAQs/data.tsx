import {
  MessageCircle,
  Clock,
  Users,
  MapPin,
  CreditCard,
  Shield,
  Calendar,
  Receipt,
  KeyRound,
  LogIn,
  Gift,
  Languages,
  Headphones,
  Smartphone,
  UserPlus,
  AlertCircle,
  Heart,
  Star,
} from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

interface FAQCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
}

export const categories: FAQCategory[] = [
  {
    name: "all",
    icon: <MessageCircle className="w-5 h-5" />,
    color: "bg-teal-500",
  },
  {
    name: "booking",
    icon: <Clock className="w-5 h-5" />,
    color: "bg-blue-500",
  },
  {
    name: "payment",
    icon: <CreditCard className="w-5 h-5" />,
    color: "bg-green-500",
  },
  {
    name: "court",
    icon: <MapPin className="w-5 h-5" />,
    color: "bg-purple-500",
  },
  {
    name: "account",
    icon: <Users className="w-5 h-5" />,
    color: "bg-orange-500",
  },
  {
    name: "security",
    icon: <Shield className="w-5 h-5" />,
    color: "bg-red-500",
  },
  {
    name: "service",
    icon: <Gift className="w-5 h-5" />,
    color: "bg-pink-500",
  },
  {
    name: "support",
    icon: <Headphones className="w-5 h-5" />,
    color: "bg-cyan-500",
  },
];

export const faqs: FAQ[] = [
  {
    id: 1,
    question: "Làm thế nào để đặt sân cầu lông?",
    answer:
      "Để đặt sân cầu lông, bạn có thể: 1) Đăng nhập vào tài khoản của mình, 2) Chọn địa điểm và thời gian mong muốn, 3) Xem các sân còn trống, 4) Chọn sân phù hợp và xác nhận đặt chỗ, 5) Thanh toán để hoàn tất đặt sân. Toàn bộ quy trình chỉ mất vài phút. Bạn cũng có thể lưu địa điểm yêu thích để đặt nhanh trong những lần tiếp theo.",
    category: "booking",
    icon: <Clock className="w-6 h-6 text-blue-500" />,
  },
  {
    id: 2,
    question: "Có thể hủy đặt sân không? Chính sách hoàn tiền như thế nào?",
    answer:
      "Bạn có thể hủy đặt sân trước 2 giờ so với giờ chơi để được hoàn 100% tiền. Hủy trong vòng 2 giờ sẽ bị tính phí 50%. Việc hủy có thể thực hiện dễ dàng qua ứng dụng hoặc website. Hệ thống cũng sẽ gửi thông báo xác nhận khi hủy thành công để bạn yên tâm.",
    category: "booking",
    icon: <Clock className="w-6 h-6 text-blue-500" />,
  },
  {
    id: 3,
    question: "Các phương thức thanh toán được hỗ trợ?",
    answer:
      "Chúng tôi hỗ trợ đa dạng phương thức thanh toán: Ví điện tử (MoMo, ZaloPay, VNPay), Thẻ tín dụng/ghi nợ (Visa, Mastercard), Chuyển khoản ngân hàng, và thanh toán tại chỗ (tùy địa điểm). Bạn có thể lưu phương thức thanh toán yêu thích để thanh toán nhanh trong lần đặt sân tiếp theo.",
    category: "payment",
    icon: <CreditCard className="w-6 h-6 text-green-500" />,
  },
  {
    id: 4,
    question: "Làm sao để tìm sân gần nhất?",
    answer:
      "Hệ thống sẽ tự động định vị vị trí của bạn và hiển thị các sân cầu lông gần nhất. Bạn cũng có thể tìm kiếm theo quận/huyện hoặc nhập địa chỉ cụ thể để tìm sân phù hợp. Ngoài ra, các sân còn hiển thị đánh giá, hình ảnh và tiện ích để bạn lựa chọn dễ dàng hơn.",
    category: "court",
    icon: <MapPin className="w-6 h-6 text-purple-500" />,
  },
  {
    id: 5,
    question: "Có cần tạo tài khoản để đặt sân không?",
    answer:
      "Có, bạn cần tạo tài khoản để đặt sân. Việc tạo tài khoản hoàn toàn miễn phí và giúp bạn theo dõi lịch sử đặt sân, quản lý thông tin cá nhân, nhận ưu đãi đặc biệt và đặt sân nhanh chóng hơn trong những lần tiếp theo.",
    category: "account",
    icon: <Users className="w-6 h-6 text-orange-500" />,
  },
  {
    id: 6,
    question: "Thông tin cá nhân có được bảo mật không?",
    answer:
      "Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn với công nghệ mã hóa SSL 256-bit và tuân thủ nghiêm ngặt các quy định về bảo mật dữ liệu. Thông tin của bạn chỉ được sử dụng để phục vụ dịch vụ đặt sân và sẽ không chia sẻ với bên thứ 3 trái phép.",
    category: "security",
    icon: <Shield className="w-6 h-6 text-red-500" />,
  },
  {
    id: 7,
    question: "Sân có sẵn vợt và cầu không?",
    answer:
      "Một số sân cung cấp dịch vụ cho thuê vợt và cầu với phí bổ sung. Bạn có thể xem thông tin chi tiết về tiện ích và dịch vụ của từng sân trong phần mô tả khi đặt chỗ. Nếu cần, bạn có thể đặt trước để chắc chắn sân có đủ dụng cụ khi đến chơi.",
    category: "court",
    icon: <MapPin className="w-6 h-6 text-purple-500" />,
  },
  {
    id: 8,
    question: "Có thể đặt sân cho nhiều người chơi không?",
    answer:
      "Có, bạn có thể đặt sân cho đôi hoặc nhóm. Khi đặt sân, hãy chọn số lượng người chơi phù hợp. Một số sân cũng hỗ trợ đặt nhiều sân cùng lúc cho giải đấu hoặc sự kiện lớn. Hệ thống sẽ tính toán và gợi ý sân phù hợp với số lượng người chơi bạn nhập.",
    category: "booking",
    icon: <Clock className="w-6 h-6 text-blue-500" />,
  },
  {
    id: 9,
    question: "Tôi có thể đặt sân định kỳ hàng tuần không?",
    answer:
      "Có, hệ thống hỗ trợ đặt sân định kỳ theo tuần hoặc theo tháng. Bạn chỉ cần chọn tùy chọn 'Đặt định kỳ' khi đặt sân để giữ chỗ cố định. Ngoài ra, bạn có thể quản lý lịch định kỳ dễ dàng, thay đổi hoặc hủy bất cứ lúc nào.",
    category: "booking",
    icon: <Calendar className="w-6 h-6 text-blue-500" />,
  },
  {
    id: 10,
    question:
      "Tôi có thể thay đổi thời gian đặt sân sau khi đã xác nhận không?",
    answer:
      "Bạn có thể thay đổi thời gian đặt sân trước 2 giờ so với giờ đã chọn. Việc thay đổi được thực hiện trong phần 'Đặt sân của tôi'. Hệ thống sẽ gửi email xác nhận sau khi bạn thay đổi để tránh nhầm lẫn.",
    category: "booking",
    icon: <Calendar className="w-6 h-6 text-blue-500" />,
  },
  {
    id: 11,
    question: "Có phí dịch vụ khi đặt sân qua ứng dụng không?",
    answer:
      "Chúng tôi không thu phí dịch vụ cho người dùng khi đặt sân. Bạn chỉ thanh toán đúng giá sân theo niêm yết. Các khuyến mãi hoặc mã giảm giá cũng được tự động áp dụng nếu đủ điều kiện.",
    category: "payment",
    icon: <CreditCard className="w-6 h-6 text-green-500" />,
  },
  {
    id: 12,
    question: "Tôi có thể nhận hóa đơn VAT cho giao dịch không?",
    answer:
      "Có, hệ thống hỗ trợ xuất hóa đơn VAT điện tử cho doanh nghiệp và cá nhân. Bạn cần điền thông tin hóa đơn khi thanh toán và có thể tải lại hóa đơn từ tài khoản cá nhân bất cứ lúc nào.",
    category: "payment",
    icon: <Receipt className="w-6 h-6 text-green-500" />,
  },
  {
    id: 13,
    question: "Tôi quên mật khẩu, làm thế nào để khôi phục?",
    answer:
      "Bạn có thể chọn 'Quên mật khẩu' tại màn hình đăng nhập. Hệ thống sẽ gửi email hoặc SMS hướng dẫn đặt lại mật khẩu. Nếu gặp khó khăn, bạn có thể liên hệ tổng đài hỗ trợ 24/7 để được trợ giúp nhanh chóng.",
    category: "account",
    icon: <KeyRound className="w-6 h-6 text-orange-500" />,
  },
  {
    id: 14,
    question: "Tôi có thể đăng nhập bằng tài khoản Google hoặc Facebook không?",
    answer:
      "Có, bạn có thể sử dụng tài khoản Google hoặc Facebook để đăng nhập nhanh chóng mà không cần tạo mật khẩu mới. Tất cả dữ liệu cá nhân vẫn được bảo mật đầy đủ theo chính sách của chúng tôi.",
    category: "account",
    icon: <LogIn className="w-6 h-6 text-orange-500" />,
  },
  {
    id: 15,
    question: "Có chương trình khuyến mãi hay ưu đãi nào không?",
    answer:
      "Chúng tôi thường xuyên triển khai các chương trình khuyến mãi. Bạn có thể xem chi tiết trong mục 'Ưu đãi' trên ứng dụng hoặc website. Hệ thống cũng gửi thông báo khuyến mãi đến tài khoản để không bỏ lỡ ưu đãi.",
    category: "service",
    icon: <Gift className="w-6 h-6 text-pink-500" />,
  },
  {
    id: 16,
    question: "Ứng dụng có hỗ trợ nhiều ngôn ngữ không?",
    answer:
      "Hiện tại, hệ thống hỗ trợ tiếng Việt và tiếng Anh. Trong tương lai, chúng tôi sẽ bổ sung thêm nhiều ngôn ngữ khác để người dùng dễ dàng thao tác trên toàn quốc.",
    category: "service",
    icon: <Languages className="w-6 h-6 text-indigo-500" />,
  },
  {
    id: 17,
    question: "Có tổng đài hỗ trợ khách hàng không?",
    answer:
      "Có, bạn có thể liên hệ hotline 24/7 hoặc sử dụng tính năng chat trực tuyến trong ứng dụng để được hỗ trợ ngay lập tức. Nhân viên luôn sẵn sàng giải đáp mọi thắc mắc của bạn.",
    category: "support",
    icon: <Headphones className="w-6 h-6 text-cyan-500" />,
  },
  {
    id: 18,
    question: "Ứng dụng có hoạt động trên iOS và Android không?",
    answer:
      "Có, ứng dụng hỗ trợ đầy đủ trên cả iOS và Android. Bạn có thể tải về từ App Store hoặc Google Play. Phiên bản luôn được cập nhật để đảm bảo trải nghiệm mượt mà.",
    category: "service",
    icon: <Smartphone className="w-6 h-6 text-teal-500" />,
  },
  {
    id: 19,
    question: "Tôi có thể đặt sân cho người khác không?",
    answer:
      "Có, bạn có thể đặt sân và thêm tên người chơi khác trong phần ghi chú hoặc mục 'Người tham gia'. Hệ thống sẽ gửi thông báo xác nhận cho tất cả người chơi được thêm.",
    category: "booking",
    icon: <UserPlus className="w-6 h-6 text-blue-500" />,
  },
  {
    id: 20,
    question: "Nếu sân tôi đặt đột ngột không khả dụng thì sao?",
    answer:
      "Trong trường hợp sân không khả dụng do sự cố, chúng tôi sẽ hỗ trợ đổi sang sân khác hoặc hoàn tiền 100%. Bạn sẽ được thông báo ngay lập tức để có phương án thay thế.",
    category: "booking",
    icon: <AlertCircle className="w-6 h-6 text-red-500" />,
  },
  {
    id: 21,
    question: "Làm thế nào để xem lịch sử đặt sân?",
    answer:
      "Bạn có thể xem toàn bộ lịch sử đặt sân trong phần 'Đặt sân của tôi'. Tại đây, hệ thống hiển thị chi tiết các lượt đặt trước, tình trạng thanh toán và thông tin sân.",
    category: "account",
    icon: <Clock className="w-6 h-6 text-orange-500" />,
  },
  {
    id: 22,
    question: "Có thể đánh giá sân sau khi chơi không?",
    answer:
      "Có, sau khi hoàn tất lượt chơi, bạn có thể để lại đánh giá về sân. Hệ thống sẽ tổng hợp điểm đánh giá để giúp người chơi khác chọn sân tốt hơn.",
    category: "service",
    icon: <Star className="w-6 h-6 text-yellow-500" />,
  },
  {
    id: 23,
    question: "Ứng dụng có hỗ trợ đặt sân cho giải đấu không?",
    answer:
      "Có, bạn có thể đặt nhiều sân cùng lúc cho giải đấu hoặc sự kiện lớn. Hệ thống sẽ tính toán và phân phối sân phù hợp với số lượng đội tham gia.",
    category: "booking",
    icon: <Users className="w-6 h-6 text-blue-500" />,
  },
  {
    id: 24,
    question: "Tôi có thể lưu sân yêu thích không?",
    answer:
      "Có, bạn có thể đánh dấu các sân yêu thích để đặt nhanh trong các lần tiếp theo. Tính năng này giúp tiết kiệm thời gian và dễ dàng quản lý sân ưa thích.",
    category: "court",
    icon: <Heart className="w-6 h-6 text-red-500" />,
  },
];
