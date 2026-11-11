# 🛡️ BÁO CÁO & DANH MỤC KIỂM TRA BẢO MẬT (SECURITY CHECKLIST)
## Website Thầy Giáo KDOL — Slogan: "1 đơn hàng - 1 nụ cười"
*Phiên bản: 1.0.0 | Ngày đánh giá: 11/11/2026 | Trạng thái tổng thể: ✅ ĐÃ HOÀN TẤT VÀ KHẮC PHỤC TOÀN DIỆN*

---

## 📑 BẢNG TỔNG HỢP KIỂM ĐỊNH AN TOÀN THÔNG TIN

| STT | Hạng mục kiểm tra | Mức độ rủi ro ban đầu | Trạng thái hiện tại | Tệp tin & Vị trí xử lý |
| :---: | :--- | :---: | :---: | :--- |
| **01** | **Chống Regex Injection / ReDoS khi tìm kiếm** | 🔴 **CRITICAL** | ✅ **Đã khắc phục** | `server/utils/sanitize.js`, `server/controllers/postController.js`, `server/controllers/bannerController.js` |
| **02** | **Security Headers & Content Security Policy (CSP)** | 🟠 **HIGH** | ✅ **Đã khắc phục** | `server/app.js` (Tắt X-Powered-By, CSP, HSTS, X-Content-Type-Options, X-Frame-Options) |
| **03** | **Global API Rate Limiting (Chống DDoS / Resource Exhaustion)** | 🟠 **HIGH** | ✅ **Đã khắc phục** | `server/middleware/rateLimiter.js`, `server/app.js` |
| **04** | **Kiểm soát CORS Allowlist & Ngăn chặn Wildcard Credentials** | 🟡 **MEDIUM** | ✅ **Đã khắc phục** | `server/app.js` |
| **05** | **Ẩn Stack Trace & Làm sạch Error Message trong Production** | 🟡 **MEDIUM** | ✅ **Đã khắc phục** | `server/middleware/errorHandler.js` |
| **06** | **Ngăn ngừa Type Confusion & NoSQL Injection trên Query Params** | 🟡 **MEDIUM** | ✅ **Đã khắc phục** | `server/controllers/categoryController.js`, `server/controllers/bannerController.js` |
| **07** | **Bảo vệ thư mục tĩnh Uploads & Chặn Directory Listing** | 🟢 **LOW** | ✅ **Đã khắc phục** | `server/app.js` (`index: false`, `dotfiles: 'ignore'`) |
| **08** | **Input Validation & Sanitization toàn diện** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `server/controllers/partnerController.js`, `server/utils/sanitize.js` |
| **09** | **Chống tấn công XSS (Reflected & Stored XSS)** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `client/js/components/*.js`, `client/admin/js/admin.js`, `server/utils/sanitize.js` |
| **10** | **Chống tấn công CSRF trên mọi thao tác quản trị** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `server/middleware/adminAuth.js` (Double-Submit Token via `X-CSRF-Token`) |
| **11** | **Chống tấn công CSV Formula Injection (DDE)** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `server/controllers/adminPartnerController.js` (`sanitizeCsvCell`) |
| **12** | **Chống lỗi IDOR & Phân quyền Admin Endpoints** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `server/middleware/adminAuth.js` (`requireAdmin`), `server/routes/adminRoutes.js` |
| **13** | **Chống Open Redirect & Lọc URL độc hại** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `server/utils/urlValidator.js` (`isSafeUrl`, `sanitizeDestinationUrl`) |
| **14** | **Quản lý Phiên Cookie (HttpOnly, Secure, SameSite, TTL Index)** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `server/models/AdminSession.js`, `server/controllers/adminController.js` |
| **15** | **Băm mật khẩu Quản trị (Password Hashing)** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `server/models/Admin.js` (Bcrypt, Salt rounds = 12) |
| **16** | **Chống Brute-Force đăng nhập (Login Rate Limiter)** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `server/middleware/adminAuth.js` (`adminLoginRateLimiter`: 5 lần / 15 phút) |
| **17** | **Bảo vệ Bí mật & Chuỗi kết nối MongoDB Atlas** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `.env`, `.env.example`, `.gitignore`, `server/config/db.js` |
| **18** | **Kiểm soát Upload File an toàn & Giới hạn dung lượng** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `server/middleware/upload.js` (Chặn SVG/HTML, 5MB, random hex filename) |
| **19** | **Kiểm tra lỗ hổng phụ thuộc bên thứ ba (Dependencies Audit)** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `package.json` (`npm audit`: 0 vulnerabilities) |
| **20** | **Bảo vệ dữ liệu riêng tư trong Log (No PII in Logs)** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `server/controllers/partnerController.js` (`maskPhone`), `server/middleware/errorHandler.js` |
| **21** | **Chính sách bảo mật & Đồng ý xử lý dữ liệu (Consent)** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `client/chinh-sach-bao-mat.html`, `server/models/Partner.js` (Nghị định 13/2023/NĐ-CP) |
| **22** | **Thực thi quyền chủ thể dữ liệu (Truy cập, Sửa, Xóa)** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | `server/controllers/adminPartnerController.js` (`getPartnerById`, `updatePartnerProfile`, `deletePartner`) |
| **23** | **Không sử dụng Marketing Tracker / Analytics không cần thiết** | 🛡️ **STANDARD** | ✅ **Đạt chuẩn** | Toàn bộ mã nguồn phía client thuần Vanilla JS, 0 tracker bên thứ 3 |

---

## 🔍 CHI TIẾT TỪNG NỘI DUNG ĐÁNH GIÁ & GIẢI PHÁP ĐÃ THỰC HIỆN

### 1. Chống Regex Injection / ReDoS (Denial of Service)
- **Vấn đề phát hiện:** Trước đây, tại các bộ điều khiển `postController.js` và `bannerController.js`, tham số tìm kiếm của người dùng được đưa trực tiếp vào hàm khởi tạo `new RegExp(keyword, 'i')`. Khi kẻ tấn công truyền các ký tự đặc biệt chưa đóng ngoặc như `?search=(?=[a-z]+` hoặc `?category=([0-9]`, Node.js phát sinh ngoại lệ cú pháp Regex chưa được kiểm soát dẫn đến lỗi 500 hoặc rủi ro Catastrophic Backtracking (ReDoS).
- **Mức độ:** 🔴 **CRITICAL**
- **Giải pháp xử lý:**
  - Bổ sung hàm tiện ích `escapeRegex(str)` trong [sanitize.js](file:///c:/laragon/www/ThayGiaoKDOL/server/utils/sanitize.js#L54-L63) sử dụng biểu thức chính quy chuẩn `/[.*+?^${}()|[\]\\]/g`.
  - Áp dụng chuẩn hóa và thoát chuỗi toàn bộ từ khóa tìm kiếm và lọc chuyên mục tại [postController.js](file:///c:/laragon/www/ThayGiaoKDOL/server/controllers/postController.js#L26-L45) và [bannerController.js](file:///c:/laragon/www/ThayGiaoKDOL/server/controllers/bannerController.js#L70-L75).
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC HOÀN TOÀN** (Đã kiểm chứng tự động trả về 200 OK khi nhập regex đặc biệt).

---

### 2. Security Headers & Content Security Policy (CSP)
- **Vấn đề phát hiện:** Server chưa khai báo các tiêu đề bảo mật chuẩn OWASP; tiêu đề `X-Powered-By: Express` bị lộ ra ngoài; chưa có CSP kiểm soát nguồn thực thi script và tải tài nguyên; chưa có `X-Content-Type-Options: nosniff` để ngăn chặn MIME-sniffing trên các file tĩnh và file ảnh upload.
- **Mức độ:** 🟠 **HIGH**
- **Giải pháp xử lý:**
  - Tắt tiêu đề công nghệ bằng `app.disable('x-powered-by')` trong [app.js](file:///c:/laragon/www/ThayGiaoKDOL/server/app.js#L28-L30).
  - Thiết lập middleware security headers trong [app.js](file:///c:/laragon/www/ThayGiaoKDOL/server/app.js#L32-L73):
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: SAMEORIGIN` (Chống Clickjacking)
    - `X-XSS-Protection: 0` (Thay thế bằng CSP hiện đại)
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (Kích hoạt tự động trên môi trường Production)
    - `Content-Security-Policy`:
      ```
      default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'
      ```
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC HOÀN TOÀN**.

---

### 3. Global API Rate Limiting (Chống Brute-Force & DDoS)
- **Vấn đề phát hiện:** Trước đây hệ thống chỉ giới hạn tốc độ tại `POST /api/partners` và `POST /api/admin/auth/login`. Các API công khai còn lại (`/api/posts`, `/api/categories`, `/api/banners`, `/api/settings/public`) chưa có rate limiter, tiềm ẩn nguy cơ bị bot cào dữ liệu liên tục gây nghẽn kết nối MongoDB Atlas.
- **Mức độ:** 🟠 **HIGH**
- **Giải pháp xử lý:**
  - Xây dựng middleware `globalApiRateLimiter` tại [rateLimiter.js](file:///c:/laragon/www/ThayGiaoKDOL/server/middleware/rateLimiter.js#L78-L92) áp dụng thuật toán Sliding Window In-Memory tự động thu dọn bộ nhớ.
  - Giới hạn: Production tối đa 200 requests / 15 phút / IP; Development hỗ trợ 1000 requests / 15 phút.
  - Gắn middleware trực tiếp vào tuyến tiền tố `/api` trong [app.js](file:///c:/laragon/www/ThayGiaoKDOL/server/app.js#L182).
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC HOÀN TOÀN**.

---

### 4. Kiểm soát CORS Allowlist & Ngăn chặn Wildcard Credentials
- **Vấn đề phát hiện:** Cơ chế kiểm tra CORS cũ chứa logic `allowedOrigins.includes('*')` kết hợp với `credentials: true`. Nếu quản trị viên cấu hình `CORS_ORIGIN=*`, trình duyệt hoặc kẻ tấn công có thể lợi dụng phản xạ Origin để đọc dữ liệu phiên đăng nhập qua cookie.
- **Mức độ:** 🟡 **MEDIUM**
- **Giải pháp xử lý:**
  - Khắt khe hóa hàm kiểm tra Origin trong [app.js](file:///c:/laragon/www/ThayGiaoKDOL/server/app.js#L86-L95): Chỉ cho phép các Origin khớp chính xác trong mảng `allowedOrigins` (hỗ trợ localhost, 127.0.0.1 và domain production). Tuyệt đối không chấp nhận phản xạ wildcard khi bật `credentials: true`.
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC HOÀN TOÀN**.

---

### 5. Xử lý Lỗi & Ẩn Stack Trace trong Production
- **Vấn đề phát hiện:** Khi xảy ra lỗi máy chủ nội bộ (500), thông điệp lỗi gốc `err.message` có thể chứa chi tiết driver database hoặc đường dẫn file hệ thống.
- **Mức độ:** 🟡 **MEDIUM**
- **Giải pháp xử lý:**
  - Cập nhật [errorHandler.js](file:///c:/laragon/www/ThayGiaoKDOL/server/middleware/errorHandler.js#L48-L62): Trong môi trường `production`, tất cả lỗi trạng thái 500 đều được chuẩn hóa thành: *"Đã có lỗi xảy ra trên hệ thống máy chủ. Vui lòng thử lại sau ít phút."*
  - Trường `stack` chỉ được trả về khi `NODE_ENV === 'development'`.
  - Log server trong production chỉ in tên lỗi và thông điệp tóm tắt, không in stack trace hay request body thô.
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC HOÀN TOÀN**.

---

### 6. Ngăn ngừa NoSQL Injection & Type Confusion trên Query Params
- **Vấn đề phát hiện:** Tham số `position` trong truy vấn banner có thể bị tấn công truyền Object (ví dụ: `?position[$ne]=home`) gây lỗi runtime `TypeError: position.toLowerCase is not a function`.
- **Mức độ:** 🟡 **MEDIUM**
- **Giải pháp xử lý:**
  - Ép kiểu dữ liệu chuỗi an toàn `const rawPos = typeof position === 'string' ? position : 'home_slider'` tại [bannerController.js](file:///c:/laragon/www/ThayGiaoKDOL/server/controllers/bannerController.js#L24-L32) và [categoryController.js](file:///c:/laragon/www/ThayGiaoKDOL/server/controllers/categoryController.js#L35-L44) trước khi đưa vào truy vấn Mongoose.
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC HOÀN TOÀN**.

---

### 7. Bảo vệ Thư mục Uploads & Chặn Directory Listing
- **Vấn đề phát hiện:** Thư mục `/uploads` cần được bảo vệ để người dùng bên ngoài không thể duyệt danh sách các file đã upload (directory indexing).
- **Mức độ:** 🟢 **LOW**
- **Giải pháp xử lý:**
  - Cấu hình `{ index: false, dotfiles: 'ignore' }` cho `express.static` phục vụ thư mục `client/uploads` tại [app.js](file:///c:/laragon/www/ThayGiaoKDOL/server/app.js#L170-L177). Truy cập trực tiếp `/uploads/` sẽ trả về `404 Not Found`.
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC HOÀN TOÀN**.

---

### 8. Input Validation, Anti-Spam & Honeypot Form Đăng ký Partner
- **Cơ chế bảo vệ:**
  - Kiểm tra kiểu dữ liệu, định dạng số điện thoại chuẩn Việt Nam (10 số, đầu số 03, 05, 07, 08, 09), độ dài họ tên (2–100 ký tự).
  - Whitelist các giá trị enum hợp lệ cho nghề nghiệp, mục tiêu, kinh nghiệm, ngành hàng, quỹ thời gian, thời điểm bắt đầu.
  - Tích hợp 3 trường bẫy Honeypot ẩn (`hp_confirm`, `website_hp`, `honeypot`). Bot tự động điền form sẽ bị chặn ngay và nhận phản hồi giả lập thành công mà không ghi vào cơ sở dữ liệu.
  - Cơ chế chống gửi trùng vô ý (Duplicate Submission Prevention): Chặn các lần gửi trùng cùng số điện thoại trong 10 phút, không chặn vĩnh viễn.
- **Vị trí tệp:** [partnerController.js](file:///c:/laragon/www/ThayGiaoKDOL/server/controllers/partnerController.js#L30-L240).
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 9. Chống Tấn công XSS (Cross-Site Scripting)
- **Phía Backend:** Hàm [sanitizeHtml](file:///c:/laragon/www/ThayGiaoKDOL/server/utils/sanitize.js#L9-L30) bóc tách toàn bộ thẻ `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, `<applet>`, các sự kiện inline `on*` (onclick, onerror, onload...) và giao thức giả `javascript:`. Nội dung bài viết luôn được sanitize trước khi lưu và trước khi trả về client.
- **Phía Frontend:** Hàm `escapeHtml()` được tích hợp và gọi đồng bộ trên toàn bộ dữ liệu nội dung động (bài viết, bình luận, tên banner, thông tin partner trong trang quản trị) tại [admin.js](file:///c:/laragon/www/ThayGiaoKDOL/client/admin/js/admin.js#L1741-L1748).
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 10. Chống Tấn công CSRF (Cross-Site Request Forgery)
- **Cơ chế bảo vệ:**
  - Cookie phiên `admin_session` thiết lập cờ `SameSite=lax` (hoặc `strict`), ngăn chặn việc tự động gửi cookie từ các website bên ngoài khi thực hiện các yêu cầu POST ngầm.
  - Áp dụng cơ chế **Double Submit / Custom Header Token**: Mọi thao tác thay đổi dữ liệu (`POST`, `PUT`, `PATCH`, `DELETE`) trong phân hệ quản trị đều bắt buộc phải gửi kèm header `X-CSRF-Token` khớp với giá trị token ngẫu nhiên được sinh bằng mã hóa chuẩn `crypto.randomBytes(24)` lưu trong phiên làm việc tại MongoDB Atlas.
- **Vị trí tệp:** [adminAuth.js](file:///c:/laragon/www/ThayGiaoKDOL/server/middleware/adminAuth.js#L74-L90).
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 11. Chống Tấn công CSV Formula Injection (DDE Attack)
- **Cơ chế bảo vệ:**
  - Khi xuất báo cáo danh sách Partner ra tệp CSV để mở trong Microsoft Excel, kẻ tấn công có thể chèn các ký tự công thức (`=`, `+`, `-`, `@`, `\t`, `\r`) vào trường Họ tên hoặc Ghi chú để thực thi mã độc trên máy tính của người quản trị.
  - Hệ thống sử dụng hàm [sanitizeCsvCell](file:///c:/laragon/www/ThayGiaoKDOL/server/controllers/adminPartnerController.js#L107-L125): Tự động thêm tiền tố dấu nháy đơn `'` nếu phát hiện các ký tự công thức nguy hiểm ở đầu chuỗi, đồng thời thoát dấu nháy kép `""` theo chuẩn RFC 4180 và gắn UTF-8 BOM (`\uFEFF`) để hiển thị tiếng Việt hoàn hảo.
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 12. Chống Lỗi IDOR & Phân quyền Toàn diện Admin Endpoints
- **Cơ chế bảo vệ:**
  - Tất cả các endpoint quản trị (/api/admin/*) đều được bảo vệ bởi middleware `requireAdmin`.
  - Nếu không có cookie `admin_session` hợp lệ hoặc phiên đã hết hạn, hệ thống trả về ngay lập tức mã `401 Unauthorized`.
  - Tuyệt đối không cung cấp endpoint GET công khai cho danh sách Partner. Tuyến `router.all('/')` trên public partner route tự động từ chối bằng `405 Method Not Allowed`.
- **Vị trí tệp:** [adminRoutes.js](file:///c:/laragon/www/ThayGiaoKDOL/server/routes/adminRoutes.js), [adminAuth.js](file:///c:/laragon/www/ThayGiaoKDOL/server/middleware/adminAuth.js).
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 13. Chống Open Redirect & Xác thực Đường dẫn Đích
- **Cơ chế bảo vệ:**
  - Utility [urlValidator.js](file:///c:/laragon/www/ThayGiaoKDOL/server/utils/urlValidator.js#L8-L48) chặn triệt để các giao thức nguy hại (`javascript:`, `vbscript:`, `data:`, `file:`, `about:`, `blob:`) và tấn công Newline Injection (`\r`, `\n`, `\0`).
  - Mọi URL liên kết của Banner và Cấu hình website đều phải vượt qua hàm `isSafeUrl()` trước khi được lưu vào cơ sở dữ liệu.
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 14. Quản lý Phiên Cookie & Tự động Hủy Phiên Hết hạn
- **Cơ chế bảo vệ:**
  - Cookie `admin_session` có các cờ bảo vệ tối đa:
    - `HttpOnly: true` (Ngăn chặn mã JavaScript độc hại truy cập đánh cắp cookie).
    - `Secure: true` trên môi trường Production (Chỉ truyền qua kết nối HTTPS bảo mật).
    - `SameSite: 'lax'` (Chống CSRF cross-origin).
    - `path: '/'`.
  - Phiên lưu tại MongoDB Atlas trong collection `AdminSession` có trường `expiresAt` (thời lượng 24 giờ).
  - Tích hợp **TTL Index** của MongoDB: `{ expiresAt: 1 }, { expireAfterSeconds: 0 }` giúp cơ sở dữ liệu tự động thanh lọc và xóa các phiên hết hạn trong nền mà không tốn tài nguyên ứng dụng.
- **Vị trí tệp:** [AdminSession.js](file:///c:/laragon/www/ThayGiaoKDOL/server/models/AdminSession.js#L50-L54), [adminController.js](file:///c:/laragon/www/ThayGiaoKDOL/server/controllers/adminController.js#L80-L86).
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 15. Băm Mật khẩu & Quản lý Tài khoản Quản trị
- **Cơ chế bảo vệ:**
  - Mật khẩu được băm một chiều bằng thuật toán Bcrypt với hệ số muối an toàn cao (`Salt rounds = 12`).
  - Schema Mongoose của Admin loại bỏ trường `passwordHash` khi truy vấn thông tin (`select('-passwordHash')`).
  - Tài khoản Admin được khởi tạo an toàn qua script độc lập [setup-admin.js](file:///c:/laragon/www/ThayGiaoKDOL/server/scripts/setup-admin.js) với giao diện dòng lệnh tương tác, yêu cầu mật khẩu tối thiểu 6 ký tự, không hardcode thông tin đăng nhập trong mã nguồn.
- **Vị trí tệp:** [Admin.js](file:///c:/laragon/www/ThayGiaoKDOL/server/models/Admin.js#L45-L56).
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 16. Chống Brute-Force Đăng nhập Quản trị
- **Cơ chế bảo vệ:**
  - Áp dụng `adminLoginRateLimiter` tại [adminAuth.js](file:///c:/laragon/www/ThayGiaoKDOL/server/middleware/adminAuth.js#L17-L25): Giới hạn tối đa 5 lần thử đăng nhập trong vòng 15 phút cho mỗi địa chỉ IP.
  - Khi vượt quá ngưỡng, hệ thống trả về HTTP `429 Too Many Requests` và tạm khóa địa chỉ IP đó cho đến khi hết cửa sổ thời gian.
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 17. Cách ly Bí mật & Chuỗi kết nối MongoDB Atlas
- **Cơ chế bảo vệ:**
  - Chuỗi kết nối MongoDB Atlas `MONGODB_URI` và các thông số nhạy cảm được nạp qua biến môi trường (.env), không commit vào kho lưu trữ mã nguồn.
  - Tệp [.gitignore](file:///c:/laragon/www/ThayGiaoKDOL/.gitignore) đã cấu hình loại trừ `.env`, `.env.local`, `logs/`, `*.log`.
  - Bộ điều khiển [settingController.js](file:///c:/laragon/www/ThayGiaoKDOL/server/controllers/settingController.js#L25-L27) thiết lập mẫu biểu thức chính quy `SENSITIVE_KEY_PATTERN` nhằm phát hiện và ngăn cấm tuyệt đối việc lưu trữ chuỗi kết nối, token, jwt hay mật khẩu vào collection Settings.
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 18. Kiểm soát Upload File & Giới hạn Dung lượng
- **Cơ chế bảo vệ:**
  - Chỉ chấp nhận 3 định dạng ảnh web an toàn: `.jpg` / `.jpeg`, `.png`, `.webp`.
  - Cấm tuyệt đối tải lên định dạng SVG (`image/svg+xml`, `.svg`) do tiềm ẩn nguy cơ nhúng mã JavaScript độc hại (Stored XSS). Cấm tải lên tệp `.html`, `.htm`, script.
  - Giới hạn kích thước file upload nghiêm ngặt ở mức 5MB.
  - Tên tệp lưu trữ trên đĩa được sinh ngẫu nhiên bằng chuỗi băm an toàn `crypto.randomBytes(6)` kết hợp timestamp, hoàn toàn vô hiệu hóa kỹ thuật Directory Traversal (`../../`) và tệp đuôi kép (`.php.jpg`).
- **Vị trí tệp:** [upload.js](file:///c:/laragon/www/ThayGiaoKDOL/server/middleware/upload.js#L46-L85).
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 19. Đánh giá Lỗ hổng Thư viện (Dependency Security Audit)
- **Kết quả kiểm tra:** Chạy lệnh kiểm tra an ninh tự động `npm audit` trên toàn bộ dependencies của dự án:
  ```bash
  $ npm audit
  found 0 vulnerabilities
  ```
- Toàn bộ gói thư viện cốt lõi (`express`, `mongoose`, `bcryptjs`, `cookie-parser`, `cors`, `multer`, `dotenv`) đều sử dụng phiên bản mới nhất, không có lỗ hổng bảo mật đã công bố.
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 20. Không Ghi Thông tin Cá nhân (PII) vào Server Logs
- **Cơ chế bảo vệ:**
  - Tại [partnerController.js](file:///c:/laragon/www/ThayGiaoKDOL/server/controllers/partnerController.js#L21-L25), số điện thoại được làm mờ (masked) qua hàm `maskPhone()` (ví dụ: `098****888`) trước khi đưa vào log đăng ký thành công.
  - Tuyệt đối không in email, họ tên, địa chỉ hoặc request body chứa dữ liệu cá nhân vào log máy chủ.
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 21. Tuân thủ Chính sách Bảo mật & Đồng ý Xử lý Dữ liệu Cá nhân
- **Cơ chế bảo vệ:**
  - Trang [chinh-sach-bao-mat.html](file:///c:/laragon/www/ThayGiaoKDOL/client/chinh-sach-bao-mat.html) trình bày minh bạch mục đích thu thập, phạm vi sử dụng nội bộ, thời hạn lưu trữ và cam kết không bán/chia sẻ dữ liệu cho bên thứ ba.
  - Form đăng ký Partner bắt buộc người dùng tick chọn checkbox xác nhận đồng ý với chính sách xử lý dữ liệu trước khi gửi.
  - Backend kiểm tra và lưu lại thời điểm xác nhận (`consentAt`) và phiên bản chính sách (`policyVersion`) theo đúng quy định của Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 22. Thực thi Quyền của Chủ thể Dữ liệu (Truy cập, Sửa đổi, Xóa bỏ)
- **Cơ chế bảo vệ:**
  - Chủ thể dữ liệu có toàn quyền yêu cầu tra cứu, chỉnh sửa thông tin sai sót hoặc xóa vĩnh viễn dữ liệu cá nhân khỏi hệ thống qua hotline/Zalo.
  - Trang quản trị Admin Partner đã được trang bị đầy đủ các API hỗ trợ quyền chủ thể dữ liệu:
    - **Quyền truy cập:** Xem chi tiết hồ sơ đối tác (`GET /api/admin/partners/:id`).
    - **Quyền chỉnh sửa:** Cập nhật thông tin cá nhân và nhu cầu theo yêu cầu của đối tác (`PUT /api/admin/partners/:id`).
    - **Quyền xóa bỏ:** Xóa vĩnh viễn hồ sơ khỏi cơ sở dữ liệu MongoDB Atlas (`DELETE /api/admin/partners/:id`).
- **Vị trí tệp:** [adminPartnerController.js](file:///c:/laragon/www/ThayGiaoKDOL/server/controllers/adminPartnerController.js#L260-L380).
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

### 23. Quyền Riêng tư: Tối giản Tracking & Không sử dụng Analytics Trái phép
- **Cơ chế bảo vệ:**
  - Toàn bộ website được xây dựng bằng Vanilla JavaScript thuần, không tích hợp bất kỳ mã theo dõi bên thứ ba nào (như Google Tag Manager, Facebook Pixel, TikTok Pixel, Hotjar hay Clarity) khi chưa có sự đồng ý cụ thể của người dùng.
  - Tôn trọng quyền riêng tư của khách hàng và duy trì tốc độ tải trang tối ưu nhất.
- **Trạng thái:** ✅ **ĐẠT TIÊU CHUẨN AN TOÀN**.

---

## 🚀 KẾT LUẬN & KHUYẾN NGHỊ VẬN HÀNH

Hệ thống website **Thầy Giáo KDOL** đã hoàn thành đợt kiểm tra an ninh toàn diện và được gia cố đầy đủ các cơ chế phòng thủ chuyên sâu từ tầng Network/Headers, Application Middleware, API Controllers cho tới tầng Cơ sở dữ liệu và Giao diện người dùng.

**Khuyến nghị khi triển khai Production:**
1. Đảm bảo cấu hình biến môi trường `NODE_ENV=production` trên máy chủ lưu trữ để kích hoạt tự động cờ `Secure: true` cho cookie và tiêu đề `Strict-Transport-Security` (HSTS).
2. Tạo tài khoản quản trị viên chính thức bằng lệnh `npm run admin:setup` và sử dụng mật khẩu mạnh (>= 12 ký tự kết hợp chữ, số, ký tự đặc biệt).
3. Đặt lịch sao lưu định kỳ cơ sở dữ liệu MongoDB Atlas tự động (Cloud Backup).

