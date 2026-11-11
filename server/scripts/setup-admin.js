/**
 * Admin Setup Script (Khởi tạo tài khoản quản trị viên an toàn)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Cách dùng:
 * 1. Chạy với đối số dòng lệnh:
 *    node server/scripts/setup-admin.js <username> <password> [role]
 * 
 * 2. Chạy tương tác (Interactive prompt nếu không truyền đối số):
 *    node server/scripts/setup-admin.js
 */

require('dotenv').config();
const readline = require('readline');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function run() {
  console.log('====================================================');
  console.log('  👑 THẦY GIÁO KDOL - SCRIPT THIẾT LẬP QUẢN TRỊ VIÊN');
  console.log('====================================================');

  let username = process.argv[2];
  let password = process.argv[3];
  let role = process.argv[4] || 'admin';

  // Nếu không truyền qua tham số dòng lệnh -> hỏi tương tác
  if (!username) {
    username = await askQuestion('👉 Nhập tên đăng nhập (username): ');
  }
  if (!password) {
    password = await askQuestion('👉 Nhập mật khẩu quản trị (password >= 6 ký tự): ');
  }

  username = (username || '').trim().toLowerCase();
  password = (password || '').trim();

  if (!username || username.length < 3) {
    console.error('❌ Lỗi: Tên đăng nhập phải có ít nhất 3 ký tự!');
    process.exit(1);
  }

  if (!password || password.length < 6) {
    console.error('❌ Lỗi: Mật khẩu quản trị phải có ít nhất 6 ký tự để đảm bảo an toàn!');
    process.exit(1);
  }

  if (role !== 'admin' && role !== 'editor') {
    role = 'admin';
  }

  try {
    console.log('⏳ Đang kết nối tới cơ sở dữ liệu MongoDB Atlas...');
    await connectDB();

    console.log(`🔐 Đang băm mật khẩu bằng Bcrypt (Salt rounds = 12)...`);
    const passwordHash = await Admin.hashPassword(password);

    const admin = await Admin.findOneAndUpdate(
      { username },
      {
        username,
        passwordHash,
        role
      },
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true
      }
    );

    console.log('----------------------------------------------------');
    console.log('✅ THIẾT LẬP TÀI KHOẢN QUẢN TRỊ THÀNH CÔNG!');
    console.log(`   - Username : ${admin.username}`);
    console.log(`   - Role     : ${admin.role}`);
    console.log(`   - ID       : ${admin._id}`);
    console.log(`   - Cập nhật : ${admin.updatedAt}`);
    console.log('----------------------------------------------------');
    console.log('👉 Bây giờ bạn có thể đăng nhập tại: /admin/login.html');

  } catch (error) {
    console.error('❌ Đã xảy ra lỗi khi tạo tài khoản Admin:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
