/**
 * Blog Hub Component (Tích hợp REST API MongoDB Atlas)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Tính năng:
 * - Nạp danh mục động từ GET /api/categories
 * - Nạp bài viết tiêu điểm từ GET /api/posts/featured
 * - Nạp danh sách bài viết từ GET /api/posts?page=1&limit=6&category=&search=
 * - Đầy đủ 4 trạng thái: Loading, Empty, Error (kèm nút Thử lại) và Success
 * - Phân trang dạng nút "Xem thêm bài viết" kèm bộ đếm tiến trình
 * - Tìm kiếm từ khóa thời gian thực (Real-time debounce)
 * - 100% tuân thủ Mobile-Only (max-width 430px)
 */

import { getPosts, getFeaturedPosts, getCategories } from '../api.js';

// Trạng thái cục bộ của Blog Hub
const blogState = {
  activeCategory: 'all',
  keyword: '',
  page: 1,
  limit: 6,
  loadedArticles: [],
  total: 0,
  hasMore: false,
  isLoading: false
};

/**
 * Khởi tạo toàn bộ Blog Hub trên trang kien-thuc.html
 */
export async function initBlogHub() {
  const chipsContainer = document.querySelector('#blog-category-chips');
  const searchInput = document.querySelector('#blog-search-input');
  const searchClearBtn = document.querySelector('#blog-search-clear');

  if (!chipsContainer && !searchInput) return;

  // 1. Tải và render Chuyên mục cuộn ngang (Horizontal Chips) từ MongoDB
  await renderCategoryChips();

  // 2. Tải và render Bài viết nổi bật (Hero Featured) ở đầu trang
  await renderHeroFeaturedArticle();

  // 3. Lắng nghe ô tìm kiếm (Search input) với Debounce 250ms
  if (searchInput) {
    let debounceTimer = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        blogState.keyword = searchInput.value.trim();
        blogState.page = 1;
        blogState.loadedArticles = []; // Reset danh sách bài nạp

        if (searchClearBtn) {
          searchClearBtn.style.display = blogState.keyword ? 'flex' : 'none';
        }

        toggleHeroFeaturedDisplay();
        loadAndRenderArticles();
      }, 250);
    });

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        blogState.keyword = '';
        searchClearBtn.style.display = 'none';
        blogState.page = 1;
        blogState.loadedArticles = [];
        toggleHeroFeaturedDisplay();
        loadAndRenderArticles();
        searchInput.focus();
      });
    }
  }

  // 4. Tải danh sách bài viết lần đầu
  loadAndRenderArticles();
}

/**
 * Render thanh Chips cuộn ngang từ API
 */
async function renderCategoryChips() {
  const container = document.querySelector('#blog-category-chips');
  if (!container) return;

  let categories = [];
  try {
    categories = await getCategories();
  } catch (err) {
    console.warn('[Categories API Warning] Dùng danh mục mặc định:', err.message);
  }

  // Luôn đảm bảo có tab "Tất cả" ở vị trí đầu tiên
  const chipItems = [
    { name: 'Tất cả', slug: 'all' },
    ...(categories || []).map(c => ({ name: c.name, slug: c.slug || c.name }))
  ];

  container.innerHTML = chipItems.map(cat => `
    <button 
      type="button" 
      class="chip-btn${cat.slug === blogState.activeCategory ? ' active' : ''}" 
      data-category-slug="${escapeHtml(cat.slug)}"
      data-category-name="${escapeHtml(cat.name)}"
      role="tab"
      aria-selected="${cat.slug === blogState.activeCategory ? 'true' : 'false'}"
    >
      ${escapeHtml(cat.name)}
    </button>
  `).join('');

  // Gắn sự kiện click chọn chuyên mục
  container.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-category-slug');
      const name = btn.getAttribute('data-category-name');
      const selected = slug === 'all' ? 'all' : name;

      if (blogState.activeCategory === selected) return;

      blogState.activeCategory = selected;
      blogState.page = 1;
      blogState.loadedArticles = [];

      // Cập nhật giao diện chips
      container.querySelectorAll('.chip-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Cuộn mượt chip vào giữa tầm nhìn
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

      // Ẩn/Hiện Hero Featured theo ngữ cảnh lọc
      toggleHeroFeaturedDisplay();

      // Nạp lại danh sách bài viết
      loadAndRenderArticles();
    });
  });
}

/**
 * Render Bài viết nổi bật tiêu điểm ở đầu trang từ API
 */
async function renderHeroFeaturedArticle() {
  const container = document.querySelector('#blog-hero-featured');
  if (!container) return;

  try {
    const featured = await getFeaturedPosts(1);
    const heroArticle = (featured && featured.length > 0) ? featured[0] : null;

    if (!heroArticle) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="featured-hero-article">
        <a href="bai-viet.html?slug=${heroArticle.slug}" class="hero-article-card" aria-label="${escapeHtml(heroArticle.title)}">
          <div class="hero-article-header">
            <span class="badge ${getCategoryBadgeClass(heroArticle.category)}">${escapeHtml(heroArticle.category)}</span>
            <span class="badge badge-featured-pill">★ Bài Viết Tiêu Điểm</span>
          </div>
          <h2 class="hero-article-title">${escapeHtml(heroArticle.title)}</h2>
          <p class="hero-article-desc">${escapeHtml(heroArticle.excerpt)}</p>
          <div class="hero-article-footer">
            <span class="hero-meta-text">Tác giả: Thầy Giáo KDOL • ${heroArticle.readTime || '5 phút đọc'}</span>
            <span class="hero-cta-btn">Đọc bài viết →</span>
          </div>
        </a>
      </div>
    `;
  } catch (err) {
    console.warn('[Hero Featured API Warning]', err.message);
    container.innerHTML = '';
  }
}

/**
 * Ẩn Hero Featured khi người dùng tìm kiếm hoặc lọc theo danh mục cụ thể
 */
function toggleHeroFeaturedDisplay() {
  const heroContainer = document.querySelector('#blog-hero-featured');
  if (!heroContainer) return;

  if (blogState.activeCategory !== 'all' || blogState.keyword !== '') {
    heroContainer.style.display = 'none';
  } else {
    heroContainer.style.display = 'block';
  }
}

/**
 * Nạp và hiển thị danh sách bài viết từ MongoDB Atlas
 */
async function loadAndRenderArticles() {
  const listContainer = document.querySelector('#blog-articles-container');
  const paginationContainer = document.querySelector('#blog-pagination-container');
  const emptyStateContainer = document.querySelector('#blog-empty-state');

  if (!listContainer) return;

  // Hiển thị trạng thái Loading (Skeleton) khi ở trang đầu
  if (blogState.page === 1) {
    renderLoadingSkeleton(listContainer);
    if (emptyStateContainer) emptyStateContainer.style.display = 'none';
    if (paginationContainer) paginationContainer.innerHTML = '';
  }

  blogState.isLoading = true;

  try {
    const { items, pagination } = await getPosts({
      page: blogState.page,
      limit: blogState.limit,
      category: blogState.activeCategory,
      search: blogState.keyword
    });

    blogState.total = pagination.total;
    blogState.hasMore = pagination.hasMore;

    if (blogState.page === 1) {
      blogState.loadedArticles = items;
    } else {
      blogState.loadedArticles = [...blogState.loadedArticles, ...items];
    }

    // XỬ LÝ TRẠNG THÁI EMPTY STATE (Không có kết quả)
    if (blogState.loadedArticles.length === 0) {
      listContainer.innerHTML = '';
      if (paginationContainer) paginationContainer.innerHTML = '';
      if (emptyStateContainer) {
        emptyStateContainer.style.display = 'block';
        emptyStateContainer.innerHTML = `
          <div class="empty-state-box">
            <div class="empty-state-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </div>
            <h3 class="empty-state-title">Không tìm thấy bài viết phù hợp</h3>
            <p class="empty-state-desc">
              Không có bài viết nào khớp với từ khóa "<strong>${escapeHtml(blogState.keyword || blogState.activeCategory)}</strong>".
            </p>
            <button type="button" class="btn btn-outline btn-sm" id="empty-state-reset-btn">
              Đặt Lại Bộ Lọc
            </button>
          </div>
        `;

        const resetBtn = emptyStateContainer.querySelector('#empty-state-reset-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', resetFilters);
        }
      }
      return;
    }

    // Ẩn Empty State nếu có bài viết
    if (emptyStateContainer) {
      emptyStateContainer.style.display = 'none';
    }

    // Render danh sách Card bài viết
    listContainer.innerHTML = blogState.loadedArticles.map(article => `
      <article class="post-card post-card-compact">
        <a href="bai-viet.html?slug=${article.slug}" class="post-card-inner" aria-label="${escapeHtml(article.title)}">
          ${renderThumbnailHtml(article)}
          <div class="post-card-content">
            <div class="post-card-meta">
              <span class="badge ${getCategoryBadgeClass(article.category)}">${escapeHtml(article.category)}</span>
              <span class="post-date">• ${formatDate(article.publishedAt)}</span>
            </div>
            <h2 class="post-card-title">${escapeHtml(article.title)}</h2>
            <p class="post-card-desc">${escapeHtml(article.excerpt)}</p>
          </div>
        </a>
      </article>
    `).join('');

    // Render phân trang "Xem thêm bài viết"
    if (paginationContainer) {
      const currentCount = blogState.loadedArticles.length;
      const totalCount = blogState.total;
      const remaining = Math.max(0, totalCount - currentCount);

      if (blogState.hasMore) {
        paginationContainer.innerHTML = `
          <div class="load-more-container">
            <span class="load-more-counter">Hiển thị ${currentCount} / ${totalCount} bài viết</span>
            <button type="button" class="btn btn-outline btn-block" id="btn-load-more">
              Xem thêm bài viết (còn ${remaining} bài) ↓
            </button>
          </div>
        `;

        const loadMoreBtn = paginationContainer.querySelector('#btn-load-more');
        if (loadMoreBtn) {
          loadMoreBtn.addEventListener('click', () => {
            blogState.page += 1;
            loadAndRenderArticles();
          });
        }
      } else {
        paginationContainer.innerHTML = `
          <div class="load-more-container all-loaded">
            <span class="load-more-counter">Đã hiển thị toàn bộ ${totalCount} bài viết</span>
          </div>
        `;
      }
    }
  } catch (err) {
    console.error('[Blog Hub Error]', err);
    renderErrorState(listContainer, paginationContainer, () => loadAndRenderArticles());
  } finally {
    blogState.isLoading = false;
  }
}

/**
 * Hiển thị trạng thái Lỗi kết nối kèm nút Thử lại (Retry)
 */
function renderErrorState(listContainer, paginationContainer, retryFn) {
  if (paginationContainer) paginationContainer.innerHTML = '';
  listContainer.innerHTML = `
    <div style="padding: var(--spacing-2xl) var(--page-padding-x); text-align: center; background-color: var(--color-bg-white); border: 1px dashed #FCA5A5; border-radius: var(--radius-md); margin: var(--spacing-md) 0;">
      <div style="color: #DC2626; margin-bottom: 8px;">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto; display: block;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3 style="font-size: var(--font-size-md); font-weight: 700; color: var(--color-text-main); margin-bottom: 6px;">
        Không thể tải danh sách bài viết
      </h3>
      <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.5; margin-bottom: var(--spacing-md);">
        Hệ thống gặp sự cố khi kết nối tới máy chủ. Vui lòng bấm thử lại bên dưới.
      </p>
      <button type="button" class="btn btn-primary btn-sm" id="btn-blog-retry">
        Thử Lại Ngay ↻
      </button>
    </div>
  `;

  const retryBtn = listContainer.querySelector('#btn-blog-retry');
  if (retryBtn && typeof retryFn === 'function') {
    retryBtn.addEventListener('click', retryFn);
  }
}

/**
 * Hiển thị hiệu ứng Skeleton Loading
 */
function renderLoadingSkeleton(container) {
  container.innerHTML = Array.from({ length: 4 }).map(() => `
    <div class="post-card post-card-compact" style="opacity: 0.6; pointer-events: none;">
      <div class="post-card-inner">
        <div class="post-thumbnail-placeholder" style="background: #E2E8F0; border-radius: 6px;"></div>
        <div class="post-card-content" style="width: 100%;">
          <div style="width: 30%; height: 14px; background: #E2E8F0; border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="width: 90%; height: 16px; background: #E2E8F0; border-radius: 4px; margin-bottom: 6px;"></div>
          <div style="width: 60%; height: 12px; background: #E2E8F0; border-radius: 4px;"></div>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Đặt lại toàn bộ bộ lọc
 */
function resetFilters() {
  const searchInput = document.querySelector('#blog-search-input');
  const searchClearBtn = document.querySelector('#blog-search-clear');
  const chipsContainer = document.querySelector('#blog-category-chips');

  blogState.keyword = '';
  blogState.activeCategory = 'all';
  blogState.page = 1;
  blogState.loadedArticles = [];

  if (searchInput) searchInput.value = '';
  if (searchClearBtn) searchClearBtn.style.display = 'none';

  if (chipsContainer) {
    chipsContainer.querySelectorAll('.chip-btn').forEach(b => {
      const isAll = b.getAttribute('data-category-slug') === 'all';
      b.classList.toggle('active', isAll);
      b.setAttribute('aria-selected', isAll ? 'true' : 'false');
    });
  }

  toggleHeroFeaturedDisplay();
  loadAndRenderArticles();
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
