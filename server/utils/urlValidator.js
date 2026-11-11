/**
 * URL Validator & Sanitizer Utility
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Kiểm tra và hạn chế các URL đích nguy hiểm (ngăn chặn XSS & Open Redirect độc hại).
 */

// Danh sách các giao thức nguy hiểm bị cấm tuyệt đối
const DANGEROUS_PROTOCOLS_REGEX = /^(javascript|vbscript|data|file|about|blob):/i;

/**
 * Kiểm tra xem một URL có an toàn hay không
 * @param {string} url - Đường dẫn cần kiểm tra
 * @returns {boolean} true nếu URL an toàn
 */
function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();

  // 1. Chặn ký tự xuống dòng (Newline Injection)
  if (/[\r\n\0]/.test(trimmed)) {
    return false;
  }

  // 2. Chặn các giao thức nguy hiểm
  if (DANGEROUS_PROTOCOLS_REGEX.test(trimmed)) {
    return false;
  }

  // 3. Cho phép đường dẫn neo hoặc rỗng
  if (trimmed === '#' || trimmed === '') {
    return true;
  }

  // 4. Cho phép đường dẫn tương đối nội bộ (bắt đầu bằng ký tự thường, dấu chấm hoặc gạch chéo)
  // Ví dụ: dang-ky-partner.html, kien-thuc.html, /bai-viet.html?slug=xyz
  if (/^(\/|\.\/|[a-zA-Z0-9_-]+\.html|[a-zA-Z0-9_-]+\/)/.test(trimmed) && !trimmed.includes('://')) {
    return true;
  }

  // 5. Cho phép các giao thức chuẩn an toàn: https://, http://, tel:, mailto:
  if (/^(https?:\/\/|tel:|mailto:)/i.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Chuẩn hóa URL đích an toàn, trả về URL đã làm sạch hoặc fallback mặc định
 * @param {string} url 
 * @param {string} fallbackUrl 
 * @returns {string}
 */
function sanitizeDestinationUrl(url, fallbackUrl = 'dang-ky-partner.html') {
  if (!url || typeof url !== 'string') return fallbackUrl;

  const trimmed = url.trim();
  if (isSafeUrl(trimmed)) {
    return trimmed;
  }

  return fallbackUrl;
}

module.exports = {
  isSafeUrl,
  sanitizeDestinationUrl
};

