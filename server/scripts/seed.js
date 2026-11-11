/**
 * Seed Database Script (Zero Personal Data / Dữ liệu mẫu an toàn)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Lệnh chạy: npm run seed hoặc node server/scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import Mongoose Models
const Category = require('../models/Category');
const Post = require('../models/Post');
const Banner = require('../models/Banner');
const Partner = require('../models/Partner');
const Admin = require('../models/Admin');
const Setting = require('../models/Setting');

// 1. Danh sách Chuyên mục
const sampleCategories = [
  { name: 'Kiến thức KDOL', slug: 'kdol', description: 'Kiến thức cốt lõi về kinh doanh online thực chiến', order: 1 },
  { name: 'Nền tảng Droppii', slug: 'droppii', description: 'Chuỗi cung ứng và vận hành Dropshipping không ôm hàng', order: 2 },
  { name: 'Kỹ năng bán hàng', slug: 'sales', description: 'Kịch bản tư vấn, xử lý từ chối và chốt đơn tự nhiên', order: 3 },
  { name: 'TikTok & Affiliate', slug: 'tiktok', description: 'Sáng tạo video ngắn gắn giỏ hàng và chuyển đổi traffic', order: 4 },
  { name: 'Marketing online', slug: 'marketing', description: 'Tối ưu chi phí quảng cáo và xây phễu khách hàng thân thiết', order: 5 },
  { name: 'Sản phẩm & ngành hàng', slug: 'products', description: 'Thẩm định sản phẩm phễu và chiến lược ngành hàng', order: 6 },
  { name: 'Hành trình Partner', slug: 'partner', description: 'Kinh nghiệm thực tế và đồng hành cùng cộng đồng', order: 7 }
];

// 2. Danh sách Banners Trang Chủ (Hỗ trợ position 'home' & 'home_slider')
const sampleBanners = [
  {
    title: 'Khởi Nghiệp KDOL Tinh Gọn',
    subtitle: 'Tối ưu chi phí, tăng trưởng lợi nhuận ròng với triết lý 1 đơn hàng - 1 nụ cười',
    badge: 'Đồng Hành Thực Chiến',
    ctaText: 'Đăng ký Partner ngay',
    link: 'dang-ky-partner.html',
    bgType: 'orange',
    image: 'assets/images/article-kdol-overview.svg',
    alt: 'Khởi Nghiệp KDOL Tinh Gọn',
    position: 'home',
    order: 1,
    active: true
  },
  {
    title: 'Bí Quyết Làm Chủ TikTok & Shopee',
    subtitle: 'Khai thác luồng traffic tự nhiên, tối ưu tỷ lệ chuyển đổi mà không đốt tiền Ads',
    badge: 'Chiến Lược Đa Kênh',
    ctaText: 'Khám phá bài học',
    link: 'kien-thuc.html',
    bgType: 'blue',
    image: 'assets/images/article-dropshipping.svg',
    alt: 'Bí Quyết Làm Chủ TikTok & Shopee',
    position: 'home',
    order: 2,
    active: true
  },
  {
    title: 'Bắt Mạch Điểm Nghẽn Gian Hàng',
    subtitle: 'Phân tích trực tiếp số liệu, tái cấu trúc quy trình đóng gói và vận hành',
    badge: 'Tư Vấn Chuyên Sâu 1:1',
    ctaText: 'Nhận tư vấn miễn phí',
    link: 'dang-ky-partner.html',
    bgType: 'neutral',
    image: 'assets/images/article-marketing-ads.svg',
    alt: 'Bắt Mạch Điểm Nghẽn Gian Hàng',
    position: 'home',
    order: 3,
    active: true
  },
  {
    title: 'Cắt Giảm Tỷ Lệ Bom Hàng Dưới 5%',
    subtitle: 'Quy trình 3 bước xác nhận đơn và chăm sóc hậu mãi tạo ấn tượng bền lâu',
    badge: 'Kiểm Soát Vận Hành',
    ctaText: 'Đọc hướng dẫn chi tiết',
    link: 'bai-viet.html?slug=xu-ly-khung-hoang-hoan-hang-duoi-5-phan-tram',
    bgType: 'orange-subtle',
    image: 'assets/images/article-default.svg',
    alt: 'Cắt Giảm Tỷ Lệ Bom Hàng Dưới 5%',
    position: 'home',
    order: 4,
    active: true
  }
];

// 3. Danh sách 12 Bài viết đầy đủ theo 8 danh mục
const samplePosts = [
  {
    title: 'KDOL là gì? Cẩm nang kinh doanh online thực chiến từ số 0 cho người mới',
    slug: 'kinh-doanh-online-la-gi',
    category: 'Kiến thức KDOL',
    tags: ['kdol', 'kinh doanh online', 'khoi nghiep'],
    readTime: '8 phút đọc',
    thumbnail: 'assets/images/article-kdol-overview.svg',
    thumbnailIcon: 'book',
    featuredImage: 'assets/images/article-kdol-overview.svg',
    featuredImageCaption: 'Mô hình kinh doanh online tinh gọn: Nguồn hàng chuẩn - Tư vấn đúng - Khách hàng hài lòng',
    excerpt: 'Toàn cảnh định nghĩa KDOL, 3 giai đoạn phát triển bắt buộc phải trải qua và tư duy quản trị dòng tiền để không rơi vào bẫy lãi ảo trên sàn TMĐT.',
    featured: true,
    status: 'published',
    publishedAt: new Date('2026-11-11'),
    content: [
      { type: 'paragraph', text: 'Rất nhiều người bước chân vào kinh doanh online (KDOL) với ảo tưởng chỉ cần đăng bài lên mạng xã hội hoặc chạy quảng cáo là tiền sẽ tự động chảy về tài khoản. Tuy nhiên, sau vài tháng thực chiến, không ít người phải ngậm ngùi rời bỏ thị trường vì hàng tồn kho chất đống, chi phí vận hành nuốt trọn lợi nhuận gộp.' },
      { type: 'callout', strong: 'Triết lý Thầy Giáo KDOL: ', text: 'KDOL không phải là trò chơi "lướt sóng" ngắn hạn. "1 đơn hàng - 1 nụ cười" nghĩa là tạo ra giá trị thực sự cho người tiêu dùng để họ hài lòng, tin tưởng và quay trở lại mua nhiều lần với chi phí quảng cáo bằng 0 đồng.' },
      { type: 'heading2', text: '1. Bản chất thực sự của KDOL (Kinh doanh online)' },
      { type: 'paragraph', text: 'Về mặt bản chất, KDOL là việc ứng dụng công nghệ và mạng Internet để tối ưu hóa quá trình tiếp cận khách hàng, quản lý đơn hàng và giao vận. Khác với cửa hàng truyền thống phụ thuộc vào mặt bằng cố định, một mô hình KDOL chuẩn mực mang lại tính linh hoạt cao nhưng đòi hỏi kỷ luật quản trị khắt khe.' },
      { type: 'image', src: 'assets/images/article-kdol-overview.svg', alt: 'Sơ đồ luồng vận hành kinh doanh online tinh gọn', caption: 'Quy trình 3 trụ cột vững chắc giúp nhà bán hàng tự tin duy trì dòng tiền dương' },
      { type: 'heading3', text: '1.1 Cạm bẫy "Doanh thu ảo - Lợi nhuận âm"' },
      { type: 'paragraph', text: 'Nhiều người khoe doanh thu hàng trăm triệu mỗi tháng, nhưng khi bóc tách chi phí thực tế thì hoàn toàn bất ngờ: phí sàn TMĐT từ 12-18%, chi phí quảng cáo 25-35%, chi phí đóng gói & hư hao 5%, tỷ lệ hoàn hàng 10-15%. Kết quả là chủ gian hàng làm việc không ngày nghỉ nhưng tài khoản ngân hàng không hề tích lũy.' },
      { type: 'heading2', text: '2. Ba giai đoạn phát triển bắt buộc của người làm KDOL' },
      { type: 'list', format: 'ordered', items: [
        'Giai đoạn 1 - Kiểm chứng thị trường (0 - 3 tháng): Tìm sản phẩm ngách có biên độ lợi nhuận tốt, nhu cầu thực và không đòi hỏi vốn lưu kho quá lớn.',
        'Giai đoạn 2 - Chuẩn hóa vận hành (3 - 6 tháng): Xây dựng kịch bản tư vấn chốt đơn, kiểm soát tỷ lệ hoàn hàng dưới 5%.',
        'Giai đoạn 3 - Xây dựng tệp khách trung thành (6 tháng trở lên): Ứng dụng phễu chăm sóc khách hàng tự động.'
      ]},
      { type: 'heading2', text: '3. Tư duy quản trị dòng tiền bền vững' },
      { type: 'paragraph', text: 'Doanh thu là phù phiếm, lợi nhuận ròng là hiện thực, nhưng dòng tiền mới là dòng máu nuôi sống doanh nghiệp.' }
    ]
  },
  {
    title: 'Tìm hiểu mô hình Dropshipping: Quy trình xử lý đơn hàng và kiểm soát chất lượng',
    slug: 'hieu-dung-ve-mo-hinh-dropshipping-droppii',
    category: 'Nền tảng Droppii',
    tags: ['dropshipping', 'droppii', 'van hanh'],
    readTime: '6 phút đọc',
    thumbnail: 'assets/images/article-dropshipping.svg',
    thumbnailIcon: 'box',
    featuredImage: 'assets/images/article-dropshipping.svg',
    featuredImageCaption: 'Sơ đồ luồng xử lý đơn hàng Dropshipping trung tâm khép kín',
    excerpt: 'Khám phá cách thức vận hành chuỗi cung ứng, từ khâu đóng gói trung tâm đến kiểm tra sản phẩm chính hãng mà không cần người bán phải ôm hàng tồn kho.',
    featured: true,
    status: 'published',
    publishedAt: new Date('2026-11-09'),
    content: [
      { type: 'paragraph', text: 'Dropshipping loại bỏ áp lực đọng vốn lưu kho, cho phép nhà bán hàng tập trung vào tư vấn chất lượng cao.' },
      { type: 'callout', strong: 'Quan điểm trung thực: ', text: 'Dropshipping không phải làm giàu cấp tốc mà là mô hình phân công lao động: nền tảng lo kho bãi, người bán lo tư vấn và chăm sóc.' },
      { type: 'heading2', text: '1. Quy trình xử lý đơn hàng trung tâm' },
      { type: 'paragraph', text: 'Người bán lên đơn trên ứng dụng, kho trung tâm đóng gói bọt khí chuyên nghiệp và bàn giao đơn vị vận chuyển.' },
      { type: 'image', src: 'assets/images/article-dropshipping.svg', alt: 'Quy trình xử lý đơn hàng Dropshipping', caption: '4 bước tinh gọn từ lúc khách chốt đơn đến khi nhận hàng' }
    ]
  },
  {
    title: 'Kịch bản tư vấn chốt đơn 4 bước: Tăng tỷ lệ chuyển đổi mà không gây phiền hà',
    slug: 'kich-ban-tu-van-chot-don-tu-nhien',
    category: 'Kỹ năng bán hàng',
    tags: ['sales', 'chot don', 'tu van'],
    readTime: '5 phút đọc',
    thumbnail: 'assets/images/article-default.svg',
    thumbnailIcon: 'chat',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Nghệ thuật lắng nghe chân thành trong tư vấn bán hàng',
    excerpt: 'Cách lắng nghe vấn đề của khách hàng, đặt câu hỏi gợi mở nhu cầu và đưa ra đề xuất giải pháp đúng lúc, đúng tâm lý người tiêu dùng.',
    featured: true,
    status: 'published',
    publishedAt: new Date('2026-11-07'),
    content: [
      { type: 'paragraph', text: 'Khách hàng ngày nay rất tinh ý và dị ứng với những lời chào mời hối thúc dồn dập.' },
      { type: 'heading2', text: '1. Kịch bản 4 bước thực chiến' },
      { type: 'list', format: 'ordered', items: [
        'Bước 1 - Tạo thiện cảm: Chào hỏi lịch sự và xác nhận nhu cầu của khách.',
        'Bước 2 - Lắng nghe: Đặt 2-3 câu hỏi mở để làm rõ vấn đề khách đang gặp phải.',
        'Bước 3 - Đề xuất giải pháp: Phân tích lý do vì sao liệu trình phù hợp với họ.',
        'Bước 4 - Hướng dẫn nhận hàng: Hỏi địa chỉ nhận hàng thuận tiện thay vì ép mua.'
      ]}
    ]
  },
  {
    title: 'Xây dựng luồng video ngắn gắn giỏ hàng chuyển đổi cao không cần lộ mặt',
    slug: 'xay-dung-video-ngan-tiktok-affiliate',
    category: 'TikTok & Affiliate',
    tags: ['tiktok', 'affiliate', 'video'],
    readTime: '4 phút đọc',
    thumbnail: 'assets/images/article-default.svg',
    thumbnailIcon: 'video',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Cách sáng tạo nội dung video ngắn giải quyết đúng nỗi đau người xem',
    excerpt: 'Phương pháp khai thác tính năng thực tế của sản phẩm, thiết lập hook 3 giây đầu giữ chân người xem và gắn link affiliate tự nhiên.',
    featured: true,
    status: 'published',
    publishedAt: new Date('2026-11-05'),
    content: [
      { type: 'paragraph', text: 'Quay cận cảnh tính năng sản phẩm giải quyết vấn đề thực tế thường mang lại tỷ lệ chốt đơn cao hơn cả video lộ mặt.' },
      { type: 'heading2', text: '1. Cấu trúc video chuyển đổi cao' },
      { type: 'list', format: 'unordered', items: [
        '0 - 3 giây: Hook thị giác hoặc âm thanh nêu bật vấn đề.',
        '4 - 15 giây: Trực tiếp trải nghiệm tính năng nổi bật.',
        '16 - 30 giây: Hướng dẫn mẹo sử dụng kèm lời nhắc kiểm tra giỏ hàng.'
      ]}
    ]
  },
  {
    title: 'Bí quyết tối ưu chi phí quảng cáo (ROAS) và giữ chân khách hàng quay lại',
    slug: 'toi-uu-chi-phi-quang-cao-roas',
    category: 'Marketing online',
    tags: ['marketing', 'roas', 'quang cao'],
    readTime: '6 phút đọc',
    thumbnail: 'assets/images/article-marketing-ads.svg',
    thumbnailIcon: 'chart',
    featuredImage: 'assets/images/article-marketing-ads.svg',
    featuredImageCaption: 'Chiến thuật cắt tỉa nhóm quảng cáo và tối ưu tỷ lệ hoàn vốn',
    excerpt: 'Chiến thuật cắt tỉa nhóm Ads kém hiệu quả, tối ưu trang đích và xây dựng kịch bản tái tiếp thị 0 đồng qua kênh chăm sóc khách hàng.',
    featured: true,
    status: 'published',
    publishedAt: new Date('2026-11-03'),
    content: [
      { type: 'paragraph', text: '80% lợi nhuận ròng đến từ 20% khách hàng trung thành mua lại với chi phí quảng cáo 0 đồng.' },
      { type: 'heading2', text: '1. Cắt tỉa nhóm quảng cáo hòa vốn' },
      { type: 'paragraph', text: 'Tắt ngay các nhóm quảng cáo không đem lại ROAS mục tiêu sau khi đã tiếp cận đủ 500 lượt hiển thị.' },
      { type: 'image', src: 'assets/images/article-marketing-ads.svg', alt: 'Chiến thuật tối ưu chi phí quảng cáo', caption: 'Chuyển dịch ngân sách sang giữ chân khách hàng' }
    ]
  },
  {
    title: 'Phương pháp thẩm định sản phẩm và lựa chọn ngành hàng ít cạnh tranh giá',
    slug: 'cach-nghien-cuu-thi-truong-ngach',
    category: 'Sản phẩm & ngành hàng',
    tags: ['products', 'nganh hang', 'thi truong'],
    readTime: '7 phút đọc',
    thumbnail: 'assets/images/article-default.svg',
    thumbnailIcon: 'search',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Tiêu chuẩn thẩm định sản phẩm trước khi đưa vào phễu phân phối',
    excerpt: 'Tiêu chí 5 điểm đánh giá vòng đời sản phẩm, biên độ lợi nhuận gộp và mức độ thỏa mãn nhu cầu tiêu dùng lặp lại.',
    featured: false,
    status: 'published',
    publishedAt: new Date('2026-11-01'),
    content: [
      { type: 'paragraph', text: 'Bán sản phẩm có rào cản chất lượng giúp bạn thoát khỏi vòng xoáy giảm giá sát ván.' },
      { type: 'heading2', text: '1. Tiêu chí lựa chọn sản phẩm ngách' },
      { type: 'list', format: 'unordered', items: [
        'Biên độ lợi nhuận gộp từ 30% trở lên.',
        'Trọng lượng nhỏ gọn dưới 1kg để tiết kiệm phí ship.',
        'Có chu kỳ tiêu dùng lặp lại 30-60 ngày.'
      ]}
    ]
  },
  {
    title: 'Hành trình Partner: Từ những ngày đầu bỡ ngỡ đến 50 đơn hàng ổn định mỗi ngày',
    slug: 'nhat-ky-dong-hanh-partner-kdol',
    category: 'Hành trình Partner',
    tags: ['partner', 'dong hanh', 'cong dong'],
    readTime: '5 phút đọc',
    thumbnail: 'assets/images/article-default.svg',
    thumbnailIcon: 'heart',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Tinh thần tương trợ trong cộng đồng Partner',
    excerpt: 'Chia sẻ câu chuyện thật về quá trình tháo gỡ điểm nghẽn đóng gói, cải thiện đánh giá 5 sao và tinh thần đồng hành bền bỉ của cộng đồng.',
    featured: false,
    status: 'published',
    publishedAt: new Date('2026-10-29'),
    content: [
      { type: 'paragraph', text: 'Muốn đi nhanh hãy đi một mình, muốn đi xa và an tâm vượt bão thị trường thì phải có cộng đồng đồng hành.' },
      { type: 'heading2', text: '1. Thay đổi tư duy từ bán tháo sang chăm sóc' },
      { type: 'paragraph', text: 'Ghi nhớ tên khách hàng và chủ động hỏi thăm sau 3 ngày nhận hàng đã giúp tỷ lệ quay lại tăng gấp đôi.' }
    ]
  },
  {
    title: 'Quy trình 3 bước xác nhận đơn và kiểm soát tỷ lệ bom hàng dưới 5%',
    slug: 'xu-ly-khung-hoang-hoan-hang-duoi-5-phan-tram',
    category: 'Kiến thức KDOL',
    tags: ['kdol', 'hoan hang', 'van hanh'],
    readTime: '6 phút đọc',
    thumbnail: 'assets/images/article-default.svg',
    thumbnailIcon: 'box',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Kiểm soát tỷ lệ hoàn hàng và bảo toàn vốn lưu động',
    excerpt: 'Cách nhắn tin xác nhận địa chỉ, gọi điện chăm sóc thời điểm giao hàng và xử lý khéo léo khi khách hàng có dấu hiệu từ chối nhận.',
    featured: false,
    status: 'published',
    publishedAt: new Date('2026-10-27'),
    content: [
      { type: 'paragraph', text: '10 giây xác nhận địa chỉ trước khi gửi hàng sẽ cứu bạn khỏi 100.000đ tiền ship hoàn vô nghĩa.' },
      { type: 'heading2', text: '1. Ba mốc thời gian liên hệ khách' },
      { type: 'list', format: 'ordered', items: [
        'Ngay sau khi chốt đơn: Xác nhận số điện thoại và địa chỉ cụ thể.',
        'Khi bưu tá chuẩn bị phát: Nhắn tin thông báo kiện hàng đã tới trạm giao.',
        'Sau khi nhận 24h: Hỏi thăm tình trạng kiện hàng và hướng dẫn sử dụng.'
      ]}
    ]
  },
  {
    title: 'Kinh nghiệm chọn lọc sản phẩm chất lượng trên nền tảng Droppii cho người mới',
    slug: 'lua-chon-danh-muc-san-pham-droppii',
    category: 'Nền tảng Droppii',
    tags: ['droppii', 'san pham', 'lua chon'],
    readTime: '5 phút đọc',
    thumbnail: 'assets/images/article-dropshipping.svg',
    thumbnailIcon: 'check',
    featuredImage: 'assets/images/article-dropshipping.svg',
    featuredImageCaption: 'Chiến lược lựa chọn sản phẩm phễu trên Droppii',
    excerpt: 'Đánh giá giấy tờ pháp lý sản phẩm, phản hồi thực tế từ thị trường và cách xây dựng combo bán kèm gia tăng giá trị đơn hàng.',
    featured: false,
    status: 'published',
    publishedAt: new Date('2026-10-25'),
    content: [
      { type: 'paragraph', text: 'Không nên bán quá nhiều mặt hàng cùng lúc, hãy tập trung sâu vào 2-3 sản phẩm phễu bạn thực sự am hiểu.' }
    ]
  },
  {
    title: 'Xử lý phản đối "Giá đắt thế": Chuyển hướng sự chú ý sang giá trị thực tế',
    slug: 'ky-nang-xu-ly-khi-khach-che-gia-cao',
    category: 'Kỹ năng bán hàng',
    tags: ['sales', 'gia ca', 'phan doi'],
    readTime: '4 phút đọc',
    thumbnail: 'assets/images/article-default.svg',
    thumbnailIcon: 'chat',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Nâng cao giá trị cảm nhận để giải tỏa nỗi lo về giá',
    excerpt: 'Cách phân tích bài toán chi phí sử dụng theo ngày, đưa ra cam kết bảo hành và nâng tầm trải nghiệm của người tiêu dùng.',
    featured: false,
    status: 'published',
    publishedAt: new Date('2026-10-22'),
    content: [
      { type: 'paragraph', text: 'Chia nhỏ chi phí theo ngày (Cost-per-day) giúp khách hàng nhận thấy khoản chi rất nhỏ so với lợi ích nhận được.' }
    ]
  },
  {
    title: 'Affiliate Marketing đa kênh: Cách xây dựng nội dung chuyển đổi không phụ thuộc trend',
    slug: 'xay-dung-kenh-affiliate-ben-vung',
    category: 'TikTok & Affiliate',
    tags: ['tiktok', 'affiliate', 'evergreen'],
    readTime: '5 phút đọc',
    thumbnail: 'assets/images/article-default.svg',
    thumbnailIcon: 'video',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Nội dung số bền vững không lỗi thời',
    excerpt: 'Tập trung vào chuỗi nội dung giải quyết nỗi đau của khách hàng (Pain-point solving) để giữ lượng view và hoa hồng đều đặn theo thời gian.',
    featured: false,
    status: 'published',
    publishedAt: new Date('2026-10-20'),
    content: [
      { type: 'paragraph', text: 'Nội dung giải quyết nỗi đau thường trực (Evergreen) luôn duy trì được lượt xem và đơn hàng đều đặn.' }
    ]
  },
  {
    title: 'Nghệ thuật chăm sóc sau bán: Biến khách mua 1 lần thành đại sứ thương hiệu',
    slug: 'nghe-thuat-cham-soc-khach-hang-sau-ban',
    category: 'Marketing online',
    tags: ['marketing', 'cham soc', 'khach hang'],
    readTime: '5 phút đọc',
    thumbnail: 'assets/images/article-default.svg',
    thumbnailIcon: 'heart',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Biến khách hàng cũ thành người giới thiệu tự nhiên',
    excerpt: 'Quy tắc 1-3-7 ngày sau khi giao hàng: thời điểm vàng để nhắn tin hỏi thăm cách dùng và gửi tặng ưu đãi khách hàng thân thiết.',
    featured: false,
    status: 'published',
    publishedAt: new Date('2026-10-17'),
    content: [
      { type: 'paragraph', text: 'Một đơn hàng giao thành công là khởi đầu của mối quan hệ lâu dài, hãy áp dụng quy tắc chăm sóc 1-3-7 ngày.' }
    ]
  }
];

// 4. Hồ sơ Partner Demo (Không chứa thông tin cá nhân thật)
const samplePartners = [
  {
    fullName: 'Nguyễn Văn Mẫu (Demo Lead)',
    phone: '0900000001',
    email: 'demo.partner1@example.com',
    province: 'Hà Nội',
    occupation: 'Nhân viên văn phòng',
    goals: ['Kiếm thêm thu nhập', 'Khởi nghiệp KDOL'],
    experience: 'Chưa có kinh nghiệm',
    interests: ['Cà phê sức khỏe', 'Sức khỏe'],
    availableTime: '1–3 giờ',
    startWhen: 'Bắt đầu ngay',
    preferredContact: 'Zalo',
    consent: true,
    source: 'website_demo',
    status: 'pending',
    notes: 'Dữ liệu mẫu thử nghiệm hệ thống'
  },
  {
    fullName: 'Trần Thị Mẫu (Demo Lead)',
    phone: '0900000002',
    email: 'demo.partner2@example.com',
    province: 'TP. Hồ Chí Minh',
    occupation: 'Kinh doanh tự do / Chủ shop',
    goals: ['Phát triển kênh bán hàng', 'Xây dựng đội nhóm'],
    experience: 'Đã từng bán hàng online',
    interests: ['Yến sào', 'Mỹ phẩm'],
    availableTime: 'Trên 3 giờ',
    startWhen: 'Trong 7 ngày tới',
    preferredContact: 'Zalo',
    consent: true,
    source: 'website_demo',
    status: 'contacted',
    notes: 'Dữ liệu mẫu thử nghiệm hệ thống'
  }
];

// 5. Cấu hình Website công khai
const sampleSettings = [
  { key: 'site_name', value: 'Thầy Giáo KDOL' },
  { key: 'site_slogan', value: '1 đơn hàng - 1 nụ cười' },
  { key: 'contact_phone', value: '0000000000' },
  { key: 'contact_zalo', value: 'https://zalo.me/placeholder_kdol' },
  { key: 'contact_messenger', value: 'https://m.me/placeholder_kdol' },
  { key: 'max_mobile_width', value: 430 }
];

// 6. Tài khoản Quản trị Demo
const sampleAdmin = {
  username: 'kdol_admin',
  passwordHash: '$2b$10$demoHashPlaceholderForSecurityDoNotUseInRealProduction123456',
  role: 'admin'
};

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Chưa cấu hình MONGODB_URI trong .env');
    }

    console.log('[Seed Script] ⏳ Đang kết nối tới MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('[Seed Script] ✅ Kết nối thành công!');

    // 1. Chuyên mục
    await Category.deleteMany({});
    await Category.insertMany(sampleCategories);
    console.log(`[Seed] ✓ Đã nạp ${sampleCategories.length} chuyên mục.`);

    // 2. Banners
    await Banner.deleteMany({});
    await Banner.insertMany(sampleBanners);
    console.log(`[Seed] ✓ Đã nạp ${sampleBanners.length} banners trang chủ.`);

    // 3. Bài viết
    await Post.deleteMany({});
    await Post.insertMany(samplePosts);
    console.log(`[Seed] ✓ Đã nạp ${samplePosts.length} bài viết chuẩn.`);

    // 4. Partner Demo
    await Partner.deleteMany({ source: 'website_demo' });
    await Partner.insertMany(samplePartners);
    console.log(`[Seed] ✓ Đã nạp ${samplePartners.length} hồ sơ Partner demo an toàn.`);

    // 5. Cấu hình Website
    for (const setting of sampleSettings) {
      await Setting.findOneAndUpdate(
        { key: setting.key },
        { value: setting.value },
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log(`[Seed] ✓ Đã nạp ${sampleSettings.length} cấu hình hệ thống.`);

    // 6. Tài khoản quản trị
    const existingAdmin = await Admin.findOne({ username: sampleAdmin.username });
    if (!existingAdmin) {
      await Admin.create(sampleAdmin);
      console.log(`[Seed] ✓ Đã tạo tài khoản quản trị mẫu: ${sampleAdmin.username}`);
    } else {
      console.log(`[Seed] ℹ Tài khoản quản trị '${sampleAdmin.username}' đã tồn tại.`);
    }

    console.log('\n======================================================');
    console.log('  🎉 HOÀN TẤT SEED DỮ LIỆU ĐẦY ĐỦ AN TOÀN CHO THẦY GIÁO KDOL');
    console.log('======================================================\n');
  } catch (error) {
    console.error('[Seed Error] ❌ Lỗi khi seed dữ liệu:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('[Seed Script] 🔌 Đã đóng kết nối cơ sở dữ liệu.');
    process.exit(0);
  }
};

seedDatabase();
