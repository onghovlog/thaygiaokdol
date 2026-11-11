/**
 * Setting Routes
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const express = require('express');
const router = express.Router();
const { getPublicSettings } = require('../controllers/settingController');

// GET /api/settings/public
router.get('/public', getPublicSettings);

module.exports = router;

