/**
 * Post Routes
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const express = require('express');
const router = express.Router();
const {
  getPosts,
  getFeaturedPosts,
  getPostBySlug
} = require('../controllers/postController');

// 1. Lấy danh sách bài viết (lọc, tìm kiếm, phân trang)
router.get('/', getPosts);

// 2. Lấy danh sách bài viết nổi bật (phải đặt trước /:slug)
router.get('/featured', getFeaturedPosts);

// 3. Lấy chi tiết bài viết theo slug
router.get('/:slug', getPostBySlug);

module.exports = router;
