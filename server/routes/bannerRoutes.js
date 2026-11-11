/**
 * Banner Public Routes
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const express = require('express');
const router = express.Router();
const { getPublicBanners } = require('../controllers/bannerController');

// GET /api/banners?position=home_slider
router.get('/', getPublicBanners);

module.exports = router;
