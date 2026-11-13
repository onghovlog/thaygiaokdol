/**
 * Main Application Entry Point (ES Module)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

import { renderHeader } from './components/header.js';
import { renderContactBar } from './components/contact-bar.js';
import { renderFooter } from './components/footer.js';
import { renderBannerSlider } from './components/slider.js';
import { renderLatestArticles, renderFeaturedArticles } from './components/articles.js';
import { initPartnerForm } from './modules/form.js';
import { initBlogHub } from './components/blog.js';
import { initArticleDetailPage } from './components/article-detail.js';
import { SITE_CONFIG } from './config.js';
import { getPublicSettings } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  // Nhận diện nếu trang đang nằm trong thư mục con (ví dụ: client/admin/)
  const isInSubDir = window.location.pathname.includes('/admin/');
  const basePath = isInSubDir ? '../' : '';

  // 1. Khởi tạo & Render Header dùng chung
  renderHeader('#site-header', { basePath });

  // 2. Khởi tạo & Render Footer dùng chung (nếu trang yêu cầu)
  renderFooter('#site-footer', { basePath });

  // 3. Khởi tạo & Render Thanh liên hệ đáy màn hình
  renderContactBar('#bottom-contact-bar');

  // Nạp cấu hình công khai động từ REST API MongoDB Atlas (nếu có)
  getPublicSettings().then(settings => {
    if (!settings) return;

    // 1. Cập nhật số điện thoại Hotline
    if (settings.contact_phone) {
      document.querySelectorAll('.contact-phone').forEach(el => {
        el.href = `tel:${settings.contact_phone}`;
      });
      document.querySelectorAll('.hotline-text-display').forEach(el => {
        el.textContent = settings.contact_phone;
      });
    }

    // 2. Cập nhật Zalo URL
    if (settings.contact_zalo) {
      document.querySelectorAll('.contact-zalo').forEach(el => {
        el.href = settings.contact_zalo;
      });
      const zaloBtn = document.querySelector('#success-zalo-btn');
      if (zaloBtn) zaloBtn.href = settings.contact_zalo;
    }

    // 3. Cập nhật Messenger URL
    if (settings.contact_messenger) {
      document.querySelectorAll('.contact-messenger').forEach(el => {
        el.href = settings.contact_messenger;
      });
    }

    // 3.5. Cập nhật Logo nếu có từ cài đặt
    if (settings.site_logo) {
      const resolvedLogo = settings.site_logo.startsWith('http') || settings.site_logo.startsWith('/')
        ? settings.site_logo
        : `${basePath}${settings.site_logo}`;
      document.querySelectorAll('.header-logo-img, .drawer-logo-img').forEach(el => {
        el.src = resolvedLogo;
      });
    }

    // 4. Cập nhật Tên thương hiệu & Slogan
    if (settings.site_name) {
      document.querySelectorAll('.brand-title').forEach(el => {
        el.textContent = settings.site_name;
      });
    }
    if (settings.site_slogan) {
      document.querySelectorAll('.brand-slogan').forEach(el => {
        el.textContent = settings.site_slogan;
      });
      document.querySelectorAll('.intro-slogan').forEach(el => {
        el.textContent = settings.site_slogan;
      });
    }

    // 5. Cập nhật Avatar / Portrait nếu có
    if (settings.site_avatar) {
      document.querySelectorAll('.portrait-image, .about-avatar-img').forEach(el => {
        el.src = settings.site_avatar;
      });
    }

    // 6. Cập nhật Link chính sách bảo mật
    if (settings.privacy_policy_url) {
      document.querySelectorAll('a.privacy-policy-link').forEach(el => {
        el.href = settings.privacy_policy_url;
      });
    }
  }).catch(() => {
    // Tự động giữ nguyên các giá trị dự phòng ban đầu
  });

  // 4. Khởi tạo Banner Slider (Trang chủ)
  renderBannerSlider('#banner-slider');

  // 5. Khởi tạo danh sách Bài viết mới & Kiến thức nổi bật (Trang chủ)
  renderLatestArticles('#latest-articles-list');
  renderFeaturedArticles('#featured-articles-list');

  // 6. Khởi tạo form đăng ký nếu có trên trang
  initPartnerForm('#partner-register-form');

  // 7. Khởi tạo Blog Knowledge Hub (Trang kien-thuc.html: Search, Horizontal Chips, Hero Featured, Pagination)
  initBlogHub();

  // 8. Khởi tạo Chi tiết bài viết (Trang bai-viet.html: Đọc theo slug, SEO, Web Share, 3 bài liên quan, 404 state)
  initArticleDetailPage();

  // 9. Khởi tạo nội dung trang Đăng ký thành công (Lời chào và Link Zalo cấu hình)
  renderSuccessGreeting();
});

/**
 * Cập nhật đường dẫn Zalo tại trang dang-ky-thanh-cong.html
 * Tuân thủ bảo mật tuyệt đối: KHÔNG truyền hoặc đọc thông tin cá nhân qua URL hoặc localStorage.
 */
function renderSuccessGreeting() {
  const zaloBtn = document.querySelector('#success-zalo-btn');

  // Cập nhật đường dẫn Zalo từ SITE_CONFIG
  if (zaloBtn && SITE_CONFIG.contact && SITE_CONFIG.contact.zaloUrl) {
    zaloBtn.href = SITE_CONFIG.contact.zaloUrl;
  }
}
