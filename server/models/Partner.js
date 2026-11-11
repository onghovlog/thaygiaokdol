/**
 * Partner Mongoose Schema & Model
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const mongoose = require('mongoose');

// Danh mục giá trị hợp lệ cho các trường lựa chọn (Enums)
const VALID_OCCUPATIONS = [
  'Nhân viên văn phòng',
  'Kinh doanh tự do / Chủ shop',
  'Giáo viên / Giảng viên',
  'Mẹ bỉm sữa / Nội trợ',
  'Sinh viên / Mới tốt nghiệp',
  'Khác'
];

const VALID_GOALS = [
  'Kiếm thêm thu nhập',
  'Khởi nghiệp KDOL',
  'Phát triển kênh bán hàng',
  'Xây dựng đội nhóm',
  'Tìm hiểu mô hình'
];

const VALID_EXPERIENCES = [
  'Chưa có kinh nghiệm',
  'Đã từng bán hàng online',
  'Đang kinh doanh',
  'Từng làm Affiliate Marketing'
];

const VALID_INTERESTS = [
  'Cà phê sức khỏe',
  'Yến sào',
  'Thực phẩm bổ sung',
  'Sức khỏe',
  'Thời trang',
  'Công nghệ',
  'Gia dụng',
  'Mỹ phẩm'
];

const VALID_AVAILABLE_TIMES = [
  'Dưới 1 giờ',
  '1 - 3 giờ',
  '1–3 giờ',
  'Trên 3 giờ'
];

const VALID_START_TIMES = [
  'Bắt đầu ngay',
  'Trong 7 ngày tới',
  'Trong 30 ngày tới',
  'Đang tìm hiểu'
];

const VALID_CONTACT_CHANNELS = ['Zalo', 'Điện thoại', 'Email'];
const VALID_SOURCES = ['website', 'tiktok_live', 'facebook', 'zalo', 'website_demo', 'other'];
const VALID_STATUSES = [
  'new',           // Mới đăng ký
  'contacted',     // Đã liên hệ
  'consulted',     // Đã tư vấn
  'joined',        // Đã tham gia (Trở thành đối tác chính thức)
  'not_suitable',  // Không phù hợp
  'pending',       // Tương thích ngược: chờ xử lý -> coi như new
  'consulting',    // Tương thích ngược: đang tư vấn -> coi như consulted
  'active',        // Tương thích ngược: đang hoạt động -> coi như joined
  'rejected'       // Tương thích ngược: từ chối -> coi như not_suitable
];

const partnerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Họ và tên là bắt buộc'],
      trim: true,
      minlength: [2, 'Họ và tên phải có ít nhất 2 ký tự'],
      maxlength: [100, 'Họ và tên không được vượt quá 100 ký tự']
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại/Zalo là bắt buộc'],
      trim: true,
      match: [/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ (cần 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email không được vượt quá 100 ký tự'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Địa chỉ email không đúng định dạng']
    },
    province: {
      type: String,
      required: [true, 'Tỉnh/Thành phố là bắt buộc'],
      trim: true,
      maxlength: [100, 'Tỉnh/Thành phố không được vượt quá 100 ký tự']
    },
    occupation: {
      type: String,
      trim: true,
      enum: {
        values: VALID_OCCUPATIONS,
        message: 'Nghề nghiệp không nằm trong danh mục hợp lệ'
      },
      default: 'Khác'
    },
    goals: {
      type: [{
        type: String,
        enum: {
          values: VALID_GOALS,
          message: 'Mục tiêu "{VALUE}" không nằm trong danh mục hợp lệ'
        }
      }],
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Vui lòng chọn ít nhất 1 mục tiêu'
      },
      default: []
    },
    experience: {
      type: String,
      trim: true,
      enum: {
        values: VALID_EXPERIENCES,
        message: 'Mức độ kinh nghiệm không nằm trong danh mục hợp lệ'
      },
      default: 'Chưa có kinh nghiệm'
    },
    interests: {
      type: [{
        type: String,
        enum: {
          values: VALID_INTERESTS,
          message: 'Ngành hàng "{VALUE}" không nằm trong danh mục hợp lệ'
        }
      }],
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Vui lòng chọn ít nhất 1 ngành hàng quan tâm'
      },
      default: []
    },
    availableTime: {
      type: String,
      trim: true,
      enum: {
        values: VALID_AVAILABLE_TIMES,
        message: 'Quỹ thời gian không hợp lệ'
      },
      default: '1 - 3 giờ'
    },
    startWhen: {
      type: String,
      trim: true,
      enum: {
        values: VALID_START_TIMES,
        message: 'Thời điểm bắt đầu không hợp lệ'
      },
      default: 'Bắt đầu ngay'
    },
    preferredContact: {
      type: String,
      trim: true,
      enum: {
        values: VALID_CONTACT_CHANNELS,
        message: 'Kênh liên hệ phải là Zalo, Điện thoại hoặc Email'
      },
      default: 'Zalo'
    },
    consent: {
      type: Boolean,
      required: [true, 'Đồng ý chính sách xử lý dữ liệu cá nhân là bắt buộc'],
      validate: {
        validator: function(v) {
          return v === true;
        },
        message: 'Bạn phải đồng ý với chính sách xử lý dữ liệu cá nhân để tiếp tục'
      }
    },
    policyVersion: {
      type: String,
      trim: true,
      maxlength: [20, 'Phiên bản chính sách không hợp lệ'],
      default: '1.0'
    },
    consentAt: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      trim: true,
      maxlength: [50, 'Nguồn chiến dịch không hợp lệ'],
      enum: {
        values: VALID_SOURCES,
        message: 'Nguồn chiến dịch không nằm trong danh mục cho phép'
      },
      default: 'website'
    },
    status: {
      type: String,
      trim: true,
      enum: {
        values: VALID_STATUSES,
        message: 'Trạng thái không hợp lệ'
      },
      default: 'new'
    },
    ipAddress: {
      type: String,
      trim: true,
      default: ''
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [200, 'User-agent quá dài'],
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Ghi chú không được vượt quá 500 ký tự'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes tối ưu truy vấn tra cứu và chống trùng
partnerSchema.index({ phone: 1, createdAt: -1 });
partnerSchema.index({ status: 1 });
partnerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Partner', partnerSchema);
module.exports.VALID_OCCUPATIONS = VALID_OCCUPATIONS;
module.exports.VALID_GOALS = VALID_GOALS;
module.exports.VALID_EXPERIENCES = VALID_EXPERIENCES;
module.exports.VALID_INTERESTS = VALID_INTERESTS;
module.exports.VALID_AVAILABLE_TIMES = VALID_AVAILABLE_TIMES;
module.exports.VALID_START_TIMES = VALID_START_TIMES;
module.exports.VALID_CONTACT_CHANNELS = VALID_CONTACT_CHANNELS;
module.exports.VALID_SOURCES = VALID_SOURCES;
module.exports.VALID_STATUSES = VALID_STATUSES;
