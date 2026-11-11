/**
 * Setting Mongoose Schema & Model
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Khóa cấu hình (key) là bắt buộc'],
      unique: true,
      trim: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Giá trị cấu hình (value) là bắt buộc']
    }
  },
  {
    timestamps: true
  }
);

// Model
module.exports = mongoose.model('Setting', settingSchema);
