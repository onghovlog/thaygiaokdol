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

// Chuẩn hóa đường dẫn hình ảnh có leading slash để luôn load đúng ở mọi tầng route (/admin hoặc /)
const formatImageUrl = (img) => {
  if (!img || typeof img !== 'string') return '/assets/images/banner-partner.svg';
  const trimmed = img.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return '/' + trimmed;
};

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

    const normalizedBanners = banners.map(b => ({
      ...b,
      image: formatImageUrl(b.image),
      url: b.url || b.link || '',
      link: b.link || b.url || ''
    }));

    res.status(200).json({
      success: true,
      count: normalizedBanners.length,
      data: normalizedBanners
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
      query.$or = [{ url: regex }, { link: regex }, { title: regex }, { alt: regex }];
    }

    const banners = await Banner.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    const normalizedBanners = banners.map(b => ({
      ...b,
      image: formatImageUrl(b.image),
      url: b.url || b.link || '',
      link: b.link || b.url || ''
    }));

    res.status(200).json({
      success: true,
      count: normalizedBanners.length,
      data: normalizedBanners
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

// @desc    Tạo Banner mới (Chỉ cần image và url)
// @route   POST /api/admin/banners
// @access  Private (requireAdmin + CSRF)
const createBanner = async (req, res, next) => {
  try {
    const {
      image,
      url,
      link,
      title,
      alt,
      position,
      order,
      active
    } = req.body;

    if (!image || !image.trim()) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_IMAGE',
        message: 'Hình ảnh banner (image) là bắt buộc.'
      });
    }

    const cleanUrl = (url || link || '').trim() || 'dang-ky-partner.html';

    // Kiểm tra an toàn cho link đích
    if (!isSafeUrl(cleanUrl)) {
      return res.status(400).json({
        success: false,
        code: 'UNSAFE_LINK',
        message: 'Đường dẫn đích (url) chứa ký tự hoặc giao thức không an toàn (ví dụ: javascript:, data:).'
      });
    }

    // Chuẩn hóa vị trí banner
    const validPositions = ['home_slider', 'partner_banner', 'home', 'sidebar', 'footer', 'popup'];
    let cleanPosition = (position || 'home_slider').trim();
    if (!validPositions.includes(cleanPosition)) {
      cleanPosition = 'home_slider';
    }

    const banner = await Banner.create({
      image: image.trim(),
      url: cleanUrl,
      link: cleanUrl,
      title: (title || '').trim(),
      alt: (alt || title || 'Banner Thầy Giáo KDOL').trim(),
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
      image,
      url,
      link,
      title,
      alt,
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

    const targetUrl = (url !== undefined ? url : link);
    if (targetUrl !== undefined) {
      const cleanUrl = String(targetUrl).trim();
      if (!isSafeUrl(cleanUrl)) {
        return res.status(400).json({
          success: false,
          code: 'UNSAFE_LINK',
          message: 'Đường dẫn đích (url) chứa ký tự hoặc giao thức không an toàn.'
        });
      }
      banner.url = cleanUrl;
      banner.link = cleanUrl;
    }

    if (image !== undefined) banner.image = String(image).trim();
    if (title !== undefined) banner.title = String(title).trim();
    if (alt !== undefined) banner.alt = String(alt).trim();
    if (position !== undefined) banner.position = String(position).trim();
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

