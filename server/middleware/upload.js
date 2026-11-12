/**
 * File Upload Middleware using Multer
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Quy chuẩn an ninh:
 * - Chỉ chấp nhận định dạng ảnh an toàn: JPG, JPEG, PNG, WebP.
 * - Tuyệt đối không cho phép upload SVG (nguy cơ Stored XSS) hoặc HTML/Scripts.
 * - Kiểm tra nghiêm ngặt cả MIME type và đuôi mở rộng (extension).
 * - Giới hạn dung lượng tối đa 5MB mỗi file.
 * - Lưu file vật lý vào thư mục cấu hình trên server, lưu URL/path vào MongoDB.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Thư mục lưu trữ uploads (mặc định trong client/uploads, có thể cấu hình qua biến môi trường UPLOAD_DIR)
const BASE_UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../../client/uploads');

// Đảm bảo thư mục tồn tại
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Cấu hình lưu trữ theo từng phân hệ (banners, settings...)
const storage = (subFolder = 'banners') => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(BASE_UPLOAD_DIR, subFolder);
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext === '.jpeg' ? '.jpg' : ext;
    const randomHex = crypto.randomBytes(6).toString('hex');
    const timestamp = Date.now();
    cb(null, `${subFolder.replace(/s$/, '')}-${timestamp}-${randomHex}${safeExt}`);
  }
});

// Bộ lọc định dạng file nghiêm ngặt (File Filter)
const safeImageFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  // 1. Chặn tuyệt đối SVG và HTML
  if (mime.includes('svg') || ext === '.svg') {
    return cb(new Error('Từ chối file SVG vì lý do an toàn mã độc (Stored XSS). Chỉ chấp nhận ảnh JPG, PNG, WebP.'));
  }
  if (mime.includes('html') || ext === '.html' || ext === '.htm') {
    return cb(new Error('Từ chối tải lên tài liệu HTML. Chỉ chấp nhận ảnh JPG, PNG, WebP.'));
  }

  // 2. Kiểm tra MIME type và Extension hợp lệ
  const isMimeValid = allowedMimeTypes.includes(mime);
  const isExtValid = allowedExtensions.includes(ext);

  if (isMimeValid && isExtValid) {
    return cb(null, true);
  }

  return cb(new Error(`Định dạng file "${ext}" không được hỗ trợ. Chỉ cho phép các định dạng ảnh: JPG, PNG, WebP.`));
};

// Khởi tạo Multer instances với giới hạn dung lượng 5MB
const uploadBanner = multer({
  storage: storage('banners'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: safeImageFilter
}).single('image');

const uploadSettingImage = multer({
  storage: storage('settings'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: safeImageFilter
}).single('image');

const uploadPost = multer({
  storage: storage('posts'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: safeImageFilter
}).single('image');

// Wrapper middleware xử lý lỗi Multer thân thiện
function handleUpload(uploadMiddleware, subFolder = 'banners') {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            code: 'FILE_TOO_LARGE',
            message: 'Dung lượng file vượt quá giới hạn tối đa cho phép (5MB).'
          });
        }
        return res.status(400).json({
          success: false,
          code: 'UPLOAD_ERROR',
          message: `Lỗi upload: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_FILE_TYPE',
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          code: 'NO_FILE_UPLOADED',
          message: 'Vui lòng chọn một file ảnh hợp lệ (JPG, PNG, WebP).'
        });
      }

      // Tạo đường dẫn URL an toàn với leading slash để client/admin ở bất kỳ tầng thư mục nào cũng load được
      const relativeUrl = `/uploads/${subFolder}/${req.file.filename}`;
      req.uploadedFileUrl = relativeUrl;

      next();
    });
  };
}

module.exports = {
  uploadBannerMiddleware: handleUpload(uploadBanner, 'banners'),
  uploadSettingImageMiddleware: handleUpload(uploadSettingImage, 'settings'),
  uploadPostImageMiddleware: handleUpload(uploadPost, 'posts'),
  BASE_UPLOAD_DIR
};

