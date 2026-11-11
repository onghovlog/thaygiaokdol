/**
 * Bottom Contact Bar Component (Thanh liên hệ cố định chân trang)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Tính năng:
 * - Cố định dưới đáy (Fixed bottom) chuẩn trong khung max-width 430px, căn giữa trên Desktop.
 * - 3 mục ngang: Điện thoại (tel:), Zalo (URL cấu hình), Messenger (URL cấu hình).
 * - Sử dụng cấu hình PLACEHOLDER từ SITE_CONFIG, không tự bịa thông tin thực tế.
 * - Màu cam chủ đạo (#F37021), xanh điểm nhấn (#123FCB / #0068FF), thiết kế tối giản.
 * - Hạn chế tối đa icon, chỉ dùng 3 SVG nét đơn sạch sẽ.
 * - Hỗ trợ safe-area-inset-bottom cho thiết bị iPhone có thanh Home Indicator.
 */

import { SITE_CONFIG } from '../config.js';

export function renderContactBar(containerSelector = '#bottom-contact-bar', customConfig = {}) {
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;

  if (!container) return;

  const contact = { ...SITE_CONFIG.contact, ...customConfig };

  container.innerHTML = `
    <!-- 1. GỌI ĐIỆN THOẠI (TEL:) -->
    <a 
      href="tel:${contact.phone}" 
      class="contact-action-item contact-phone" 
      data-contact="phone" 
      aria-label="Gọi điện thoại trực tiếp"
    >
      <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
      <span class="contact-label">Điện thoại</span>
    </a>

    <!-- 2. NHẮN TIN ZALO -->
    <a 
      href="${contact.zaloUrl}" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="contact-action-item contact-zalo" 
      data-contact="zalo" 
      aria-label="Nhắn tin qua Zalo"
    >
      <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.5 5.43 3.84 7.08-.16.94-.7 2.65-.77 2.92-.09.34.12.35.26.25.18-.13 2.5-1.7 3.51-2.4.73.18 1.48.27 2.26.27 5.52 0 10-4.03 10-9s-4.48-9-10-9zm-1.8 11.5H8.35c-.28 0-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5h1.85c.28 0 .5.22.5.5v4c0 .28-.22.5-.5.5zm5.6 0h-3.4c-.28 0-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5h3.4c.28 0 .5.22.5.5s-.22.5-.5.5h-2.9v1.1h2.4c.28 0 .5.22.5.5s-.22.5-.5.5h-2.4v1.4h2.9c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
      </svg>
      <span class="contact-label">Zalo</span>
    </a>

    <!-- 3. NHẮN TIN MESSENGER -->
    <a 
      href="${contact.messengerUrl}" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="contact-action-item contact-messenger" 
      data-contact="messenger" 
      aria-label="Nhắn tin qua Facebook Messenger"
    >
      <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.43 3.14 7.15.16.14.26.35.27.57l.08 1.78c.03.65.67 1.08 1.25.84l1.98-.82c.18-.08.38-.09.57-.04.87.24 1.78.37 2.71.37 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.09 13.06-2.58-2.75-5.04 2.75 5.54-5.88 2.65 2.75 4.97-2.75-5.54 5.88z"/>
      </svg>
      <span class="contact-label">Messenger</span>
    </a>
  `;

  // Ghi nhận sự kiện bấm liên hệ
  container.querySelectorAll('.contact-action-item').forEach((item) => {
    item.addEventListener('click', () => {
      const type = item.getAttribute('data-contact');
      console.log(`[Contact Action] Người dùng tương tác: ${type}`);
    });
  });
}

