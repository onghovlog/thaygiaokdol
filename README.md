# Dự Án Website: Thầy Giáo KDOL

> **Slogan:** *"1 đơn hàng - 1 nụ cười"*  
> **Định hướng thiết kế:** Mobile-Only (max-width 430px, hiển thị khung căn giữa trên Desktop), Tối giản tinh tế (Minimalism), Không lạm dụng icon, gradient, shadow hay animation.

---

## 1. Công Nghệ Sử Dụng

- **Frontend:** HTML5 ngữ nghĩa, CSS3 thuần (CSS Variables, Flexbox, CSS Grid), Vanilla JavaScript (ES Modules).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas + Mongoose ODM.
- **Quy chuẩn bắt buộc:**
  - Tuyệt đối **không** dùng Angular, React, Vue, Bootstrap, Tailwind.
  - Quản lý gói bằng **npm**.
  - Toàn bộ nội dung hiển thị tiếng Việt, mã hóa chuẩn **UTF-8**.

---

## 2. Hệ Thống Thiết Kế & Nhận Diện UI/UX

| Yếu Tố | Thông Số / Giá Trị | Ghi Chú |
| :--- | :--- | :--- |
| **Màu chính (Primary)** | `#F37021` | Cam nhiệt huyết, năng lượng chuyển đổi đơn |
| **Màu phụ (Secondary)** | `#123FCB` | Xanh dương uy tín, chuyên nghiệp |
| **Nền Canvas** | `#FFFFFF` | Nền trắng tinh giản cho khung mobile |
| **Nền Desktop ngoài** | `#F3F4F6` | Xám sáng dịu mắt bao quanh khung mobile |
| **Màu chữ chính** | `#20242B` | Xám đen tương phản cao, dễ đọc |
| **Font chữ** | `Be Vietnam Pro` | Chuẩn tiếng Việt, tải trực tiếp từ Google Fonts |
| **Khung hiển thị** | `max-width: 430px` | Căn giữa màn hình desktop, 100% trên thiết bị <= 430px |
| **Header** | `Sticky Top` | Nằm cố định trên cùng, giới hạn trong khung 430px |
| **Thanh liên hệ** | `Fixed Bottom` | Gồm: **Điện thoại**, **Zalo**, **Messenger**, căn chuẩn khung 430px |

---

## 3. Cấu Trúc Dự Án

```
ThayGiaoKDOL/
├── package.json                   # Cấu hình npm & dependencies (express, mongoose, dotenv, cors)
├── .env.example                   # Mẫu biến môi trường an toàn (không chứa mật khẩu thật)
├── .env                           # Biến môi trường cục bộ (được bỏ qua bởi .gitignore)
├── .gitignore                     # Bỏ qua node_modules, .env, logs
├── README.md                      # Hướng dẫn chi tiết dự án & API
│
├── client/                        # GIAO DIỆN NGƯỜI DÙNG (Frontend thuần Vanilla JS)
│   ├── index.html                 # 1. Trang chủ (Slider, Giới thiệu, Bài viết mới, Partner banner)
│   ├── gioi-thieu.html            # 2. Trang giới thiệu Tôi là ai & triết lý KDOL
│   ├── kien-thuc.html             # 3. Blog Hub (Search realtime, Horizontal Chips, Hero Featured, Phân trang)
│   ├── bai-viet.html              # 4. Chi tiết bài viết (Đọc theo slug, SEO động, Web Share, 3 bài liên quan, 404)
│   ├── dang-ky-partner.html       # 5. Form đăng ký Partner 2 bước (Stepper, validation tiếng Việt)
│   ├── dang-ky-thanh-cong.html    # 6. Thông báo thành công, lời cảm ơn & liên hệ Zalo cấu hình
│   ├── chinh-sach-bao-mat.html    # 7. Chính sách bảo mật dữ liệu khách hàng
│   ├── admin/                     # Khung giao diện Admin Dashboard tối giản
│   │   └── index.html
│   ├── assets/
│   │   ├── icons/                 # SVG icons tối giản
│   │   └── images/                # Minh họa SVG (chân dung, kdol overview, dropshipping, ads...)
│   ├── css/
│   │   ├── variables.css          # Design tokens (màu sắc, font, spacing, layout 430px)
│   │   ├── reset.css              # Reset CSS tối ưu mobile
│   │   ├── components.css         # Các component cơ bản
│   │   └── style.css              # Master stylesheet
│   └── js/
│       ├── config.js              # Cấu hình tập trung (Zalo, Hotline, Menu)
│       ├── main.js                # Entry point ES Module
│       ├── data/
│       │   └── mock-data.js       # 12 bài viết chuẩn, banners, categories
│       ├── components/            # Header, slider, articles, blog, article-detail, contact-bar, footer
│       └── modules/               # Form validation & submission module
│
└── server/                        # MÁY CHỦ BACKEND (Node.js + Express + Mongoose)
    ├── config/
    │   └── db.js                  # Kết nối MongoDB Atlas an toàn qua Mongoose
    ├── models/                    # Mongoose Schemas & Indexes
    │   ├── Partner.js             # Schema Partner (họ tên, sđt, tỉnh thành, mục tiêu, ngành hàng, consent...)
    │   ├── Post.js                # Schema Post (tiêu đề, slug, tóm tắt, nội dung, status, publishedAt...)
    │   ├── Category.js            # Schema Category (tên, slug, mô tả, order)
    │   ├── Banner.js              # Schema Banner (ảnh, link, vị trí, order, active)
    │   ├── Admin.js               # Schema Admin (username, passwordHash, role)
    │   └── Setting.js             # Schema Setting (key, value)
    ├── controllers/               # Business Logic xử lý dữ liệu
    │   ├── healthController.js    # Kiểm tra trạng thái máy chủ & kết nối Database
    │   ├── partnerController.js   # Tiếp nhận đăng ký Partner & danh sách quản trị
    │   ├── postController.js      # Danh sách bài viết & chi tiết theo slug
    │   └── categoryController.js  # Lấy danh mục & banner
    ├── routes/                    # API Routing
    │   ├── api.js                 # Master API Router (/api/*)
    │   ├── healthRoutes.js        # GET /api/health
    │   ├── partnerRoutes.js       # POST /api/partners, GET /api/partners
    │   ├── postRoutes.js          # GET /api/posts, GET /api/posts/:slug
    │   ├── categoryRoutes.js      # GET /api/categories
    │   └── bannerRoutes.js        # GET /api/banners
    ├── middleware/
    │   ├── errorHandler.js        # Xử lý lỗi tập trung (Validation, Duplicate Key, CastError, SyntaxError)
    │   └── notFoundHandler.js     # Xử lý 404 cho API endpoints không tồn tại
    ├── scripts/
    │   └── seed.js                # Script nạp dữ liệu mẫu an toàn (Zero Personal Data)
    ├── app.js                     # Cấu hình Express, CORS, JSON parser, static files
    ├── index.js                   # Server entry point khởi động máy chủ
    └── dev-server.js              # Local dev server độc lập cho Frontend
```

---

## 4. Hướng Dẫn Cài Đặt & Khởi Chạy Backend

### 4.1 Cấu hình Biến Môi Trường (.env)
Dự án sử dụng file `.env` để bảo mật thông tin nhạy cảm. Không bao giờ commit file `.env` lên kho mã nguồn.

1. Sao chép từ mẫu `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Mở file `.env` và kiểm tra chuỗi kết nối MongoDB Atlas:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.uafqmya.mongodb.net/thaygiaokdol?retryWrites=true&w=majority
   CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5000,http://127.0.0.1:5000
   ```

### 4.2 Nạp Dữ Liệu Mẫu (Database Seeding)
Chạy script seed để tự động khởi tạo các chuyên mục, bài viết, banner và hồ sơ demo an toàn:

```bash
npm run seed
```

Kết quả nạp dữ liệu mẫu:
- 7 Chuyên mục kiến thức KDOL.
- 3 Banner trang chủ chuẩn tỷ lệ mobile.
- 3 Bài viết kiến thức thực chiến.
- 2 Hồ sơ Partner demo an toàn (không chứa dữ liệu người thật).
- 6 Cấu hình thương hiệu & 1 tài khoản quản trị mẫu.

### 4.3 Khởi chạy Máy Chủ Backend (Express API)

```bash
# Chế độ phát triển (Tự động tải lại khi sửa code với Node.js --watch)
npm run dev

# Hoặc khởi chạy thông thường:
npm start
```

Máy chủ sẽ lắng nghe tại:
👉 **`http://localhost:5000`**

---

## 5. Danh Sách API Endpoints

| Phương Thức | Endpoint | Chức Năng | Ghi Chú |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Kiểm tra tình trạng server & kết nối Database | Trả về `status: healthy` khi MongoDB kết nối |
| `POST` | `/api/partners` | Gửi biểu mẫu đăng ký Partner 2 bước | Validate Mongoose, trả về 201 Created |
| `GET` | `/api/partners` | Lấy danh sách hồ sơ đăng ký Partner | Hỗ trợ phân trang `?page=1&limit=20` & lọc `?status=` |
| `GET` | `/api/posts` | Lấy danh sách bài viết kiến thức | Lọc theo `?category=`, tìm kiếm `?q=`, `?page=`, `?limit=` |
| `GET` | `/api/posts/:slug` | Lấy chi tiết bài viết theo Slug | Kèm 3 bài viết liên quan trong cùng chuyên mục |
| `GET` | `/api/categories` | Lấy danh sách chuyên mục kiến thức | Sắp xếp theo trường `order: 1` |
| `GET` | `/api/banners` | Lấy danh sách banners đang kích hoạt | Lọc theo vị trí `?position=home_slider` |

---

## 6. Hướng Dẫn Chạy Frontend Độc Lập

Nếu chỉ cần phát triển hoặc kiểm tra giao diện người dùng mà không cần mở kết nối MongoDB:

```bash
npm run dev:frontend
```
Mở trình duyệt tại: 👉 **`http://localhost:3000`**

---

## 7. Hướng Dẫn Kiểm Tra Dữ Liệu Đăng Ký Partner Trong MongoDB Atlas

Toàn bộ biểu mẫu đăng ký Partner 2 bước trên website đã được kết nối trực tiếp với MongoDB Atlas Cluster qua API `POST /api/partners`.

### 7.1 Cấu Trúc Bản Ghi Partner Trong Collection `partners`

Mỗi hồ sơ đăng ký được lưu trong Database **`thaygiaokdol`**, Collection **`partners`** với các trường quy chuẩn:

| Tên Trường | Kiểu Dữ Liệu | Mô Tả & Quy Chuẩn |
| :--- | :--- | :--- |
| `_id` | `ObjectId` | Khóa chính tự sinh bởi MongoDB |
| `fullName` | `String` | Họ và tên đối tác (đã chuẩn hóa khoảng trắng thừa) |
| `phone` | `String` | Số điện thoại / Zalo (10 chữ số chuẩn đầu số VN) |
| `email` | `String` | Địa chỉ email liên hệ (nếu có, tự động viết thường) |
| `province` | `String` | Tỉnh / Thành phố đang sinh sống |
| `occupation` | `String` | Nghề nghiệp hiện tại (trong danh mục enum cho phép) |
| `goals` | `[String]` | Mảng các mục tiêu hợp tác (ít nhất 1 mục) |
| `experience` | `String` | Mức độ kinh nghiệm kinh doanh |
| `interests` | `[String]` | Mảng ngành hàng quan tâm (ít nhất 1 ngành) |
| `availableTime` | `String` | Quỹ thời gian mỗi ngày (`Dưới 1 giờ`, `1 - 3 giờ`, `Trên 3 giờ`) |
| `startWhen` | `String` | Thời điểm bắt đầu (`Bắt đầu ngay`, `Trong 7 ngày tới`, ...) |
| `preferredContact` | `String` | Kênh liên hệ ưu tiên (`Zalo`, `Điện thoại`, `Email`) |
| `consent` | `Boolean` | Bắt buộc `true` (xác nhận đồng ý điều khoản xử lý dữ liệu) |
| `policyVersion` | `String` | Phiên bản chính sách bảo mật (mặc định `'1.0'`) |
| `consentAt` | `Date` | Thời điểm người dùng nhấn đồng ý |
| `source` | `String` | Nguồn chiến dịch (`website`, `tiktok_live`, `facebook`, `zalo`) |
| `status` | `String` | Trạng thái xử lý: **`new`** (mặc định), `contacted`, `consulting`, `active`, `rejected` |
| `ipAddress` | `String` | Địa chỉ IP gửi yêu cầu (phục vụ audit & rate limit an toàn) |
| `createdAt` | `Date` | Thời điểm tạo hồ sơ trên hệ thống |
| `updatedAt` | `Date` | Thời điểm cập nhật trạng thái gần nhất |

---

### 7.2 Cách Kiểm Tra Trực Quan Trên Giao Diện MongoDB Atlas

1. Truy cập trang quản trị [cloud.mongodb.com](https://cloud.mongodb.com) và đăng nhập tài khoản Atlas.
2. Tại màn hình **Database Deployments**, nhấn vào nút **Browse Collections** ở cụm máy chủ `Cluster0`.
3. Trong danh sách cơ sở dữ liệu bên trái, chọn **`thaygiaokdol`** và nhấp vào collection **`partners`**.
4. Sử dụng thanh **Filter** để tra cứu nhanh các nhóm hồ sơ:
   - **Tìm tất cả hồ sơ mới cần tư vấn:**
     ```json
     { "status": "new" }
     ```
   - **Tìm theo số điện thoại đối tác:**
     ```json
     { "phone": "0912345678" }
     ```
   - **Tìm các hồ sơ đăng ký trong ngày hôm nay:**
     ```json
     { "createdAt": { "$gte": { "$date": "2026-11-11T00:00:00.000Z" } } }
     ```
   - **Lọc theo nguồn chiến dịch TikTok Live:**
     ```json
     { "source": "tiktok_live" }
     ```

---

### 7.3 Cách Kiểm Tra Bằng Dòng Lệnh (CLI) Hoặc REST API

#### Cách 1: Gọi REST API Quản Trị
```bash
# Lấy danh sách 10 hồ sơ mới nhất đang ở trạng thái 'new'
curl -X GET "http://localhost:5000/api/partners?status=new&limit=10"
```

#### Cách 2: Chạy Script Node.js Tra Cứu Trực Tiếp MongoDB
```bash
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
const Partner = require('./server/models/Partner');

mongoose.connect(process.env.MONGODB_URI, { dbName: 'thaygiaokdol' }).then(async () => {
  const total = await Partner.countDocuments();
  const newLeads = await Partner.countDocuments({ status: 'new' });
  const latest = await Partner.find().sort({ createdAt: -1 }).limit(3).select('fullName phone province occupation source status createdAt');
  console.log('--- BÁO CÁO HỒ SƠ PARTNER MONGODB ATLAS ---');
  console.log('Tổng số đối tác:', total);
  console.log('Số hồ sơ mới (status: new):', newLeads);
  console.log('3 đối tác mới nhất:', latest);
  process.exit(0);
});
"
```

---

### 7.4 Các Lớp Bảo Mật & Chống Spam Đã Triển Khai Cho Biểu Mẫu

1. **Honeypot ngầm:** Form chứa trường ẩn `hp_confirm`. Khi spam bot tự động điền giá trị vào trường này, máy chủ sẽ âm thầm lọc bỏ và không lưu vào Database.
2. **Rate Limiting:** Giới hạn tối đa 5 yêu cầu / 15 phút trên mỗi địa chỉ IP (HTTP 429).
3. **Chống gửi trùng ngoài ý muốn (10 phút):** Nếu cùng một số điện thoại gửi lại trong vòng 10 phút, hệ thống sẽ trả về mã `409 Conflict` kèm thông báo thân thiện mà không tạo bản ghi rác. Sau 10 phút, đối tác hoàn toàn có thể gửi lại để cập nhật thông tin.
4. **Bảo vệ dữ liệu cá nhân (No PII in Logs):** Server logs chỉ ghi nhận số điện thoại được ẩn ký tự (`091****678`), tuyệt đối không ghi tên, email hay câu trả lời riêng tư ra console/file log.
5. **Client Security:** Tuyệt đối không lưu dữ liệu đăng ký vào `localStorage`, `sessionStorage` hay truyền qua URL query parameter khi chuyển sang trang cảm ơn.

---

## 8. Hướng Dẫn Hệ Thống Quản Trị /admin

Hệ thống quản trị cung cấp giao diện Mobile-First (430px căn giữa trên Desktop) với đầy đủ các phân hệ quản lý: Dashboard số liệu thật, Hồ sơ đối tác Partner, Kho bài viết, Chuyên mục, Banner và Cấu hình liên hệ.

### 8.1 Thiết Lập Tài Khoản Quản Trị Viên (Setup Admin Script)

Tài khoản Admin được tạo độc lập qua script an toàn, mật khẩu được băm bằng thuật toán **Bcrypt** (Salt rounds = 12), tuyệt đối không hardcode thông tin đăng nhập trong mã nguồn.

```bash
# Cách 1: Chạy trực tiếp với thông tin mong muốn
node server/scripts/setup-admin.js <username> <password> [role]

# Ví dụ tạo tài khoản:
node server/scripts/setup-admin.js admin ThayGiaoKDOL@2026 admin

# Cách 2: Chạy tương tác (Script sẽ hỏi lần lượt username & password)
npm run admin:setup
```

### 8.2 Truy Cập & Đăng Nhập Hệ Thống

1. Mở trình duyệt và truy cập: 👉 **`http://localhost:5000/admin/login.html`**
2. Nhập `username` và `password` vừa tạo.
3. Khi đăng nhập thành công, trình duyệt sẽ tự động nhận **HttpOnly Cookie** (`admin_session`) và chuyển hướng vào Dashboard: 👉 **`http://localhost:5000/admin/index.html`**

### 8.3 Cơ Chế Bảo Mật Toàn Diện Của Phân Hệ Quản Trị

* **HttpOnly & Secure Session Cookie:** Trình duyệt tự động đính kèm cookie khi gọi API qua `credentials: 'include'`. JavaScript phía client không thể đọc cookie này, triệt tiêu nguy cơ rò rỉ qua tấn công XSS.
* **Không Lưu Trữ Token Vào LocalStorage:** Tuyệt đối không lưu JWT hay Access Token vào `localStorage` hoặc `sessionStorage`.
* **Bảo Vệ Chống CSRF (Cross-Site Request Forgery):** Mọi thao tác thay đổi dữ liệu (`POST`, `PUT`, `PATCH`, `DELETE`) bắt buộc phải gửi kèm header `X-CSRF-Token` khớp với token phiên được cấp phát trong bộ nhớ RAM.
* **Rate Limiting Đăng Nhập:** Giới hạn tối đa 5 lần thử đăng nhập thất bại / 15 phút trên mỗi địa chỉ IP (HTTP `429 Too Many Requests`).
* **Session Tự Hủy (TTL):** Phiên đăng nhập được quản lý trong MongoDB collection `adminsessions`, tự động hết hạn và xóa bản ghi sau 24 giờ.
* **Middleware `requireAdmin`:** Chặn toàn bộ truy cập trái phép vào các API quản trị `/api/admin/*` nếu chưa có phiên hợp lệ (HTTP `401 Unauthorized`).
* **Đăng Xuất (Logout):** Xóa hoàn toàn bản ghi phiên khỏi MongoDB Atlas và xóa Cookie trên trình duyệt.


