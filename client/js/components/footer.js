/**
 * Footer Component (Chân trang dùng chung)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

import { SITE_CONFIG } from '../config.js';

export function renderFooter(containerSelector = '#site-footer', options = {}) {
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;

  if (!container) return;

  const basePath = options.basePath || '';

  container.innerHTML = `
    <div class="footer-brand">
      <div class="name">${SITE_CONFIG.brand.name}</div>
      <div class="slogan">${SITE_CONFIG.brand.slogan}</div>
    </div>
    <p>Hệ sinh thái đào tạo & đồng hành thực chiến kinh doanh online tinh gọn, hiệu quả và bền vững.</p>
    <div class="footer-links">
      <a href="${basePath}gioi-thieu.html">Tôi là ai</a>
      <a href="${basePath}kien-thuc.html">KDOL là gì</a>
      <a href="${basePath}dang-ky-partner.html">Đăng ký Partner</a>
      <a href="${basePath}chinh-sach-bao-mat.html">Chính sách bảo mật</a>
    </div>
    <div class="footer-copyright">
      © 2026 ${SITE_CONFIG.brand.name}. Bản quyền thuộc về thương hiệu.
    </div>
  `;
}

