/**
 * Centralized Error Handler Middleware
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const errorHandler = (err, req, res, next) => {
  // Ghi log an toàn: Trong production chỉ log loại lỗi và thông điệp, không log toàn bộ stack hay dữ liệu nhạy cảm
  if (process.env.NODE_ENV === 'production') {
    console.error(`[Error Caught] ${err.name || 'Error'}: ${err.message || 'Unknown error'}`);
  } else {
    console.error('[Error Caught]', err);
  }

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Lỗi hệ thống máy chủ nội bộ';
  let errors = null;

  // Xử lý lỗi Mongoose Validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dữ liệu không hợp lệ';
    errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
  }

  // Xử lý lỗi trùng lặp khóa Unique (Mongoose duplicate key code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Dữ liệu trường '${field}' đã tồn tại trong hệ thống`;
  }

  // Xử lý lỗi CastError (Sai định dạng ObjectId hoặc kiểu dữ liệu)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Giá trị không đúng định dạng cho trường: ${err.path}`;
  }

  // Xử lý lỗi kết nối MongoDB (MongooseServerSelectionError hoặc MongoNetworkError)
  if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoNetworkError') {
    statusCode = 503;
    message = 'Hệ thống cơ sở dữ liệu đang tạm thời gián đoạn hoặc bảo trì. Vui lòng thử lại sau ít phút.';
  }

  // Xử lý lỗi cú pháp JSON trong request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Cú pháp JSON trong yêu cầu (request body) không hợp lệ';
  }

  // Bảo vệ thông tin máy chủ: Trong production, không trả thông tin chi tiết lỗi 500 ra client
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Đã có lỗi xảy ra trên hệ thống máy chủ. Vui lòng thử lại sau ít phút.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;

