/**
 * Mock Data Module cho Thầy Giáo KDOL
 * Slogan: "1 đơn hàng - 1 nụ cười"
 * 
 * Lưu ý: Dữ liệu mẫu (mock data) tự xây dựng an toàn, không chứa HTML chưa kiểm soát.
 * Sẵn sàng kết nối API Backend trong giai đoạn tiếp theo (khi tích hợp backend phải sanitize HTML phía server).
 */

// Danh sách banner cho slider trang chủ (Chỉ cần image và url tỷ lệ 2:1)
export const BANNERS_DATA = [
  {
    id: 1,
    image: 'assets/images/banner-partner.svg',
    url: 'dang-ky-partner.html',
    link: 'dang-ky-partner.html',
    order: 1,
    active: true
  },
  {
    id: 2,
    image: 'assets/images/banner-kdol.svg',
    url: 'bai-viet.html?slug=kdol-la-gi',
    link: 'bai-viet.html?slug=kdol-la-gi',
    order: 2,
    active: true
  },
  {
    id: 3,
    image: 'assets/images/banner-droppii.svg',
    url: 'bai-viet.html?slug=droppii-la-gi',
    link: 'bai-viet.html?slug=droppii-la-gi',
    order: 3,
    active: true
  }
];

// Danh mục chuẩn cho Horizontal Scroll Chips tại trang Kiến thức
export const BLOG_CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'kdol', label: 'Kiến thức KDOL' },
  { id: 'droppii', label: 'Nền tảng Droppii' },
  { id: 'sales', label: 'Kỹ năng bán hàng' },
  { id: 'tiktok', label: 'TikTok & Affiliate' },
  { id: 'marketing', label: 'Marketing online' },
  { id: 'products', label: 'Sản phẩm & ngành hàng' },
  { id: 'partner', label: 'Hành trình Partner' }
];

// Danh sách bài viết kiến thức kinh doanh online với cấu trúc dữ liệu an toàn (Structured Blocks)
export const ARTICLES_DATA = [
  {
    id: 1,
    slug: 'kinh-doanh-online-la-gi',
    aliases: ['kdol-la-gi-toan-canh-thuc-chien'],
    title: 'KDOL là gì? Cẩm nang kinh doanh online thực chiến từ số 0 cho người mới',
    category: 'Kiến thức KDOL',
    categorySlug: 'kdol',
    categoryClass: 'badge-primary',
    date: '11/11/2026',
    readTime: '8 phút đọc',
    excerpt: 'Toàn cảnh định nghĩa KDOL, 3 giai đoạn phát triển bắt buộc phải trải qua và tư duy quản trị dòng tiền để không rơi vào bẫy lãi ảo trên sàn TMĐT.',
    featured: true,
    isHeroFeatured: true,
    isLatest: true,
    thumbnailIcon: 'book',
    featuredImage: 'assets/images/article-kdol-overview.svg',
    featuredImageCaption: 'Mô hình kinh doanh online tinh gọn: Nguồn hàng chuẩn - Tư vấn đúng - Khách hàng hài lòng',
    contentBlocks: [
      {
        type: 'paragraph',
        text: 'Rất nhiều người bước chân vào kinh doanh online (KDOL) với ảo tưởng chỉ cần đăng bài lên mạng xã hội hoặc chạy quảng cáo là tiền sẽ tự động chảy về tài khoản. Tuy nhiên, sau vài tháng thực chiến, không ít người phải ngậm ngùi rời bỏ thị trường vì hàng tồn kho chất đống, chi phí vận hành nuốt trọn lợi nhuận gộp.'
      },
      {
        type: 'callout',
        strong: 'Triết lý Thầy Giáo KDOL: ',
        text: 'KDOL không phải là trò chơi "lướt sóng" ngắn hạn. "1 đơn hàng - 1 nụ cười" nghĩa là tạo ra giá trị thực sự cho người tiêu dùng để họ hài lòng, tin tưởng và quay trở lại mua nhiều lần với chi phí quảng cáo bằng 0 đồng.'
      },
      {
        type: 'heading2',
        text: '1. Bản chất thực sự của KDOL (Kinh doanh online)'
      },
      {
        type: 'paragraph',
        text: 'Về mặt bản chất, KDOL là việc ứng dụng công nghệ và mạng Internet để tối ưu hóa quá trình tiếp cận khách hàng, quản lý đơn hàng và giao vận. Khác với cửa hàng truyền thống phụ thuộc vào mặt bằng cố định, một mô hình KDOL chuẩn mực mang lại tính linh hoạt cao nhưng đòi hỏi kỷ luật quản trị khắt khe.'
      },
      {
        type: 'image',
        src: 'assets/images/article-kdol-overview.svg',
        alt: 'Sơ đồ luồng vận hành kinh doanh online tinh gọn',
        caption: 'Quy trình 3 trụ cột vững chắc giúp nhà bán hàng tự tin duy trì dòng tiền dương'
      },
      {
        type: 'heading3',
        text: '1.1 Cạm bẫy "Doanh thu ảo - Lợi nhuận âm"'
      },
      {
        type: 'paragraph',
        text: 'Nhiều người khoe doanh thu hàng trăm triệu mỗi tháng, nhưng khi bóc tách chi phí thực tế thì hoàn toàn bất ngờ: phí sàn TMĐT từ 12-18%, chi phí quảng cáo 25-35%, chi phí đóng gói & hư hao 5%, tỷ lệ hoàn hàng 10-15%. Kết quả là chủ gian hàng làm việc không ngày nghỉ nhưng tài khoản ngân hàng không hề tích lũy.'
      },
      {
        type: 'heading2',
        text: '2. Ba giai đoạn phát triển bắt buộc của người làm KDOL'
      },
      {
        type: 'list',
        format: 'ordered',
        items: [
          'Giai đoạn 1 - Kiểm chứng thị trường (0 - 3 tháng): Tập trung tìm kiếm sản phẩm ngách có biên độ lợi nhuận tốt, nhu cầu thực và không đòi hỏi vốn lưu kho quá lớn (ưu tiên mô hình Dropshipping hoặc liên kết đối tác).',
          'Giai đoạn 2 - Chuẩn hóa vận hành (3 - 6 tháng): Xây dựng kịch bản tư vấn chốt đơn, kiểm soát chặt chẽ tỷ lệ hoàn hàng dưới mức 5% và đo lường chi phí thu hút khách hàng (CAC).',
          'Giai đoạn 3 - Xây dựng tệp khách trung thành (6 tháng trở lên): Ứng dụng phễu chăm sóc khách hàng tự động, biến mỗi khách hàng cũ thành người giới thiệu sản phẩm mới.'
        ]
      },
      {
        type: 'heading2',
        text: '3. Tư duy quản trị dòng tiền bền vững'
      },
      {
        type: 'paragraph',
        text: 'Doanh thu là phù phiếm, lợi nhuận ròng là hiện thực, nhưng dòng tiền mới chính là dòng máu nuôi sống doanh nghiệp. Hãy luôn duy trì lượng tiền mặt dự phòng đủ vận hành trong ít nhất 3 tháng và nói không với việc vay mượn lãi cao để nhập hàng khi chưa nắm rõ đầu ra.'
      },
      {
        type: 'paragraph',
        text: 'Nếu bạn đang tìm kiếm một lộ trình đồng hành bài bản, hãy khám phá chương trình ',
        link: {
          text: 'Đăng ký đối tác Partner KDOL',
          url: 'dang-ky-partner.html'
        }
      }
    ]
  },
  {
    id: 2,
    slug: 'hieu-dung-ve-mo-hinh-dropshipping-droppii',
    aliases: ['dropshipping-droppii-la-gi'],
    title: 'Tìm hiểu mô hình Dropshipping: Quy trình xử lý đơn hàng và kiểm soát chất lượng',
    category: 'Nền tảng Droppii',
    categorySlug: 'droppii',
    categoryClass: 'badge-secondary',
    date: '09/11/2026',
    readTime: '6 phút đọc',
    excerpt: 'Khám phá cách thức vận hành chuỗi cung ứng, từ khâu đóng gói trung tâm đến kiểm tra sản phẩm chính hãng mà không cần người bán phải ôm hàng tồn kho.',
    featured: true,
    isHeroFeatured: false,
    isLatest: true,
    thumbnailIcon: 'box',
    featuredImage: 'assets/images/article-dropshipping.svg',
    featuredImageCaption: 'Sơ đồ luồng xử lý đơn hàng Dropshipping trung tâm khép kín',
    contentBlocks: [
      {
        type: 'paragraph',
        text: 'Dropshipping từ lâu đã là giải pháp khởi nghiệp thương mại điện tử được nhiều cá nhân lựa chọn nhờ khả năng loại bỏ gánh nặng nhập hàng và lưu kho. Tuy nhiên, để vận hành mô hình này thành công tại Việt Nam, việc lựa chọn nền tảng uy tín có kho bãi chuẩn mực là yếu tố quyết định.'
      },
      {
        type: 'callout',
        strong: 'Quan điểm trung thực: ',
        text: 'Dropshipping không phải là công cụ làm giàu cấp tốc hay việc "ngồi mát ăn bát vàng". Đây là mô hình phân công lao động văn minh: nền tảng lo kho vận, người bán tập trung làm tốt khâu tư vấn và chăm sóc khách hàng.'
      },
      {
        type: 'heading2',
        text: '1. Quy trình xử lý đơn hàng Dropshipping diễn ra như thế nào?'
      },
      {
        type: 'paragraph',
        text: 'Trong quy trình chuẩn, người bán không cần trực tiếp chạm tay vào kiện hàng. Thay vào đó, mọi khâu từ kiểm đếm, đóng gói bọt khí đến dán tem vận chuyển đều được thực hiện tại các trung tâm xử lý đơn hàng chuyên nghiệp.'
      },
      {
        type: 'image',
        src: 'assets/images/article-dropshipping.svg',
        alt: 'Quy trình xử lý đơn hàng Dropshipping',
        caption: '4 bước tinh gọn từ lúc khách chốt đơn đến khi nhận hàng tận tay'
      },
      {
        type: 'heading2',
        text: '2. Tiêu chí đánh giá nền tảng cung ứng tin cậy'
      },
      {
        type: 'list',
        format: 'unordered',
        items: [
          'Hồ sơ pháp lý, giấy công bố sản phẩm và hóa đơn VAT đầy đủ theo quy định của pháp luật.',
          'Kho bãi đạt chuẩn kiểm soát nhiệt độ, độ ẩm giúp bảo quản thực phẩm chức năng và mỹ phẩm an toàn.',
          'Chính sách cam kết chất lượng rõ ràng, hỗ trợ đổi trả nếu sản phẩm có lỗi từ nhà sản xuất.',
          'Ứng dụng công nghệ cập nhật trạng thái đơn hàng theo thời gian thực (Real-time tracking).'
        ]
      },
      {
        type: 'heading3',
        text: '2.1 Trách nhiệm của người bán hàng tư vấn'
      },
      {
        type: 'paragraph',
        text: 'Dù được giải phóng khỏi áp lực kho bãi, người bán phải luôn là người hiểu rõ sản phẩm nhất. Bạn cần tìm hiểu kỹ thành phần, công dụng và đối tượng sử dụng để tư vấn đúng nhu cầu, tuyệt đối không thổi phồng công dụng sản phẩm.'
      }
    ]
  },
  {
    id: 3,
    slug: 'kich-ban-tu-van-chot-don-tu-nhien',
    aliases: ['kich-ban-chot-don'],
    title: 'Kịch bản tư vấn chốt đơn 4 bước: Tăng tỷ lệ chuyển đổi mà không gây phiền hà',
    category: 'Kỹ năng bán hàng',
    categorySlug: 'sales',
    categoryClass: 'badge-neutral',
    date: '07/11/2026',
    readTime: '5 phút đọc',
    excerpt: 'Cách lắng nghe vấn đề của khách hàng, đặt câu hỏi gợi mở nhu cầu và đưa ra đề xuất giải pháp đúng lúc, đúng tâm lý người tiêu dùng.',
    featured: true,
    isHeroFeatured: false,
    isLatest: true,
    thumbnailIcon: 'chat',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Nghệ thuật giao tiếp và lắng nghe chân thành trong tư vấn bán hàng',
    contentBlocks: [
      {
        type: 'paragraph',
        text: 'Khách hàng ngày nay rất tinh ý và dị ứng với những lời chào mời hối thúc dồn dập. Một nhân viên tư vấn xuất sắc không phải là người nói nhiều nhất, mà là người biết đặt câu hỏi đúng để khách hàng tự nhận ra giải pháp họ đang tìm kiếm.'
      },
      {
        type: 'callout',
        strong: 'Nguyên tắc vàng: ',
        text: 'Đừng cố bán cái bạn có. Hãy giúp khách hàng giải quyết vấn đề họ đang gặp phải. Khi vấn đề được tháo gỡ, đơn hàng sẽ đến một cách tự nhiên kèm theo nụ cười hài lòng.'
      },
      {
        type: 'heading2',
        text: '1. Kịch bản tư vấn 4 bước thực chiến'
      },
      {
        type: 'list',
        format: 'ordered',
        items: [
          'Bước 1 - Tạo thiện cảm & Phá vỡ khoảng cách: Chào hỏi lịch sự, xưng hô tôn trọng và xác nhận lại lý do khách hàng nhắn tin hoặc quan tâm đến sản phẩm.',
          'Bước 2 - Lắng nghe & Đặt câu hỏi thấu cảm: Đặt 2-3 câu hỏi mở để làm rõ tình trạng hiện tại, thói quen sinh hoạt hoặc sản phẩm họ từng sử dụng trước đây.',
          'Bước 3 - Đề xuất giải pháp phù hợp ngân sách: Phân tích lý do vì sao liệu trình hoặc sản phẩm này phù hợp với tình trạng cụ thể của họ, chỉ rõ các lợi ích thực tế.',
          'Bước 4 - Hướng dẫn chốt đơn nhẹ nhàng: Thay vì hỏi "Anh/Chị có mua không?", hãy hỏi "Anh/Chị muốn nhận hàng tại địa chỉ nhà riêng hay văn phòng làm việc?".'
        ]
      },
      {
        type: 'heading2',
        text: '2. Xử lý khi khách hàng im lặng (Seen không rep)'
      },
      {
        type: 'paragraph',
        text: 'Đừng vội nản lòng hoặc nhắn tin trách móc. Sau 4-6 tiếng, hãy gửi cho họ một thông tin hữu ích liên quan đến vấn đề của họ (ví dụ: bài viết mẹo hay, hướng dẫn sử dụng) kèm câu hỏi nhẹ nhàng: "Em gửi anh/chị tham khảo mẹo này nhé ạ". Tỷ lệ phản hồi lại thường tăng trên 40%.'
      }
    ]
  },
  {
    id: 4,
    slug: 'xay-dung-video-ngan-tiktok-affiliate',
    aliases: ['tiktok-affiliate-cho-nguoi-moi'],
    title: 'Xây dựng luồng video ngắn gắn giỏ hàng chuyển đổi cao không cần lộ mặt',
    category: 'TikTok & Affiliate',
    categorySlug: 'tiktok',
    categoryClass: 'badge-neutral',
    date: '05/11/2026',
    readTime: '4 phút đọc',
    excerpt: 'Phương pháp khai thác tính năng thực tế của sản phẩm, thiết lập hook 3 giây đầu giữ chân người xem và gắn link affiliate tự nhiên.',
    featured: true,
    isHeroFeatured: false,
    isLatest: true,
    thumbnailIcon: 'video',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Cách sáng tạo nội dung video ngắn giải quyết đúng nỗi đau người xem',
    contentBlocks: [
      {
        type: 'paragraph',
        text: 'Nhiều bạn mới bắt đầu làm TikTok Affiliate thường lo ngại việc phải xuất hiện trước ống kính. Thực tế chứng minh, những video quay cận cảnh chi tiết sản phẩm và quá trình giải quyết vấn đề thực tế lại thường mang lại tỷ lệ chuyển đổi đơn hàng cao hơn.'
      },
      {
        type: 'callout',
        strong: 'Bí quyết nội dung: ',
        text: '3 giây đầu tiên quyết định 80% thành bại của một video ngắn. Hãy mở đầu bằng một câu hỏi trúng nỗi đau hoặc hình ảnh kết quả trước/sau rõ rệt.'
      },
      {
        type: 'heading2',
        text: '1. Cấu trúc một video ngắn chuyển đổi cao'
      },
      {
        type: 'list',
        format: 'unordered',
        items: [
          '0 - 3 giây: Hook thị giác hoặc âm thanh nêu bật vấn đề nhức nhối.',
          '4 - 15 giây: Trực tiếp trải nghiệm và thử nghiệm tính năng nổi bật của sản phẩm.',
          '16 - 30 giây: Hướng dẫn mẹo sử dụng kèm lời kêu gọi kiểm tra giỏ hàng màu vàng góc trái màn hình.'
        ]
      },
      {
        type: 'heading2',
        text: '2. Tuân thủ chính sách cộng đồng của nền tảng'
      },
      {
        type: 'paragraph',
        text: 'Tuyệt đối tránh sử dụng các từ ngữ mang tính cam kết tuyệt đối (như "100%", "chữa khỏi dứt điểm", "rẻ nhất thị trường"). Hãy chia sẻ dựa trên cảm nhận trung thực để xây dựng kênh lâu dài, tránh bị quét vi phạm tiêu chuẩn cộng đồng.'
      }
    ]
  },
  {
    id: 5,
    slug: 'toi-uu-chi-phi-quang-cao-roas',
    aliases: ['toi-uu-roas-quang-cao'],
    title: 'Bí quyết tối ưu chi phí quảng cáo (ROAS) và giữ chân khách hàng quay lại',
    category: 'Marketing online',
    categorySlug: 'marketing',
    categoryClass: 'badge-primary',
    date: '03/11/2026',
    readTime: '6 phút đọc',
    excerpt: 'Chiến thuật cắt tỉa nhóm Ads kém hiệu quả, tối ưu trang đích và xây dựng kịch bản tái tiếp thị 0 đồng qua kênh chăm sóc khách hàng.',
    featured: true,
    isHeroFeatured: false,
    isLatest: true,
    thumbnailIcon: 'chart',
    featuredImage: 'assets/images/article-marketing-ads.svg',
    featuredImageCaption: 'So sánh tư duy đốt tiền quảng cáo và phương pháp giữ chân khách hàng bền vững',
    contentBlocks: [
      {
        type: 'paragraph',
        text: 'Rất nhiều nhà bán hàng online rơi vào tình cảnh: "Đơn hàng nổ rào rào nhưng tiền lãi thì chẳng thấy đâu". Nguyên nhân lớn nhất đến từ việc chi phí quảng cáo (Ads) nuốt trọn biên độ lợi nhuận gộp của sản phẩm.'
      },
      {
        type: 'callout',
        strong: 'Triết lý Thầy Giáo KDOL: ',
        text: 'Đừng chỉ chăm chăm bán 1 lần rồi thôi. "1 đơn hàng - 1 nụ cười" nghĩa là mang lại trải nghiệm vượt mong đợi để khách hàng mua lần 2, lần 3 với chi phí quảng cáo bằng 0 đồng.'
      },
      {
        type: 'heading2',
        text: '1. Cắt tỉa nhóm quảng cáo kém hiệu quả'
      },
      {
        type: 'paragraph',
        text: 'Đa số người chạy Ads thường có tâm lý tiếc tiền nên giữ lại các chiến dịch đang cắn tiền nhưng không ra đơn. Quy tắc thực chiến chuẩn:'
      },
      {
        type: 'list',
        format: 'unordered',
        items: [
          'Kiểm tra chỉ số chi phí trên mỗi kết quả (Cost per Result) theo từng khung giờ.',
          'Tắt thẳng tay các nhóm có chi phí vượt quá ngưỡng hòa vốn sau khi đã tiếp cận đủ mẫu 500 lượt hiển thị.',
          'Tập trung 80% ngân sách vào các nhóm quảng cáo đem lại ROAS từ 3.5 trở lên.'
        ]
      },
      {
        type: 'image',
        src: 'assets/images/article-marketing-ads.svg',
        alt: 'Chiến thuật tối ưu chi phí quảng cáo bền vững',
        caption: 'Chuyển đổi từ chi tiền mù quáng sang kiểm soát chỉ số ROAS thực tế'
      },
      {
        type: 'heading2',
        text: '2. Tối ưu trang đích và kịch bản chốt sale'
      },
      {
        type: 'paragraph',
        text: 'Tăng gấp đôi ngân sách không giúp bạn có gấp đôi đơn hàng nếu tỷ lệ chuyển đổi của bạn quá thấp. Hãy cải thiện 3 điểm mấu chốt:'
      },
      {
        type: 'list',
        format: 'ordered',
        items: [
          'Tốc độ tải trang hoặc thời gian phản hồi tin nhắn phải dưới 30 giây.',
          'Hình ảnh và video phải thể hiện trực quan vấn đề thực tế của khách hàng.',
          'Kêu gọi hành động (CTA) dứt khoát, minh bạch về chính sách đổi trả và freeship.'
        ]
      },
      {
        type: 'heading2',
        text: '3. Xây dựng phễu chăm sóc khách hàng tự động'
      },
      {
        type: 'paragraph',
        text: 'Chi phí để có 1 khách hàng mới cao gấp 5 đến 7 lần chi phí giữ chân khách hàng cũ. Hãy chủ động tạo kết nối qua Zalo OA hoặc tin nhắn hậu mãi sau khi khách nhận hàng 24 giờ.'
      }
    ]
  },
  {
    id: 6,
    slug: 'cach-nghien-cuu-thi-truong-ngach',
    title: 'Phương pháp thẩm định sản phẩm và lựa chọn ngành hàng ít cạnh tranh giá',
    category: 'Sản phẩm & ngành hàng',
    categorySlug: 'products',
    categoryClass: 'badge-primary',
    date: '01/11/2026',
    readTime: '7 phút đọc',
    excerpt: 'Tiêu chí 5 điểm đánh giá vòng đời sản phẩm, biên độ lợi nhuận gộp và mức độ thỏa mãn nhu cầu tiêu dùng lặp lại.',
    featured: false,
    isHeroFeatured: false,
    isLatest: true,
    thumbnailIcon: 'search',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Tiêu chuẩn thẩm định sản phẩm trước khi đưa vào phễu phân phối',
    contentBlocks: [
      {
        type: 'paragraph',
        text: 'Bán cái gì để không bị cuốn vào vòng xoáy giảm giá sát ván? Câu trả lời nằm ở việc lựa chọn sản phẩm có rào cản chất lượng và giải quyết nhu cầu đặc thù của một nhóm khách hàng cụ thể.'
      },
      {
        type: 'callout',
        strong: 'Lời khuyên lựa chọn: ',
        text: 'Tránh xa các mặt hàng thời trang đại trà hoặc đồ gia dụng không thương hiệu. Hãy ưu tiên ngành hàng sức khỏe, sắc đẹp hoặc tiện ích gia đình có giấy tờ kiểm định rõ ràng.'
      },
      {
        type: 'heading2',
        text: '1. Tiêu chí 5 điểm lựa chọn sản phẩm KDOL'
      },
      {
        type: 'list',
        format: 'unordered',
        items: [
          'Biên độ lợi nhuận gộp tối thiểu từ 30% trở lên sau khi trừ toàn bộ chi phí vận hành.',
          'Trọng lượng nhỏ gọn (dưới 1kg) giúp tiết kiệm phí vận chuyển và giảm tỷ lệ móp méo khi giao.',
          'Có khả năng tiêu dùng lặp lại định kỳ (30 - 60 ngày hết một chu kỳ sử dụng).',
          'Nguồn cung ứng ổn định, không bị đứt gãy hàng trong mùa cao điểm.'
        ]
      }
    ]
  },
  {
    id: 7,
    slug: 'nhat-ky-dong-hanh-partner-kdol',
    title: 'Hành trình Partner: Từ những ngày đầu bỡ ngỡ đến 50 đơn hàng ổn định mỗi ngày',
    category: 'Hành trình Partner',
    categorySlug: 'partner',
    categoryClass: 'badge-secondary',
    date: '29/10/2026',
    readTime: '5 phút đọc',
    excerpt: 'Chia sẻ câu chuyện thật về quá trình tháo gỡ điểm nghẽn đóng gói, cải thiện đánh giá 5 sao và tinh thần đồng hành bền bỉ của cộng đồng.',
    featured: false,
    isHeroFeatured: false,
    isLatest: true,
    thumbnailIcon: 'heart',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Tinh thần tương trợ và đồng hành cùng nhau phát triển trong cộng đồng Partner',
    contentBlocks: [
      {
        type: 'paragraph',
        text: 'Kinh doanh online không phải là con đường trải đầy hoa hồng. Có những ngày thức trắng kiểm tra đơn, có những lúc khách khiếu nại vì đơn vị vận chuyển làm chậm trễ. Nhưng chính sự kiên trì và một cộng đồng đồng hành đã giúp các Partner vượt qua.'
      },
      {
        type: 'callout',
        strong: 'Giá trị cộng đồng: ',
        text: 'Đi một mình bạn có thể đi nhanh, nhưng muốn đi xa và an tâm vượt bão thị trường thì phải đi cùng đồng đội có chung hệ giá trị tử tế.'
      },
      {
        type: 'heading2',
        text: '1. Bước ngoặt từ tư duy "bán tháo" sang "chăm sóc tận tâm"'
      },
      {
        type: 'paragraph',
        text: 'Khi bắt đầu ghi nhớ tên khách hàng, gọi điện hướng dẫn sử dụng và lắng nghe phản hồi chân thành, tỷ lệ đơn hàng giới thiệu từ người quen đã tăng vọt ngoài mong đợi.'
      }
    ]
  },
  {
    id: 8,
    slug: 'xu-ly-khung-hoang-hoan-hang-duoi-5-phan-tram',
    title: 'Quy trình 3 bước xác nhận đơn và kiểm soát tỷ lệ bom hàng dưới 5%',
    category: 'Kiến thức KDOL',
    categorySlug: 'kdol',
    categoryClass: 'badge-primary',
    date: '27/10/2026',
    readTime: '6 phút đọc',
    excerpt: 'Cách nhắn tin xác nhận địa chỉ, gọi điện chăm sóc thời điểm giao hàng và xử lý khéo léo khi khách hàng có dấu hiệu từ chối nhận.',
    featured: false,
    isHeroFeatured: false,
    isLatest: false,
    thumbnailIcon: 'box',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Quy trình đối soát và xác nhận đơn hàng kiểm soát rủi ro giao nhận',
    contentBlocks: [
      {
        type: 'paragraph',
        text: 'Hoàn hàng (bom hàng) là nỗi đau thầm kín của mọi nhà bán hàng online. Mỗi kiện hàng bị hoàn về không chỉ mất phí ship 2 chiều mà còn làm hỏng bao bì và đọng vốn lưu động.'
      },
      {
        type: 'callout',
        strong: 'Quy tắc vàng: ',
        text: 'Đừng vội gửi hàng khi địa chỉ chưa cụ thể đến số nhà/thôn xóm. 10 giây gọi điện xác nhận trước sẽ cứu bạn khỏi 100.000đ tiền ship hoàn vô nghĩa.'
      },
      {
        type: 'heading2',
        text: '1. Ba thời điểm then chốt để liên hệ khách hàng'
      },
      {
        type: 'list',
        format: 'ordered',
        items: [
          'Ngay sau khi đặt: Nhắn tin xác nhận số điện thoại, quy cách đóng gói và thời gian dự kiến nhận.',
          'Khi bưu tá chuẩn bị giao: Nhắn tin thông báo kiện hàng đã tới trạm giao gần nhà khách.',
          'Sau khi nhận 24 giờ: Hỏi thăm tình trạng kiện hàng và hướng dẫn kích hoạt bảo hành.'
        ]
      }
    ]
  },
  {
    id: 9,
    slug: 'lua-chon-danh-muc-san-pham-droppii',
    title: 'Kinh nghiệm chọn lọc sản phẩm chất lượng trên nền tảng Droppii cho người mới',
    category: 'Nền tảng Droppii',
    categorySlug: 'droppii',
    categoryClass: 'badge-secondary',
    date: '25/10/2026',
    readTime: '5 phút đọc',
    excerpt: 'Đánh giá giấy tờ pháp lý sản phẩm, phản hồi thực tế từ thị trường và cách xây dựng combo bán kèm gia tăng giá trị đơn hàng.',
    featured: false,
    isHeroFeatured: false,
    isLatest: false,
    thumbnailIcon: 'check',
    featuredImage: 'assets/images/article-dropshipping.svg',
    featuredImageCaption: 'Lựa chọn dòng sản phẩm phễu và sản phẩm chủ lực bài bản',
    contentBlocks: [
      {
        type: 'paragraph',
        text: 'Trên nền tảng có hàng nghìn mã sản phẩm, người mới rất dễ bị ngợp và phân tán nguồn lực. Bí quyết của những Partner thành công là chỉ tập trung sâu vào tối đa 2 đến 3 sản phẩm chủ lực thuộc lĩnh vực mình am hiểu nhất.'
      },
      {
        type: 'heading2',
        text: '1. Chiến lược sản phẩm đầu phễu và chủ lực'
      },
      {
        type: 'paragraph',
        text: 'Sản phẩm đầu phễu cần có mức giá dễ tiếp cận (dưới 300.000đ) để khách hàng trải nghiệm dịch vụ đóng gói và chăm sóc chu đáo. Khi đã có niềm tin, việc tư vấn sản phẩm chủ lực giá trị cao hơn sẽ diễn ra rất thuận lợi.'
      }
    ]
  },
  {
    id: 10,
    slug: 'ky-nang-xu-ly-khi-khach-che-gia-cao',
    title: 'Xử lý phản đối "Giá đắt thế": Chuyển hướng sự chú ý sang giá trị thực tế',
    category: 'Kỹ năng bán hàng',
    categorySlug: 'sales',
    categoryClass: 'badge-neutral',
    date: '22/10/2026',
    readTime: '4 phút đọc',
    excerpt: 'Cách phân tích bài toán chi phí sử dụng theo ngày, đưa ra cam kết bảo hành và nâng tầm trải nghiệm của người tiêu dùng.',
    featured: false,
    isHeroFeatured: false,
    isLatest: false,
    thumbnailIcon: 'chat',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Nâng tầm giá trị cảm nhận để khách hàng thấu hiểu chi phí thực tế',
    contentBlocks: [
      {
        type: 'paragraph',
        text: 'Khi khách hàng thốt lên "Giá đắt thế em ơi!", đó không phải là lời từ chối, mà là tín hiệu họ đang quan tâm và cần bạn thuyết phục lý do vì sao sản phẩm xứng đáng với số tiền họ bỏ ra.'
      },
      {
        type: 'heading2',
        text: '1. Công thức chia nhỏ chi phí theo ngày (Cost-per-day)'
      },
      {
        type: 'paragraph',
        text: 'Một sản phẩm giá 600.000đ sử dụng trong 2 tháng tương đương chỉ 10.000đ mỗi ngày - chưa bằng một ly trà đá, nhưng mang lại sự an tâm tuyệt đối về sức khỏe.'
      }
    ]
  },
  {
    id: 11,
    slug: 'xay-dung-kenh-affiliate-ben-vung',
    title: 'Affiliate Marketing đa kênh: Cách xây dựng nội dung chuyển đổi không phụ thuộc trend',
    category: 'TikTok & Affiliate',
    categorySlug: 'tiktok',
    categoryClass: 'badge-neutral',
    date: '20/10/2026',
    readTime: '5 phút đọc',
    excerpt: 'Tập trung vào chuỗi nội dung giải quyết nỗi đau của khách hàng (Pain-point solving) để giữ lượng view và hoa hồng đều đặn theo thời gian.',
    featured: false,
    isHeroFeatured: false,
    isLatest: false,
    thumbnailIcon: 'video',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Xây dựng tài sản nội dung số mang lại dòng hoa hồng bền vững',
    contentBlocks: [
      {
        type: 'paragraph',
        text: 'Đu trend có thể mang lại hàng triệu view nhất thời, nhưng khi trend qua đi thì kênh cũng lụi tàn. Nội dung giải quyết nỗi đau muôn thuở của người dùng (Evergreen Content) mới là cỗ máy tạo hoa hồng tự động bền bỉ.'
      }
    ]
  },
  {
    id: 12,
    slug: 'nghe-thuat-cham-soc-khach-hang-sau-ban',
    title: 'Nghệ thuật chăm sóc sau bán: Biến khách mua 1 lần thành đại sứ thương hiệu',
    category: 'Marketing online',
    categorySlug: 'marketing',
    categoryClass: 'badge-primary',
    date: '17/10/2026',
    readTime: '5 phút đọc',
    excerpt: 'Quy tắc 1-3-7 ngày sau khi giao hàng: thời điểm vàng để nhắn tin hỏi thăm cách dùng và gửi tặng ưu đãi khách hàng thân thiết.',
    featured: false,
    isHeroFeatured: false,
    isLatest: false,
    thumbnailIcon: 'heart',
    featuredImage: 'assets/images/article-default.svg',
    featuredImageCaption: 'Xây dựng mối quan hệ gắn bó bền chặt giữa người bán và người mua',
    contentBlocks: [
      {
        type: 'paragraph',
        text: 'Một đơn hàng giao thành công không phải là kết thúc, mà là sự bắt đầu của một mối quan hệ kinh doanh lâu dài. Chăm sóc tận tâm sau bán chính là vũ khí cạnh tranh bí mật của các nhà bán hàng xuất sắc.'
      }
    ]
  }
];

/**
 * Tìm kiếm bài viết theo slug (hỗ trợ slug chính hoặc alias)
 */
export function findArticleBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase();
  return ARTICLES_DATA.find(a => 
    a.slug === cleanSlug || 
    (Array.isArray(a.aliases) && a.aliases.includes(cleanSlug))
  ) || null;
}
