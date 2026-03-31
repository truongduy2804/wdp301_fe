# 📊 Presentation Content - DRONIVERSE

Đây là tài liệu hướng dẫn soạn thảo Canva presentation cho dự án **DRONIVERSE** - Hệ thống quản lý thu gom & tái chế chất thải.

## 📁 Files đã tạo:

### 1. **PRESENTATION_CONTENT.md** 
Chi tiết đầy đủ tất cả các function của ADMIN và ENTERPRISE roles:
- Mô tả chi tiết mỗi function
- Bảng so sánh admin vs enterprise
- Gợi ý thiết kế Canva
- Key messages & pitch

### 2. **PRESENTATION_DATA.json**
Dữ liệu có cấu trúc (JSON format):
- Thông tin project
- Danh sách 7 functions của ADMIN
- Danh sách 8 functions của ENTERPRISE
- Icon & màu sắc gợi ý

### 3. **CANVA_TEXT_LAYOUT.txt**
Text sẵn sàng copy-paste cho Canva:
- Layout cột trái (ADMIN) & cột phải (ENTERPRISE)
- Format bullet points
- Bảng so sánh
- Tiếng Anh & Tiếng Việt

---

## 🎨 Quick Canva Design Guide:

### Template:
- **Mô phỏng**: Mẫu ảnh đính kèm (Actors & Functions)
- **Cấu trúc**: 2 cột - ADMIN | ENTERPRISE
- **Tiêu đề**: "Actors & Functions" hoặc "Nội dung Quản lý Hệ thống"
- **Layout**: Mỗi cột có icon + 6-8 bullet functions

### Màu sắc gợi ý:
- **ADMIN**: 🔴 Đỏ đậm (control, authority)
- **ENTERPRISE**: 🟢 Xanh đậm (growth, business)
- **Background**: Xanh đen (phù hợp project theme)

### Fonts:
- Title: **Bold, 48px+**
- Subtitle: **Regular, 28px**
- Functions: **Regular, 18-22px**

---

## 📋 Tóm tắt Roles & Functions:

### **ADMIN (Quản trị viên)** - 7 Functions:
1. **Bảng Tổng quan** 📊 - KPI, trends, top enterprises
2. **Vi phạm Báo cáo** ⚠️ - Quản lý & xử lý vi phạm
3. **Khiếu nại/Tranh chấp** ⚖️ - Giải quyết khiếu nại
4. **Cấu hình Hệ thống** 🔧 - Giám sát & cấu hình
5. **Bản đồ Doanh nghiệp** 🗺️ - Xem vị trí & chi tiết
6. **Quản lý Quà & Điểm** 🎁 - Tạo & phân phối
7. **Lịch sử Đổi quà** 📜 - Theo dõi redemption

### **ENTERPRISE (Doanh nghiệp)** - 8 Functions:
1. **Bảng Thống kê** 📈 - Xem KPI hoạt động
2. **Đơn Chờ Phản hồi** 📥 - Quản lý yêu cầu
3. **Đơn Đang Xử lý** ⚙️ - Điều phối, gán nhân viên
4. **Lịch sử Hoàn thành** ✅ - Xuất báo cáo
5. **Đơn Hủy** ❌ - Xem danh sách hủy
6. **Quản lý Nhân viên** 👥 - Quản lý thu gom
7. **Quy tắc Điểm** 🎖️ - Cấu hình khuyến mãi
8. **Thông tin Công ty** ⚙️ - Cập nhật profile

---

## 🚀 Hướng dẫn Canva:

### Step 1: Tạo template
- Chọn size: A5 Landscape (1080 x 1920px) hoặc Custom
- Background: Dark navy/black (#0F1419 hoặc #1A1F3A)

### Step 2: Add elements
- **Left Panel**: Logo DRONIVERSE + ADMIN header
- **Right Panel**: FPT Education logo + ENTERPRISE header
- **Bottom**: Page number & footer

### Step 3: Add text
- Copy từ **CANVA_TEXT_LAYOUT.txt**
- Format mỗi dòng với icon tương ứng

### Step 4: Design polish
- Thêm divider line giữa 2 cột
- Shadow/glow effects cho text
- Consistent spacing (20-25px margins)

---

## 📝 Content Source (Code Files):

Functions được lấy từ:
- `/src/layout/Dashboard/components/Menu/admin.ts` - Admin menu
- `/src/layout/Dashboard/components/Menu/enterprise.ts` - Enterprise menu
- `/src/pages/Admin/` - Admin page structure
- `/src/pages/Enterprise/` - Enterprise page structure
- `/src/api/admin/` - Admin API & functions

---

## 💡 Key Points:

✅ **ADMIN**: Quản lý toàn hệ thống, xử lý vi phạm/khiếu nại, giám sát doanh nghiệp

✅ **ENTERPRISE**: Quản lý hoạt động riêng, số liệu, nhân viên, điểm thưởng

✅ **Differences**: Admin có 3 functions độc quyền (Vi phạm, Khiếu nại, Hệ thống), Enterprise có 5 functions về quản lý hoạt động

---

## 📧 Contact:

Nếu cần thêm thông tin hoặc chỉnh sửa, xem:
- `PRESENTATION_CONTENT.md` - Chi tiết đầy đủ
- `PRESENTATION_DATA.json` - Data có cấu trúc
- Source code: `/src/` folder
