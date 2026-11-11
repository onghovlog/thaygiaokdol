/**
 * Admin Routes
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const express = require('express');
const router = express.Router();

const {
  login,
  logout,
  getMe,
  getDashboardStats
} = require('../controllers/adminController');

const {
  getAdminPartners,
  exportPartnersCsv,
  getPartnerById,
  updatePartnerStatusAndNotes,
  updatePartnerProfile,
  deletePartner
} = require('../controllers/adminPartnerController');

const {
  getAdminBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive,
  uploadBannerImage
} = require('../controllers/bannerController');

const {
  getAdminSettings,
  updateAdminSettings,
  uploadSettingImage
} = require('../controllers/settingController');

const {
  getAdminPosts,
  getPostById,
  uploadPostImage,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postController');

const {
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const { requireAdmin, adminLoginRateLimiter } = require('../middleware/adminAuth');
const {
  uploadBannerMiddleware,
  uploadSettingImageMiddleware,
  uploadPostImageMiddleware
} = require('../middleware/upload');

// 1. Tuyến xác thực Public
router.post('/auth/login', adminLoginRateLimiter, login);

// 2. Tuyến xác thực Private (Bắt buộc phiên Admin hợp lệ)
router.post('/auth/logout', requireAdmin, logout);
router.get('/auth/me', requireAdmin, getMe);

// 3. Quản trị Dashboard & Thống kê
router.get('/dashboard/stats', requireAdmin, getDashboardStats);

// 4. Quản trị Đối tác Partner (Đầy đủ CRUD, Lọc, Xuất CSV, CSKH & Quyền riêng tư)
router.get('/partners/export', requireAdmin, exportPartnersCsv);
router.get('/partners', requireAdmin, getAdminPartners);
router.get('/partners/:id', requireAdmin, getPartnerById);
router.patch('/partners/:id', requireAdmin, updatePartnerStatusAndNotes);
router.put('/partners/:id', requireAdmin, updatePartnerProfile);
router.delete('/partners/:id', requireAdmin, deletePartner);

// 5. Quản trị Banner (CRUD + Upload ảnh an toàn)
router.get('/banners', requireAdmin, getAdminBanners);
router.post('/banners', requireAdmin, createBanner);
router.get('/banners/:id', requireAdmin, getBannerById);
router.put('/banners/:id', requireAdmin, updateBanner);
router.delete('/banners/:id', requireAdmin, deleteBanner);
router.patch('/banners/:id/toggle', requireAdmin, toggleBannerActive);
router.post('/upload/banner', requireAdmin, uploadBannerMiddleware, uploadBannerImage);

// 6. Quản trị Cấu hình hệ thống & Upload Logo/Avatar
router.get('/settings', requireAdmin, getAdminSettings);
router.put('/settings', requireAdmin, updateAdminSettings);
router.post('/upload/setting', requireAdmin, uploadSettingImageMiddleware, uploadSettingImage);

// 7. Quản trị Bài viết (CRUD an toàn + Upload ảnh, requireAdmin + CSRF)
router.get('/posts', requireAdmin, getAdminPosts);
router.get('/posts/:id', requireAdmin, getPostById);
router.post('/posts', requireAdmin, createPost);
router.put('/posts/:id', requireAdmin, updatePost);
router.delete('/posts/:id', requireAdmin, deletePost);
router.post('/upload/post', requireAdmin, uploadPostImageMiddleware, uploadPostImage);

// 8. Quản trị Chuyên mục (CRUD an toàn, requireAdmin + CSRF)
router.get('/categories/:id', requireAdmin, getCategoryById);
router.post('/categories', requireAdmin, createCategory);
router.put('/categories/:id', requireAdmin, updateCategory);
router.delete('/categories/:id', requireAdmin, deleteCategory);

module.exports = router;
