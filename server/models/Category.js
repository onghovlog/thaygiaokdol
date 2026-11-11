/**
 * Category Mongoose Schema & Model
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên chuyên mục là bắt buộc'],
      trim: true,
      maxlength: [100, 'Tên chuyên mục không vượt quá 100 ký tự']
    },
    slug: {
      type: String,
      required: [true, 'Slug chuyên mục là bắt buộc'],
      unique: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes phục vụ tìm kiếm và sắp xếp thứ tự hiển thị
categorySchema.index({ order: 1 });

module.exports = mongoose.model('Category', categorySchema);
