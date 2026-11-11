/**
 * Admin Session Model
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Lưu trữ phiên đăng nhập quản trị an toàn trong MongoDB.
 * Tự động hủy phiên hết hạn nhờ TTL Index trên trường expiresAt.
 */

const mongoose = require('mongoose');

const adminSessionSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      index: true
    },
    username: {
      type: String,
      required: true
    },
    csrfToken: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// TTL Index: MongoDB tự động xóa session khi expiresAt đến hạn
adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AdminSession', adminSessionSchema);

