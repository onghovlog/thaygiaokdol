/**
 * Admin Mongoose Schema & Model
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Tên đăng nhập là bắt buộc'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Tên đăng nhập phải có ít nhất 3 ký tự'],
      maxlength: [50, 'Tên đăng nhập không quá 50 ký tự']
    },
    passwordHash: {
      type: String,
      required: [true, 'Mật khẩu băm (passwordHash) là bắt buộc']
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'editor'],
        message: 'Vai trò phải là admin hoặc editor'
      },
      default: 'admin'
    },
    lastLogin: {
      type: Date
    },
    lastLoginIp: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Phương thức so khớp mật khẩu đã băm (Bcrypt compare)
adminSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.passwordHash || !enteredPassword) return false;
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Phương thức tĩnh băm mật khẩu chuẩn bảo mật cao (Salt rounds = 12)
adminSchema.statics.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

module.exports = mongoose.model('Admin', adminSchema);
