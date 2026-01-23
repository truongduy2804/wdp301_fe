import {
  Wifi,
  Users,
  Car,
  ShoppingBag,
  Zap,
  Coffee,
  Store,
  User,
} from "lucide-react";

export const areas = [
  { value: "all", label: "Tất cả khu vực" },
  { value: "ba-dinh", label: "Ba Đình" },
  { value: "dong-da", label: "Đống Đa" },
  { value: "ha-dong", label: "Hà Đông" },
];

export interface Amenity {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export const amenitiesList: Amenity[] = [
  { key: "wifi", label: "Wifi miễn phí", icon: <Wifi className="w-4 h-4" /> },
  { key: "parking", label: "Bãi đỗ xe", icon: <Car className="w-4 h-4" /> },
  {
    key: "locker",
    label: "Phòng thay đồ",
    icon: <Users className="w-4 h-4" />,
  },
  { key: "shower", label: "Phòng tắm", icon: <Users className="w-4 h-4" /> },
  {
    key: "equipment",
    label: "Dụng cụ thi đấu",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    key: "rental",
    label: "Cho thuê vợt",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  { key: "aircon", label: "Điều hòa", icon: <Zap className="w-4 h-4" /> },
  { key: "canteen", label: "Căn tin", icon: <Coffee className="w-4 h-4" /> },
  {
    key: "store",
    label: "Cửa hàng dụng cụ",
    icon: <Store className="w-4 h-4" />,
  },
  {
    key: "coach",
    label: "Huấn luyện viên",
    icon: <User className="w-4 h-4" />,
  },
];

export interface Court {
  id: number;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  price: number;
  image: string;
  amenities: string[];
  availableSlots: string[];
  isNewlyOpened: boolean;
}

export const courts: Court[] = [
  {
    id: 1,
    name: "Sân Cầu Lông Thống Nhất",
    address: "30 Đường Trần Phú, Quận Ba Đình, Hà Nội",
    rating: 4.8,
    reviewCount: 124,
    price: 150000,
    image:
      "https://images.unsplash.com/photo-1618548723848-1b339b8a7999?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJhZG1pbnRvbiUyMGNvdXJ0fGVufDB8fDB8fHww",
    amenities: ["wifi", "parking", "locker", "shower", "aircon"],
    availableSlots: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "13:00",
    ],
    isNewlyOpened: true,
  },
  {
    id: 2,
    name: "Sân Cầu Lông Olympia",
    address: "15 Đường Nguyễn Chí Thanh, Quận Đống Đa, Hà Nội",
    rating: 4.7,
    reviewCount: 98,
    price: 180000,
    image:
      "https://plus.unsplash.com/premium_photo-1663039984787-b11d7240f592?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmFkbWludG9uJTIwY291cnR8ZW58MHx8MHx8fDA%3D",
    amenities: ["wifi", "parking", "canteen", "store"],
    availableSlots: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "13:00",
      "14:00",
    ],
    isNewlyOpened: false,
  },
  {
    id: 3,
    name: "Sân Cầu Lông Hà Đông",
    address: "45 Đường Quang Trung, Quận Hà Đông, Hà Nội",
    rating: 4.5,
    reviewCount: 76,
    price: 120000,
    image:
      "https://media.istockphoto.com/id/1310354398/photo/empty-badminton-court-sport-venue-without-people.webp?a=1&b=1&s=612x612&w=0&k=20&c=_kJ_Zrs207Dx34oko4QBPmY9aQZYc_eQlJNuJT6eGls=",
    amenities: ["wifi", "locker", "shower", "equipment", "coach"],
    availableSlots: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "13:00",
    ],
    isNewlyOpened: false,
  },
  {
    id: 4,
    name: "Sân Cầu Lông Mỹ Đình",
    address: "10 Đường Lê Đức Thọ, Quận Nam Từ Liêm, Hà Nội",
    rating: 4.9,
    reviewCount: 152,
    price: 200000,
    image:
      "https://plus.unsplash.com/premium_photo-1708119178805-321dec8ba9cf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fGJhZG1pbnRvbiUyMGNvdXJ0fGVufDB8fDB8fHww",
    amenities: ["wifi", "aircon", "rental", "equipment"],
    availableSlots: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "13:00",
      "14:00",
    ],
    isNewlyOpened: false,
  },
  {
    id: 5,
    name: "Sân Cầu Lông Thanh Xuân",
    address: "25 Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội",
    rating: 4.6,
    reviewCount: 89,
    price: 160000,
    image:
      "https://images.unsplash.com/photo-1567220720374-a67f33b2a6b9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGJhZG1pbnRvbiUyMGNvdXJ0fGVufDB8fDB8fHww",
    amenities: ["wifi", "parking", "locker", "coach"],
    availableSlots: ["09:00", "10:00", "11:00", "14:00"],
    isNewlyOpened: true,
  },
  {
    id: 6,
    name: "Sân Cầu Lông Long Biên",
    address: "50 Đường Nguyễn Văn Cừ, Quận Long Biên, Hà Nội",
    rating: 4.7,
    reviewCount: 112,
    price: 170000,
    image:
      "https://images.unsplash.com/photo-1597309792995-1f61243fca21?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fGJhZG1pbnRvbiUyMGNvdXJ0fGVufDB8fDB8fHww",
    amenities: ["wifi", "parking", "canteen", "store", "rental"],
    availableSlots: ["08:00", "09:00", "10:00", "13:00", "15:00"],
    isNewlyOpened: false,
  },
  {
    id: 7,
    name: "Sân Cầu Lông Cầu Giấy",
    address: "60 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội",
    rating: 4.4,
    reviewCount: 65,
    price: 140000,
    image:
      "https://plus.unsplash.com/premium_photo-1709932754899-5c36599fface?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTN8fGJhZG1pbnRvbiUyMGNvdXJ0fGVufDB8fDB8fHww",
    amenities: ["wifi", "locker", "aircon"],
    availableSlots: ["07:00", "08:00", "09:00", "11:00"],
    isNewlyOpened: false,
  },
  {
    id: 8,
    name: "Sân Cầu Lông Bắc Từ Liêm",
    address: "75 Đường Hoàng Quốc Việt, Quận Bắc Từ Liêm, Hà Nội",
    rating: 4.3,
    reviewCount: 54,
    price: 130000,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYq5n0oKhMMLbGYkbHOZqRDyeUOxQbW6ErGg&s",
    amenities: ["wifi", "parking", "equipment"],
    availableSlots: ["08:00", "09:00", "10:00", "14:00"],
    isNewlyOpened: true,
  },
  {
    id: 9,
    name: "Sân Cầu Lông Tây Hồ",
    address: "85 Đường Lạc Long Quân, Quận Tây Hồ, Hà Nội",
    rating: 4.8,
    reviewCount: 133,
    price: 190000,
    image:
      "https://images.unsplash.com/photo-1573078701606-41e41a8287f3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTA3fHxiYWRtaW50b24lMjBjb3VydHxlbnwwfHwwfHx8MA%3D%3D",
    amenities: ["wifi", "locker", "shower", "canteen", "aircon"],
    availableSlots: ["09:00", "10:00", "11:00", "13:00", "14:00"],
    isNewlyOpened: false,
  },
  {
    id: 10,
    name: "Sân Cầu Lông Hoàn Kiếm",
    address: "95 Đường Hàng Bài, Quận Hoàn Kiếm, Hà Nội",
    rating: 4.9,
    reviewCount: 200,
    price: 220000,
    image:
      "https://images.unsplash.com/photo-1723633236252-eb7badabb34c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTJ8fGJhZG1pbnRvbiUyMGNvdXJ0fGVufDB8fDB8fHww",
    amenities: ["wifi", "parking", "store", "coach"],
    availableSlots: ["08:00", "09:00", "10:00", "15:00"],
    isNewlyOpened: false,
  },
  {
    id: 11,
    name: "Sân Cầu Lông Đống Đa",
    address: "105 Đường Tôn Đức Thắng, Quận Đống Đa, Hà Nội",
    rating: 4.5,
    reviewCount: 78,
    price: 150000,
    image:
      "https://images.unsplash.com/photo-1723534862765-5760900d68d8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTEyfHxiYWRtaW50b24lMjBjb3VydHxlbnwwfHwwfHx8MA%3D%3D",
    amenities: ["wifi", "parking", "locker", "shower"],
    availableSlots: ["07:00", "08:00", "09:00", "13:00"],
    isNewlyOpened: true,
  },
  {
    id: 12,
    name: "Sân Cầu Lông Hai Bà Trưng",
    address: "115 Đường Bạch Mai, Quận Hai Bà Trưng, Hà Nội",
    rating: 4.6,
    reviewCount: 99,
    price: 175000,
    image:
      "https://plus.unsplash.com/premium_photo-1733342490554-4bcb4c60631e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D",
    amenities: ["wifi", "aircon", "canteen", "rental"],
    availableSlots: ["08:00", "09:00", "10:00", "11:00", "14:00"],
    isNewlyOpened: false,
  },
];
