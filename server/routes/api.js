/**
 * Master API Router
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const partnerRoutes = require('./partnerRoutes');
const postRoutes = require('./postRoutes');
const categoryRoutes = require('./categoryRoutes');
const bannerRoutes = require('./bannerRoutes');
const settingRoutes = require('./settingRoutes');
const adminRoutes = require('./adminRoutes');

// 1. Phân hệ API công khai (Public APIs)
router.use('/health', healthRoutes);
router.use('/partners', partnerRoutes);
router.use('/posts', postRoutes);
router.use('/categories', categoryRoutes);
router.use('/banners', bannerRoutes);
router.use('/settings', settingRoutes);

// 2. Phân hệ API quản trị (/api/admin/*)
router.use('/admin', adminRoutes);

module.exports = router;
