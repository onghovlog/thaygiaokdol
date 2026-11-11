/**
 * In-Memory Sliding Window Rate Limiter Middleware
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Bảo vệ các endpoint nhạy cảm (như POST /api/partners) chống spam và DDoS.
 * Không phụ thuộc thư viện ngoài, tự động thu dọn bộ nhớ định kỳ.
 */

class MemoryRateLimiter {
  constructor({ windowMs = 15 * 60 * 1000, max = 5, message = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.' } = {}) {
    this.windowMs = windowMs;
    this.max = max;
    this.message = message;
    this.hits = new Map();

    // Dọn dẹp bản ghi hết hạn mỗi 5 phút để tránh rò rỉ bộ nhớ
    this.cleanupTimer = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.hits.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < this.windowMs);
      if (validTimestamps.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, validTimestamps);
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      // Lấy IP của client (xử lý cả trường hợp đứng sau proxy)
      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || req.ip || 'unknown');
      const now = Date.now();

      const timestamps = this.hits.get(ip) || [];
      const recentTimestamps = timestamps.filter(t => now - t < this.windowMs);

      if (recentTimestamps.length >= this.max) {
        return res.status(429).json({
          success: false,
          code: 'RATE_LIMIT_EXCEEDED',
          message: this.message
        });
      }

      recentTimestamps.push(now);
      this.hits.set(ip, recentTimestamps);

      // Thêm thông tin rate limit vào headers
      res.setHeader('X-RateLimit-Limit', this.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.max - recentTimestamps.length));

      next();
    };
  }
}

// Ngưỡng giới hạn đăng ký: production 5 lần / 15 phút, development cho phép 30 lần để test
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const maxRequests = process.env.PARTNER_RATE_LIMIT_MAX 
  ? parseInt(process.env.PARTNER_RATE_LIMIT_MAX, 10) 
  : (isDev ? 30 : 5);

// Giới hạn số lần đăng ký đối tác trong 15 phút cho mỗi địa chỉ IP
const partnerRateLimiter = new MemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: maxRequests,
  message: 'Bạn đã thực hiện quá nhiều yêu cầu đăng ký trong thời gian ngắn. Vui lòng thử lại sau 15 phút.'
}).middleware();

// Giới hạn tổng thể cho tất cả các API công khai (/api/*) chống DDoS và lạm dụng tài nguyên
const globalApiMax = process.env.GLOBAL_API_RATE_LIMIT_MAX
  ? parseInt(process.env.GLOBAL_API_RATE_LIMIT_MAX, 10)
  : (isDev ? 1000 : 200);

const globalApiRateLimiter = new MemoryRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: globalApiMax,
  message: 'Hệ thống phát hiện tần suất yêu cầu API bất thường từ địa chỉ IP của bạn. Vui lòng thử lại sau ít phút.'
}).middleware();

module.exports = {
  partnerRateLimiter,
  globalApiRateLimiter,
  MemoryRateLimiter
};
