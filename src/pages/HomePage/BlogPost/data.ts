export interface Post {
  id: number;
  author: string;
  initials: string;
  avatarColor: string;
  time: string;
  title: string;
  description: string;
  image: string;
  likes: number;
  comments: number;
  category: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
  ctaType?: 'booking' | 'guide' | 'community';
  trending?: boolean;  
  date: string; // 🆕 thêm field ngày
}

export const posts: Post[] = [
{
  id: 1,
  author: "HLV Minh Tuấn",
  initials: "MT",
  avatarColor: "bg-gradient-to-r from-blue-500 to-purple-600",
  time: "2 giờ trước",
  title: "7 Lỗi Phổ Biến Khi Đặt Sân Cầu Lông & Cách Tránh",
  description: "Từ việc chọn sai giờ vàng đến không kiểm tra chất lượng sân - những sai lầm này có thể hủy hoại trải nghiệm chơi của bạn.",
  image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?...",
  likes: 234,
  comments: 45,
  category: "Hướng dẫn",
  readTime: "5 phút đọc",
  tags: ["đặt sân", "mẹo hay", "người mới"],
  featured: true,
   trending: true,
  ctaType: 'booking',
  date: "2025-08-31" // 🆕 thêm ngày chuẩn ISO
},
{
  id: 2,
  author: "Nguyễn Thị Lan",
  initials: "NL",
  avatarColor: "bg-gradient-to-r from-pink-500 to-rose-600",
  time: "1 ngày trước",
  title: "Bí Quyết Chọn Giờ Chơi Cầu Lông Tiết Kiệm 40% Chi Phí",
  description: "Phân tích chi tiết về khung giờ vàng, giờ bạc và những thời điểm ít người biết để đặt sân với giá tốt nhất.",
  image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?...",
  likes: 189,
  comments: 67,
  category: "Tiết kiệm",
  readTime: "7 phút đọc",
  tags: ["tiết kiệm", "giờ vàng", "đặt sân"],
  ctaType: 'booking',
  date: "2025-08-30"
},
  {
    id: 3,
    author: "Trần Văn Nam",
    initials: "TN",
    avatarColor: "bg-gradient-to-r from-green-500 to-teal-600",
    time: "3 ngày trước",
    title: "Review Chi Tiết 15+ Sân Cầu Lông Tốt Nhất Tại TP.HCM",
    description: "Từ sân cao cấp đến sân bình dân, từ trung tâm thành phố đến các quận xa - đánh giá trung thực về chất lượng, giá cả và dịch vụ. Cập nhật tình hình mới nhất!",
    image: "https://plus.unsplash.com/premium_photo-1709932754899-5c36599fface?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAxfHxiYWRtaW50b24lMjBjb3VydHxlbnwwfHwwfHx8MA%3D%3D",
    likes: 312,
    comments: 89,
    category: "Review",
    readTime: "12 phút đọc",
    tags: ["review sân", "TP.HCM", "chất lượng"],
    featured: true,
     trending: true,
    ctaType: 'booking',
    date: "2025-08-30"
  },
  {
    id: 4,
    author: "Lê Thị Hồng",
    initials: "LH",
    avatarColor: "bg-gradient-to-r from-orange-500 to-yellow-600",
    time: "5 ngày trước",
    title: "Lịch Trình Tập Luyện Cầu Lông Cho Người Mới: 0 → Hero Trong 3 Tháng",
    description: "Chương trình chi tiết từ tuần 1 đến tuần 12, kèm theo lịch đặt sân tối ưu và các mốc đánh giá tiến độ. Đã giúp 500+ người đạt mục tiêu!",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 445,
    comments: 123,
    category: "Tập luyện",
    readTime: "10 phút đọc",
    tags: ["lịch tập", "người mới", "kế hoạch"],
    ctaType: 'guide',
    date: "2025-08-30"
  },
  {
    id: 5,
    author: "Phạm Minh Đức",
    initials: "PD",
    avatarColor: "bg-gradient-to-r from-indigo-500 to-blue-600",
    time: "1 tuần trước",
    title: "Ứng Dụng Đặt Sân Cầu Lông: So Sánh Top 5 Nền Tảng Phổ Biến",
    description: "Phân tích deep-dive về tính năng, giao diện, độ tin cậy và giá cả của các app hàng đầu. Bao gồm tips để tối đa hóa lợi ích khi sử dụng từng platform.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 278,
    comments: 56,
    category: "Công nghệ",
    readTime: "8 phút đọc",
    tags: ["app đặt sân", "so sánh", "công nghệ"],
    ctaType: 'booking',
    date: "2025-08-30"
  },
  {
    id: 6,
    author: "Võ Thị Mai",
    initials: "VM",
    avatarColor: "bg-gradient-to-r from-purple-500 to-pink-600",
    time: "1 tuần trước",
    title: "Cách Tổ Chức Giải Cầu Lông Công Ty Thành Công: A-Z Checklist",
    description: "Hướng dẫn từ lên ý tưởng, chọn địa điểm, đặt sân hàng loạt, đến tổ chức sự kiện hoàn hảo. Kèm template và pricing cho từng quy mô từ 20-200 người.",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 156,
    comments: 34,
    category: "Sự kiện",
    readTime: "15 phút đọc",
    tags: ["giải đấu", "công ty", "sự kiện"],
    ctaType: 'booking',
    date: "2025-08-30"
  },
  {
    id: 7,
    author: "Đinh Văn Hùng",
    initials: "DH",
    avatarColor: "bg-gradient-to-r from-red-500 to-orange-600",
    time: "10 ngày trước",
    title: "Những Sai Lầm Chết Người Khi Chọn Vợt Cầu Lông Cho Người Mới",
    description: "90% người mới mắc những lỗi này! Từ việc chọn sai trọng lượng đến không hiểu về độ căng dây. Bao gồm bảng so sánh 20+ mẫu vợt phổ biến nhất.",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 367,
    comments: 78,
    category: "Dụng cụ",
    readTime: "9 phút đọc",
    tags: ["vợt cầu lông", "người mới", "lựa chọn"],
    ctaType: 'guide',
    date: "2025-08-30"
  },
  {
    id: 8,
    author: "Ngô Thị Linh",
    initials: "NL",
    avatarColor: "bg-gradient-to-r from-teal-500 to-green-600",
    time: "2 tuần trước",
    title: "Mindset Của Champion: 5 Thói Quen Tinh Thần Từ Các Pro Player",
    description: "Phỏng vấn độc quyền với 3 VĐV cầu lông hàng đầu Việt Nam về bí quyết mental game. Cách áp dụng vào đời sống và cải thiện performance trong mọi trận đấu.",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9nZXRoZXJ8ZW58MHx8MHx8fDA%3D",
    likes: 234,
    comments: 45,
    category: "Tâm lý",
    readTime: "11 phút đọc",
    tags: ["tâm lý", "pro player", "mindset"],
    ctaType: 'community',
    date: "2025-08-30"
  },
  {
    id: 9,
    author: "Bùi Văn Thành",
    initials: "BT",
    avatarColor: "bg-gradient-to-r from-gray-600 to-gray-800",
    time: "2 tuần trước",
    title: "Cầu Lông Mùa Mưa: 7 Địa Điểm Indoor Tốt Nhất & Tips Booking",
    description: "Mùa mưa không còn là cản trở! Danh sách chi tiết các sân có mái che chất lượng cao, kèm tips đặt sân nhanh trong thời tiết khó lường và các gói ưu đãi đặc biệt.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 189,
    comments: 23,
    category: "Thời tiết",
    readTime: "6 phút đọc",
    tags: ["mùa mưa", "sân indoor", "thời tiết"],
    ctaType: 'booking',
    date: "2025-08-30"
  },
  {
    id: 10,
    author: "Trịnh Thị Hạnh",
    initials: "TH",
    avatarColor: "bg-gradient-to-r from-cyan-500 to-blue-600",
    time: "3 tuần trước",
    title: "Case Study: Cách Anh Minh Tiết Kiệm 2 Triệu/Tháng Khi Đặt Sân",
    description: "Câu chuyện có thật về một golfer chuyển sang cầu lông và áp dụng mindset đầu tư thông minh. Phân tích chi tiết strategy và các tricks đặt sân mà 95% người không biết.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 445,
    comments: 67,
    category: "Case Study",
    readTime: "13 phút đọc",
    tags: ["tiết kiệm", "case study", "chiến lược"],
    ctaType: 'booking',
    date: "2025-08-30"
  },
  {
    id: 11,
    author: "Lý Hoàng Nam",
    initials: "LN",
    avatarColor: "bg-gradient-to-r from-emerald-500 to-teal-600",
    time: "3 tuần trước",
    title: "Công Thức Vàng: Làm Sao Để Luôn Có Đối Thủ Chơi Cầu Lông?",
    description: "Hệ thống matching thông minh và community building từ các expert. Bao gồm cách sử dụng các platform, tips networking và xây dựng nhóm chơi bền vững.",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 278,
    comments: 89,
    category: "Cộng đồng",
    readTime: "8 phút đọc",
    tags: ["matching", "cộng đồng", "networking"],
    ctaType: 'community',
    date: "2025-08-30"
  },
  {
    id: 12,
    author: "Phan Thị Uyên",
    initials: "PU",
    avatarColor: "bg-gradient-to-r from-violet-500 to-purple-600",
    time: "1 tháng trước",
    title: "Nutrition Hack Cho Người Chơi Cầu Lông: Ăn Gì, Khi Nào, Bao Nhiêu",
    description: "Plan dinh dưỡng cụ thể cho từng thời điểm: pre-game, during game, post-game. Kèm menu 7 ngày và các supplement được recommend bởi sports nutritionist.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 234,
    comments: 45,
    category: "Sức khỏe",
    readTime: "10 phút đọc",
    tags: ["dinh dưỡng", "sức khỏe", "performance"],
    ctaType: 'guide',
    date: "2025-08-30"
  },
  {
    id: 24,
    author: "Phan Thị Uyên",
    initials: "PU",
    avatarColor: "bg-gradient-to-r from-violet-500 to-purple-600",
    time: "1 tháng trước",
    title: "Nutrition Hack Cho Người Chơi Cầu Lông: Ăn Gì, Khi Nào, Bao Nhiêu",
    description: "Plan dinh dưỡng cụ thể cho từng thời điểm: pre-game, during game, post-game. Kèm menu 7 ngày và các supplement được recommend bởi sports nutritionist.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 234,
    comments: 45,
    category: "Sức khỏe",
    readTime: "10 phút đọc",
    tags: ["dinh dưỡng", "sức khỏe", "performance"],
    ctaType: 'guide',
    date: "2025-08-30"
  },
  {
    id: 13,
    author: "Nguyễn Minh Anh",
    initials: "NA",
    avatarColor: "bg-gradient-to-r from-pink-500 to-red-600",
    time: "2 tuần trước",
    title: "Top 5 Bài Tập Tăng Sức Bền Cho Người Chơi Bóng Rổ",
    description: "Hướng dẫn chi tiết các bài tập tăng sức bền, kèm video demo và tips từ coach chuyên nghiệp.",
    image: "https://images.unsplash.com/photo-1554284126-5f3471d9c1b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 180,
    comments: 30,
    category: "Thể thao",
    readTime: "8 phút đọc",
    tags: ["thể thao", "sức bền", "basketball"],
    ctaType: 'guide',
    date: "2025-08-28"
  },
  {
    id: 14,
    author: "Trần Bảo Ngọc",
    initials: "BN",
    avatarColor: "bg-gradient-to-r from-green-400 to-teal-500",
    time: "3 tuần trước",
    title: "Yoga Cho Người Mới Bắt Đầu: 7 Ngày Đầu Tiên",
    description: "Lộ trình 7 ngày giúp người mới bắt đầu luyện yoga đúng cách, tăng linh hoạt và giảm stress.",
    image: "https://images.unsplash.com/photo-1517964603305-5e3ff1d1a065?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 150,
    comments: 20,
    category: "Sức khỏe",
    readTime: "9 phút đọc",
    tags: ["yoga", "stress", "linh hoạt"],
    ctaType: 'guide',
    date: "2025-08-25"
  },
  {
    id: 15,
    author: "Lê Quang Huy",
    initials: "QH",
    avatarColor: "bg-gradient-to-r from-blue-400 to-indigo-500",
    time: "5 ngày trước",
    title: "Chế Độ Ăn Low-Carb Cho Người Muốn Giảm Cân Nhanh",
    description: "Hướng dẫn ăn low-carb an toàn, kèm thực đơn mẫu 7 ngày và những lưu ý quan trọng.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D",
    likes: 210,
    comments: 25,
    category: "Dinh dưỡng",
    readTime: "7 phút đọc",
    tags: ["low-carb", "giảm cân", "dinh dưỡng"],
    ctaType: 'guide',
    date: "2025-08-31"
  },
  {
    id: 16,
    author: "Phạm Thảo Vy",
    initials: "TV",
    avatarColor: "bg-gradient-to-r from-yellow-400 to-orange-500",
    time: "1 tháng trước",
    title: "Cardio Hiệu Quả Trong 20 Phút Mỗi Ngày",
    description: "Bài tập cardio 20 phút giúp cải thiện tim mạch và đốt calo nhanh chóng.",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 190,
    comments: 15,
    category: "Thể dục",
    readTime: "6 phút đọc",
    tags: ["cardio", "tim mạch", "tập luyện"],
    ctaType: 'guide',
    date: "2025-08-20"
  },
  {
    id: 17,
    author: "Nguyễn Hữu Long",
    initials: "HL",
    avatarColor: "bg-gradient-to-r from-purple-400 to-pink-500",
    time: "2 tuần trước",
    title: "5 Loại Smoothie Tăng Cường Năng Lượng Buổi Sáng",
    description: "Công thức smoothie bổ dưỡng giúp khởi đầu ngày mới đầy năng lượng.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 160,
    comments: 18,
    category: "Dinh dưỡng",
    readTime: "5 phút đọc",
    tags: ["smoothie", "sáng", "energy"],
    ctaType: 'guide',
    date: "2025-08-22"
  },
  {
    id: 18,
    author: "Lê Thị Mai",
    initials: "LM",
    avatarColor: "bg-gradient-to-r from-red-400 to-pink-500",
    time: "3 tuần trước",
    title: "Kỹ Thuật Bơi Hiệu Quả Cho Người Mới Học",
    description: "Các kỹ thuật cơ bản và mẹo bơi nhanh cho người mới bắt đầu.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 140,
    comments: 12,
    category: "Thể thao",
    readTime: "8 phút đọc",
    tags: ["bơi lội", "kỹ thuật", "swimming"],
    ctaType: 'guide',
    date: "2025-08-18"
  },
  {
    id: 19,
    author: "Trần Minh Tú",
    initials: "MT",
    avatarColor: "bg-gradient-to-r from-teal-400 to-cyan-500",
    time: "1 tuần trước",
    title: "Chế Độ Ăn Cho Người Tập Gym: Tăng Cơ Giảm Mỡ",
    description: "Plan ăn uống cân đối, giúp tăng cơ và giảm mỡ nhanh chóng cho gymer.",
    image: "https://images.unsplash.com/photo-1554284126-5f3471d9c1b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 220,
    comments: 35,
    category: "Dinh dưỡng",
    readTime: "10 phút đọc",
    tags: ["gym", "tăng cơ", "giảm mỡ"],
    ctaType: 'guide',
    date: "2025-08-27"
  },
  {
    id: 20,
    author: "Phạm Thị Linh",
    initials: "PL",
    avatarColor: "bg-gradient-to-r from-indigo-400 to-purple-500",
    time: "5 ngày trước",
    title: "Meditation 10 Phút Mỗi Ngày Giúp Giảm Stress",
    description: "Hướng dẫn thiền 10 phút mỗi ngày giúp thư giãn và giảm căng thẳng.",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 130,
    comments: 10,
    category: "Sức khỏe",
    readTime: "4 phút đọc",
    tags: ["meditation", "stress", "mental health"],
    ctaType: 'guide',
    date: "2025-08-29"
  },
  {
    id: 21,
    author: "Nguyễn Văn Khoa",
    initials: "VK",
    avatarColor: "bg-gradient-to-r from-green-400 to-lime-500",
    time: "1 tháng trước",
    title: "HIIT 15 Phút Tại Nhà: Đốt Calo Nhanh",
    description: "Lộ trình HIIT 15 phút tại nhà giúp tăng nhịp tim và đốt mỡ hiệu quả.",
    image: "https://images.unsplash.com/photo-1554284126-5f3471d9c1b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 170,
    comments: 22,
    category: "Thể dục",
    readTime: "6 phút đọc",
    tags: ["HIIT", "calo", "home workout"],
    ctaType: 'guide',
    date: "2025-08-21"
  },
  {
    id: 22,
    author: "Lê Ngọc Hân",
    initials: "NH",
    avatarColor: "bg-gradient-to-r from-pink-400 to-red-500",
    time: "2 tuần trước",
    title: "Ăn Uống Khi Chơi Tennis: Tăng Sức Bền Và Năng Lượng",
    description: "Gợi ý dinh dưỡng trước, trong và sau khi chơi tennis, kèm tips từ chuyên gia.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 200,
    comments: 28,
    category: "Sức khỏe",
    readTime: "9 phút đọc",
    tags: ["tennis", "dinh dưỡng", "performance"],
    ctaType: 'guide',
    date: "2025-08-26"
  },
  {
    id: 23,
    author: "Phan Minh Châu",
    initials: "MC",
    avatarColor: "bg-gradient-to-r from-blue-400 to-cyan-500",
    time: "1 tuần trước",
    title: "Chạy Bộ Buổi Sáng: 7 Tips Giúp Hiệu Quả Hơn",
    description: "Các tips chạy bộ sáng sớm giúp tăng hiệu quả, tránh chấn thương và giữ động lực.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 145,
    comments: 16,
    category: "Thể thao",
    readTime: "7 phút đọc",
    tags: ["chạy bộ", "sáng", "fitness"],
    ctaType: 'guide',
    date: "2025-08-24"
  },
  
];

// Utility functions để filter và sort posts
export const getFeaturedPosts = () => posts.filter(post => post.featured);

export const getPostsByCategory = (category: string) => 
  posts.filter(post => post.category === category);

export const getLatestPosts = (limit: number = 6) => 
  [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

export const searchPosts = (query: string) => 
  posts.filter(post => 
    post.title.toLowerCase().includes(query.toLowerCase()) ||
    post.description.toLowerCase().includes(query.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

export const categories = [
  "Tất cả",
  "Hướng dẫn", 
  "Review",
  "Tiết kiệm",
  "Tập luyện",
  "Công nghệ",
  "Sự kiện",
  "Dụng cụ",
  "Tâm lý",
  "Thời tiết",
  "Case Study",
  "Cộng đồng",
  "Sức khỏe"
];

// CTA Templates dựa trên ctaType
export const ctaTemplates = {
  booking: {
    text: "Đặt Sân Ngay",
    description: "Áp dụng ngay những tips này!",
    color: "bg-gradient-to-r from-teal-600 to-green-600"
  },
  guide: {
    text: "Tải Guide Miễn Phí",
    description: "Nhận hướng dẫn chi tiết",
    color: "bg-gradient-to-r from-blue-600 to-purple-600"
  },
  community: {
    text: "Tham Gia Cộng Đồng",
    description: "Kết nối với người chơi khác",
    color: "bg-gradient-to-r from-pink-600 to-rose-600"
  }
};