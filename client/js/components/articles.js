/**
 * Articles Component (Tích hợp REST API MongoDB Atlas)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

import { getPosts, getFeaturedPosts } from '../api.js';

/**
 * 1. Render Section 4: Bài viết mới (4–5 bài mới nhất)
 */
export async function renderLatestArticles(containerSelector = '#latest-articles-list', options = {}) {
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;

  if (!container) return;

  const basePath = options.basePath || '';

  // Trạng thái Loading
  renderArticlesLoadingState(container, 4);

  try {
    const { items } = await getPosts({ page: 1, limit: 5 });

    if (!items || items.length === 0) {
      container.innerHTML = `
        <div style="padding: var(--spacing-lg) 0; text-align: center; color: var(--color-text-muted); font-size: var(--font-size-sm);">
          Chưa có bài viết mới nào được xuất bản.
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(article => `
      <a href="bai-viet.html?slug=${article.slug}" class="post-card post-card-compact" aria-label="${escapeHtml(article.title)}">
        <div class="post-card-inner">
          ${renderThumbnailHtml(article, basePath)}
          <div class="post-card-content">
            <div class="post-card-meta">
              <span class="badge ${getCategoryBadgeClass(article.category)}">${escapeHtml(article.category)}</span>
              <span class="post-date">• ${formatDate(article.publishedAt)}</span>
            </div>
            <h3 class="post-card-title">${escapeHtml(article.title)}</h3>
            <p class="post-card-desc">${escapeHtml(article.excerpt)}</p>
          </div>
        </div>
      </a>
    `).join('');
  } catch (err) {
    console.error('[Latest Articles API Error]', err);
    renderArticlesErrorState(container, 'Không thể tải danh sách bài viết mới.', () => renderLatestArticles(containerSelector, options));
  }
}

/**
 * 2. Render Section 6: Kiến thức nổi bật (3–4 bài featured)
 */
export async function renderFeaturedArticles(containerSelector = '#featured-articles-list') {
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;

  if (!container) return;

  renderArticlesLoadingState(container, 3);

  try {
    const posts = await getFeaturedPosts(4);

    if (!posts || posts.length === 0) {
      container.innerHTML = `
        <div style="padding: var(--spacing-lg) 0; text-align: center; color: var(--color-text-muted); font-size: var(--font-size-sm);">
          Chưa có bài viết tiêu điểm nổi bật.
        </div>
      `;
      return;
    }

    container.innerHTML = posts.map(article => `
      <a href="bai-viet.html?slug=${article.slug}" class="post-card post-card-featured" aria-label="${escapeHtml(article.title)}">
        <div class="post-card-content">
          <div class="post-card-meta">
            <span class="badge ${getCategoryBadgeClass(article.category)}">${escapeHtml(article.category)}</span>
            <span class="badge badge-featured-pill">★ Nổi bật</span>
            <span class="post-date">• ${article.readTime || '5 phút đọc'}</span>
          </div>
          <h3 class="post-card-title">${escapeHtml(article.title)}</h3>
          <p class="post-card-desc">${escapeHtml(article.excerpt)}</p>
          <div class="post-card-footer-action">
            <span class="read-more-text">Đọc bài viết →</span>
          </div>
        </div>
      </a>
    `).join('');
  } catch (err) {
    console.error('[Featured Articles API Error]', err);
    renderArticlesErrorState(container, 'Không thể tải danh sách bài viết nổi bật.', () => renderFeaturedArticles(containerSelector));
  }
}

/**
 * Trạng thái Skeleton Loading
 */
function renderArticlesLoadingState(container, count = 3) {
  const skeletons = Array.from({ length: count }).map(() => `
    <div class="post-card post-card-compact" style="opacity: 0.6; pointer-events: none;">
      <div class="post-card-inner">
        <div class="post-thumbnail-placeholder" style="background: #E2E8F0; border-radius: 6px;"></div>
        <div class="post-card-content" style="width: 100%;">
          <div style="width: 35%; height: 14px; background: #E2E8F0; border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="width: 85%; height: 16px; background: #E2E8F0; border-radius: 4px; margin-bottom: 6px;"></div>
          <div style="width: 65%; height: 12px; background: #E2E8F0; border-radius: 4px;"></div>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = skeletons;
}

/**
 * Trạng thái Lỗi kèm nút Retry (Thử lại)
 */
function renderArticlesErrorState(container, message, retryFn) {
  container.innerHTML = `
    <div style="padding: var(--spacing-lg) var(--page-padding-x); text-align: center; background: #FFF7ED; border: 1px dashed #FDBA74; border-radius: var(--radius-sm); margin: var(--spacing-sm) 0;">
      <p style="font-size: var(--font-size-xs); color: #C2410C; margin-bottom: 8px;">
        ${escapeHtml(message)}
      </p>
      <button type="button" class="btn btn-outline btn-sm" id="btn-retry-articles" style="padding: 4px 12px; font-size: 11px;">
        Thử lại ↻
      </button>
    </div>
  `;

  const retryBtn = container.querySelector('#btn-retry-articles');
  if (retryBtn && typeof retryFn === 'function') {
    retryBtn.addEventListener('click', retryFn);
  }
}

function getCategoryBadgeClass(category) {
  if (!category) return 'badge-primary';
  const catLower = category.toLowerCase();
  if (catLower.includes('droppii') || catLower.includes('partner')) return 'badge-secondary';
  if (catLower.includes('sales') || catLower.includes('bán hàng') || catLower.includes('tiktok')) return 'badge-neutral';
  return 'badge-primary';
}

function renderThumbnailHtml(article, basePath = '') {
  const rawImg = article.thumbnail || article.featuredImage;

  if (rawImg && typeof rawImg === 'string' && rawImg.trim()) {
    let src = rawImg.trim();
    if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:')) {
      if (src.startsWith('/')) {
        src = `${basePath}${src.slice(1)}`;
      } else {
        src = `${basePath}${src}`;
      }
    }
    const safeTitle = escapeHtml(article.title || 'Bài viết');
    const defaultFallback = `${basePath}assets/images/article-default.svg`;

    return `
      <div class="post-thumbnail-wrapper" aria-hidden="true">
        <img 
          src="${src}" 
          alt="${safeTitle}" 
          class="post-thumbnail-img"
          width="72"
          height="72"
          loading="lazy"
          decoding="async"
          onerror="this.onerror=null; this.src='${defaultFallback}';"
        >
      </div>
    `;
  }

  return `
    <div class="post-thumbnail-placeholder" aria-hidden="true">
      ${getThumbnailSvg(article.thumbnailIcon, article.category)}
    </div>
  `;
}

function getThumbnailSvg(type, categoryName = 'KDOL') {
  let initial = (categoryName || 'K').charAt(0).toUpperCase();

  return `
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      <circle cx="40" cy="35" r="18" fill="var(--color-primary-light)"/>
      <text x="40" y="41" font-size="16" font-family="'Be Vietnam Pro', sans-serif" font-weight="700" fill="var(--color-primary)" text-anchor="middle">
        ${initial}
      </text>
      <rect x="22" y="60" width="36" height="4" rx="2" fill="#CBD5E1"/>
    </svg>
  `;
}

function formatDate(dateInput) {
  if (!dateInput) return '11/11/2026';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '11/11/2026';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return '11/11/2026';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}
