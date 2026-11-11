/**
 * Admin Controller
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const Admin = require('../models/Admin');
const AdminSession = require('../models/AdminSession');
const Partner = require('../models/Partner');
const Post = require('../models/Post');
const Category = require('../models/Category');
const Banner = require('../models/Banner');
const Setting = require('../models/Setting');
const { generateSecureToken } = require('../middleware/adminAuth');

// 24 giờ cho thời lượng một phiên làm việc (Session Max Age)
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// @desc    Đăng nhập quản trị viên (Admin Login)
// @route   POST /api/admin/auth/login
// @access  Public (Bảo vệ bởi Rate Limiter)
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_CREDENTIALS',
        message: 'Vui lòng nhập tên đăng nhập và mật khẩu.'
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // 1. Tìm tài khoản trong database
    const admin = await Admin.findOne({ username: cleanUsername });
    if (!admin) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.'
      });
    }

    // 2. So khớp mật khẩu băm bằng Bcrypt
    const isMatch = await admin.matchPassword(String(password));
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.'
      });
    }

    // 3. Khởi tạo Token phiên & Token CSRF an toàn ngẫu nhiên
    const sessionToken = generateSecureToken(32);
    const csrfToken = generateSecureToken(24);
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || req.ip || '');

    // 4. Lưu phiên vào MongoDB Atlas
    await AdminSession.create({
      token: sessionToken,
      adminId: admin._id,
      username: admin.username,
      csrfToken,
      ipAddress,
      userAgent: (req.headers['user-agent'] || '').substring(0, 200),
      expiresAt
    });

    // 5. Cập nhật mốc đăng nhập mới nhất của Admin
    admin.lastLogin = new Date();
    admin.lastLoginIp = ipAddress;
    await admin.save();

    // 6. Đặt Cookie HttpOnly, Secure, SameSite an toàn tuyệt đối
    res.cookie('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_MS,
      path: '/'
    });

    // 7. Phản hồi JSON (Chỉ trả csrfToken và thông tin cơ bản, không trả sessionToken)
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        lastLogin: admin.lastLogin
      },
      csrfToken
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Đăng xuất quản trị viên (Logout)
// @route   POST /api/admin/auth/logout
// @access  Private (requireAdmin)
const logout = async (req, res, next) => {
  try {
    if (req.adminSession) {
      await AdminSession.deleteOne({ _id: req.adminSession._id });
    }

    // Xóa cookie an toàn
    res.clearCookie('admin_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Kiểm tra phiên đăng nhập hiện tại (Check Session)
// @route   GET /api/admin/auth/me
// @access  Private (requireAdmin)
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        role: req.admin.role,
        lastLogin: req.admin.lastLogin
      },
      csrfToken: req.adminSession.csrfToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy số liệu thống kê Dashboard thực tế từ MongoDB Atlas
// @route   GET /api/admin/dashboard/stats
// @access  Private (requireAdmin)
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Thống kê bài viết thực tế
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: 'published' });

    // 2. Thống kê chuyên mục & banner
    const totalCategories = await Category.countDocuments();
    const activeBanners = await Banner.countDocuments({ active: true });

    // 3. Thống kê đối tác & trạng thái thực tế từ MongoDB
    const [
      totalPartners,
      newPartners,
      contactedPartners,
      consultedPartners,
      joinedPartners,
      notSuitablePartners,
      sourceAgg
    ] = await Promise.all([
      Partner.countDocuments(),
      Partner.countDocuments({ status: { $in: ['new', 'pending'] } }),
      Partner.countDocuments({ status: 'contacted' }),
      Partner.countDocuments({ status: { $in: ['consulted', 'consulting'] } }),
      Partner.countDocuments({ status: { $in: ['joined', 'active'] } }),
      Partner.countDocuments({ status: { $in: ['not_suitable', 'rejected'] } }),
      Partner.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ])
    ]);

    // Phân bổ nguồn đăng ký (sourceBreakdown)
    const sourceBreakdown = {
      website: 0,
      tiktok_live: 0,
      facebook: 0,
      zalo: 0
    };
    sourceAgg.forEach(item => {
      const srcKey = item._id || 'website';
      sourceBreakdown[srcKey] = item.count;
    });

    // 4. Danh sách 5 đối tác đăng ký mới nhất
    const recentPartners = await Partner.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName phone province occupation source status createdAt preferredContact')
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        posts: {
          total: totalPosts,
          published: publishedPosts,
          drafts: totalPosts - publishedPosts
        },
        categories: {
          total: totalCategories
        },
        banners: {
          active: activeBanners
        },
        partners: {
          total: totalPartners,
          newCount: newPartners,
          contactedCount: contactedPartners,
          joinedCount: joinedPartners,
          statusBreakdown: {
            new: newPartners,
            contacted: contactedPartners,
            consulted: consultedPartners,
            joined: joinedPartners,
            not_suitable: notSuitablePartners,
            // Giữ tương thích ngược
            consulting: consultedPartners,
            active: joinedPartners,
            rejected: notSuitablePartners
          },
          sourceBreakdown
        },
        recentPartners
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách đối tác đăng ký (Có phân trang, lọc status, tìm kiếm)
// @route   GET /api/admin/partners
// @access  Private (requireAdmin)
const getAdminPartners = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ fullName: regex }, { phone: regex }, { province: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 15), 50);
    const skip = (pageNum - 1) * limitNum;

    const total = await Partner.countDocuments(query);
    const partners = await Partner.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    return res.status(200).json({
      success: true,
      data: partners,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật trạng thái và ghi chú cho Partner
// @route   PATCH /api/admin/partners/:id
// @access  Private (requireAdmin)
const updatePartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body || {};

    const validStatuses = ['new', 'pending', 'contacted', 'consulting', 'active', 'rejected'];
    const updateData = {};

    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_STATUS',
          message: 'Trạng thái không nằm trong danh mục hợp lệ.'
        });
      }
      updateData.status = status;
    }

    if (typeof notes === 'string') {
      updateData.notes = notes.trim().substring(0, 500);
    }

    const partner = await Partner.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ đối tác với ID đã chỉ định.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ đối tác thành công!',
      data: partner
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy cấu hình hệ thống
// @route   GET /api/admin/settings
// @access  Private (requireAdmin)
const getAdminSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find().lean();
    const configMap = {};
    settings.forEach(s => {
      configMap[s.key] = s.value;
    });

    return res.status(200).json({
      success: true,
      data: configMap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật cấu hình hệ thống
// @route   PUT /api/admin/settings
// @access  Private (requireAdmin)
const updateAdminSettings = async (req, res, next) => {
  try {
    const { contact_phone, contact_zalo, contact_messenger, site_slogan } = req.body || {};

    const updates = {
      contact_phone,
      contact_zalo,
      contact_messenger,
      site_slogan
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        await Setting.findOneAndUpdate(
          { key },
          { key, value: String(value).trim() },
          { upsert: true, returnDocument: 'after' }
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật cấu hình thành công!'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getMe,
  getDashboardStats,
  getAdminPartners,
  updatePartner,
  getAdminSettings,
  updateAdminSettings
};

