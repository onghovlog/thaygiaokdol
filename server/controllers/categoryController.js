/**
 * Category & Banner Controllers (Public APIs)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const Category = require('../models/Category');
const Banner = require('../models/Banner');

// @desc    Lấy danh sách tất cả chuyên mục (sắp xếp theo thứ tự order)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .sort({ order: 1 })
      .select('-__v')
      .lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách Banners đang kích hoạt theo vị trí
// @route   GET /api/banners?position=home
// @access  Public
const getBanners = async (req, res, next) => {
  try {
    const { position = 'home' } = req.query;

    // Chuẩn hóa vị trí: cho phép cả 'home' và 'home_slider' khớp với banner trang chủ
    let positionCondition;
    const rawPos = typeof position === 'string' ? position : 'home';
    const cleanPos = rawPos.toLowerCase().trim();
    if (cleanPos === 'home' || cleanPos === 'home_slider') {
      positionCondition = { $in: ['home', 'home_slider'] };
    } else {
      positionCondition = cleanPos;
    }

    const banners = await Banner.find({
      active: true,
      position: positionCondition
    })
      .sort({ order: 1 })
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
// ADMIN APIS (requireAdmin)
// ==========================================

// @desc    Lấy chi tiết chuyên mục theo ID
// @route   GET /api/admin/categories/:id
// @access  Private (requireAdmin)
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chuyên mục.' });
    }
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo Chuyên mục mới
// @route   POST /api/admin/categories
// @access  Private (requireAdmin + CSRF)
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, order } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên chuyên mục là bắt buộc.' });
    }
    let cleanSlug = (slug || name).toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const existingSlug = await Category.findOne({ slug: cleanSlug });
    if (existingSlug) {
      cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await Category.create({
      name: name.trim(),
      slug: cleanSlug,
      description: (description || '').trim(),
      order: parseInt(order, 10) || 0
    });

    res.status(201).json({
      success: true,
      message: 'Tạo chuyên mục thành công!',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật Chuyên mục
// @route   PUT /api/admin/categories/:id
// @access  Private (requireAdmin + CSRF)
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, order } = req.body || {};
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chuyên mục.' });
    }

    if (name) category.name = name.trim();
    if (slug) {
      const cleanSlug = slug.toLowerCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const slugConflict = await Category.findOne({ slug: cleanSlug, _id: { $ne: id } });
      if (slugConflict) {
        return res.status(400).json({ success: false, message: 'Đường dẫn (slug) này đã được sử dụng bởi chuyên mục khác.' });
      }
      category.slug = cleanSlug;
    }
    if (description !== undefined) category.description = description.trim();
    if (order !== undefined) category.order = parseInt(order, 10) || 0;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật chuyên mục thành công!',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa Chuyên mục
// @route   DELETE /api/admin/categories/:id
// @access  Private (requireAdmin + CSRF)
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chuyên mục để xóa.' });
    }
    await Category.deleteOne({ _id: id });
    res.status(200).json({
      success: true,
      message: 'Đã xóa chuyên mục thành công.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getBanners,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
