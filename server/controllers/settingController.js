/**
 * Setting Controller (Public & Admin Settings APIs)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const Setting = require('../models/Setting');
const { isSafeUrl } = require('../utils/urlValidator');

// Danh sách các khóa cấu hình được phép công khai (Whitelist)
const PUBLIC_SETTING_KEYS = [
  'site_name',
  'site_slogan',
  'site_logo',
  'site_avatar',
  'contact_phone',
  'contact_zalo',
  'contact_messenger',
  'site_short_intro',
  'seo_default_title',
  'seo_default_description',
  'privacy_policy_url',
  'max_mobile_width'
];

// Danh sách các từ khóa nhạy cảm bị cấm lưu vào Settings collection (Secrets Blacklist)
const SENSITIVE_KEY_PATTERN = /(password|secret|token|key|credential|admin_hash|private|jwt|auth|cookie|mongo|connection)/i;

// Giá trị mặc định dự phòng nếu chưa có trong Database
const DEFAULT_PUBLIC_SETTINGS = {
  site_name: 'Thầy Giáo KDOL',
  site_slogan: '1 đơn hàng - 1 nụ cười',
  site_logo: 'assets/images/logo.png',
  site_avatar: 'assets/images/thay-giao-kdol-portrait.svg',
  contact_phone: '0000000000',
  contact_zalo: 'https://zalo.me/placeholder_kdol',
  contact_messenger: 'https://m.me/placeholder_kdol',
  site_short_intro: 'Đồng hành thực chiến kinh doanh online tinh gọn cùng Thầy Giáo KDOL với triết lý 1 đơn hàng - 1 nụ cười.',
  seo_default_title: 'Thầy Giáo KDOL – 1 đơn hàng - 1 nụ cười | Kinh Doanh Online Thực Chiến',
  seo_default_description: 'Nền tảng chia sẻ kiến thức kinh doanh online thực chiến, tối ưu vận hành, phát triển đối tác KDOL không ôm hàng.',
  privacy_policy_url: 'chinh-sach-bao-mat.html',
  max_mobile_width: 430
};

// @desc    Lấy cấu hình công khai (Public Settings API - Chỉ trả dữ liệu công khai an toàn)
// @route   GET /api/settings/public
// @access  Public
const getPublicSettings = async (req, res, next) => {
  try {
    const settingsDocs = await Setting.find({
      key: { $in: PUBLIC_SETTING_KEYS }
    }).lean();

    const data = { ...DEFAULT_PUBLIC_SETTINGS };

    settingsDocs.forEach(item => {
      if (PUBLIC_SETTING_KEYS.includes(item.key)) {
        data[item.key] = item.value;
      }
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy toàn bộ cấu hình quản trị
// @route   GET /api/admin/settings
// @access  Private (requireAdmin)
const getAdminSettings = async (req, res, next) => {
  try {
    const settingsDocs = await Setting.find().lean();
    const data = { ...DEFAULT_PUBLIC_SETTINGS };

    settingsDocs.forEach(item => {
      // Chỉ đọc các key thuộc whitelist cấu hình giao diện
      if (PUBLIC_SETTING_KEYS.includes(item.key)) {
        data[item.key] = item.value;
      }
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật cấu hình website (Chặn lưu secrets)
// @route   PUT /api/admin/settings
// @access  Private (requireAdmin + CSRF)
const updateAdminSettings = async (req, res, next) => {
  try {
    const updates = req.body || {};

    // 1. Kiểm tra chống lưu trữ secrets hoặc mật khẩu vào settings collection
    for (const [key, value] of Object.entries(updates)) {
      if (SENSITIVE_KEY_PATTERN.test(key) && !['site_slogan', 'site_short_intro'].includes(key)) {
        return res.status(400).json({
          success: false,
          code: 'SECRETS_FORBIDDEN',
          message: `Không cho phép lưu trữ thông tin bí mật hoặc khóa bảo mật (secrets) vào bảng cấu hình website (Từ khóa bị chặn: "${key}").`
        });
      }

      if (typeof value === 'string' && SENSITIVE_KEY_PATTERN.test(value)) {
        // Kiểm tra xem value có phải chuỗi token / connection string / secret không
        if (value.startsWith('mongodb') || value.startsWith('eyJ') || value.length > 200) {
          return res.status(400).json({
            success: false,
            code: 'SECRETS_FORBIDDEN',
            message: 'Phát hiện chuỗi dữ liệu có cấu trúc bí mật/token. Không cho phép lưu vào cấu hình website.'
          });
        }
      }
    }

    // 2. Validate các đường dẫn URL nếu có
    const urlFields = ['contact_zalo', 'contact_messenger', 'privacy_policy_url', 'site_logo', 'site_avatar'];
    for (const field of urlFields) {
      if (updates[field]) {
        const val = String(updates[field]).trim();
        if (!isSafeUrl(val)) {
          return res.status(400).json({
            success: false,
            code: 'UNSAFE_URL',
            message: `Trường "${field}" chứa đường dẫn hoặc giao thức không an toàn.`
          });
        }
      }
    }

    // 3. Cập nhật các trường được phép
    const updatedMap = {};
    for (const key of PUBLIC_SETTING_KEYS) {
      if (updates[key] !== undefined) {
        const cleanVal = typeof updates[key] === 'string' ? updates[key].trim() : updates[key];
        await Setting.findOneAndUpdate(
          { key },
          { key, value: cleanVal },
          { upsert: true, returnDocument: 'after' }
        );
        updatedMap[key] = cleanVal;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật cấu hình website thành công!',
      data: updatedMap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload ảnh cấu hình (Logo / Avatar)
// @route   POST /api/admin/upload/setting
// @access  Private (requireAdmin + CSRF)
const uploadSettingImage = async (req, res, next) => {
  try {
    if (!req.uploadedFileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Không có file ảnh được upload.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Upload ảnh cấu hình thành công!',
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
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings,
  uploadSettingImage,
  PUBLIC_SETTING_KEYS,
  DEFAULT_PUBLIC_SETTINGS
};
