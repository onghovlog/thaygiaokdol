/**
 * Partner Controller
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const Partner = require('../models/Partner');
const {
  VALID_OCCUPATIONS,
  VALID_GOALS,
  VALID_EXPERIENCES,
  VALID_INTERESTS,
  VALID_AVAILABLE_TIMES,
  VALID_START_TIMES,
  VALID_CONTACT_CHANNELS,
  VALID_SOURCES
} = require('../models/Partner');

// Khoảng thời gian chống gửi trùng ngoài ý muốn (10 phút)
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

// Hàm ẩn số điện thoại trong log để bảo vệ thông tin riêng tư (No PII in logs)
function maskPhone(phone) {
  if (!phone || phone.length < 6) return '***';
  return phone.slice(0, 3) + '****' + phone.slice(-3);
}

// @desc    Tạo hồ sơ đăng ký Partner mới (Public REST API)
// @route   POST /api/partners
// @access  Public (Bảo vệ bằng Rate Limiting & Honeypot)
const createPartner = async (req, res, next) => {
  try {
    const body = req.body || {};

    // 1. Kiểm tra Honeypot chống spam bot
    // Nếu các trường bẫy ẩn có nội dung -> yêu cầu từ bot tự động điền form
    if (body.hp_confirm || body.website_hp || body.honeypot) {
      console.warn(`[Anti-Spam] Phát hiện bot tự động điền form honeypot từ IP: ${req.ip || 'unknown'}`);
      // Trả về thành công giả định để đánh lừa bot mà không lưu vào DB
      return res.status(200).json({
        success: true,
        message: 'Đăng ký hồ sơ Partner thành công!',
        data: {
          id: 'spambot-filtered',
          status: 'new',
          createdAt: new Date()
        }
      });
    }

    // 2. Chuẩn hóa (Normalize) và Validate dữ liệu đầu vào
    // 2.1. Họ và tên
    const rawFullName = typeof body.fullName === 'string' ? body.fullName : (body.fullname || '');
    const fullName = rawFullName.trim().replace(/\s+/g, ' ');
    if (!fullName) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FULLNAME',
        message: 'Vui lòng nhập họ và tên của bạn.'
      });
    }
    if (fullName.length < 2 || fullName.length > 100) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_FULLNAME_LENGTH',
        message: 'Họ và tên phải từ 2 đến 100 ký tự.'
      });
    }

    // 2.2. Số điện thoại (Zalo)
    const rawPhone = typeof body.phone === 'string' ? body.phone : '';
    const phone = rawPhone.replace(/[\s\-\.]/g, '');
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phone) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PHONE',
        message: 'Vui lòng nhập số điện thoại hoặc Zalo.'
      });
    }
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PHONE',
        message: 'Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số (bắt đầu bằng 03, 05, 07, 08, 09).'
      });
    }

    // 2.3. Tỉnh/Thành phố
    const province = typeof body.province === 'string' ? body.province.trim() : '';
    if (!province) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PROVINCE',
        message: 'Vui lòng chọn Tỉnh/Thành phố bạn đang sinh sống.'
      });
    }
    if (province.length > 100) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PROVINCE_LENGTH',
        message: 'Tên Tỉnh/Thành phố không được vượt quá 100 ký tự.'
      });
    }

    // 2.4. Email (Không bắt buộc)
    let email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 100) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_EMAIL',
          message: 'Địa chỉ email không đúng định dạng.'
        });
      }
    } else {
      email = undefined;
    }

    // 2.5. Nghề nghiệp
    const occupation = typeof body.occupation === 'string' ? body.occupation.trim() : '';
    if (!occupation || !VALID_OCCUPATIONS.includes(occupation)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_OCCUPATION',
        message: 'Vui lòng chọn nghề nghiệp hợp lệ trong danh mục.'
      });
    }

    // 2.6. Mục tiêu (Goals - Ít nhất 1 mục)
    const rawGoals = Array.isArray(body.goals) ? body.goals : (body.goals ? [body.goals] : []);
    const goals = rawGoals.map(g => String(g).trim()).filter(g => VALID_GOALS.includes(g));
    if (goals.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_GOALS',
        message: 'Vui lòng chọn ít nhất 1 mục tiêu mong muốn khi tham gia Partner.'
      });
    }

    // 2.7. Mức độ kinh nghiệm
    const experience = typeof body.experience === 'string' ? body.experience.trim() : '';
    if (!experience || !VALID_EXPERIENCES.includes(experience)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_EXPERIENCE',
        message: 'Vui lòng chọn mức độ kinh nghiệm bán hàng của bạn.'
      });
    }

    // 2.8. Ngành hàng quan tâm (Interests / Categories - Ít nhất 1 mục)
    const rawInterests = Array.isArray(body.interests) 
      ? body.interests 
      : (Array.isArray(body.categories) ? body.categories : (body.interests ? [body.interests] : []));
    const interests = rawInterests.map(i => String(i).trim()).filter(i => VALID_INTERESTS.includes(i));
    if (interests.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_INTERESTS',
        message: 'Vui lòng chọn ít nhất 1 ngành hàng bạn quan tâm.'
      });
    }

    // 2.9. Quỹ thời gian có thể dành mỗi ngày
    let availableTime = typeof body.availableTime === 'string' ? body.availableTime.trim() : (body.dailyTime || '');
    if (availableTime === '1-3 giờ' || availableTime === '1 - 3 giờ' || availableTime === '1–3 giờ') {
      availableTime = '1 - 3 giờ';
    }
    if (!availableTime || (!VALID_AVAILABLE_TIMES.includes(availableTime) && availableTime !== '1 - 3 giờ')) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_AVAILABLE_TIME',
        message: 'Vui lòng chọn quỹ thời gian hợp lệ có thể dành mỗi ngày.'
      });
    }

    // 2.10. Thời điểm bắt đầu
    let startWhen = typeof body.startWhen === 'string' ? body.startWhen.trim() : (body.startTime || '');
    if (startWhen === 'Bắt đầu ngay hôm nay') startWhen = 'Bắt đầu ngay';
    if (startWhen === 'Trong vòng 7 ngày tới') startWhen = 'Trong 7 ngày tới';
    if (startWhen === 'Trong vòng 30 ngày tới') startWhen = 'Trong 30 ngày tới';
    if (startWhen === 'Đang tìm hiểu mô hình') startWhen = 'Đang tìm hiểu';
    if (!startWhen || !VALID_START_TIMES.includes(startWhen)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_START_TIME',
        message: 'Vui lòng chọn thời điểm dự kiến bắt đầu hợp lệ.'
      });
    }

    // 2.11. Kênh liên hệ ưu tiên
    let preferredContact = typeof body.preferredContact === 'string' ? body.preferredContact.trim() : (body.contactChannel || 'Zalo');
    if (!VALID_CONTACT_CHANNELS.includes(preferredContact)) {
      preferredContact = 'Zalo';
    }

    // 2.12. Checkbox bắt buộc: Đồng ý chính sách dữ liệu cá nhân (Consent)
    const consent = body.consent === true || body.consent === 'true' || body.agreePrivacy === true || body.agreePrivacy === 'true';
    if (!consent) {
      return res.status(400).json({
        success: false,
        code: 'CONSENT_REQUIRED',
        message: 'Bạn phải đồng ý với chính sách xử lý dữ liệu cá nhân để tiếp tục đăng ký.'
      });
    }

    // 2.13. Phiên bản chính sách và thời điểm đồng ý
    const policyVersion = typeof body.policyVersion === 'string' && body.policyVersion.trim() 
      ? body.policyVersion.trim().substring(0, 20) 
      : '1.0';
    const consentAt = new Date();

    // 2.14. Nguồn chiến dịch (Source Whitelist)
    let source = typeof body.source === 'string' ? body.source.toLowerCase().trim() : 'website';
    if (!VALID_SOURCES.includes(source)) {
      source = 'website';
    }

    // 3. Chống gửi trùng ngoài ý muốn trong vòng 10 phút theo số điện thoại
    const cutoffTime = new Date(Date.now() - DUPLICATE_WINDOW_MS);
    const existingRecent = await Partner.findOne({
      phone,
      createdAt: { $gte: cutoffTime }
    }).sort({ createdAt: -1 });

    if (existingRecent) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_SUBMISSION',
        message: 'Số điện thoại này vừa gửi thông tin đăng ký cách đây ít phút. Thầy Giáo KDOL đã ghi nhận và sẽ liên hệ sớm. Nếu bạn muốn gửi lại hoặc cập nhật, vui lòng thử lại sau 10 phút.'
      });
    }

    // 4. Lưu thông tin Partner vào cơ sở dữ liệu MongoDB Atlas
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || req.ip || '');
    const userAgent = typeof req.headers['user-agent'] === 'string' 
      ? req.headers['user-agent'].substring(0, 200) 
      : '';

    const partner = await Partner.create({
      fullName,
      phone,
      email,
      province,
      occupation,
      goals,
      experience,
      interests,
      availableTime,
      startWhen,
      preferredContact,
      consent: true,
      policyVersion,
      consentAt,
      source,
      status: 'new',
      ipAddress: clientIp,
      userAgent,
      notes: typeof body.notes === 'string' ? body.notes.trim().substring(0, 500) : ''
    });

    // 5. Ghi log an toàn tuyệt đối - KHÔNG đưa thông tin cá nhân (PII) vào server logs
    console.log(`[Partner Registration] Thành công | ID: ${partner._id} | Phone: ${maskPhone(phone)} | Source: ${source} | IP: ${clientIp}`);

    // 6. Phản hồi API an toàn - Chỉ trả thông tin tối thiểu cần thiết, KHÔNG trả dữ liệu nhạy cảm
    return res.status(201).json({
      success: true,
      message: 'Đăng ký hồ sơ Partner thành công! Thầy Giáo KDOL sẽ sớm liên hệ tư vấn qua Zalo.',
      data: {
        id: partner._id,
        status: partner.status,
        createdAt: partner.createdAt
      }
    });

  } catch (error) {
    // Nếu xảy ra lỗi Mongoose Validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: messages.join(', ')
      });
    }
    next(error);
  }
};

module.exports = {
  createPartner
};
