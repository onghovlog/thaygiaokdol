/**
 * Banner Slider Component (Tỷ lệ ảnh chuẩn 2:1, Tích hợp REST API MongoDB Atlas)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

import { getBanners } from '../api.js';
import { BANNERS_DATA } from '../data/mock-data.js';

// Hàm escape HTML an toàn chống XSS
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Kiểm tra và chuẩn hóa link đích an toàn
function getSafeLink(rawLink) {
  if (!rawLink || typeof rawLink !== 'string') return 'dang-ky-partner.html';
  const trimmed = rawLink.trim();
  if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed)) {
    return 'dang-ky-partner.html';
  }
  return trimmed;
}

export async function renderBannerSlider(containerSelector = '#banner-slider') {
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;

  if (!container) return;

  // 1. Trạng thái Loading ban đầu với tỷ lệ 2:1
  container.innerHTML = `
    <div class="slider-viewport slider-loading-skeleton" aria-busy="true" aria-label="Đang nạp banner...">
      <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #FFF7ED; color: var(--color-primary); font-size: var(--font-size-xs); font-weight: 600;">
        Đang tải banner ưu đãi...
      </div>
    </div>
  `;

  let banners = [];

  try {
    // 2. Gọi API lấy banner trang chủ từ MongoDB
    banners = await getBanners('home_slider');
    if (!banners || banners.length === 0) {
      banners = await getBanners('home');
    }
  } catch (err) {
    console.warn('[Slider API] Không thể tải banner từ API, sử dụng dữ liệu dự phòng:', err.message);
    banners = BANNERS_DATA;
  }

  // Dự phòng nếu API rỗng
  if (!banners || banners.length === 0) {
    banners = BANNERS_DATA;
  }

  // 3. Render các Slides chỉ cần image và url (tỷ lệ chuẩn 2:1)
  const slidesHtml = banners.map((banner, index) => {
    const linkUrl = getSafeLink(banner.url || banner.link);
    const imageUrl = banner.image || 'assets/images/banner-partner.svg';
    const altText = banner.alt || 'Banner Thầy Giáo KDOL';

    return `
      <div 
        class="slider-slide" 
        role="group" 
        aria-roledescription="slide" 
        aria-label="Slide ${index + 1} / ${banners.length}"
        data-slide-index="${index}"
      >
        <a 
          href="${escapeHtml(linkUrl)}" 
          class="slide-link" 
          aria-label="${escapeHtml(altText)}"
        >
          <img 
            src="${escapeHtml(imageUrl)}" 
            alt="${escapeHtml(altText)}" 
            class="slide-img" 
            width="860" 
            height="430" 
            loading="${index === 0 ? 'eager' : 'lazy'}"
            ${index === 0 ? 'fetchpriority="high"' : ''}
            decoding="async"
            onerror="this.onerror=null;this.src='assets/images/banner-partner.svg';"
          >
        </a>
      </div>
    `;
  }).join('');

  // 4. Render Pagination Dots
  const dotsHtml = banners.map((_, index) => `
    <button 
      type="button" 
      class="slider-dot${index === 0 ? ' active' : ''}" 
      data-dot-index="${index}"
      aria-label="Chuyển tới slide ${index + 1}"
      aria-current="${index === 0 ? 'true' : 'false'}"
    ></button>
  `).join('');

  container.innerHTML = `
    <div 
      class="slider-viewport" 
      role="region" 
      aria-roledescription="carousel" 
      aria-label="Banner nổi bật Thầy Giáo KDOL"
      tabindex="0"
    >
      <div class="slider-track" id="slider-track">
        ${slidesHtml}
      </div>

      <div class="slider-pagination" id="slider-pagination" role="tablist" aria-label="Chọn banner">
        ${dotsHtml}
      </div>
    </div>
  `;

  // 5. Khởi tạo điều khiển Slider (Touch, Autoplay 5s, Keyboard, Chống click nhầm khi vuốt)
  initSliderInteractions(container, banners.length);
}

function initSliderInteractions(container, totalSlides) {
  const track = container.querySelector('#slider-track');
  const viewport = container.querySelector('.slider-viewport');
  const dots = container.querySelectorAll('.slider-dot');
  
  if (!track || totalSlides <= 1) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const AUTOPLAY_INTERVAL = 5000;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    const translateValue = -(currentIndex * 100);
    track.style.transform = `translateX(${translateValue}%)`;

    dots.forEach((dot, idx) => {
      const isActive = idx === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIndex = parseInt(dot.getAttribute('data-dot-index'), 10);
      goToSlide(targetIndex);
      startAutoplay();
    });
  });

  viewport.addEventListener('mouseenter', stopAutoplay);
  viewport.addEventListener('mouseleave', startAutoplay);
  viewport.addEventListener('focusin', stopAutoplay);
  viewport.addEventListener('focusout', startAutoplay);

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToSlide(currentIndex - 1);
      startAutoplay();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToSlide(currentIndex + 1);
      startAutoplay();
    }
  });

  // Touch Swipe trên Mobile & Chống click nhầm khi đang vuốt chạm
  let startX = 0;
  let currentX = 0;
  let isSwiping = false;
  let wasSwiping = false;
  const SWIPE_THRESHOLD = 35;

  viewport.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    startX = e.touches[0].clientX;
    currentX = startX;
    isSwiping = true;
    wasSwiping = false;
    stopAutoplay();
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (!isSwiping || !e.touches || e.touches.length === 0) return;
    currentX = e.touches[0].clientX;
    if (Math.abs(currentX - startX) > 8) {
      wasSwiping = true;
    }
  }, { passive: true });

  viewport.addEventListener('touchend', () => {
    if (!isSwiping) return;
    isSwiping = false;

    const diffX = currentX - startX;
    if (Math.abs(diffX) > SWIPE_THRESHOLD) {
      if (diffX < 0) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(currentIndex - 1);
      }
    }

    setTimeout(() => {
      wasSwiping = false;
    }, 150);

    startAutoplay();
  });

  // Ngăn chặn chuyển trang khi người dùng đang thực hiện cử chỉ vuốt ngang
  const slideLinks = container.querySelectorAll('.slide-link');
  slideLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (wasSwiping) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
  });

  startAutoplay();
}
