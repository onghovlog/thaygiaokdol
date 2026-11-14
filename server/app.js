/**
 * Express Application Setup
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Kiến trúc bảo mật đa tầng:
 * - Tắt nhận diện công nghệ X-Powered-By
 * - Thiết lập Security Headers toàn diện (MIME sniffing, Clickjacking, Referrer Policy, HSTS, CSP)
 * - Kiểm soát CORS nghiêm ngặt theo Allowlist (chặn phản xạ wildcard khi có credentials)
 * - Giới hạn dung lượng payload JSON/URL-encoded chống DoS
 * - Rate Limiting toàn cục và chuyên biệt cho từng loại tài nguyên
 * - Cách ly và ngăn duyệt danh mục thư mục uploads
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const apiRoutes = require('./routes/api');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');
const { globalApiRateLimiter } = require('./middleware/rateLimiter');

const app = express();

// Kích hoạt tin cậy reverse proxy (Nginx trên aaPanel / VPS)
app.set('trust proxy', 1);

// ==========================================
// 1. Tắt X-Powered-By để tránh lộ thông tin máy chủ
// ==========================================
app.disable('x-powered-by');

// ==========================================
// 2. Middleware Security Headers & Content Security Policy (CSP)
// ==========================================
app.use((req, res, next) => {
  // Chống MIME-sniffing: Trình duyệt không được đoán MIME type sai khác Content-Type
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Chống Clickjacking: Chỉ cho phép nhúng frame từ chính origin của website
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Chuẩn XSS Protection hiện đại (vô hiệu hóa bộ lọc cũ của trình duyệt để tránh lỗ hổng phụ)
  res.setHeader('X-XSS-Protection', '0');

  // Chính sách gửi Referrer: Gửi đầy đủ trong nội bộ, chỉ gửi origin khi sang site khác
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Giới hạn quyền truy cập phần cứng & thiết bị người dùng (Permissions Policy)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS (HTTP Strict Transport Security) trong môi trường Production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Content Security Policy (CSP): Kiểm soát nguồn tài nguyên an toàn cho giao diện mobile & admin
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'"
  ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  next();
});

// ==========================================
// 3. Cấu hình CORS theo Allowlist nghiêm ngặt
// ==========================================
const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
  : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (ví dụ: mobile app, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Chống lỗ hổng cấu hình: Không cho phép phản xạ wildcard '*' khi credentials = true
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' không được cấp quyền truy cập theo cấu hình CORS an toàn.`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    credentials: true,
    maxAge: 86400
  })
);

// ==========================================
// 4. Middlewares phân tích cú pháp (Parsers với giới hạn kích thước)
// ==========================================
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ==========================================
// 5. Phục vụ tĩnh giao diện Frontend & Thư mục Uploads (Tối ưu Caching & Bảo mật)
// ==========================================
const isDev = process.env.NODE_ENV !== 'production';

const staticOptions = {
  maxAge: isDev ? 0 : '1d',
  dotfiles: 'ignore', // Chặn truy cập các file ẩn (.env, .git...)
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || isDev) {
      // HTML hoặc môi trường phát triển: Luôn revalidate ngay để nhận CSS/JS mới nhất
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.match(/\.(css|js|svg|png|jpg|jpeg|webp|woff2?|ico)$/i)) {
      // Tài nguyên tĩnh trong Production: Cache 1 ngày, stale-while-revalidate 7 ngày
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    }
  }
};

// Sitemap XML động (Cập nhật thời gian thực từ MongoDB Atlas)
const Post = require('./models/Post');
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const posts = await Post.find({ status: 'published' }).select('slug updatedAt').lean();
    const siteUrl = 'https://thaygiaokdol.vn';
    const today = new Date().toISOString().slice(0, 10);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const staticPages = [
      { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${siteUrl}/gioi-thieu.html`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${siteUrl}/kien-thuc.html`, changefreq: 'daily', priority: '0.9' },
      { loc: `${siteUrl}/dang-ky-partner.html`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${siteUrl}/chinh-sach-bao-mat.html`, changefreq: 'monthly', priority: '0.5' },
    ];

    staticPages.forEach(p => {
      xml += `  <url>\n    <loc>${p.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    });

    posts.forEach(post => {
      const lastMod = post.updatedAt ? new Date(post.updatedAt).toISOString().slice(0, 10) : today;
      xml += `  <url>\n    <loc>${siteUrl}/bai-viet.html?slug=${encodeURIComponent(post.slug)}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(xml);
  } catch (error) {
    next(error);
  }
});

app.use(express.static(path.join(__dirname, '../client'), staticOptions));

// Thư mục uploads: Chặn directory listing (index: false) và chặn dotfiles
// Hỗ trợ cả truy cập trực tiếp từ root (/uploads) và từ thư mục con admin (/admin/uploads)
app.use(
  ['/uploads', '/admin/uploads'],
  express.static(path.join(__dirname, '../client/uploads'), {
    ...staticOptions,
    index: false
  })
);

app.use(
  ['/assets', '/admin/assets'],
  express.static(path.join(__dirname, '../client/assets'), staticOptions)
);

// ==========================================
// 6. Định tuyến API (/api/*) với Global Rate Limiter
// ==========================================
app.use('/api', globalApiRateLimiter, apiRoutes);

// ==========================================
// 7. Xử lý 404 & Centralized Error Handler
// ==========================================
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
