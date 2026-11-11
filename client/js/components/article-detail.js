/**
 * Article Detail Component (Tích hợp REST API MongoDB Atlas)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

import { getPostBySlug } from '../api.js';

export async function initArticleDetailPage() {
  const articleViewContainer = document.querySelector('#article-view');
  if (!articleViewContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  // 1. Trường hợp không truyền slug hoặc slug rỗng
  if (!slug || !slug.trim()) {
    renderNotFoundState(articleViewContainer, 'Vui lòng chọn bài viết từ thư viện kiến thức KDOL.');
    return;
  }

  const cleanSlug = slug.trim().toLowerCase();

  // 2. Hiển thị trạng thái Loading
  renderDetailLoadingState(articleViewContainer);

  try {
    // 3. Gọi REST API lấy chi tiết bài viết từ MongoDB Atlas
    const postData = await getPostBySlug(cleanSlug);

    if (!postData) {
      renderNotFoundState(articleViewContainer, `Không tìm thấy bài viết tương ứng với đường dẫn "${escapeHtml(cleanSlug)}".`);
      return;
    }

    // 4. Cập nhật SEO động (Title, Meta Description, Canonical URL, Open Graph)
    updateArticleSeo(postData);

    // 5. Cập nhật Breadcrumbs
    updateBreadcrumbs(postData);

    // 6. Render nội dung bài viết chi tiết
    renderArticleContent(articleViewContainer, postData);

    // 7. Gắn sự kiện thanh chia sẻ (Copy link & Web Share API)
    bindShareActions(postData);

    // 8. Render 3 bài viết liên quan theo chuyên mục
    renderRelatedArticles(postData.relatedPosts || []);
  } catch (err) {
    console.error('[Article Detail Error]', err);

    if (err.status === 404) {
      renderNotFoundState(articleViewContainer, `Không tìm thấy bài viết tương ứng với đường dẫn "${escapeHtml(cleanSlug)}".`);
    } else {
      renderDetailErrorState(articleViewContainer, err.message || 'Lỗi kết nối máy chủ.', () => initArticleDetailPage());
    }
  }
}

/**
 * Cập nhật thẻ SEO động theo bài viết
 */
function updateArticleSeo(article) {
  // Title
  document.title = `${article.title} – Thầy Giáo KDOL`;

  // Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = article.excerpt;

  // Canonical URL
  const canonicalHref = `${window.location.origin}${window.location.pathname}?slug=${encodeURIComponent(article.slug)}`;
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonicalHref;

  // Open Graph Tags
  setMetaTag('property', 'og:title', `${article.title} – Thầy Giáo KDOL`);
  setMetaTag('property', 'og:description', article.excerpt);
  setMetaTag('property', 'og:url', canonicalHref);
  setMetaTag('property', 'og:type', 'article');
  setMetaTag('property', 'og:image', article.thumbnail || `${window.location.origin}/assets/images/article-default.svg`);

  // Twitter Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', `${article.title} – Thầy Giáo KDOL`);
  setMetaTag('name', 'twitter:description', article.excerpt);
  setMetaTag('name', 'twitter:image', article.thumbnail || `${window.location.origin}/assets/images/article-default.svg`);

  // Dữ liệu có cấu trúc Schema.org BlogPosting (JSON-LD)
  let scriptLd = document.querySelector('#article-json-ld');
  if (!scriptLd) {
    scriptLd = document.createElement('script');
    scriptLd.id = 'article-json-ld';
    scriptLd.type = 'application/ld+json';
    document.head.appendChild(scriptLd);
  }
  scriptLd.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.thumbnail ? [article.thumbnail] : [`${window.location.origin}/assets/images/article-default.svg`],
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "author": {
      "@type": "Person",
      "name": "Thầy Giáo KDOL",
      "url": `${window.location.origin}/gioi-thieu.html`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Thầy Giáo KDOL",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/assets/images/thay-giao-kdol-portrait.svg`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalHref
    }
  });
}

function setMetaTag(attrName, attrVal, content) {
  let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrVal);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

/**
 * Cập nhật đường dẫn điều hướng Breadcrumbs
 */
function updateBreadcrumbs(article) {
  const breadcrumbsContainer = document.querySelector('#article-breadcrumbs');
  if (!breadcrumbsContainer) return;

  const shortTitle = article.title.length > 32 
    ? article.title.substring(0, 32) + '...' 
    : article.title;

  breadcrumbsContainer.innerHTML = `
    <a href="index.html">Trang chủ</a>
    <span class="separator">/</span>
    <a href="kien-thuc.html">Kiến thức</a>
    <span class="separator">/</span>
    <span class="breadcrumb-current" title="${escapeHtml(article.title)}">${escapeHtml(shortTitle)}</span>
  `;
}

/**
 * Render giao diện bài viết chi tiết
 */
function renderArticleContent(container, article) {
  container.innerHTML = `
    <!-- HEADER BÀI VIẾT -->
    <header class="article-header">
      <div class="article-category">
        <span class="badge ${getCategoryBadgeClass(article.category)}">${escapeHtml(article.category)}</span>
      </div>
      <h1 class="article-title">${escapeHtml(article.title)}</h1>
      <div class="article-meta">
        <span>Tác giả: Thầy Giáo KDOL</span>
        <span>•</span>
        <span>${formatDate(article.publishedAt)}</span>
        <span>•</span>
        <span>${article.readTime || '5 phút đọc'}</span>
      </div>

      <!-- THANH CHIA SẺ BÀI VIẾT -->
      <div class="article-share-bar" role="toolbar" aria-label="Công cụ chia sẻ bài viết">
        <button type="button" class="btn-share-action" id="btn-copy-link" aria-label="Sao chép liên kết bài viết">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span class="btn-share-text">Sao chép link</span>
        </button>

        <button type="button" class="btn-share-action" id="btn-share-native" aria-label="Chia sẻ bài viết này">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>Chia sẻ</span>
        </button>
      </div>
    </header>

    <!-- NỘI DUNG CHÍNH (ARTICLE BODY) -->
    <article class="article-body">
      <!-- ẢNH ĐẠI DIỆN BÀI VIẾT (FEATURED IMAGE) -->
      ${renderFeaturedImageMarkup(article)}

      <!-- CÁC KHỐI NỘI DUNG (H2, H3, ĐOẠN VĂN, DANH SÁCH, ẢNH, CALLOUT) -->
      <div id="article-structured-body"></div>

      <!-- TÁC GIẢ BOX -->
      <div class="card" style="margin-top: var(--spacing-xl); background-color: var(--color-bg-subtle);">
        <div style="display: flex; gap: 12px; align-items: center;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background-color: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
            KDOL
          </div>
          <div>
            <strong style="display: block; font-size: var(--font-size-base); color: var(--color-text-main);">Thầy Giáo KDOL</strong>
            <span style="font-size: var(--font-size-xs); color: var(--color-text-muted);">Huấn luyện viên thực chiến & Tư vấn vận hành</span>
          </div>
        </div>
        <p style="font-size: var(--font-size-xs); margin-top: 8px; margin-bottom: 0; color: var(--color-text-secondary); line-height: 1.5;">
          Chuyên gia chia sẻ kiến thức bán hàng đa kênh thực chiến với phương châm cốt lõi: <strong>1 đơn hàng - 1 nụ cười</strong>.
        </p>
      </div>

      <!-- BANNER CUỐI BÀI VIẾT -->
      <div class="article-partner-banner">
        <span class="article-partner-banner-badge">Đồng Hành Thực Chiến 1-1</span>
        <h3 class="article-partner-banner-title">Bạn muốn bắt đầu kinh doanh online?</h3>
        <p class="article-partner-banner-desc">
          Đồng hành trực tiếp cùng Thầy Giáo KDOL: Tối ưu chi phí, xây dựng kênh bán hàng tinh gọn và kiểm soát dòng tiền bền vững.
        </p>
        <a href="dang-ky-partner.html" class="btn btn-primary btn-block">
          ĐĂNG KÝ PARTNER KDOL NGAY
        </a>
      </div>

      <!-- SECTION: 3 BÀI VIẾT LIÊN QUAN THEO CHUYÊN MỤC -->
      <div style="margin-top: var(--spacing-2xl);">
        <h3 style="font-size: var(--font-size-md); font-weight: 700; color: var(--color-text-main); margin-bottom: var(--spacing-sm);">
          Bài viết liên quan (${escapeHtml(article.category)})
        </h3>
        <div id="article-related-list" style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
          <!-- Render tự động 3 bài liên quan -->
        </div>
      </div>
    </article>
  `;

  // Render các khối nội dung an toàn qua DOM API
  const structuredBodyEl = container.querySelector('#article-structured-body');
  if (structuredBodyEl) {
    if (Array.isArray(article.content)) {
      renderStructuredBlocks(structuredBodyEl, article.content);
    } else if (typeof article.content === 'string') {
      // Hỗ trợ trường hợp nội dung là chuỗi HTML đã được sanitize
      structuredBodyEl.innerHTML = article.content;
    }
  }
}

/**
 * Render ảnh đại diện bài viết
 */
function renderFeaturedImageMarkup(article) {
  const imgSrc = article.featuredImage || article.thumbnail;
  if (!imgSrc) return '';

  const caption = article.featuredImageCaption || `Hình ảnh minh họa: ${article.title}`;
  return `
    <figure class="article-featured-image-wrap">
      <img 
        src="${escapeHtml(imgSrc)}" 
        alt="${escapeHtml(article.title)}" 
        class="article-featured-image"
        width="398"
        height="224"
        loading="lazy"
        decoding="async"
        style="aspect-ratio: 16/9; width: 100%; height: auto; object-fit: cover;"
      >
      <figcaption class="article-image-caption">${escapeHtml(caption)}</figcaption>
    </figure>
  `;
}

/**
 * Render các khối nội dung an toàn (XSS-safe DOM Construction)
 */
function renderStructuredBlocks(container, blocks) {
  container.innerHTML = '';

  blocks.forEach(block => {
    switch (block.type) {
      case 'heading2': {
        const h2 = document.createElement('h2');
        h2.textContent = block.text;
        container.appendChild(h2);
        break;
      }

      case 'heading3': {
        const h3 = document.createElement('h3');
        h3.textContent = block.text;
        container.appendChild(h3);
        break;
      }

      case 'paragraph': {
        const p = document.createElement('p');
        p.textContent = block.text;
        if (block.link && block.link.text && block.link.url) {
          const a = document.createElement('a');
          a.href = sanitizeUrl(block.link.url);
          a.textContent = block.link.text;
          p.appendChild(a);
        }
        container.appendChild(p);
        break;
      }

      case 'callout': {
        const callout = document.createElement('div');
        callout.className = 'article-callout';
        if (block.strong) {
          const strong = document.createElement('strong');
          strong.textContent = block.strong;
          callout.appendChild(strong);
        }
        const textSpan = document.createElement('span');
        textSpan.textContent = block.text;
        callout.appendChild(textSpan);
        container.appendChild(callout);
        break;
      }

      case 'list': {
        const listEl = document.createElement(block.format === 'ordered' ? 'ol' : 'ul');
        if (Array.isArray(block.items)) {
          block.items.forEach(itemText => {
            const li = document.createElement('li');
            li.textContent = itemText;
            listEl.appendChild(li);
          });
        }
        container.appendChild(listEl);
        break;
      }

      case 'image': {
        const figure = document.createElement('figure');
        figure.className = 'article-content-image-wrap';

        const img = document.createElement('img');
        img.src = sanitizeUrl(block.src);
        img.alt = block.alt || '';
        img.loading = 'lazy';
        figure.appendChild(img);

        if (block.caption) {
          const figcaption = document.createElement('figcaption');
          figcaption.textContent = block.caption;
          figure.appendChild(figcaption);
        }

        container.appendChild(figure);
        break;
      }

      default:
        break;
    }
  });
}

/**
 * Gắn sự kiện sao chép liên kết và Web Share API
 */
function bindShareActions(article) {
  const copyBtn = document.querySelector('#btn-copy-link');
  const shareBtn = document.querySelector('#btn-share-native');

  if (copyBtn) {
    const textSpan = copyBtn.querySelector('.btn-share-text');
    copyBtn.addEventListener('click', async () => {
      const shareUrl = window.location.href;
      let success = false;

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          success = true;
        } catch (e) {
          success = fallbackCopyText(shareUrl);
        }
      } else {
        success = fallbackCopyText(shareUrl);
      }

      if (success && textSpan) {
        copyBtn.classList.add('copied');
        textSpan.textContent = '✓ Đã sao chép liên kết!';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          textSpan.textContent = 'Sao chép link';
        }, 2500);
      }
    });
  }

  if (shareBtn) {
    if (navigator.share) {
      shareBtn.addEventListener('click', async () => {
        try {
          await navigator.share({
            title: `${article.title} – Thầy Giáo KDOL`,
            text: article.excerpt,
            url: window.location.href
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            if (copyBtn) copyBtn.click();
          }
        }
      });
    } else {
      shareBtn.addEventListener('click', () => {
        if (copyBtn) copyBtn.click();
      });
    }
  }
}

function fallbackCopyText(text) {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    return false;
  }
}

/**
 * Render 3 bài viết liên quan
 */
function renderRelatedArticles(relatedList) {
  const container = document.querySelector('#article-related-list');
  if (!container) return;

  if (!relatedList || relatedList.length === 0) {
    container.innerHTML = `
      <p style="font-size: var(--font-size-xs); color: var(--color-text-muted);">
        Chưa có bài viết liên quan trong chuyên mục này.
      </p>
    `;
    return;
  }

  const finalItems = relatedList.slice(0, 3);

  container.innerHTML = finalItems.map(item => `
    <article class="post-card post-card-compact" style="margin-bottom: 0;">
      <a href="bai-viet.html?slug=${item.slug}" class="post-card-inner" aria-label="${escapeHtml(item.title)}">
        <div class="post-thumbnail-placeholder" aria-hidden="true">
          ${getThumbnailSvg(item.thumbnailIcon, item.category)}
        </div>
        <div class="post-card-content">
          <div class="post-card-meta">
            <span class="badge ${getCategoryBadgeClass(item.category)}">${escapeHtml(item.category)}</span>
            <span class="post-date">• ${item.readTime || '5 phút đọc'}</span>
          </div>
          <h4 class="post-card-title" style="font-size: var(--font-size-sm); margin-bottom: 3px;">${escapeHtml(item.title)}</h4>
          <p class="post-card-desc" style="font-size: var(--font-size-xs); -webkit-line-clamp: 2;">${escapeHtml(item.excerpt)}</p>
        </div>
      </a>
    </article>
  `).join('');
}

/**
 * Trạng thái Loading chi tiết bài viết
 */
function renderDetailLoadingState(container) {
  container.innerHTML = `
    <div style="padding: var(--spacing-2xl) var(--page-padding-x); text-align: center; color: var(--color-primary);">
      <div style="width: 36px; height: 36px; border: 3px solid #FED7AA; border-top-color: var(--color-primary); border-radius: 50%; animation: spinner-rotate 0.6s linear infinite; margin: 0 auto 12px;"></div>
      <p style="font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-secondary);">
        Đang nạp bài viết từ máy chủ...
      </p>
    </div>
  `;
}

/**
 * Trạng thái Lỗi kết nối kèm nút Thử lại (Retry)
 */
function renderDetailErrorState(container, message, retryFn) {
  container.innerHTML = `
    <div style="padding: var(--spacing-2xl) var(--page-padding-x); text-align: center; background-color: var(--color-bg-white); border: 1px dashed #FCA5A5; border-radius: var(--radius-md); margin: var(--spacing-xl) 0;">
      <div style="color: #DC2626; margin-bottom: 8px;">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto; display: block;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h2 style="font-size: var(--font-size-lg); font-weight: 700; color: var(--color-text-main); margin-bottom: 6px;">
        Không thể tải nội dung bài viết
      </h2>
      <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.5; margin-bottom: var(--spacing-md);">
        ${escapeHtml(message)}
      </p>
      <button type="button" class="btn btn-primary btn-sm" id="btn-detail-retry">
        Thử Lại Ngay ↻
      </button>
    </div>
  `;

  const retryBtn = container.querySelector('#btn-detail-retry');
  if (retryBtn && typeof retryFn === 'function') {
    retryBtn.addEventListener('click', retryFn);
  }
}

/**
 * Trạng thái 404 / Không tìm thấy bài viết
 */
function renderNotFoundState(container, message) {
  document.title = '404 - Không tìm thấy bài viết | Thầy Giáo KDOL';

  const breadcrumbsContainer = document.querySelector('#article-breadcrumbs');
  if (breadcrumbsContainer) {
    breadcrumbsContainer.innerHTML = `
      <a href="index.html">Trang chủ</a>
      <span class="separator">/</span>
      <a href="kien-thuc.html">Kiến thức</a>
      <span class="separator">/</span>
      <span class="breadcrumb-current">404 Không tìm thấy</span>
    `;
  }

  container.innerHTML = `
    <div class="article-not-found">
      <div class="article-not-found-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h1 class="article-not-found-title">404 - Không Tìm Thấy Bài Viết</h1>
      <p class="article-not-found-desc">${escapeHtml(message)}</p>
      <div class="article-not-found-actions">
        <a href="kien-thuc.html" class="btn btn-primary btn-block">
          ← Về Danh Mục Kiến Thức
        </a>
        <a href="index.html" class="btn btn-outline btn-block">
          Về Trang Chủ Thầy Giáo KDOL
        </a>
      </div>
    </div>
  `;
}

function getCategoryBadgeClass(category) {
  if (!category) return 'badge-primary';
  const catLower = category.toLowerCase();
  if (catLower.includes('droppii') || catLower.includes('partner')) return 'badge-secondary';
  if (catLower.includes('sales') || catLower.includes('bán hàng') || catLower.includes('tiktok')) return 'badge-neutral';
  return 'badge-primary';
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

function sanitizeUrl(url) {
  if (!url) return '#';
  const clean = url.trim();
  if (clean.startsWith('javascript:') || clean.startsWith('data:')) {
    return '#';
  }
  return clean;
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
