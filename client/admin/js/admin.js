/**
 * Admin Dashboard Logic (ES Module)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Tuyệt đối KHÔNG lưu trữ token xác thực vào localStorage hay sessionStorage.
 * Sử dụng Session HttpOnly Cookie và In-Memory CSRF Token.
 */

const API_BASE = window.location.port === '3000' 
  ? `${window.location.protocol}//${window.location.hostname}:5000/api` 
  : '/api';

// Trạng thái trong bộ nhớ RAM (In-Memory State)
const adminState = {
  admin: null,
  csrfToken: null,
  currentTab: 'dashboard',
  partnerPage: 1,
  partnerLimit: 10,
  partnerStatus: 'all',
  partnerSearch: '',
  partnerProvince: 'all',
  partnerSource: 'all',
  partnerInterest: 'all',
  partnerFromDate: '',
  partnerToDate: '',
  partnerTotalPages: 1,
  bannerPosition: 'all',
  bannerSearch: '',
  editingBannerId: null,
  selectedPartnerId: null,
  postPage: 1,
  postLimit: 10,
  postSearch: '',
  postCategory: 'all',
  postStatus: 'all',
  postTotalPages: 1,
  editingPostId: null,
  editingCategoryId: null,
  cachedCategories: []
};

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Kiểm tra phiên đăng nhập quản trị viên (Auth Guard)
  const isAuthenticated = await checkAdminSession();
  if (!isAuthenticated) {
    window.location.href = 'login.html';
    return;
  }

  // 2. Khởi tạo giao diện và các sự kiện
  bindNavigationTabs();
  bindLogoutButton();
  bindDashboardRefresh();
  bindPartnerManagement();
  bindBannerManagement();
  bindSettingsManagement();
  bindPostManagement();
  bindCategoryManagement();

  // 3. Tải dữ liệu Dashboard và Cache Chuyên mục ban đầu
  loadDashboardStats();
  loadCategories();
});

/**
 * Kiểm tra phiên đăng nhập và lấy CSRF Token
 */
async function checkAdminSession() {
  try {
    const res = await fetch(`${API_BASE}/admin/auth/me`, {
      method: 'GET',
      credentials: 'include' // Bắt buộc để truyền HttpOnly Cookie
    });

    if (!res.ok) return false;

    const result = await res.json();
    if (result && result.success && result.admin) {
      adminState.admin = result.admin;
      adminState.csrfToken = result.csrfToken;

      const userDisplay = document.querySelector('#admin-user-display');
      if (userDisplay) {
        userDisplay.textContent = `👤 ${result.admin.username}`;
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error('[Admin Auth Error]', err);
    return false;
  }
}

/**
 * Xử lý đăng xuất quản trị viên
 */
function bindLogoutButton() {
  const btnLogout = document.querySelector('#btn-admin-logout');
  if (!btnLogout) return;

  btnLogout.addEventListener('click', async () => {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?')) return;

    try {
      await fetch(`${API_BASE}/admin/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': adminState.csrfToken || ''
        }
      });
    } catch (err) {
      console.warn('Lỗi khi gọi logout:', err);
    } finally {
      adminState.admin = null;
      adminState.csrfToken = null;
      window.location.href = 'login.html';
    }
  });
}

/**
 * Điều hướng giữa các Tab chức năng
 */
function bindNavigationTabs() {
  const tabs = document.querySelectorAll('.admin-nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      switchTab(targetTab);
    });
  });

  document.querySelectorAll('.admin-tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.target;
      if (target) switchTab(target);
    });
  });
}

function switchTab(tabName) {
  adminState.currentTab = tabName;

  document.querySelectorAll('.admin-nav-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabName);
  });

  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.toggle('active', p.id === `panel-${tabName}`);
  });

  // Tải dữ liệu tương ứng khi mở tab
  if (tabName === 'dashboard') {
    loadDashboardStats();
  } else if (tabName === 'banners') {
    loadBanners();
  } else if (tabName === 'settings') {
    loadSettings();
  } else if (tabName === 'partners') {
    loadPartners();
  } else if (tabName === 'posts') {
    loadPosts();
  } else if (tabName === 'categories') {
    loadCategories();
  }
}

/**
 * ====================================================
 * TAB 1: DASHBOARD STATS (SỐ LIỆU THẬT TỪ MONGODB ATLAS)
 * ====================================================
 */
function bindDashboardRefresh() {
  const btn = document.querySelector('#btn-refresh-dashboard');
  if (btn) {
    btn.addEventListener('click', () => loadDashboardStats());
  }
}

async function loadDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = 'login.html';
        return;
      }
      throw new Error('Không thể tải số liệu thống kê.');
    }

    const { data } = await res.json();
    if (!data) return;

    // 1. Cập nhật 4 thẻ thống kê chính
    const statTotalPartners = document.querySelector('#stat-total-partners');
    if (statTotalPartners) statTotalPartners.textContent = data.partners.total || 0;

    const statNewPartners = document.querySelector('#stat-new-partners');
    if (statNewPartners) statNewPartners.textContent = data.partners.newCount || 0;

    const statContactedPartners = document.querySelector('#stat-contacted-partners');
    if (statContactedPartners) statContactedPartners.textContent = data.partners.contactedCount || (data.partners.statusBreakdown && data.partners.statusBreakdown.contacted) || 0;

    const statJoinedPartners = document.querySelector('#stat-joined-partners');
    if (statJoinedPartners) statJoinedPartners.textContent = data.partners.joinedCount || (data.partners.statusBreakdown && data.partners.statusBreakdown.joined) || 0;

    // Cập nhật badge trên thanh tab
    const tabBadge = document.querySelector('#tab-new-partner-badge');
    if (tabBadge) tabBadge.textContent = data.partners.newCount || 0;

    // 2. Phân bố trạng thái tư vấn
    const bd = data.partners.statusBreakdown || {};
    const setElem = (sel, val) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = val || 0;
    };
    setElem('#breakdown-new', bd.new);
    setElem('#breakdown-contacted', bd.contacted);
    setElem('#breakdown-consulted', bd.consulted || bd.consulting);
    setElem('#breakdown-joined', bd.joined || bd.active);
    setElem('#breakdown-not-suitable', bd.not_suitable || bd.rejected);
    setElem('#breakdown-total', data.partners.total || 0);

    // 3. Phân bổ nguồn đăng ký (sourceBreakdown)
    renderSourceBreakdown(data.partners.sourceBreakdown || {}, data.partners.total || 0);

    // 4. Render danh sách gần đây
    renderRecentPartnersList(data.recentPartners || []);

  } catch (err) {
    console.error('[Dashboard Error]', err);
    showToast(err.message || 'Lỗi nạp dữ liệu thống kê');
  }
}

function renderRecentPartnersList(partners) {
  const container = document.querySelector('#dashboard-recent-partners-list');
  if (!container) return;

  if (partners.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 12px; color: var(--color-text-muted); font-size: 11px;">
        Chưa có hồ sơ đối tác nào.
      </div>
    `;
    return;
  }

  container.innerHTML = partners.map(p => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--color-border); font-size: 11px;">
      <div>
        <div style="font-weight: 700; color: var(--color-text-main); cursor: pointer;" onclick="window.handleViewPartnerDetail('${p._id}')" title="Xem chi tiết hồ sơ">
          ${escapeHtml(p.fullName)} ↗
        </div>
        <div style="color: var(--color-text-secondary); font-size: 10px;">
          ${escapeHtml(p.phone)} • ${escapeHtml(p.province)} • Nguồn: <strong>${escapeHtml(p.source || 'website')}</strong>
        </div>
      </div>
      <div>
        ${renderStatusBadge(p.status)}
      </div>
    </div>
  `).join('');
}

function renderSourceBreakdown(sources, total) {
  const container = document.querySelector('#dashboard-source-breakdown');
  if (!container) return;

  const sourceLabels = {
    website: '🌐 Website',
    tiktok_live: '🎵 TikTok Live',
    facebook: '📘 Facebook',
    zalo: '💬 Zalo',
    website_demo: '🧪 Demo Form',
    other: '📌 Nguồn khác'
  };

  const keys = Object.keys(sources);
  if (keys.length === 0 || total === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 12px; color: var(--color-text-muted); font-size: 11px;">
        Chưa có dữ liệu nguồn đăng ký.
      </div>
    `;
    return;
  }

  container.innerHTML = keys.map(k => {
    const count = sources[k] || 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const label = sourceLabels[k] || k;
    return `
      <div class="source-dist-item">
        <span style="width: 105px; color: var(--color-text-main); font-weight: 600; white-space: nowrap;">${label}</span>
        <div class="source-bar-wrapper">
          <div class="source-bar-fill" style="width: ${pct}%;"></div>
        </div>
        <span style="width: 60px; text-align: right; color: var(--color-text-secondary); font-weight: 600;">
          ${count} <small style="color: var(--color-text-muted); font-weight: 400;">(${pct}%)</small>
        </span>
      </div>
    `;
  }).join('');
}

/**
 * ====================================================
 * TAB 2: QUẢN LÝ BANNER & UPLOAD ẢNH (CRUD TOÀN DIỆN)
 * ====================================================
 */
function bindBannerManagement() {
  const modal = document.querySelector('#banner-modal');
  const btnOpen = document.querySelector('#btn-open-create-banner');
  const btnClose = document.querySelector('#btn-close-banner-modal');
  const btnCancel = document.querySelector('#btn-cancel-banner');
  const form = document.querySelector('#banner-form');
  const searchInput = document.querySelector('#banner-search-input');
  const filterPos = document.querySelector('#banner-filter-pos');
  const fileUpload = document.querySelector('#file-upload-banner');
  const imageInput = document.querySelector('#banner-image');
  const previewImg = document.querySelector('#banner-preview-img');
  const previewPlaceholder = document.querySelector('#banner-preview-placeholder');

  // 1. Mở modal thêm mới
  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      adminState.editingBannerId = null;
      if (form) form.reset();
      document.querySelector('#banner-id').value = '';
      document.querySelector('#banner-modal-heading').textContent = 'Thêm Banner Mới';
      updateBannerPreview('');
      if (modal) modal.style.display = 'flex';
    });
  }

  // 2. Đóng modal
  const closeModal = () => {
    if (modal) modal.style.display = 'none';
    if (form) form.reset();
    adminState.editingBannerId = null;
  };
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  // 3. Xử lý Upload ảnh Banner (JPG, PNG, WebP)
  if (fileUpload) {
    fileUpload.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      // Kiểm tra sơ bộ phía client
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('❌ Định dạng file không hợp lệ! Chỉ cho phép JPG, PNG, WebP (không cho phép SVG).');
        fileUpload.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('❌ Dung lượng file ảnh vượt quá 5MB!');
        fileUpload.value = '';
        return;
      }

      // Preview ảnh ngay lập tức bằng FileReader
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateBannerPreview(ev.target.result);
      };
      reader.readAsDataURL(file);

      // Gửi upload lên server qua multipart/form-data
      const formData = new FormData();
      formData.append('image', file);

      showToast('⏳ Đang upload ảnh lên hệ thống...');

      try {
        const res = await fetch(`${API_BASE}/admin/upload/banner`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'X-CSRF-Token': adminState.csrfToken || ''
          },
          body: formData
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.message || 'Lỗi khi upload ảnh.');
        }

        // Cập nhật URL vào input
        if (imageInput) {
          imageInput.value = result.url;
        }
        showToast('✅ Upload ảnh banner thành công!');

      } catch (uploadErr) {
        showToast(`❌ ${uploadErr.message}`);
        fileUpload.value = '';
      }
    });
  }

  // 4. Lắng nghe thay đổi URL ảnh thủ công để cập nhật preview
  if (imageInput) {
    imageInput.addEventListener('input', () => {
      updateBannerPreview(imageInput.value.trim());
    });
  }

  function updateBannerPreview(url) {
    if (url && (url.startsWith('data:image') || url.startsWith('http') || url.startsWith('uploads/') || url.startsWith('assets/'))) {
      if (previewImg) {
        previewImg.src = url;
        previewImg.style.display = 'block';
      }
      if (previewPlaceholder) previewPlaceholder.style.display = 'none';
    } else {
      if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
      }
      if (previewPlaceholder) previewPlaceholder.style.display = 'block';
    }
  }

  // 5. Submit Form Thêm / Sửa Banner
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.querySelector('#btn-submit-banner');

      const image = form.image.value.trim();
      const targetUrl = (form.url ? form.url.value : (form.link ? form.link.value : '')).trim();
      const position = form.position.value;
      const order = parseInt(form.order.value, 10) || 0;
      const active = form.active.checked;

      if (!image) {
        showToast('❌ Vui lòng chọn hoặc nhập hình ảnh banner!');
        return;
      }

      if (!targetUrl) {
        showToast('❌ Vui lòng nhập đường dẫn đích (URL)!');
        return;
      }

      // Kiểm tra an toàn link đích
      if (targetUrl.toLowerCase().startsWith('javascript:') || targetUrl.toLowerCase().startsWith('data:')) {
        showToast('❌ Cảnh báo: Đường dẫn đích chứa mã javascript: hoặc data: bị cấm vì lý do an ninh!');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang lưu...';
      }

      const payload = {
        image,
        url: targetUrl,
        link: targetUrl,
        position,
        order,
        active
      };

      try {
        const isEditing = Boolean(adminState.editingBannerId);
        const url = isEditing 
          ? `${API_BASE}/admin/banners/${adminState.editingBannerId}`
          : `${API_BASE}/admin/banners`;
        const method = isEditing ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': adminState.csrfToken || ''
          },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.message || 'Không thể lưu banner.');
        }

        showToast(`✅ ${isEditing ? 'Cập nhật' : 'Thêm'} banner thành công!`);
        closeModal();
        loadBanners();
        loadDashboardStats();

      } catch (err) {
        showToast(`❌ ${err.message}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Lưu Banner';
        }
      }
    });
  }

  // 6. Lọc và tìm kiếm
  if (searchInput) {
    let timer = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        adminState.bannerSearch = searchInput.value.trim();
        loadBanners();
      }, 300);
    });
  }

  if (filterPos) {
    filterPos.addEventListener('change', () => {
      adminState.bannerPosition = filterPos.value;
      loadBanners();
    });
  }
}

async function loadBanners() {
  const container = document.querySelector('#admin-banners-list');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 16px; color: var(--color-text-muted); font-size: 11px;">
      Đang nạp danh sách banner...
    </div>
  `;

  try {
    const params = new URLSearchParams({
      position: adminState.bannerPosition,
      search: adminState.bannerSearch
    });

    const res = await fetch(`${API_BASE}/admin/banners?${params}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Không thể tải danh sách banner.');

    const { data } = await res.json();
    const banners = data || [];

    if (banners.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--color-text-muted); font-size: var(--font-size-xs);">
          Chưa có banner nào phù hợp với bộ lọc.
        </div>
      `;
      return;
    }

    container.innerHTML = banners.map(b => {
      const bannerUrl = b.url || b.link || '';
      return `
      <div class="banner-admin-card" id="banner-card-${b._id}">
        <!-- THUMBNAIL PREVIEW 2:1 -->
        <div class="banner-thumb-box" style="aspect-ratio: 2 / 1; width: 130px; min-width: 130px; height: auto; border-radius: var(--radius-xs); overflow: hidden; border: 1px solid var(--color-border); background: #FFF7ED;">
          <img 
            src="${escapeHtml(b.image || 'assets/images/banner-partner.svg')}" 
            alt="Banner Image" 
            class="banner-thumb-img"
            style="width: 100%; height: 100%; object-fit: cover; display: block;"
            onerror="this.src='../assets/images/banner-partner.svg'"
          >
        </div>

        <!-- INFO -->
        <div class="banner-info-box" style="flex: 1; min-width: 0;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--color-text-main); word-break: break-all;">
              🔗 <a href="${escapeHtml(bannerUrl)}" target="_blank" style="color: var(--color-primary); text-decoration: none;">${escapeHtml(bannerUrl || 'Chưa gắn link')}</a>
            </div>
            <span class="badge ${b.active ? 'badge-primary' : 'badge-neutral'}" style="font-size: 10px; flex-shrink: 0;">
              ${b.active ? 'Hoạt động' : 'Tạm dừng'}
            </span>
          </div>

          <div style="font-size: 11px; color: var(--color-text-muted); margin: 4px 0;">
            Vị trí: <strong>${escapeHtml(b.position || 'home_slider')}</strong> • Thứ tự: <strong>#${b.order || 0}</strong>
          </div>

          <!-- ACTIONS -->
          <div class="banner-actions" style="display: flex; gap: 4px; margin-top: 6px;">
            <button 
              type="button" 
              class="btn btn-outline btn-sm" 
              style="padding: 2px 8px; font-size: 10px;"
              onclick="window.handleEditBanner('${b._id}')"
            >
              ✏️ Sửa
            </button>
            <button 
              type="button" 
              class="btn btn-outline btn-sm" 
              style="padding: 2px 8px; font-size: 10px; color: ${b.active ? '#4B5563' : '#15803D'};"
              onclick="window.handleToggleBanner('${b._id}')"
            >
              ${b.active ? '⏸ Tạm dừng' : '▶ Kích hoạt'}
            </button>
            <button 
              type="button" 
              class="btn btn-outline btn-sm" 
              style="padding: 2px 8px; font-size: 10px; color: #DC2626; border-color: #FCA5A5;"
              onclick="window.handleDeleteBanner('${b._id}')"
            >
              🗑 Xóa
            </button>
          </div>
        </div>
      </div>
    `}).join('');

  } catch (err) {
    container.innerHTML = `<div style="text-align: center; padding: 16px; color: #DC2626; font-size: 11px;">${escapeHtml(err.message)}</div>`;
  }
}

// Hàm toàn cục hỗ trợ sửa / xóa / bật tắt banner
window.handleEditBanner = async function(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/banners/${id}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Không thể lấy thông tin banner.');

    const { data } = await res.json();
    if (!data) return;

    adminState.editingBannerId = id;
    const form = document.querySelector('#banner-form');
    if (!form) return;

    document.querySelector('#banner-id').value = data._id;
    document.querySelector('#banner-modal-heading').textContent = 'Chỉnh Sửa Banner';
    form.image.value = data.image || '';
    if (form.url) form.url.value = data.url || data.link || '';
    if (form.link) form.link.value = data.url || data.link || '';
    if (form.position) form.position.value = data.position || 'home_slider';
    if (form.order) form.order.value = data.order || 0;
    if (form.active) form.active.checked = Boolean(data.active);

    // Cập nhật preview ảnh
    const previewImg = document.querySelector('#banner-preview-img');
    const previewPlaceholder = document.querySelector('#banner-preview-placeholder');
    if (data.image) {
      if (previewImg) {
        previewImg.src = data.image;
        previewImg.style.display = 'block';
      }
      if (previewPlaceholder) previewPlaceholder.style.display = 'none';
    } else {
      if (previewImg) previewImg.style.display = 'none';
      if (previewPlaceholder) previewPlaceholder.style.display = 'block';
    }

    const modal = document.querySelector('#banner-modal');
    if (modal) modal.style.display = 'flex';

  } catch (err) {
    showToast(`❌ Lỗi: ${err.message}`);
  }
};

window.handleToggleBanner = async function(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/banners/${id}/toggle`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': adminState.csrfToken || ''
      }
    });

    if (!res.ok) throw new Error('Không thể thay đổi trạng thái.');

    showToast('✅ Đã cập nhật trạng thái banner!');
    loadBanners();
    loadDashboardStats();
  } catch (err) {
    showToast(`❌ Lỗi: ${err.message}`);
  }
};

window.handleDeleteBanner = async function(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa banner này vĩnh viễn?')) return;

  try {
    const res = await fetch(`${API_BASE}/admin/banners/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': adminState.csrfToken || ''
      }
    });

    if (!res.ok) throw new Error('Không thể xóa banner.');

    showToast('✅ Đã xóa banner thành công!');
    loadBanners();
    loadDashboardStats();
  } catch (err) {
    showToast(`❌ Lỗi: ${err.message}`);
  }
};

/**
 * ====================================================
 * TAB 3: QUẢN LÝ CẤU HÌNH WEBSITE & UPLOAD LOGO/AVATAR
 * ====================================================
 */
function bindSettingsManagement() {
  const form = document.querySelector('#admin-settings-form');
  const uploadLogoInput = document.querySelector('#file-upload-logo');
  const uploadAvatarInput = document.querySelector('#file-upload-avatar');

  // 1. Upload Logo với Preview
  if (uploadLogoInput) {
    uploadLogoInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('❌ Logo chỉ cho phép định dạng JPG, PNG, WebP (không cho phép SVG)!');
        uploadLogoInput.value = '';
        return;
      }

      // Preview tức thì
      const reader = new FileReader();
      reader.onload = (ev) => {
        const previewBox = document.querySelector('#preview-box-logo');
        const previewImg = document.querySelector('#img-preview-logo');
        if (previewImg) previewImg.src = ev.target.result;
        if (previewBox) previewBox.style.display = 'flex';
      };
      reader.readAsDataURL(file);

      // Upload lên server
      const formData = new FormData();
      formData.append('image', file);

      showToast('⏳ Đang upload logo mới...');

      try {
        const res = await fetch(`${API_BASE}/admin/upload/setting`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'X-CSRF-Token': adminState.csrfToken || ''
          },
          body: formData
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Lỗi upload logo.');

        document.querySelector('#cfg-site-logo').value = result.url;
        showToast('✅ Upload logo thành công!');
      } catch (err) {
        showToast(`❌ ${err.message}`);
      }
    });
  }

  // 2. Upload Avatar với Preview
  if (uploadAvatarInput) {
    uploadAvatarInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('❌ Ảnh đại diện chỉ cho phép định dạng JPG, PNG, WebP!');
        uploadAvatarInput.value = '';
        return;
      }

      // Preview tức thì
      const reader = new FileReader();
      reader.onload = (ev) => {
        const previewBox = document.querySelector('#preview-box-avatar');
        const previewImg = document.querySelector('#img-preview-avatar');
        if (previewImg) previewImg.src = ev.target.result;
        if (previewBox) previewBox.style.display = 'flex';
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('image', file);

      showToast('⏳ Đang upload ảnh đại diện...');

      try {
        const res = await fetch(`${API_BASE}/admin/upload/setting`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'X-CSRF-Token': adminState.csrfToken || ''
          },
          body: formData
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Lỗi upload ảnh đại diện.');

        document.querySelector('#cfg-site-avatar').value = result.url;
        showToast('✅ Upload ảnh đại diện thành công!');
      } catch (err) {
        showToast(`❌ ${err.message}`);
      }
    });
  }

  // 3. Submit Form Lưu Toàn Bộ Cấu Hình
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.querySelector('#btn-save-settings');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Đang lưu cấu hình...';
      }

      try {
        const payload = {
          site_name: form.site_name.value.trim(),
          site_slogan: form.site_slogan.value.trim(),
          site_logo: form.site_logo.value.trim(),
          site_avatar: form.site_avatar.value.trim(),
          contact_phone: form.contact_phone.value.trim(),
          contact_zalo: form.contact_zalo.value.trim(),
          contact_messenger: form.contact_messenger.value.trim(),
          site_short_intro: form.site_short_intro.value.trim(),
          seo_default_title: form.seo_default_title.value.trim(),
          seo_default_description: form.seo_default_description.value.trim(),
          privacy_policy_url: form.privacy_policy_url.value.trim()
        };

        const res = await fetch(`${API_BASE}/admin/settings`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': adminState.csrfToken || ''
          },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.message || 'Không thể lưu cấu hình.');
        }

        showToast('✅ Đã lưu cấu hình website thành công!');
      } catch (err) {
        showToast(`❌ Lỗi: ${err.message}`);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = '💾 Lưu Toàn Bộ Cấu Hình Hệ Thống';
        }
      }
    });
  }
}

async function loadSettings() {
  try {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!res.ok) return;

    const { data } = await res.json();
    if (!data) return;

    const form = document.querySelector('#admin-settings-form');
    if (!form) return;

    form.site_name.value = data.site_name || '';
    form.site_slogan.value = data.site_slogan || '';
    form.site_logo.value = data.site_logo || '';
    form.site_avatar.value = data.site_avatar || '';
    form.contact_phone.value = data.contact_phone || '';
    form.contact_zalo.value = data.contact_zalo || '';
    form.contact_messenger.value = data.contact_messenger || '';
    form.site_short_intro.value = data.site_short_intro || '';
    form.seo_default_title.value = data.seo_default_title || '';
    form.seo_default_description.value = data.seo_default_description || '';
    form.privacy_policy_url.value = data.privacy_policy_url || '';

    // Cập nhật preview nếu có
    if (data.site_logo) {
      const box = document.querySelector('#preview-box-logo');
      const img = document.querySelector('#img-preview-logo');
      if (img) img.src = data.site_logo;
      if (box) box.style.display = 'flex';
    }
    if (data.site_avatar) {
      const box = document.querySelector('#preview-box-avatar');
      const img = document.querySelector('#img-preview-avatar');
      if (img) img.src = data.site_avatar;
      if (box) box.style.display = 'flex';
    }

  } catch (err) {
    console.error('[Load Settings Error]', err);
  }
}

/**
 * ====================================================
 * TAB 4: PARTNERS MANAGEMENT (TOÀN DIỆN CRUD, LỌC, XUẤT CSV, CSKH & QUYỀN RIÊNG TƯ)
 * ====================================================
 */
function bindPartnerManagement() {
  const searchInput = document.querySelector('#partner-search-input');
  const btnPrev = document.querySelector('#btn-prev-page');
  const btnNext = document.querySelector('#btn-next-page');
  const limitSelect = document.querySelector('#partner-page-limit');
  const btnExport = document.querySelector('#btn-export-partner-csv');
  const btnToggleFilters = document.querySelector('#btn-toggle-partner-filters');
  const advFiltersBox = document.querySelector('#partner-advanced-filters');
  const provinceSelect = document.querySelector('#partner-filter-province');
  const sourceSelect = document.querySelector('#partner-filter-source');
  const interestSelect = document.querySelector('#partner-filter-interest');
  const fromDateInput = document.querySelector('#partner-filter-from-date');
  const toDateInput = document.querySelector('#partner-filter-to-date');
  const btnResetFilters = document.querySelector('#btn-reset-partner-filters');

  // Detail Modal Elements
  const detailModal = document.querySelector('#partner-detail-modal');
  const btnCloseDetail = document.querySelector('#btn-close-partner-detail-modal');

  // Edit Modal Elements
  const editModal = document.querySelector('#partner-edit-modal');
  const btnCloseEdit = document.querySelector('#btn-close-partner-edit-modal');
  const btnCancelEdit = document.querySelector('#btn-cancel-partner-edit');
  const editForm = document.querySelector('#partner-edit-form');

  // 1. Tìm kiếm theo Tên hoặc Số điện thoại (Debounce 300ms)
  if (searchInput) {
    let timer = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        adminState.partnerSearch = searchInput.value.trim();
        adminState.partnerPage = 1;
        loadPartners();
      }, 300);
    });
  }

  // 2. Click Filter Pills (Tất cả, Mới, Đã liên hệ, Đã tư vấn, Đã tham gia, Không phù hợp)
  const pillBtns = document.querySelectorAll('#partner-status-pills .partner-pill-btn');
  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      adminState.partnerStatus = btn.dataset.status || 'all';
      adminState.partnerPage = 1;
      loadPartners();
    });
  });

  // 3. Toggle ẩn / hiện bộ lọc nâng cao
  if (btnToggleFilters && advFiltersBox) {
    btnToggleFilters.addEventListener('click', () => {
      const isHidden = advFiltersBox.style.display === 'none';
      advFiltersBox.style.display = isHidden ? 'block' : 'none';
    });
  }

  // 4. Lọc Tỉnh thành
  if (provinceSelect) {
    provinceSelect.addEventListener('change', () => {
      adminState.partnerProvince = provinceSelect.value;
      adminState.partnerPage = 1;
      loadPartners();
    });
  }

  // 5. Lọc Nguồn đăng ký
  if (sourceSelect) {
    sourceSelect.addEventListener('change', () => {
      adminState.partnerSource = sourceSelect.value;
      adminState.partnerPage = 1;
      loadPartners();
    });
  }

  // 6. Lọc Ngành hàng quan tâm
  if (interestSelect) {
    interestSelect.addEventListener('change', () => {
      adminState.partnerInterest = interestSelect.value;
      adminState.partnerPage = 1;
      loadPartners();
    });
  }

  // 7. Lọc Khoảng thời gian
  if (fromDateInput) {
    fromDateInput.addEventListener('change', () => {
      adminState.partnerFromDate = fromDateInput.value;
      adminState.partnerPage = 1;
      loadPartners();
    });
  }
  if (toDateInput) {
    toDateInput.addEventListener('change', () => {
      adminState.partnerToDate = toDateInput.value;
      adminState.partnerPage = 1;
      loadPartners();
    });
  }

  // 8. Đặt lại toàn bộ bộ lọc
  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (provinceSelect) provinceSelect.value = 'all';
      if (sourceSelect) sourceSelect.value = 'all';
      if (interestSelect) interestSelect.value = 'all';
      if (fromDateInput) fromDateInput.value = '';
      if (toDateInput) toDateInput.value = '';

      pillBtns.forEach(b => b.classList.remove('active'));
      const allPill = document.querySelector('#partner-status-pills [data-status="all"]');
      if (allPill) allPill.classList.add('active');

      adminState.partnerSearch = '';
      adminState.partnerStatus = 'all';
      adminState.partnerProvince = 'all';
      adminState.partnerSource = 'all';
      adminState.partnerInterest = 'all';
      adminState.partnerFromDate = '';
      adminState.partnerToDate = '';
      adminState.partnerPage = 1;

      loadPartners();
      showToast('🔄 Đã đặt lại toàn bộ bộ lọc tìm kiếm.');
    });
  }

  // 9. Phân trang
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (adminState.partnerPage > 1) {
        adminState.partnerPage--;
        loadPartners();
      }
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (adminState.partnerPage < adminState.partnerTotalPages) {
        adminState.partnerPage++;
        loadPartners();
      }
    });
  }
  if (limitSelect) {
    limitSelect.addEventListener('change', () => {
      adminState.partnerLimit = parseInt(limitSelect.value, 10) || 10;
      adminState.partnerPage = 1;
      loadPartners();
    });
  }

  // 10. Xuất file CSV UTF-8 BOM chuẩn Excel (Chống Formula Injection)
  if (btnExport) {
    btnExport.addEventListener('click', async () => {
      btnExport.disabled = true;
      btnExport.textContent = '⏳ Đang xuất...';
      showToast('⏳ Đang chuẩn bị file CSV danh sách đối tác...');

      try {
        const queryParams = new URLSearchParams();
        if (adminState.partnerStatus && adminState.partnerStatus !== 'all') queryParams.append('status', adminState.partnerStatus);
        if (adminState.partnerSearch) queryParams.append('search', adminState.partnerSearch);
        if (adminState.partnerProvince && adminState.partnerProvince !== 'all') queryParams.append('province', adminState.partnerProvince);
        if (adminState.partnerSource && adminState.partnerSource !== 'all') queryParams.append('source', adminState.partnerSource);
        if (adminState.partnerInterest && adminState.partnerInterest !== 'all') queryParams.append('interest', adminState.partnerInterest);
        if (adminState.partnerFromDate) queryParams.append('fromDate', adminState.partnerFromDate);
        if (adminState.partnerToDate) queryParams.append('toDate', adminState.partnerToDate);

        const res = await fetch(`${API_BASE}/admin/partners/export?${queryParams.toString()}`, {
          method: 'GET',
          credentials: 'include'
        });

        if (!res.ok) throw new Error('Không thể tải file CSV từ máy chủ.');

        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;

        // Trích xuất tên file từ Header nếu có hoặc đặt tên mặc định
        const disposition = res.headers.get('content-disposition');
        let filename = 'danh-sach-partner-kdol.csv';
        if (disposition && disposition.indexOf('filename=') !== -1) {
          const match = disposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) filename = match[1];
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);

        showToast('✅ Đã xuất file CSV thành công! Mở tốt trên Microsoft Excel.');
      } catch (err) {
        showToast(`❌ Lỗi xuất CSV: ${err.message}`);
      } finally {
        btnExport.disabled = false;
        btnExport.textContent = '📥 Xuất CSV';
      }
    });
  }

  // 11. Đóng Modal Chi tiết
  if (btnCloseDetail && detailModal) {
    btnCloseDetail.addEventListener('click', () => {
      detailModal.style.display = 'none';
    });
  }

  // 12. Đóng Modal Sửa Thông Tin
  const closeEditModal = () => {
    if (editModal) editModal.style.display = 'none';
    if (editForm) editForm.reset();
  };
  if (btnCloseEdit) btnCloseEdit.addEventListener('click', closeEditModal);
  if (btnCancelEdit) btnCancelEdit.addEventListener('click', closeEditModal);

  // 13. Submit Sửa Thông Tin Đối Tác (Quyền chủ thể dữ liệu)
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.querySelector('#edit-partner-id').value;
      const btnSubmit = document.querySelector('#btn-submit-partner-edit');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Đang lưu...';
      }

      try {
        const payload = {
          fullName: document.querySelector('#edit-partner-fullname').value.trim(),
          phone: document.querySelector('#edit-partner-phone').value.trim(),
          email: document.querySelector('#edit-partner-email').value.trim(),
          province: document.querySelector('#edit-partner-province').value.trim(),
          occupation: document.querySelector('#edit-partner-occupation').value.trim(),
          experience: document.querySelector('#edit-partner-experience').value
        };

        const res = await fetch(`${API_BASE}/admin/partners/${id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': adminState.csrfToken || ''
          },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Lỗi cập nhật thông tin đối tác.');

        showToast('✅ Đã cập nhật thông tin đối tác thành công theo yêu cầu!');
        closeEditModal();
        loadPartners();
        loadDashboardStats();
      } catch (err) {
        showToast(`❌ ${err.message}`);
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Lưu Thay Đổi';
        }
      }
    });
  }
}

async function loadPartners() {
  const container = document.querySelector('#admin-partners-list');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 16px; color: var(--color-text-muted); font-size: 11px;">
      Đang tải danh sách đối tác...
    </div>
  `;

  try {
    const params = new URLSearchParams({
      page: adminState.partnerPage,
      limit: adminState.partnerLimit || 10,
      status: adminState.partnerStatus,
      search: adminState.partnerSearch
    });

    if (adminState.partnerProvince && adminState.partnerProvince !== 'all') {
      params.append('province', adminState.partnerProvince);
    }
    if (adminState.partnerSource && adminState.partnerSource !== 'all') {
      params.append('source', adminState.partnerSource);
    }
    if (adminState.partnerInterest && adminState.partnerInterest !== 'all') {
      params.append('interest', adminState.partnerInterest);
    }
    if (adminState.partnerFromDate) {
      params.append('fromDate', adminState.partnerFromDate);
    }
    if (adminState.partnerToDate) {
      params.append('toDate', adminState.partnerToDate);
    }

    const res = await fetch(`${API_BASE}/admin/partners?${params}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Không thể tải danh sách đối tác.');

    const result = await res.json();
    const partners = result.data || [];
    const pagination = result.pagination || {};
    const statusCounts = result.statusCounts || {};
    const filterOptions = result.filterOptions || {};

    adminState.partnerTotalPages = pagination.totalPages || 1;

    // Cập nhật số đếm trên các nút Filter Pills
    const setPillCount = (sel, val) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = val || 0;
    };
    setPillCount('#count-partner-all', statusCounts.all);
    setPillCount('#count-partner-new', statusCounts.new);
    setPillCount('#count-partner-contacted', statusCounts.contacted);
    setPillCount('#count-partner-consulted', statusCounts.consulted);
    setPillCount('#count-partner-joined', statusCounts.joined);
    setPillCount('#count-partner-not-suitable', statusCounts.not_suitable);

    // Điền danh sách Tỉnh/Thành phố vào dropdown nếu chưa có
    const provSelect = document.querySelector('#partner-filter-province');
    if (provSelect && provSelect.options.length <= 1 && filterOptions.provinces) {
      filterOptions.provinces.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        provSelect.appendChild(opt);
      });
    }

    // Cập nhật giao diện phân trang
    const pageInfo = document.querySelector('#partner-page-info');
    if (pageInfo) {
      pageInfo.textContent = `Trang ${pagination.page} / ${pagination.totalPages} (Tổng: ${pagination.total})`;
    }
    const btnPrev = document.querySelector('#btn-prev-page');
    const btnNext = document.querySelector('#btn-next-page');
    if (btnPrev) btnPrev.disabled = pagination.page <= 1;
    if (btnNext) btnNext.disabled = pagination.page >= pagination.totalPages;

    if (partners.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--color-text-muted); font-size: var(--font-size-xs);">
          Không tìm thấy hồ sơ đối tác nào phù hợp với bộ lọc hiện tại.
        </div>
      `;
      return;
    }

    container.innerHTML = partners.map(p => `
      <div class="partner-card status-${p.status || 'new'}" id="partner-card-${p._id}">
        <!-- HEADER: TÊN & TRẠNG THÁI -->
        <div class="partner-header">
          <div>
            <div class="partner-name" style="cursor: pointer;" onclick="window.handleViewPartnerDetail('${p._id}')" title="Nhấn để xem chi tiết">
              ${escapeHtml(p.fullName)} ↗
            </div>
            <div style="display: flex; gap: 8px; align-items: center; margin-top: 2px;">
              <a href="tel:${p.phone}" class="partner-phone" title="Gọi điện trực tiếp">
                📞 ${escapeHtml(p.phone)}
              </a>
              <a href="https://zalo.me/${p.phone}" target="_blank" rel="noopener" style="font-size: 11px; color: #0284C7; font-weight: 600; text-decoration: none;" title="Nhắn tin Zalo">
                💬 Zalo
              </a>
              ${p.email ? `<span style="font-size: 11px; color: var(--color-text-muted);">• ${escapeHtml(p.email)}</span>` : ''}
            </div>
          </div>
          <div>
            ${renderStatusBadge(p.status)}
          </div>
        </div>

        <!-- THÔNG TIN ĐỊA LÝ & NGHỀ NGHIỆP -->
        <div class="partner-meta-row">
          📍 <strong>${escapeHtml(p.province)}</strong> • Nghề nghiệp: <em>${escapeHtml(p.occupation || 'Chưa rõ')}</em>
        </div>

        <div class="partner-meta-row">
          ⏱️ Quỹ thời gian: <strong>${escapeHtml(p.availableTime || '')}</strong> • Bắt đầu: <strong>${escapeHtml(p.startWhen || '')}</strong> • Kênh ưu tiên: <strong>${escapeHtml(p.preferredContact || 'Zalo')}</strong>
        </div>

        <!-- MỤC TIÊU & NGÀNH HÀNG QUAN TÂM -->
        <div class="partner-tags">
          ${(p.goals || []).map(g => `<span class="tag-sm">🎯 ${escapeHtml(g)}</span>`).join('')}
          ${(p.interests || []).map(i => `<span class="tag-sm">📦 ${escapeHtml(i)}</span>`).join('')}
        </div>

        <!-- GHI CHÚ CHĂM SÓC KHÁCH HÀNG (NẾU CÓ) -->
        ${p.notes ? `
          <div class="partner-note-box">
            <strong>📝 Ghi chú CSKH:</strong> ${escapeHtml(p.notes)}
          </div>
        ` : ''}

        <div style="font-size: 10px; color: var(--color-text-muted); margin-top: 4px; display: flex; justify-content: space-between;">
          <span>Nguồn: <strong>${escapeHtml(p.source || 'website')}</strong></span>
          <span>Đăng ký: ${formatDateTime(p.createdAt)}</span>
        </div>

        <!-- CẬP NHẬT TRẠNG THÁI & HÀNH ĐỘNG NHANH -->
        <div class="partner-action-box">
          <select class="select-status-sm" data-id="${p._id}" onchange="window.handleStatusChange('${p._id}', this.value)" title="Cập nhật trạng thái đối tác">
            <option value="new" ${['new', 'pending'].includes(p.status) ? 'selected' : ''}>● Mới đăng ký</option>
            <option value="contacted" ${p.status === 'contacted' ? 'selected' : ''}>● Đã liên hệ</option>
            <option value="consulted" ${['consulted', 'consulting'].includes(p.status) ? 'selected' : ''}>● Đã tư vấn</option>
            <option value="joined" ${['joined', 'active'].includes(p.status) ? 'selected' : ''}>● Đã tham gia</option>
            <option value="not_suitable" ${['not_suitable', 'rejected'].includes(p.status) ? 'selected' : ''}>● Không phù hợp</option>
          </select>

          <button type="button" class="btn btn-outline btn-sm" onclick="window.handleViewPartnerDetail('${p._id}')" style="padding: 3px 8px; font-size: 11px;">
            👁️ Chi tiết
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="window.handleOpenEditPartner('${p._id}')" style="padding: 3px 8px; font-size: 11px;" title="Chỉnh sửa thông tin">
            ✏️ Sửa
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="window.handleDeletePartner('${p._id}')" style="padding: 3px 8px; font-size: 11px; color: #DC2626; border-color: #FECACA;" title="Xóa dữ liệu theo yêu cầu bảo mật">
            🗑️ Xóa
          </button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #DC2626; font-size: 11px;">
        ${escapeHtml(err.message)}
      </div>
    `;
  }
}

// 1. Cập nhật trạng thái Partner nhanh
window.handleStatusChange = async function(id, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/admin/partners/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': adminState.csrfToken || ''
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) throw new Error('Không thể cập nhật trạng thái.');

    showToast('✅ Đã cập nhật trạng thái đối tác thành công!');
    loadPartners();
    loadDashboardStats();
  } catch (err) {
    showToast(`❌ Lỗi: ${err.message}`);
  }
};

// 2. Mở xem chi tiết đối tác
window.handleViewPartnerDetail = async function(id) {
  const modal = document.querySelector('#partner-detail-modal');
  const container = document.querySelector('#partner-detail-content');
  if (!modal || !container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 20px; font-size: 11px; color: var(--color-text-muted);">
      Đang tải chi tiết hồ sơ...
    </div>
  `;
  modal.style.display = 'flex';

  try {
    const res = await fetch(`${API_BASE}/admin/partners/${id}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Không thể tải chi tiết đối tác.');

    const { data: p } = await res.json();
    document.querySelector('#partner-detail-modal-heading').textContent = `Hồ Sơ: ${p.fullName}`;

    container.innerHTML = `
      <!-- THÔNG TIN CÁ NHÂN -->
      <div class="card" style="padding: 10px; margin-bottom: 8px; background: var(--color-bg-subtle);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h4 style="font-size: var(--font-size-sm); font-weight: 700; margin: 0 0 4px 0;">${escapeHtml(p.fullName)}</h4>
            <div style="font-size: 12px; font-weight: 600; color: var(--color-primary); margin-bottom: 2px;">
              📞 <a href="tel:${p.phone}" style="color: inherit; text-decoration: none;">${escapeHtml(p.phone)}</a>
              <a href="https://zalo.me/${p.phone}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="margin-left: 6px; padding: 1px 6px; font-size: 10px; color: #0284C7; border-color: #BAE6FD;">
                Nhắn Zalo ↗
              </a>
            </div>
            ${p.email ? `<div style="font-size: 11px; color: var(--color-text-secondary);">✉️ ${escapeHtml(p.email)}</div>` : ''}
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 2px;">
              📍 Tỉnh/Thành: <strong>${escapeHtml(p.province)}</strong>
            </div>
            <div style="font-size: 11px; color: var(--color-text-secondary);">
              💼 Nghề nghiệp: <strong>${escapeHtml(p.occupation || 'Chưa rõ')}</strong>
            </div>
          </div>
          <div>
            ${renderStatusBadge(p.status)}
          </div>
        </div>
      </div>

      <!-- NHU CẦU HỢP TÁC -->
      <div class="card" style="padding: 10px; margin-bottom: 8px;">
        <h4 style="font-size: 11px; font-weight: 700; margin: 0 0 6px 0; color: var(--color-text-main); text-transform: uppercase;">
          Nhu Cầu Hợp Tác KDOL
        </h4>

        <div style="margin-bottom: 6px;">
          <span style="font-size: 11px; color: var(--color-text-muted); display: block;">Mục tiêu chính:</span>
          <div class="partner-tags">
            ${(p.goals || []).map(g => `<span class="tag-sm" style="background: #EFF6FF; color: #1E40AF; border-color: #BFDBFE;">🎯 ${escapeHtml(g)}</span>`).join('')}
          </div>
        </div>

        <div style="font-size: 11px; margin-bottom: 4px;">
          <span style="color: var(--color-text-muted);">Kinh nghiệm kinh doanh:</span>
          <strong>${escapeHtml(p.experience || 'Chưa có kinh nghiệm')}</strong>
        </div>

        <div style="margin-bottom: 6px;">
          <span style="font-size: 11px; color: var(--color-text-muted); display: block;">Ngành hàng quan tâm:</span>
          <div class="partner-tags">
            ${(p.interests || []).map(i => `<span class="tag-sm" style="background: #FEF3C7; color: #92400E; border-color: #FDE68A;">📦 ${escapeHtml(i)}</span>`).join('')}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; margin-top: 4px;">
          <div>
            <span style="color: var(--color-text-muted); display: block;">Quỹ thời gian:</span>
            <strong>${escapeHtml(p.availableTime || '')}</strong>
          </div>
          <div>
            <span style="color: var(--color-text-muted); display: block;">Thời điểm bắt đầu:</span>
            <strong>${escapeHtml(p.startWhen || '')}</strong>
          </div>
        </div>

        <div style="font-size: 11px; margin-top: 6px;">
          <span style="color: var(--color-text-muted);">Kênh liên hệ ưu tiên:</span>
          <strong>${escapeHtml(p.preferredContact || 'Zalo')}</strong>
        </div>
      </div>

      <!-- PHÁP LÝ & BẢO MẬT DỮ LIỆU -->
      <div class="card" style="padding: 10px; margin-bottom: 8px; background: #F8FAFC;">
        <h4 style="font-size: 11px; font-weight: 700; margin: 0 0 6px 0; color: var(--color-text-main); text-transform: uppercase;">
          Pháp Lý & Bảo Mật Dữ Liệu
        </h4>
        <div style="font-size: 11px; color: var(--color-text-secondary); line-height: 1.5;">
          <div>✅ <strong>Đồng ý chính sách xử lý dữ liệu:</strong> Đã xác nhận (Phiên bản: v${escapeHtml(p.policyVersion || '1.0')})</div>
          <div>🕒 <strong>Thời điểm xác nhận:</strong> ${formatDateTime(p.consentAt || p.createdAt)}</div>
          <div>🌐 <strong>Nguồn chiến dịch:</strong> <span class="badge badge-neutral">${escapeHtml(p.source || 'website')}</span></div>
          <div>🛡️ <strong>Chính sách tự động:</strong> Không tự động gửi SMS/Email khi chưa được phép</div>
        </div>
      </div>

      <!-- GHI CHÚ CHĂM SÓC KHÁCH HÀNG (ADMIN ONLY) -->
      <div class="card" style="padding: 10px; margin-bottom: 8px;">
        <h4 style="font-size: 11px; font-weight: 700; margin: 0 0 4px 0; color: var(--color-text-main); text-transform: uppercase;">
          Ghi Chú Chăm Sóc Khách Hàng (Admin Only)
        </h4>
        <p style="font-size: 10px; color: var(--color-text-muted); margin: 0 0 6px 0;">
          Chỉ quản trị viên mới có quyền xem và cập nhật lịch sử trao đổi.
        </p>
        <textarea id="modal-partner-notes" class="form-control" rows="3" placeholder="Nhập ghi chú tư vấn, thỏa thuận hợp tác, tiến độ kết nối...">${escapeHtml(p.notes || '')}</textarea>
        <div style="margin-top: 6px; display: flex; justify-content: flex-end;">
          <button type="button" class="btn btn-primary btn-sm" onclick="window.handleSaveCareNote('${p._id}')" style="font-size: 11px; padding: 4px 10px;">
            💾 Lưu Ghi Chú CSKH
          </button>
        </div>
      </div>

      <!-- QUYỀN CHỦ THỂ DỮ LIỆU (CHỈNH SỬA / XÓA THEO CHÍNH SÁCH) -->
      <div style="display: flex; gap: 8px; margin-top: 10px;">
        <button type="button" class="btn btn-outline btn-block" onclick="window.handleOpenEditPartner('${p._id}'); document.querySelector('#partner-detail-modal').style.display='none';" style="font-size: 11px;">
          ✏️ Chỉnh Sửa Thông Tin
        </button>
        <button type="button" class="btn btn-outline btn-block" onclick="window.handleDeletePartner('${p._id}'); document.querySelector('#partner-detail-modal').style.display='none';" style="font-size: 11px; color: #DC2626; border-color: #FECACA;">
          🗑️ Xóa Dữ Liệu Đối Tác
        </button>
      </div>
    `;

  } catch (err) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #DC2626; font-size: 11px;">
        ${escapeHtml(err.message)}
      </div>
    `;
  }
};

// 3. Lưu ghi chú chăm sóc khách hàng
window.handleSaveCareNote = async function(id) {
  const textarea = document.querySelector('#modal-partner-notes');
  if (!textarea) return;

  const notes = textarea.value.trim();
  showToast('⏳ Đang lưu ghi chú chăm sóc...');

  try {
    const res = await fetch(`${API_BASE}/admin/partners/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': adminState.csrfToken || ''
      },
      body: JSON.stringify({ notes })
    });

    if (!res.ok) throw new Error('Không thể lưu ghi chú.');

    showToast('✅ Đã lưu ghi chú chăm sóc đối tác thành công!');
    loadPartners();
  } catch (err) {
    showToast(`❌ Lỗi: ${err.message}`);
  }
};

// 4. Mở modal chỉnh sửa thông tin đối tác
window.handleOpenEditPartner = async function(id) {
  const modal = document.querySelector('#partner-edit-modal');
  if (!modal) return;

  try {
    const res = await fetch(`${API_BASE}/admin/partners/${id}`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Không thể lấy thông tin đối tác.');

    const { data: p } = await res.json();
    document.querySelector('#edit-partner-id').value = p._id;
    document.querySelector('#edit-partner-fullname').value = p.fullName || '';
    document.querySelector('#edit-partner-phone').value = p.phone || '';
    document.querySelector('#edit-partner-email').value = p.email || '';
    document.querySelector('#edit-partner-province').value = p.province || '';
    document.querySelector('#edit-partner-occupation').value = p.occupation || '';
    document.querySelector('#edit-partner-experience').value = p.experience || 'Chưa có kinh nghiệm';

    modal.style.display = 'flex';
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
};

// 5. Xóa dữ liệu đối tác theo quyền rút lại đồng ý (Chính sách bảo mật)
window.handleDeletePartner = async function(id) {
  const ok = confirm('⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN hồ sơ đối tác này khỏi cơ sở dữ liệu theo yêu cầu chính sách bảo mật? Thao tác này không thể hoàn tác.');
  if (!ok) return;

  showToast('⏳ Đang xử lý xóa dữ liệu...');

  try {
    const res = await fetch(`${API_BASE}/admin/partners/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': adminState.csrfToken || ''
      }
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Không thể xóa hồ sơ.');

    showToast('✅ Đã xóa vĩnh viễn hồ sơ đối tác theo quy định bảo mật.');
    loadPartners();
    loadDashboardStats();
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
};

/**
 * ====================================================
 * TAB 5: POSTS MANAGEMENT (MODAL TẠO / SỬA / XÓA)
 * ====================================================
 */
function bindPostManagement() {
  const modal = document.querySelector('#post-modal');
  const btnOpen = document.querySelector('#btn-open-create-post');
  const btnClose = document.querySelector('#btn-close-post-modal');
  const btnCancel = document.querySelector('#btn-cancel-post');
  const form = document.querySelector('#post-form');
  const searchInput = document.querySelector('#post-search-input');
  const filterCat = document.querySelector('#post-filter-category');
  const filterStatus = document.querySelector('#post-filter-status');
  const btnGenSlug = document.querySelector('#btn-generate-post-slug');
  const titleInput = document.querySelector('#post-title');
  const slugInput = document.querySelector('#post-slug');
  const fileUpload = document.querySelector('#file-upload-post');
  const thumbnailInput = document.querySelector('#post-thumbnail');
  const btnPrevPage = document.querySelector('#btn-prev-post-page');
  const btnNextPage = document.querySelector('#btn-next-post-page');

  // 1. Mở modal thêm mới bài viết
  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      adminState.editingPostId = null;
      if (form) form.reset();
      document.querySelector('#post-id').value = '';
      document.querySelector('#post-modal-heading').textContent = 'Thêm Bài Viết Mới';
      document.querySelector('#post-status').value = 'published';
      document.querySelector('#post-readtime').value = '5 phút đọc';
      document.querySelector('#post-featured').checked = false;
      updatePostThumbnailPreview('');
      populatePostCategoryDropdown();
      if (modal) modal.style.display = 'flex';
    });
  }

  // 2. Đóng modal
  const closeModal = () => {
    if (modal) modal.style.display = 'none';
    if (form) form.reset();
    adminState.editingPostId = null;
  };
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  // 3. Tự sinh slug từ tiêu đề
  if (btnGenSlug) {
    btnGenSlug.addEventListener('click', () => {
      if (titleInput && slugInput) {
        slugInput.value = slugify(titleInput.value);
      }
    });
  }

  // Tự điền slug nếu người dùng chưa nhập slug
  if (titleInput && slugInput) {
    titleInput.addEventListener('blur', () => {
      if (!slugInput.value.trim()) {
        slugInput.value = slugify(titleInput.value);
      }
    });
  }

  // 4. Upload ảnh đại diện bài viết
  if (fileUpload) {
    fileUpload.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('❌ Định dạng file không hợp lệ! Chỉ cho phép JPG, PNG, WebP.');
        fileUpload.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('❌ Dung lượng ảnh vượt quá 5MB!');
        fileUpload.value = '';
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      showToast('⏳ Đang tải ảnh lên máy chủ...');
      try {
        const res = await fetch(`${API_BASE}/admin/upload/post`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'X-CSRF-Token': adminState.csrfToken || ''
          },
          body: formData
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Lỗi upload ảnh.');

        if (thumbnailInput) {
          thumbnailInput.value = result.url;
        }
        updatePostThumbnailPreview(result.url);
        showToast('✅ Upload ảnh bài viết thành công!');
      } catch (err) {
        showToast(`❌ ${err.message}`);
      } finally {
        fileUpload.value = '';
      }
    });
  }

  // 5. Thay đổi URL ảnh thumbnail -> preview
  if (thumbnailInput) {
    thumbnailInput.addEventListener('input', () => {
      updatePostThumbnailPreview(thumbnailInput.value.trim());
    });
  }

  // 6. Lưu bài viết (POST hoặc PUT)
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.querySelector('#post-id').value;
      const title = titleInput.value.trim();
      const slug = slugInput.value.trim() || slugify(title);
      const category = document.querySelector('#post-category').value.trim();
      const readTime = document.querySelector('#post-readtime').value.trim() || '5 phút đọc';
      const excerpt = document.querySelector('#post-excerpt').value.trim();
      const thumbnail = thumbnailInput.value.trim() || 'assets/images/article-default.svg';
      const tags = document.querySelector('#post-tags').value.trim();
      const content = document.querySelector('#post-content').value.trim();
      const status = document.querySelector('#post-status').value;
      const featured = document.querySelector('#post-featured').checked;

      if (!title || !excerpt || !category || !content) {
        showToast('❌ Vui lòng điền đầy đủ các trường bắt buộc (*)');
        return;
      }

      const payload = {
        title,
        slug,
        category,
        readTime,
        excerpt,
        thumbnail,
        featuredImage: thumbnail,
        tags,
        content,
        status,
        featured
      };

      const btnSubmit = document.querySelector('#btn-submit-post');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Đang lưu...';
      }

      try {
        const url = id ? `${API_BASE}/admin/posts/${id}` : `${API_BASE}/admin/posts`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': adminState.csrfToken || ''
          },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Không thể lưu bài viết.');

        showToast(id ? '✅ Đã cập nhật bài viết thành công!' : '✅ Đã tạo bài viết mới thành công!');
        closeModal();
        loadPosts();
      } catch (err) {
        showToast(`❌ ${err.message}`);
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Lưu Bài Viết';
        }
      }
    });
  }

  // 7. Tìm kiếm và lọc bài viết
  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        adminState.postSearch = e.target.value.trim();
        adminState.postPage = 1;
        loadPosts();
      }, 350);
    });
  }

  if (filterCat) {
    filterCat.addEventListener('change', (e) => {
      adminState.postCategory = e.target.value;
      adminState.postPage = 1;
      loadPosts();
    });
  }

  if (filterStatus) {
    filterStatus.addEventListener('change', (e) => {
      adminState.postStatus = e.target.value;
      adminState.postPage = 1;
      loadPosts();
    });
  }

  // 8. Phân trang
  if (btnPrevPage) {
    btnPrevPage.addEventListener('click', () => {
      if (adminState.postPage > 1) {
        adminState.postPage--;
        loadPosts();
      }
    });
  }
  if (btnNextPage) {
    btnNextPage.addEventListener('click', () => {
      if (adminState.postPage < adminState.postTotalPages) {
        adminState.postPage++;
        loadPosts();
      }
    });
  }
}

function updatePostThumbnailPreview(url) {
  const img = document.querySelector('#post-preview-img');
  const placeholder = document.querySelector('#post-preview-placeholder');
  if (!img || !placeholder) return;

  if (url) {
    img.src = url.startsWith('http') || url.startsWith('assets') || url.startsWith('/') ? url : `/${url}`;
    img.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    img.src = '';
    img.style.display = 'none';
    placeholder.style.display = 'block';
  }
}

function populatePostCategoryDropdown(selectedCategory = '') {
  const select = document.querySelector('#post-category');
  if (!select) return;

  select.innerHTML = '<option value="">-- Chọn chuyên mục --</option>';
  adminState.cachedCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.name;
    opt.textContent = `${cat.name} (${cat.slug})`;
    if (selectedCategory && (cat.name === selectedCategory || cat.slug === selectedCategory)) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

async function loadPosts() {
  const container = document.querySelector('#admin-posts-list');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 20px; color: var(--color-text-muted); font-size: 11px;">
      Đang tải danh sách bài viết...
    </div>
  `;

  try {
    const params = new URLSearchParams({
      page: adminState.postPage,
      limit: adminState.postLimit,
      search: adminState.postSearch,
      category: adminState.postCategory,
      status: adminState.postStatus
    });

    const res = await fetch(`${API_BASE}/admin/posts?${params}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Không thể tải danh sách bài viết.');

    const result = await res.json();
    const posts = result.data || [];
    const pagination = result.pagination || {};

    adminState.postTotalPages = pagination.totalPages || 1;

    // Cập nhật phân trang
    const pageInfo = document.querySelector('#post-page-info');
    if (pageInfo) {
      pageInfo.textContent = `Trang ${pagination.page || 1} / ${pagination.totalPages || 1} (Tổng: ${pagination.total || 0})`;
    }
    const btnPrev = document.querySelector('#btn-prev-post-page');
    const btnNext = document.querySelector('#btn-next-post-page');
    if (btnPrev) btnPrev.disabled = (pagination.page || 1) <= 1;
    if (btnNext) btnNext.disabled = (pagination.page || 1) >= (pagination.totalPages || 1);

    if (posts.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--color-text-muted); font-size: var(--font-size-xs);">
          Không tìm thấy bài viết nào phù hợp. Nhấn "+ Viết Bài Mới" để tạo bài viết đầu tiên.
        </div>
      `;
      return;
    }

    container.innerHTML = posts.map(p => {
      const thumbSrc = p.thumbnail 
        ? (p.thumbnail.startsWith('http') || p.thumbnail.startsWith('assets') || p.thumbnail.startsWith('/') ? p.thumbnail : `/${p.thumbnail}`)
        : 'assets/images/article-default.svg';

      return `
        <div class="card" style="padding: 10px; margin-bottom: 8px;">
          <div style="display: flex; gap: 10px; align-items: flex-start;">
            <div style="width: 72px; height: 52px; border-radius: var(--radius-xs); overflow: hidden; background: #FFF7ED; border: 1px solid var(--color-border); flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
              <img src="${thumbSrc}" alt="${escapeHtml(p.title)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='assets/images/article-default.svg'">
            </div>
            <div style="flex: 1; min-width: 0;">
              <h4 style="font-size: var(--font-size-xs); font-weight: 700; margin: 0 0 3px 0; line-height: 1.3;" title="${escapeHtml(p.title)}">
                ${escapeHtml(p.title)}
              </h4>
              <div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center;">
                <span class="badge ${p.status === 'published' ? 'badge-primary' : 'badge-neutral'}">
                  ${p.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
                ${p.featured ? '<span class="badge" style="background: #FEF3C7; color: #B45309; border: 1px solid #FCD34D;">🌟 Nổi bật</span>' : ''}
                <span style="font-size: 10px; color: var(--color-text-muted);">📁 ${escapeHtml(p.category)}</span>
                <span style="font-size: 10px; color: var(--color-text-muted);">⏱️ ${escapeHtml(p.readTime || '5 phút')}</span>
              </div>
            </div>
          </div>

          <div style="font-size: 11px; color: var(--color-text-secondary); margin: 6px 0 4px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${escapeHtml(p.excerpt)}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--color-border); font-size: 11px;">
            <a href="../bai-viet.html?slug=${escapeHtml(p.slug)}" target="_blank" style="color: var(--color-primary); font-weight: 600; text-decoration: none; font-size: 11px;">
              Xem bài viết ↗
            </a>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn btn-outline btn-sm" onclick="window.handleOpenEditPost('${p._id}')" style="padding: 2px 8px; font-size: 11px;">
                ✏️ Sửa
              </button>
              <button type="button" class="btn btn-outline btn-sm" onclick="window.handleDeletePost('${p._id}')" style="padding: 2px 8px; font-size: 11px; color: #DC2626; border-color: #FECACA;">
                🗑️ Xóa
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #DC2626; font-size: 11px;">
        ${escapeHtml(err.message)}
      </div>
    `;
  }
}

window.handleOpenEditPost = async function(id) {
  const modal = document.querySelector('#post-modal');
  if (!modal) return;

  showToast('⏳ Đang tải nội dung bài viết...');
  try {
    const res = await fetch(`${API_BASE}/admin/posts/${id}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Không thể tải bài viết.');

    const { data: p } = await res.json();
    adminState.editingPostId = p._id;

    document.querySelector('#post-id').value = p._id;
    document.querySelector('#post-title').value = p.title || '';
    document.querySelector('#post-slug').value = p.slug || '';
    document.querySelector('#post-readtime').value = p.readTime || '5 phút đọc';
    document.querySelector('#post-excerpt').value = p.excerpt || '';
    document.querySelector('#post-thumbnail').value = p.thumbnail || '';
    updatePostThumbnailPreview(p.thumbnail || '');
    document.querySelector('#post-tags').value = Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '');

    // Nội dung bài viết
    let contentStr = '';
    if (typeof p.content === 'string') {
      contentStr = p.content;
    } else if (Array.isArray(p.content)) {
      contentStr = p.content.map(b => b.text || b.heading || '').join('\n\n');
    } else {
      contentStr = JSON.stringify(p.content, null, 2);
    }
    document.querySelector('#post-content').value = contentStr;

    document.querySelector('#post-status').value = p.status || 'published';
    document.querySelector('#post-featured').checked = Boolean(p.featured);

    populatePostCategoryDropdown(p.category);

    document.querySelector('#post-modal-heading').textContent = 'Chỉnh Sửa Bài Viết';
    modal.style.display = 'flex';
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
};

window.handleDeletePost = async function(id) {
  const ok = confirm('⚠️ Bạn có chắc chắn muốn XÓA bài viết này? Thao tác không thể hoàn tác.');
  if (!ok) return;

  showToast('⏳ Đang xóa bài viết...');
  try {
    const res = await fetch(`${API_BASE}/admin/posts/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': adminState.csrfToken || ''
      }
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Không thể xóa bài viết.');

    showToast('✅ Đã xóa bài viết thành công.');
    loadPosts();
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
};

/**
 * ====================================================
 * TAB 6: CATEGORIES MANAGEMENT (MODAL TẠO / SỬA / XÓA)
 * ====================================================
 */
function bindCategoryManagement() {
  const modal = document.querySelector('#category-modal');
  const btnOpen = document.querySelector('#btn-open-create-category');
  const btnClose = document.querySelector('#btn-close-category-modal');
  const btnCancel = document.querySelector('#btn-cancel-category');
  const form = document.querySelector('#category-form');
  const nameInput = document.querySelector('#category-name');
  const slugInput = document.querySelector('#category-slug');
  const btnGenSlug = document.querySelector('#btn-generate-category-slug');

  // 1. Mở modal thêm mới chuyên mục
  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      adminState.editingCategoryId = null;
      if (form) form.reset();
      document.querySelector('#category-id').value = '';
      document.querySelector('#category-order').value = '0';
      document.querySelector('#category-modal-heading').textContent = 'Thêm Chuyên Mục Mới';
      if (modal) modal.style.display = 'flex';
    });
  }

  // 2. Đóng modal
  const closeModal = () => {
    if (modal) modal.style.display = 'none';
    if (form) form.reset();
    adminState.editingCategoryId = null;
  };
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  // 3. Tự sinh slug từ tên chuyên mục
  if (btnGenSlug) {
    btnGenSlug.addEventListener('click', () => {
      if (nameInput && slugInput) {
        slugInput.value = slugify(nameInput.value);
      }
    });
  }
  if (nameInput && slugInput) {
    nameInput.addEventListener('blur', () => {
      if (!slugInput.value.trim()) {
        slugInput.value = slugify(nameInput.value);
      }
    });
  }

  // 4. Lưu chuyên mục (POST hoặc PUT)
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.querySelector('#category-id').value;
      const name = nameInput.value.trim();
      const slug = slugInput.value.trim() || slugify(name);
      const order = parseInt(document.querySelector('#category-order').value, 10) || 0;
      const description = document.querySelector('#category-description').value.trim();

      if (!name) {
        showToast('❌ Vui lòng nhập tên chuyên mục.');
        return;
      }

      const payload = { name, slug, order, description };

      const btnSubmit = document.querySelector('#btn-submit-category');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Đang lưu...';
      }

      try {
        const url = id ? `${API_BASE}/admin/categories/${id}` : `${API_BASE}/admin/categories`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': adminState.csrfToken || ''
          },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Không thể lưu chuyên mục.');

        showToast(id ? '✅ Đã cập nhật chuyên mục thành công!' : '✅ Đã tạo chuyên mục mới thành công!');
        closeModal();
        loadCategories();
      } catch (err) {
        showToast(`❌ ${err.message}`);
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Lưu Chuyên Mục';
        }
      }
    });
  }
}

async function loadCategories() {
  const container = document.querySelector('#admin-categories-list');

  try {
    const res = await fetch(`${API_BASE}/categories`);
    const { data } = await res.json();
    const cats = data || [];

    adminState.cachedCategories = cats;

    // Cập nhật bộ lọc chuyên mục bên tab bài viết
    const filterCat = document.querySelector('#post-filter-category');
    if (filterCat) {
      const currentVal = filterCat.value;
      filterCat.innerHTML = '<option value="all">Tất cả chuyên mục</option>';
      cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.textContent = c.name;
        filterCat.appendChild(opt);
      });
      if (currentVal) filterCat.value = currentVal;
    }

    if (!container) return;

    if (cats.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--color-text-muted); font-size: var(--font-size-xs);">
          Chưa có chuyên mục nào. Hãy nhấn "+ Thêm Chuyên Mục" để tạo chuyên mục đầu tiên.
        </div>
      `;
      return;
    }

    container.innerHTML = cats.map(c => `
      <div class="card" style="padding: 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="badge badge-neutral" style="font-weight: 700; font-size: 10px;">#${c.order || 0}</span>
            <span style="font-size: var(--font-size-xs); font-weight: 700; color: var(--color-text-main);">${escapeHtml(c.name)}</span>
          </div>
          <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 2px;">
            Slug: <code>${escapeHtml(c.slug)}</code> ${c.description ? `• <em>${escapeHtml(c.description)}</em>` : ''}
          </div>
        </div>
        <div style="display: flex; gap: 4px; flex-shrink: 0;">
          <button type="button" class="btn btn-outline btn-sm" onclick="window.handleOpenEditCategory('${c._id}')" style="padding: 2px 8px; font-size: 11px;">
            ✏️ Sửa
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="window.handleDeleteCategory('${c._id}')" style="padding: 2px 8px; font-size: 11px; color: #DC2626; border-color: #FECACA;">
            🗑️ Xóa
          </button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    if (container) {
      container.innerHTML = `<div style="text-align:center; padding:16px; color:#DC2626; font-size:11px;">Lỗi tải chuyên mục: ${escapeHtml(err.message)}</div>`;
    }
  }
}

window.handleOpenEditCategory = async function(id) {
  const modal = document.querySelector('#category-modal');
  if (!modal) return;

  showToast('⏳ Đang tải thông tin chuyên mục...');
  try {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Không thể tải chuyên mục.');

    const { data: c } = await res.json();
    adminState.editingCategoryId = c._id;

    document.querySelector('#category-id').value = c._id;
    document.querySelector('#category-name').value = c.name || '';
    document.querySelector('#category-slug').value = c.slug || '';
    document.querySelector('#category-order').value = c.order || 0;
    document.querySelector('#category-description').value = c.description || '';

    document.querySelector('#category-modal-heading').textContent = 'Chỉnh Sửa Chuyên Mục';
    modal.style.display = 'flex';
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
};

window.handleDeleteCategory = async function(id) {
  const ok = confirm('⚠️ Bạn có chắc chắn muốn XÓA chuyên mục này? Thao tác không thể hoàn tác.');
  if (!ok) return;

  showToast('⏳ Đang xóa chuyên mục...');
  try {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': adminState.csrfToken || ''
      }
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Không thể xóa chuyên mục.');

    showToast('✅ Đã xóa chuyên mục thành công.');
    loadCategories();
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
};

/**
 * Hàm hỗ trợ tạo slug chuẩn tiếng Việt
 */
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Helpers
 */
function renderStatusBadge(status) {
  switch (status) {
    case 'new':
    case 'pending':
      return '<span class="badge" style="background:#FFF7ED; color:#EA580C; border:1px solid #FDBA74;">● Mới đăng ký</span>';
    case 'contacted':
      return '<span class="badge" style="background:#EFF6FF; color:#1D4ED8; border:1px solid #93C5FD;">● Đã liên hệ</span>';
    case 'consulted':
    case 'consulting':
      return '<span class="badge" style="background:#F5F3FF; color:#6D28D9; border:1px solid #C4B5FD;">● Đã tư vấn</span>';
    case 'joined':
    case 'active':
      return '<span class="badge" style="background:#F0FDF4; color:#15803D; border:1px solid #86EFAC;">● Đã tham gia</span>';
    case 'not_suitable':
    case 'rejected':
      return '<span class="badge" style="background:#F9FAFB; color:#4B5563; border:1px solid #D1D5DB;">● Không phù hợp</span>';
    default:
      return `<span class="badge badge-neutral">${escapeHtml(status || 'new')}</span>`;
  }
}

function formatDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • ${d.toLocaleDateString('vi-VN')}`;
}

function showToast(message) {
  const toast = document.querySelector('#admin-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
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
