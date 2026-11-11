/**
 * Database Connection Module (MongoDB Atlas + Mongoose)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('Biến môi trường MONGODB_URI chưa được thiết lập trong file .env');
    }

    // Tùy chọn kết nối tối ưu cho Mongoose 8+ / Atlas
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: process.env.NODE_ENV !== 'production' // Tự động tạo index trong môi trường phát triển
    });

    console.log(`[MongoDB Atlas] ✅ Đã kết nối thành công: ${conn.connection.host}`);
    console.log(`[Database Name] 📁 ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Atlas] ❌ Lỗi kết nối cơ sở dữ liệu: ${error.message}`);
    // Trong môi trường development không crash ngay, để dev server vẫn chạy và báo lỗi rõ ràng
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;

