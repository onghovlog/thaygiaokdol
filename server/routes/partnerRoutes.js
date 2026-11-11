/**
 * Partner Routes (Public)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Lưu ý bảo mật: Tuyệt đối KHÔNG cung cấp API GET công khai để tránh lộ thông tin đối tác (PII).
 * Mọi thao tác xem và quản trị danh sách đối tác chỉ được phép thông qua /api/admin/partners (yêu cầu session Admin).
 */

const express = require('express');
const router = express.Router();
const { createPartner } = require('../controllers/partnerController');
const { partnerRateLimiter } = require('../middleware/rateLimiter');

// POST /api/partners - Đăng ký đối tác mới (Bảo vệ bằng Rate Limiter & Honeypot)
router.post('/', partnerRateLimiter, createPartner);

// Chặn dứt khoát các phương thức đọc công khai
router.all('/', (req, res) => {
  return res.status(405).json({
    success: false,
    code: 'METHOD_NOT_ALLOWED',
    message: 'Phương thức không được hỗ trợ trên tuyến API công khai này.'
  });
});

module.exports = router;
