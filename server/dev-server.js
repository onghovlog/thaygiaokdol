/**
 * Local Development Server (Zero-Dependency)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Chạy trực tiếp bằng Node.js tích hợp sẵn, không phụ thuộc thư viện bên ngoài.
 * Lệnh chạy: npm run dev hoặc node server/dev-server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const CLIENT_DIR = path.join(__dirname, '..', 'client');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Chuẩn hóa URL
  let safePath = req.url.split('?')[0];
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  // Chặn path traversal attacks
  const resolvedPath = path.normalize(path.join(CLIENT_DIR, safePath));
  if (!resolvedPath.startsWith(CLIENT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="vi">
        <head><meta charset="utf-8"><title>404 Not Found - Thầy Giáo KDOL</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>404 - Không tìm thấy trang</h2>
          <p>Tệp yêu cầu không tồn tại: <code>${safePath}</code></p>
          <a href="/">← Về Trang Chủ Thầy Giáo KDOL</a>
        </body>
        </html>
      `);
      return;
    }

    let filePathToRead = resolvedPath;
    if (stats.isDirectory()) {
      filePathToRead = path.join(resolvedPath, 'index.html');
    }

    const ext = path.extname(filePathToRead).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePathToRead, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error: ' + readErr.message);
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log('\n======================================================');
  console.log('  🎯 THẦY GIÁO KDOL - LOCAL DEVELOPMENT SERVER');
  console.log('  Slogan: "1 đơn hàng - 1 nụ cười"');
  console.log('======================================================');
  console.log(`  🌐 Website đang chạy tại: http://localhost:${PORT}`);
  console.log(`  📱 Khung Mobile-Only (max-width 430px)`);
  console.log('  Nhấn Ctrl + C để dừng server.\n');
});

