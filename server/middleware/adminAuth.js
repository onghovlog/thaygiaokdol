/**
 * Admin Authentication & Security Middleware
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Tính năng:
 * - Xác thực phiên đăng nhập qua HttpOnly, Secure, SameSite Cookie.
 * - Chống tấn công CSRF (Cross-Site Request Forgery) trên mọi thao tác thay đổi dữ liệu (POST, PUT, PATCH, DELETE).
 * - Rate Limiting chống Brute-Force mật khẩu đăng nhập.
 * - Tuyệt đối không cho phép truy cập dữ liệu quản trị nếu chưa xác thực (401 Unauthorized).
 */

const crypto = require('crypto');
const Admin = require('../models/Admin');
const AdminSession = require('../models/AdminSession');
const { MemoryRateLimiter } = require('./rateLimiter');

// Rate Limiter cho đăng nhập quản trị: 5 lần trong production, 50 lần trong development/test
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const adminLoginMax = process.env.ADMIN_LOGIN_RATE_LIMIT_MAX
  ? parseInt(process.env.ADMIN_LOGIN_RATE_LIMIT_MAX, 10)
  : (isDev ? 50 : 5);

const loginLimiter = new MemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: adminLoginMax,
  message: 'Bạn đã thử đăng nhập thất bại quá nhiều lần. Vui lòng thử lại sau 15 phút để bảo vệ tài khoản.'
});

const adminLoginRateLimiter = loginLimiter.middleware();

/**
 * Middleware bắt buộc quyền Admin (requireAdmin)
 * Bảo vệ tất cả các endpoint quản trị (/api/admin/*)
 */
async function requireAdmin(req, res, next) {
  try {
    const sessionToken = req.cookies ? req.cookies.admin_session : null;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Yêu cầu đăng nhập quản trị viên để tiếp tục.'
      });
    }

    // 1. Kiểm tra session hợp lệ và chưa hết hạn trong MongoDB Atlas
    const session = await AdminSession.findOne({
      token: sessionToken,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      // Xóa cookie nếu phiên không còn tồn tại hoặc đã hết hạn
      res.clearCookie('admin_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      return res.status(401).json({
        success: false,
        code: 'SESSION_EXPIRED',
        message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.'
      });
    }

    // 2. Kiểm tra tài khoản Admin có còn tồn tại trong hệ thống
    const admin = await Admin.findById(session.adminId).select('-passwordHash');
    if (!admin) {
      await AdminSession.deleteOne({ _id: session._id });
      res.clearCookie('admin_session');
      return res.status(401).json({
        success: false,
        code: 'ACCOUNT_NOT_FOUND',
        message: 'Tài khoản quản trị không tồn tại.'
      });
    }

    // 3. Bảo vệ chống CSRF cho các phương thức thay đổi dữ liệu (Mutating Methods)
    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (mutatingMethods.includes(req.method)) {
      // Ngoại lệ cho route đăng xuất không cần kiểm tra CSRF nghiêm ngặt
      const isLogoutRoute = req.path.endsWith('/logout');
      if (!isLogoutRoute) {
        const clientCsrfToken = req.headers['x-csrf-token'];
        if (!clientCsrfToken || clientCsrfToken !== session.csrfToken) {
          return res.status(403).json({
            success: false,
            code: 'CSRF_INVALID',
            message: 'Mã xác thực CSRF Token không hợp lệ hoặc bị thiếu. Yêu cầu đã bị từ chối vì lý do an toàn.'
          });
        }
      }
    }

    // Gắn thông tin admin và session vào request
    req.admin = admin;
    req.adminSession = session;
    next();

  } catch (error) {
    next(error);
  }
}

/**
 * Sinh chuỗi ngẫu nhiên an toàn bằng thư viện crypto chuẩn
 */
function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = {
  requireAdmin,
  adminLoginRateLimiter,
  generateSecureToken
};

