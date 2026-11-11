/**
 * Cấu hình tập trung cho Thầy Giáo KDOL
 * Slogan: "1 đơn hàng - 1 nụ cười"
 * 
 * Lưu ý: Các thông số liên hệ dưới đây là GIÁ TRỊ PLACEHOLDER cấu hình sẵn,
 * người quản trị có thể thay thế bằng số hotline và đường dẫn thực tế khi triển khai.
 */

export const SITE_CONFIG = {
  brand: {
    name: 'Thầy Giáo KDOL',
    slogan: '1 đơn hàng - 1 nụ cười',
    homeUrl: 'index.html'
  },

  // Cấu hình liên hệ Placeholder (không bịa số thực tế)
  contact: {
    // Thay thế bằng số điện thoại hotline thực tế khi triển khai (VD: 0912345678)
    phone: '0000000000',
    
    // Thay thế bằng đường dẫn Zalo OA hoặc Zalo cá nhân chính thức
    zaloUrl: 'https://zalo.me/placeholder_kdol',
    
    // Thay thế bằng đường dẫn Fanpage Messenger chính thức
    messengerUrl: 'https://m.me/placeholder_kdol'
  },

  // Ba mục điều hướng chính theo yêu cầu
  primaryNavigation: [
    {
      id: 'gioi-thieu',
      label: 'Tôi là ai',
      path: 'gioi-thieu.html',
      description: 'Giới thiệu & Câu chuyện thương hiệu'
    },
    {
      id: 'kien-thuc',
      label: 'KDOL là gì',
      path: 'kien-thuc.html',
      matchPaths: ['kien-thuc.html', 'bai-viet.html'],
      description: 'Kiến thức kinh doanh online thực chiến'
    },
    {
      id: 'dang-ky-partner',
      label: 'Đăng ký Partner',
      path: 'dang-ky-partner.html',
      matchPaths: ['dang-ky-partner.html', 'dang-ky-thanh-cong.html'],
      isHighlight: true,
      description: 'Đồng hành tăng trưởng 1:1'
    }
  ],

  // Các liên kết phụ trợ
  secondaryNavigation: [
    { id: 'index', label: 'Trang chủ', path: 'index.html' },
    { id: 'chinh-sach-bao-mat', label: 'Chính sách bảo mật', path: 'chinh-sach-bao-mat.html' },
    { id: 'admin', label: 'Quản trị Admin', path: 'admin/index.html' }
  ]
};

