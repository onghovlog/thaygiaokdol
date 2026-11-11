/**
 * Frontend REST API Client
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Đảm nhiệm giao tiếp với hệ thống Express Backend qua Fetch API.
 * Hỗ trợ fallback linh hoạt khi chạy độc lập (port 3000) hoặc chạy cùng backend (port 5000).
 */

// Tự động nhận diện Base URL của API
const isDevFrontendOnly = window.location.port === '3000';
export const API_BASE_URL = isDevFrontendOnly 
  ? `${window.location.protocol}//${window.location.hostname}:5000/api`
  : '/api';

/**
 * Hàm gọi API chung kèm timeout và xử lý lỗi
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(result.message || `Lỗi máy chủ (${response.status})`);
      error.status = response.status;
      error.data = result;
      throw error;
    }

    return result;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      // Lỗi mất kết nối mạng hoặc server backend chưa khởi động
      const networkError = new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại.');
      networkError.status = 0;
      throw networkError;
    }
    throw err;
  }
}

/**
 * 1. Lấy danh sách cấu hình công khai (Zalo, Hotline, Slogan, Brand name...)
 * GET /api/settings/public
 */
export async function getPublicSettings() {
  const res = await apiRequest('/settings/public');
  return res.data;
}

/**
 * 2. Lấy danh sách Banner slider trang chủ
 * GET /api/banners?position=home
 */
export async function getBanners(position = 'home') {
  const res = await apiRequest(`/banners?position=${encodeURIComponent(position)}`);
  return res.data || [];
}

/**
 * 3. Lấy danh sách Chuyên mục kiến thức
 * GET /api/categories
 */
export async function getCategories() {
  const res = await apiRequest('/categories');
  return res.data || [];
}

/**
 * 4. Lấy danh sách bài viết (có tìm kiếm, lọc danh mục, phân trang)
 * GET /api/posts?page=1&limit=6&category=&search=
 */
export async function getPosts({ page = 1, limit = 6, category = '', search = '' } = {}) {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (category && category !== 'all') params.append('category', category);
  if (search && search.trim()) params.append('search', search.trim());

  const queryString = params.toString();
  const endpoint = `/posts${queryString ? `?${queryString}` : ''}`;
  const res = await apiRequest(endpoint);

  return {
    items: res.data || [],
    pagination: res.pagination || {
      page: 1,
      limit: 6,
      total: (res.data || []).length,
      totalPages: 1,
      hasMore: false
    }
  };
}

/**
 * 5. Lấy danh sách bài viết nổi bật (Featured Posts)
 * GET /api/posts/featured
 */
export async function getFeaturedPosts(limit = 4) {
  const res = await apiRequest(`/posts/featured?limit=${limit}`);
  return res.data || [];
}

/**
 * 6. Lấy chi tiết bài viết theo Slug
 * GET /api/posts/:slug
 */
export async function getPostBySlug(slug) {
  if (!slug) throw new Error('Slug không được để trống');
  const res = await apiRequest(`/posts/${encodeURIComponent(slug)}`);
  return res.data;
}

/**
 * 7. Gửi đăng ký hồ sơ Partner
 * POST /api/partners
 */
export async function registerPartner(partnerData) {
  const res = await apiRequest('/partners', {
    method: 'POST',
    body: JSON.stringify(partnerData)
  });
  return res;
}

