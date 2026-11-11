/**
 * Admin Partner Controller
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Quản trị hồ sơ Partner từ MongoDB Atlas:
 * - Tìm kiếm, lọc đa tiêu chí (ngày, tỉnh thành, nguồn, ngành hàng, trạng thái).
 * - Cập nhật trạng thái và ghi chú CSKH nội bộ (Admin only).
 * - Xem chi tiết & xử lý quyền chủ thể dữ liệu (Chỉnh sửa/Xóa dữ liệu theo chính sách bảo mật).
 * - Xuất CSV UTF-8 BOM kèm cơ chế chống CSV Formula Injection.
 * - Thống kê số lượng theo trạng thái và phân bổ nguồn đăng ký.
 */

const Partner = require('../models/Partner');
const {
  VALID_OCCUPATIONS,
  VALID_GOALS,
  VALID_EXPERIENCES,
  VALID_INTERESTS,
  VALID_AVAILABLE_TIMES,
  VALID_START_TIMES,
  VALID_CONTACT_CHANNELS
} = require('../models/Partner');

// Bản đồ trạng thái chuẩn hóa thân thiện người dùng
const STATUS_LABELS = {
  new: 'Mới đăng ký',
  pending: 'Mới đăng ký',
  contacted: 'Đã liên hệ',
  consulted: 'Đã tư vấn',
  consulting: 'Đã tư vấn',
  joined: 'Đã tham gia',
  active: 'Đã tham gia',
  not_suitable: 'Không phù hợp',
  rejected: 'Không phù hợp'
};

// Hàm xây dựng MongoDB query từ các tham số lọc
function buildPartnerQuery(params) {
  const { search, status, province, source, interest, fromDate, toDate } = params;
  const query = {};

  // 1. Tìm kiếm theo Tên và Số điện thoại
  if (search && search.trim()) {
    const cleanSearch = search.trim();
    const regex = new RegExp(cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ fullName: regex }, { phone: regex }];
  }

  // 2. Lọc theo trạng thái
  if (status && status !== 'all') {
    if (status === 'new') {
      query.status = { $in: ['new', 'pending'] };
    } else if (status === 'contacted') {
      query.status = 'contacted';
    } else if (status === 'consulted') {
      query.status = { $in: ['consulted', 'consulting'] };
    } else if (status === 'joined') {
      query.status = { $in: ['joined', 'active'] };
    } else if (status === 'not_suitable') {
      query.status = { $in: ['not_suitable', 'rejected'] };
    } else {
      query.status = status;
    }
  }

  // 3. Lọc theo Tỉnh / Thành phố
  if (province && province.trim() && province !== 'all') {
    query.province = new RegExp(province.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }

  // 4. Lọc theo Nguồn đăng ký
  if (source && source.trim() && source !== 'all') {
    query.source = source.trim();
  }

  // 5. Lọc theo Ngành hàng quan tâm
  if (interest && interest.trim() && interest !== 'all') {
    query.interests = { $in: [interest.trim()] };
  }

  // 6. Lọc theo Khoảng thời gian ngày đăng ký (fromDate, toDate)
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) {
      const fDate = new Date(fromDate);
      if (!isNaN(fDate.getTime())) {
        fDate.setUTCHours(0, 0, 0, 0);
        query.createdAt.$gte = fDate;
      }
    }
    if (toDate) {
      const tDate = new Date(toDate);
      if (!isNaN(tDate.getTime())) {
        tDate.setUTCHours(23, 59, 59, 999);
        query.createdAt.$lte = tDate;
      }
    }
    // Nếu cả 2 đều không hợp lệ thì xóa trường createdAt
    if (Object.keys(query.createdAt).length === 0) {
      delete query.createdAt;
    }
  }

  return query;
}

// Hàm làm sạch ô dữ liệu để chống CSV Formula Injection (DDE attack)
function sanitizeCsvCell(val) {
  if (val === null || val === undefined) return '""';

  let str = String(val).trim();

  // CHỐNG FORMULA INJECTION:
  // Nếu ký tự đầu tiên là =, +, -, @, tab hoặc return (\r)
  // Kẻ tấn công có thể chèn công thức Excel thực thi mã độc hoặc rò rỉ dữ liệu.
  // Giải pháp: Thêm dấu nháy đơn ' ở đầu để Excel ép kiểu thành chuỗi văn bản thuần túy.
  if (/^[\=\+\-\@\t\r]/.test(str)) {
    str = "'" + str;
  }

  // Thoát dấu nháy kép bên trong chuỗi theo chuẩn CSV RFC 4180: " -> ""
  str = str.replace(/"/g, '""');

  return `"${str}"`;
}

// ==========================================
// 1. DANH SÁCH PARTNER (PHÂN TRANG PHÍA SERVER)
// ==========================================
// @desc    Lấy danh sách Partner có phân trang, tìm kiếm & lọc đa tiêu chí
// @route   GET /api/admin/partners
// @access  Private (requireAdmin)
const getAdminPartners = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = buildPartnerQuery(req.query);

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 10), 100);
    const skip = (pageNum - 1) * limitNum;

    // Chạy song song: đếm tổng kết quả lọc, lấy danh sách trang hiện tại, và đếm thống kê trạng thái
    const [total, partners, totalAll, countNew, countContacted, countConsulted, countJoined, countNotSuitable, distinctProvinces] = await Promise.all([
      Partner.countDocuments(query),
      Partner.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Partner.countDocuments(),
      Partner.countDocuments({ status: { $in: ['new', 'pending'] } }),
      Partner.countDocuments({ status: 'contacted' }),
      Partner.countDocuments({ status: { $in: ['consulted', 'consulting'] } }),
      Partner.countDocuments({ status: { $in: ['joined', 'active'] } }),
      Partner.countDocuments({ status: { $in: ['not_suitable', 'rejected'] } }),
      Partner.distinct('province')
    ]);

    // Chuẩn hóa nhãn trạng thái và format ngày cho từng đối tác
    const formattedPartners = partners.map(p => ({
      ...p,
      statusLabel: STATUS_LABELS[p.status] || p.status,
      goalsText: Array.isArray(p.goals) ? p.goals.join(', ') : '',
      interestsText: Array.isArray(p.interests) ? p.interests.join(', ') : ''
    }));

    return res.status(200).json({
      success: true,
      data: formattedPartners,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      statusCounts: {
        all: totalAll,
        new: countNew,
        contacted: countContacted,
        consulted: countConsulted,
        joined: countJoined,
        not_suitable: countNotSuitable
      },
      filterOptions: {
        provinces: distinctProvinces.filter(Boolean).sort(),
        interests: VALID_INTERESTS,
        sources: ['website', 'tiktok_live', 'facebook', 'zalo']
      }
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. XEM CHI TIẾT ĐỐI TÁC
// ==========================================
// @desc    Lấy chi tiết hồ sơ một đối tác
// @route   GET /api/admin/partners/:id
// @access  Private (requireAdmin)
const getPartnerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const partner = await Partner.findById(id).lean();

    if (!partner) {
      return res.status(404).json({
        success: false,
        code: 'PARTNER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ đối tác với ID đã cung cấp.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...partner,
        statusLabel: STATUS_LABELS[partner.status] || partner.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. CẬP NHẬT TRẠNG THÁI & GHI CHÚ CSKH
// ==========================================
// @desc    Cập nhật trạng thái và ghi chú nội bộ của Admin
// @route   PATCH /api/admin/partners/:id
// @access  Private (requireAdmin + CSRF)
const updatePartnerStatusAndNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body || {};

    const allowedStatuses = ['new', 'contacted', 'consulted', 'joined', 'not_suitable'];
    const updateData = {};

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_STATUS',
          message: `Trạng thái không hợp lệ. Phải là một trong các giá trị: ${allowedStatuses.join(', ')}.`
        });
      }
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = String(notes).trim().substring(0, 500);
    }

    const partner = await Partner.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        code: 'PARTNER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ đối tác để cập nhật.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái & ghi chú chăm sóc đối tác thành công!',
      data: {
        ...partner.toObject(),
        statusLabel: STATUS_LABELS[partner.status] || partner.status
      }
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. CHỈNH SỬA THÔNG TIN ĐỐI TÁC (QUYỀN CHỦ THỂ DỮ LIỆU)
// ==========================================
// @desc    Cập nhật thông tin đối tác khi có yêu cầu chỉnh sửa theo chính sách bảo mật
// @route   PUT /api/admin/partners/:id
// @access  Private (requireAdmin + CSRF)
const updatePartnerProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
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
      preferredContact
    } = req.body || {};

    // Validate họ và tên
    if (!fullName || String(fullName).trim().length < 2) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_FULLNAME',
        message: 'Họ và tên phải có ít nhất 2 ký tự.'
      });
    }

    // Validate số điện thoại (10 chữ số)
    const cleanPhone = String(phone || '').replace(/[\s.-]/g, '');
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PHONE',
        message: 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).'
      });
    }

    // Validate tỉnh thành
    if (!province || String(province).trim().length < 2) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PROVINCE',
        message: 'Tỉnh/Thành phố là bắt buộc.'
      });
    }

    const updateDoc = {
      fullName: String(fullName).trim().substring(0, 100),
      phone: cleanPhone,
      email: email ? String(email).trim().toLowerCase().substring(0, 100) : '',
      province: String(province).trim().substring(0, 100)
    };

    if (occupation) updateDoc.occupation = String(occupation).trim();
    if (experience) updateDoc.experience = String(experience).trim();
    if (availableTime) updateDoc.availableTime = String(availableTime).trim();
    if (startWhen) updateDoc.startWhen = String(startWhen).trim();
    if (preferredContact) updateDoc.preferredContact = String(preferredContact).trim();

    if (Array.isArray(goals) && goals.length > 0) {
      updateDoc.goals = goals;
    }
    if (Array.isArray(interests) && interests.length > 0) {
      updateDoc.interests = interests;
    }

    const partner = await Partner.findByIdAndUpdate(
      id,
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        code: 'PARTNER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ đối tác để chỉnh sửa.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã cập nhật thông tin đối tác theo yêu cầu chỉnh sửa dữ liệu.',
      data: partner
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. XÓA DỮ LIỆU ĐỐI TÁC (QUYỀN RÚT LẠI ĐỒNG Ý / XÓA DỮ LIỆU)
// ==========================================
// @desc    Xóa vĩnh viễn hồ sơ đối tác theo yêu cầu chính sách bảo mật
// @route   DELETE /api/admin/partners/:id
// @access  Private (requireAdmin + CSRF)
const deletePartner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const partner = await Partner.findByIdAndDelete(id);
    if (!partner) {
      return res.status(404).json({
        success: false,
        code: 'PARTNER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ đối tác để xóa.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã xóa vĩnh viễn hồ sơ đối tác khỏi cơ sở dữ liệu theo yêu cầu quyền riêng tư.'
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. XUẤT CSV UTF-8 BOM VỚI CHỐNG CSV FORMULA INJECTION
// ==========================================
// @desc    Xuất danh sách đối tác ra file CSV tương thích hoàn hảo Microsoft Excel
// @route   GET /api/admin/partners/export
// @access  Private (requireAdmin)
const exportPartnersCsv = async (req, res, next) => {
  try {
    // Áp dụng chung logic bộ lọc để chỉ xuất những đối tác đang lọc (hoặc toàn bộ nếu không lọc)
    const query = buildPartnerQuery(req.query);

    const partners = await Partner.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // 1. Tiêu đề các cột trong file CSV
    const headers = [
      'STT',
      'Họ và tên',
      'Số điện thoại',
      'Email',
      'Tỉnh/Thành phố',
      'Nghề nghiệp',
      'Mục tiêu hợp tác',
      'Kinh nghiệm',
      'Ngành hàng quan tâm',
      'Quỹ thời gian/ngày',
      'Thời điểm bắt đầu',
      'Kênh liên hệ ưu tiên',
      'Nguồn đăng ký',
      'Trạng thái',
      'Ghi chú CSKH',
      'Phiên bản chính sách',
      'Thời điểm đồng ý CSBM',
      'Ngày đăng ký'
    ];

    const csvRows = [];

    // Hàng tiêu đề
    csvRows.push(headers.map(sanitizeCsvCell).join(','));

    // 2. Chuyển đổi dữ liệu từng dòng
    partners.forEach((p, index) => {
      const createdDateStr = p.createdAt
        ? new Date(p.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        : '';
      const consentDateStr = p.consentAt
        ? new Date(p.consentAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        : '';

      const row = [
        index + 1,
        p.fullName || '',
        p.phone || '',
        p.email || 'Không có',
        p.province || '',
        p.occupation || 'Khác',
        Array.isArray(p.goals) ? p.goals.join('; ') : '',
        p.experience || 'Chưa có kinh nghiệm',
        Array.isArray(p.interests) ? p.interests.join('; ') : '',
        p.availableTime || '',
        p.startWhen || '',
        p.preferredContact || 'Zalo',
        p.source || 'website',
        STATUS_LABELS[p.status] || p.status || 'Mới',
        p.notes || '',
        p.policyVersion ? `v${p.policyVersion}` : 'v1.0',
        consentDateStr,
        createdDateStr
      ];

      csvRows.push(row.map(sanitizeCsvCell).join(','));
    });

    // 3. Bổ sung UTF-8 BOM (\uFEFF) ở đầu chuỗi:
    // Giúp Microsoft Excel tự động nhận diện bảng mã UTF-8 và hiển thị tiếng Việt có dấu chuẩn 100%
    const csvContent = '\uFEFF' + csvRows.join('\r\n');

    // 4. Thiết lập Header HTTP trả về file tải về
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `danh-sach-partner-kdol-${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).send(csvContent);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  STATUS_LABELS,
  buildPartnerQuery,
  sanitizeCsvCell,
  getAdminPartners,
  getPartnerById,
  updatePartnerStatusAndNotes,
  updatePartnerProfile,
  deletePartner,
  exportPartnersCsv
};

