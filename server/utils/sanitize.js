/**
 * HTML & Data Sanitizer Utility
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Loại bỏ các thẻ độc hại (script, iframe, object, embed...)
 * và các thuộc tính nguy hiểm (onload, onerror, javascript: pseudo-protocol).
 */

function sanitizeHtml(input) {
  if (typeof input !== 'string') return input;

  let sanitized = input;

  // 1. Loại bỏ các thẻ độc hại và nội dung bên trong của chúng
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  sanitized = sanitized.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '');

  // 2. Loại bỏ các sự kiện inline (on* event handlers như onclick, onerror, onload...)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Loại bỏ javascript: pseudo-protocol trong href hoặc src
  sanitized = sanitized.replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'"]*(\2)/gi, '$1="#"');

  return sanitized.trim();
}

/**
 * Xử lý làm sạch an toàn cho cả Object, Array hoặc String
 */
function sanitizeContent(data) {
  if (typeof data === 'string') {
    return sanitizeHtml(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeContent(item));
  }

  if (data !== null && typeof data === 'object') {
    const cleaned = {};
    for (const [key, val] of Object.entries(data)) {
      cleaned[key] = sanitizeContent(val);
    }
    return cleaned;
  }

  return data;
}

/**
 * Thoát các ký tự đặc biệt trong biểu thức chính quy (Regex Escape)
 * Ngăn chặn lỗi cú pháp Regular Expression và tấn công ReDoS (Denial of Service).
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  sanitizeHtml,
  sanitizeContent,
  escapeRegex
};

