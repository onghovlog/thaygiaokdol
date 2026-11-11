/**
 * Banner Slider Component (Tích hợp REST API)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

import { getBanners } from '../api.js';
import { BANNERS_DATA } from '../data/mock-data.js';

export async function renderBannerSlider(containerSelector = '#banner-slider') {
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;

  if (!container) return;

  // 1. Trạng thái Loading ban đầu
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
    banners = await getBanners('home');
  } catch (err) {
    console.warn('[Slider API] Không thể tải banner từ API, sử dụng dữ liệu dự phòng:', err.message);
    banners = BANNERS_DATA;
  }

  // Dự phòng nếu API rỗng
  if (!banners || banners.length === 0) {
    banners = BANNERS_DATA;
  }

  // 3. Render các Slides
  const slidesHtml = banners.map((banner, index) => {
    let bgStyleClass = 'slide-bg-orange';
    if (banner.bgType === 'blue') bgStyleClass = 'slide-bg-blue';
    if (banner.bgType === 'neutral') bgStyleClass = 'slide-bg-neutral';
    if (banner.bgType === 'orange-subtle') bgStyleClass = 'slide-bg-orange-subtle';

    const linkUrl = banner.link || banner.url || 'dang-ky-partner.html';

    return `
      <div 
        class="slider-slide ${bgStyleClass}" 
        role="group" 
        aria-roledescription="slide" 
        aria-label="Slide ${index + 1} / ${banners.length}"
        data-slide-index="${index}"
      >
        <a href="${linkUrl}" class="slide-link-overlay" aria-label="${banner.title}">
          <div class="slide-content">
            ${banner.badge ? `<span class="slide-badge">${banner.badge}</span>` : ''}
            <h2 class="slide-title">${banner.title}</h2>
            ${banner.subtitle ? `<p class="slide-subtitle">${banner.subtitle}</p>` : ''}
            <span class="slide-cta-pill">
              ${banner.ctaText || 'Xem chi tiết'} →
            </span>
          </div>
          ${banner.image ? `
            <div class="slide-thumb-illustration" aria-hidden="true" style="position: absolute; right: 12px; bottom: 12px; width: 68px; height: 68px; border-radius: var(--radius-xs); overflow: hidden; opacity: 0.85; pointer-events: none; border: 1px solid rgba(0,0,0,0.06);">
              <img 
                src="${escapeHtml(banner.image)}" 
                alt="${escapeHtml(banner.alt || banner.title)}" 
                width="68" 
                height="68" 
                loading="${index === 0 ? 'eager' : 'lazy'}"
                ${index === 0 ? 'fetchpriority="high"' : ''}
                decoding="async"
                style="width: 100%; height: 100%; object-fit: cover;" 
                onerror="this.parentElement.style.display='none'"
              >
            </div>
          ` : ''}
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

  // 5. Khởi tạo điều khiển Slider (Touch, Autoplay 5s, Keyboard)
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

  // Touch Swipe trên Mobile
  let startX = 0;
  let currentX = 0;
  let isSwiping = false;
  const SWIPE_THRESHOLD = 40;

  viewport.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    startX = e.touches[0].clientX;
    currentX = startX;
    isSwiping = true;
    stopAutoplay();
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (!isSwiping || !e.touches || e.touches.length === 0) return;
    currentX = e.touches[0].clientX;
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
    startAutoplay();
  });

  startAutoplay();
}
