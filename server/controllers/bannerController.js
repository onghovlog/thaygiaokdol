/**
 * Banner Controller (Public & Admin APIs)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const path = require('path');
const fs = require('fs');
const Banner = require('../models/Banner');
const { isSafeUrl } = require('../utils/urlValidator');
const { escapeRegex } = require('../utils/sanitize');
const { BASE_UPLOAD_DIR } = require('../middleware/upload');

// ==========================================
// 1. PUBLIC APIS
// ==========================================

// @desc    Lấy danh sách Banner đang kích hoạt theo vị trí
// @route   GET /api/banners?position=home_slider
// @access  Public
const getPublicBanners = async (req, res, next) => {
  try {
    const { position = 'home_slider' } = req.query;

    let positionCondition;
    const rawPos = typeof position === 'string' ? position : 'home_slider';
    const cleanPos = rawPos.toLowerCase().trim();

    // Hỗ trợ đồng thời cả 'home', 'home_slider' cho tương thích ngược
    if (cleanPos === 'home' || cleanPos === 'home_slider') {
      positionCondition = { $in: ['home', 'home_slider'] };
    } else {
      positionCondition = cleanPos;
    }

    const banners = await Banner.find({
      active: true,
      position: positionCondition
    })
      .sort({ order: 1, createdAt: -1 })
      .select('-__v')
      .lean();

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. ADMIN APIS (requireAdmin)
// ==========================================

// @desc    Lấy toàn bộ danh sách Banner (Cả active và inactive)
// @route   GET /api/admin/banners
// @access  Private (requireAdmin)
const getAdminBanners = async (req, res, next) => {
  try {
    const { position, search } = req.query;

    const query = {};
    if (position && position !== 'all') {
      if (position === 'home_slider' || position === 'home') {
        query.position = { $in: ['home', 'home_slider'] };
      } else {
        query.position = position;
      }
    }

    if (search && typeof search === 'string' && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      const regex = new RegExp(safeSearch, 'i');
      query.$or = [{ title: regex }, { subtitle: regex }, { alt: regex }];
    }

    const banners = await Banner.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết 1 Banner
// @route   GET /api/admin/banners/:id
// @access  Private (requireAdmin)
const getBannerById = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner với ID đã cung cấp.'
      });
    }

    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo Banner mới
// @route   POST /api/admin/banners
// @access  Private (requireAdmin + CSRF)
const createBanner = async (req, res, next) => {
  try {
    const {
      title,
      badge,
      subtitle,
      ctaText,
      bgType,
      image,
      alt,
      link,
      position,
      order,
      active
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_TITLE',
        message: 'Tiêu đề banner là bắt buộc.'
      });
    }

    if (!image || !image.trim()) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_IMAGE',
        message: 'Vui lòng cung cấp URL hoặc upload ảnh cho banner.'
      });
    }

    const cleanAlt = (alt || title).trim();
    const cleanLink = (link || 'dang-ky-partner.html').trim();

    // Kiểm tra an toàn cho link đích
    if (!isSafeUrl(cleanLink)) {
      return res.status(400).json({
        success: false,
        code: 'UNSAFE_LINK',
        message: 'Đường dẫn đích (link) chứa ký tự hoặc giao thức không an toàn (ví dụ: javascript:, data:).'
      });
    }

    // Chuẩn hóa vị trí banner
    const validPositions = ['home_slider', 'partner_banner', 'home', 'sidebar', 'footer', 'popup'];
    let cleanPosition = (position || 'home_slider').trim();
    if (!validPositions.includes(cleanPosition)) {
      cleanPosition = 'home_slider';
    }

    const banner = await Banner.create({
      title: title.trim(),
      badge: (badge || '').trim(),
      subtitle: (subtitle || '').trim(),
      ctaText: (ctaText || 'Xem chi tiết').trim(),
      bgType: bgType || 'orange',
      image: image.trim(),
      alt: cleanAlt,
      link: cleanLink,
      position: cleanPosition,
      order: parseInt(order, 10) || 0,
      active: active !== undefined ? Boolean(active) : true
    });

    res.status(201).json({
      success: true,
      message: 'Thêm banner mới thành công!',
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật Banner
// @route   PUT /api/admin/banners/:id
// @access  Private (requireAdmin + CSRF)
const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      badge,
      subtitle,
      ctaText,
      bgType,
      image,
      alt,
      link,
      position,
      order,
      active
    } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner cần cập nhật.'
      });
    }

    if (link && !isSafeUrl(link.trim())) {
      return res.status(400).json({
        success: false,
        code: 'UNSAFE_LINK',
        message: 'Đường dẫn đích (link) chứa ký tự hoặc giao thức không an toàn.'
      });
    }

    if (title) banner.title = title.trim();
    if (badge !== undefined) banner.badge = badge.trim();
    if (subtitle !== undefined) banner.subtitle = subtitle.trim();
    if (ctaText !== undefined) banner.ctaText = ctaText.trim();
    if (bgType) banner.bgType = bgType;
    if (image) banner.image = image.trim();
    if (alt) banner.alt = alt.trim();
    if (link) banner.link = link.trim();
    if (position) banner.position = position.trim();
    if (order !== undefined) banner.order = parseInt(order, 10) || 0;
    if (active !== undefined) banner.active = Boolean(active);

    await banner.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật banner thành công!',
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa Banner
// @route   DELETE /api/admin/banners/:id
// @access  Private (requireAdmin + CSRF)
const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner để xóa.'
      });
    }

    // Nếu ảnh nằm trong thư mục uploads nội bộ -> dọn dẹp file vật lý an toàn
    if (banner.image && banner.image.startsWith('uploads/banners/')) {
      const filename = path.basename(banner.image);
      const filePath = path.join(BASE_UPLOAD_DIR, 'banners', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn('[Banner] Không thể xóa file ảnh cũ:', unlinkErr.message);
        }
      }
    }

    await Banner.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Đã xóa banner thành công!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bật/Tắt nhanh trạng thái Banner
// @route   PATCH /api/admin/banners/:id/toggle
// @access  Private (requireAdmin + CSRF)
const toggleBannerActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner.'
      });
    }

    banner.active = !banner.active;
    await banner.save();

    res.status(200).json({
      success: true,
      message: `Đã ${banner.active ? 'kích hoạt' : 'tạm dừng'} banner thành công!`,
      data: {
        id: banner._id,
        active: banner.active
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload ảnh Banner (JPG, PNG, WebP)
// @route   POST /api/admin/upload/banner
// @access  Private (requireAdmin + CSRF)
const uploadBannerImage = async (req, res, next) => {
  try {
    if (!req.uploadedFileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Không có file ảnh được upload.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Upload ảnh banner thành công!',
      url: req.uploadedFileUrl,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicBanners,
  getAdminBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive,
  uploadBannerImage
};

