/**
 * Server Entry Point
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Khởi chạy máy chủ sau khi kết nối Database
const startServer = async () => {
  // 1. Kết nối MongoDB Atlas
  await connectDB();

  // 2. Lắng nghe yêu cầu HTTP
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log('\n======================================================');
    console.log('  🎯 THẦY GIÁO KDOL - EXPRESS BACKEND SERVER');
    console.log('  Slogan: "1 đơn hàng - 1 nụ cười"');
    console.log('======================================================');
    console.log(`  🌐 Server lắng nghe tại: http://localhost:${PORT}`);
    console.log(`  🩺 Kiểm tra sức khỏe API: http://localhost:${PORT}/api/health`);
    console.log(`  📱 Giao diện Client:      http://localhost:${PORT}/index.html`);
    console.log(`  ⚙️ Môi trường:            ${process.env.NODE_ENV || 'development'}`);
    console.log('======================================================\n');
  });

  // Xử lý dừng máy chủ an toàn (Graceful Shutdown)
  const shutdown = async (signal) => {
    console.log(`\nNhận tín hiệu ${signal}. Đang đóng máy chủ an toàn...`);
    server.close(() => {
      console.log('HTTP Server đã đóng.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch(err => {
  console.error('Không thể khởi chạy máy chủ backend:', err);
});
