/**
 * 404 Not Found Middleware
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy tài nguyên: ${req.method} ${req.originalUrl}`,
    status: 404,
    timestamp: new Date().toISOString()
  });
};

module.exports = notFoundHandler;

