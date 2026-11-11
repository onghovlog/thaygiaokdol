/**
 * Header Component (Dùng chung cho toàn bộ website)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Tính năng:
 * - Logo/avatar Thầy Giáo KDOL bên trái, click về trang chủ.
 * - Nút hamburger menu bên phải, hỗ trợ aria-expanded và keyboard navigation.
 * - Sticky top: 0, nền trắng, viền dưới nhẹ.
 * - Panel menu trượt với 3 mục chính: "Tôi là ai", "KDOL là gì", "Đăng ký Partner".
 * - Tự động nhận diện và đánh dấu mục đang hoạt động (active link, aria-current).
 * - Đóng menu khi chọn mục, nhấn bên ngoài (backdrop) hoặc nhấn phím Escape.
 * - Focus management (bẫy tiêu điểm bàn phím cho trợ năng A11y).
 */

import { SITE_CONFIG } from '../config.js';

export function renderHeader(containerSelector = '#site-header', options = {}) {
  const container = typeof containerSelector === 'string' 
    ? document.querySelector(containerSelector) 
    : containerSelector;

  if (!container) return;

  const basePath = options.basePath || '';
  const currentFileName = window.location.pathname.split('/').pop() || 'index.html';

  // SVG Avatar biểu trưng cho "Thầy Giáo" (Mũ cử nhân) + "1 đơn hàng - 1 nụ cười"
  const avatarSvg = `
    <span class="header-avatar" aria-hidden="true">
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="18" fill="var(--color-primary)"/>
        <!-- Mũ học vấn / Thầy giáo -->
        <path d="M18 9L8 14L18 19L28 14L18 9Z" fill="#FFFFFF"/>
        <path d="M12 16.5V21.5C12 23.5 14.5 25 18 25C21.5 25 24 23.5 24 21.5V16.5" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M26 15V22" stroke="var(--color-secondary-light)" stroke-width="1.6" stroke-linecap="round"/>
        <!-- Nụ cười thương hiệu: 1 đơn hàng - 1 nụ cười -->
        <path d="M14 27.5C15.2 29 20.8 29 22 27.5" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </span>
  `;

  // Render HTML cho Header Bar
  container.innerHTML = `
    <div class="header-inner">
      <!-- LOGO / AVATAR TRẢ VỀ TRANG CHỦ -->
      <a href="${basePath}index.html" class="header-brand" aria-label="${SITE_CONFIG.brand.name} - Về trang chủ">
        ${avatarSvg}
        <div class="brand-text-group">
          <span class="brand-title">${SITE_CONFIG.brand.name}</span>
          <span class="brand-slogan">${SITE_CONFIG.brand.slogan}</span>
        </div>
      </a>

      <!-- NÚT HAMBURGER MENU VỚI ARIA HOÀN CHỈNH -->
      <button 
        type="button" 
        class="menu-toggle-btn" 
        id="menu-toggle-btn"
        aria-label="Mở menu điều hướng" 
        aria-expanded="false" 
        aria-controls="nav-drawer"
        aria-haspopup="dialog"
      >
        <svg class="icon-hamburger" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>
  `;

  // Kiểm tra hoặc tạo Backdrop & Drawer Panel
  mountNavigationDrawer(basePath, currentFileName);

  // Kích hoạt tương tác
  bindNavigationEvents();
}

/**
 * Gắn Navigation Drawer vào DOM nếu chưa tồn tại
 */
function mountNavigationDrawer(basePath, currentFileName) {
  let backdrop = document.getElementById('nav-backdrop');
  let drawer = document.getElementById('nav-drawer');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'nav-backdrop';
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.style.display = 'none'; // Đảm bảo ẩn hoàn toàn khi tải trang
    document.body.appendChild(backdrop);
  }

  if (!drawer) {
    drawer = document.createElement('aside');
    drawer.id = 'nav-drawer';
    drawer.className = 'nav-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Menu điều hướng chính');
    drawer.setAttribute('tabindex', '-1');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.style.display = 'none'; // Đảm bảo ẩn hoàn toàn khi tải trang
    document.body.appendChild(drawer);
  }

  // Tạo 3 mục chính theo yêu cầu
  const primaryLinksHtml = SITE_CONFIG.primaryNavigation.map(item => {
    const isMatch = (item.matchPaths && item.matchPaths.includes(currentFileName)) || item.path === currentFileName;
    const activeClass = isMatch ? ' active' : '';
    const currentAttr = isMatch ? ' aria-current="page"' : '';
    const highlightClass = item.isHighlight ? ' drawer-nav-item-highlight' : '';

    return `
      <a 
        href="${basePath}${item.path}" 
        class="drawer-nav-item${activeClass}${highlightClass}"
        data-nav-id="${item.id}"
        ${currentAttr}
      >
        <span class="nav-item-label">${item.label}</span>
        ${item.description ? `<span class="nav-item-desc">${item.description}</span>` : ''}
      </a>
    `;
  }).join('');

  // Tạo các liên kết phụ
  const secondaryLinksHtml = SITE_CONFIG.secondaryNavigation.map(item => {
    const isMatch = item.path === currentFileName || (currentFileName === '' && item.path === 'index.html');
    const activeClass = isMatch ? ' active' : '';
    const currentAttr = isMatch ? ' aria-current="page"' : '';

    return `
      <a 
        href="${basePath}${item.path}" 
        class="drawer-nav-sublink${activeClass}"
        data-nav-id="${item.id}"
        ${currentAttr}
      >
        ${item.label}
      </a>
    `;
  }).join('');

  drawer.innerHTML = `
    <div class="drawer-header">
      <div class="drawer-header-brand">
        <span class="brand-title">${SITE_CONFIG.brand.name}</span>
        <span class="brand-slogan">${SITE_CONFIG.brand.slogan}</span>
      </div>
      <button 
        type="button" 
        class="menu-close-btn" 
        id="menu-close-btn" 
        aria-label="Đóng menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="drawer-body">
      <!-- 3 MỤC CHÍNH YÊU CẦU -->
      <div class="drawer-section-title">Danh mục chính</div>
      <nav class="drawer-nav-primary" aria-label="Menu chính">
        ${primaryLinksHtml}
      </nav>

      <!-- CÁC LIÊN KẾT PHỤ TRỢ -->
      <div class="drawer-section-divider"></div>
      <div class="drawer-section-title">Liên kết nhanh</div>
      <nav class="drawer-nav-secondary" aria-label="Menu phụ">
        ${secondaryLinksHtml}
      </nav>
    </div>

    <div class="drawer-footer">
      <div class="drawer-footer-brand">
        <strong>${SITE_CONFIG.brand.name}</strong>
        <span>• ${SITE_CONFIG.brand.slogan}</span>
      </div>
    </div>
  `;
}

/**
 * Gán sự kiện điều hướng, đóng mở và Accessibility Focus Trap
 */
function bindNavigationEvents() {
  const menuBtn = document.getElementById('menu-toggle-btn');
  const closeBtn = document.getElementById('menu-close-btn');
  const drawer = document.getElementById('nav-drawer');
  const backdrop = document.getElementById('nav-backdrop');

  if (!menuBtn || !drawer || !backdrop) return;

  function openMenu() {
    drawer.style.display = 'flex';
    backdrop.style.display = 'block';
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.setAttribute('aria-hidden', 'false');

    // Bắt buộc reflow đồng bộ để trình duyệt ghi nhận trạng thái ban đầu translateX(100%)
    void drawer.offsetWidth;
    void backdrop.offsetWidth;

    // Kích hoạt transition trượt translateX từ mép phải sang trái
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');

    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Đưa tiêu điểm vào nút đóng hoặc item đầu tiên để hỗ trợ bàn phím
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 60);
    }
  }

  function closeMenu() {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    // Sau khi kết thúc animation trượt 300ms thì ẩn hoàn toàn display: none
    setTimeout(() => {
      if (!drawer.classList.contains('is-open')) {
        drawer.style.display = 'none';
        backdrop.style.display = 'none';
      }
    }, 320);

    // Trả lại tiêu điểm cho nút mở menu
    menuBtn.focus();
  }

  // 1. Nhấn nút mở menu
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // 2. Nhấn nút đóng menu
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  // 3. Nhấn bên ngoài (Backdrop)
  backdrop.addEventListener('click', closeMenu);

  // 4. Nhấn chọn bất kỳ mục nào trong menu
  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // 5. Đóng bằng phím Escape & Quản lý bẫy tiêu điểm (Keyboard Focus Trap)
  document.addEventListener('keydown', (e) => {
    if (!drawer.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = drawer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey) {
        // Shift + Tab lùi về phần tử cuối nếu đang ở đầu
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        // Tab tiến tới phần tử đầu nếu đang ở cuối
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  });
}

