/**
 * Banner Mongoose Schema & Model
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const mongoose = require('mongoose');
const { isSafeUrl } = require('../utils/urlValidator');

const bannerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, 'URL hình ảnh banner là bắt buộc'],
      trim: true
    },
    url: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || isSafeUrl(v);
        },
        message: 'Đường dẫn đích (URL) chứa ký tự hoặc giao thức không an toàn'
      },
      default: 'dang-ky-partner.html'
    },
    link: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || isSafeUrl(v);
        },
        message: 'Đường dẫn đích (link) chứa ký tự hoặc giao thức không an toàn'
      },
      default: 'dang-ky-partner.html'
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự'],
      default: ''
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [200, 'Alt text không được vượt quá 200 ký tự'],
      default: 'Banner Thầy Giáo KDOL'
    },
    badge: {
      type: String,
      trim: true,
      maxlength: [100, 'Nhãn phụ không vượt quá 100 ký tự'],
      default: ''
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Mô tả phụ không vượt quá 300 ký tự'],
      default: ''
    },
    ctaText: {
      type: String,
      trim: true,
      maxlength: [50, 'Nút bấm CTA không vượt quá 50 ký tự'],
      default: 'Xem chi tiết'
    },
    bgType: {
      type: String,
      trim: true,
      default: 'orange'
    },
    position: {
      type: String,
      trim: true,
      enum: {
        values: ['home_slider', 'partner_banner', 'home', 'sidebar', 'footer', 'popup'],
        message: 'Vị trí banner không hợp lệ (hỗ trợ home_slider, partner_banner)'
      },
      default: 'home_slider'
    },
    order: {
      type: Number,
      default: 0
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes tối ưu truy vấn theo vị trí hiển thị và sắp xếp thứ tự
bannerSchema.index({ position: 1, active: 1, order: 1 });
bannerSchema.index({ active: 1 });
bannerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Banner', bannerSchema);
