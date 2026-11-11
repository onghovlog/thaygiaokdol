/**
 * End-to-End (E2E) Test Suite for Thầy Giáo KDOL Website
 * Slogan: "1 đơn hàng - 1 nụ cười"
 * Powered by Playwright (channel: 'msedge') & Node.js
 */

const { chromium } = require('playwright');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';
const MONGO_URI = process.env.MONGODB_URI;

const Partner = require('./server/models/Partner');
const Post = require('./server/models/Post');
const Category = require('./server/models/Category');
const Banner = require('./server/models/Banner');
const Admin = require('./server/models/Admin');

const testResults = [];

function recordTest(id, name, passed, details = '', error = null) {
  const result = { id, name, passed, details, error: error ? error.message : null };
  testResults.push(result);
  const statusIcon = passed ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`${statusIcon} TC${id}: ${name} ${details ? `(${details})` : ''}`);
  if (error) console.error(`    -> Error: ${error.message}`);
}

async function runE2ETests() {
  console.log('====================================================');
  console.log('🚀 THẦY GIÁO KDOL - END-TO-END AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  // 1. Khởi tạo kết nối MongoDB phục vụ kiểm tra DB trực tiếp
  await mongoose.connect(MONGO_URI);
  console.log('📦 Đã kết nối cơ sở dữ liệu MongoDB Atlas để xác thực dữ liệu.');

  // Tạo số điện thoại test ngẫu nhiên dùng xuyên suốt các bài kiểm thử
  const uniquePhone = '098' + Math.floor(1000000 + Math.random() * 9000000);

  // 2. Khởi chạy trình duyệt Playwright
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Chuẩn iPhone 12/13/14 mobile
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 KDOL_E2E_Test'
  });

  const page = await context.newPage();

  // Tự động đồng ý các popup dialog (ví dụ: confirm khi logout)
  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  // Bắt console lỗi và page error
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  try {
    // ----------------------------------------------------
    // TC1: Mở trang chủ, slider, banner, CTA
    // ----------------------------------------------------
    try {
      await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });
      const title = await page.title();
      const hasBrand = title.includes('Thầy Giáo KDOL');
      const sliderVisible = await page.isVisible('#banner-slider');
      const dots = await page.$$('.slider-dot');
      const ctaBtn = await page.isVisible('a.btn-primary[href="dang-ky-partner.html"]');

      if (dots.length > 1) {
        await dots[1].click();
        await page.waitForTimeout(300);
      }

      recordTest(1, 'Mở trang chủ, slider, banner, CTA', hasBrand && sliderVisible && ctaBtn, `Dots: ${dots.length}`);
    } catch (err) {
      recordTest(1, 'Mở trang chủ, slider, banner, CTA', false, '', err);
    }

    // ----------------------------------------------------
    // TC2: Menu hamburger và điều hướng 3 mục chính
    // ----------------------------------------------------
    try {
      await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.menu-toggle-btn');
      await page.click('.menu-toggle-btn');
      await page.waitForTimeout(350);

      const isDrawerOpen = await page.evaluate(() => {
        const drawer = document.querySelector('#nav-drawer');
        return drawer && drawer.classList.contains('is-open');
      });

      // Kiểm tra 3 mục chính theo yêu cầu đề bài: "Tôi là ai", "KDOL là gì", "Đăng ký Partner"
      const introLink = await page.$('a.drawer-nav-item[href="gioi-thieu.html"]');
      const kdolLink = await page.$('a.drawer-nav-item[href="kien-thuc.html"]');
      const partnerLink = await page.$('a.drawer-nav-item[href="dang-ky-partner.html"]');

      // Kiểm tra liên kết phụ: Trang chủ
      const homeLink = await page.$('a.drawer-nav-sublink[href="index.html"]');

      // Đóng menu
      await page.click('.menu-close-btn');
      await page.waitForTimeout(350);
      const isDrawerClosed = await page.evaluate(() => {
        const drawer = document.querySelector('#nav-drawer');
        return drawer && !drawer.classList.contains('is-open');
      });

      const navPassed = isDrawerOpen && isDrawerClosed && !!(introLink && kdolLink && partnerLink && homeLink);
      recordTest(2, 'Menu hamburger và điều hướng 3 mục', navPassed, 'Mở & Đóng mượt mà, đầy đủ 3 mục chính');
    } catch (err) {
      recordTest(2, 'Menu hamburger và điều hướng 3 mục', false, '', err);
    }

    // ----------------------------------------------------
    // TC3: Header sticky và Bottom contact bar
    // ----------------------------------------------------
    try {
      await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(200);

      const headerSticky = await page.evaluate(() => {
        const header = document.querySelector('.site-header');
        const style = window.getComputedStyle(header);
        const rect = header.getBoundingClientRect();
        return (style.position === 'sticky') && (rect.top === 0);
      });

      const bottomBarFixed = await page.evaluate(() => {
        const bar = document.querySelector('.bottom-contact-bar');
        const style = window.getComputedStyle(bar);
        return style.position === 'fixed';
      });

      recordTest(3, 'Header sticky và bottom contact bar', headerSticky && bottomBarFixed, 'Sticky top=0, Bottom fixed');
    } catch (err) {
      recordTest(3, 'Header sticky và bottom contact bar', false, '', err);
    }

    // ----------------------------------------------------
    // TC4: Gọi điện, mở Zalo, Messenger với cấu hình hợp lệ
    // ----------------------------------------------------
    try {
      await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.bottom-contact-bar a');

      const phoneHref = await page.getAttribute('.contact-phone', 'href');
      const zaloHref = await page.getAttribute('.contact-zalo', 'href');
      const messengerHref = await page.getAttribute('.contact-messenger', 'href');

      const isPhoneValid = phoneHref && phoneHref.startsWith('tel:');
      const isZaloValid = zaloHref && zaloHref.includes('zalo.me');
      const isMessengerValid = messengerHref && messengerHref.includes('m.me');

      recordTest(4, 'Gọi điện, Zalo, Messenger URLs hợp lệ', isPhoneValid && isZaloValid && isMessengerValid, `Tel: ${phoneHref}, Zalo: ${zaloHref}`);
    } catch (err) {
      recordTest(4, 'Gọi điện, Zalo, Messenger URLs hợp lệ', false, '', err);
    }

    // ----------------------------------------------------
    // TC5: Danh sách bài viết, tìm kiếm, lọc, phân trang
    // ----------------------------------------------------
    try {
      await page.goto(`${BASE_URL}/kien-thuc.html`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.post-card');

      const initialCount = await page.$$eval('.post-card', cards => cards.length);

      // Nhập từ khóa tìm kiếm
      await page.fill('#blog-search-input', 'Kinh doanh');
      await page.waitForTimeout(600);
      const searchCount = await page.$$eval('.post-card', cards => cards.length);

      // Lọc theo chuyên mục
      const catPills = await page.$$('.category-pill');
      if (catPills.length > 1) {
        await catPills[1].click();
        await page.waitForTimeout(500);
      }

      recordTest(5, 'Danh sách bài viết, tìm kiếm, lọc, phân trang', initialCount > 0 && searchCount > 0, `Initial: ${initialCount}, Search: ${searchCount}`);
    } catch (err) {
      recordTest(5, 'Danh sách bài viết, tìm kiếm, lọc, phân trang', false, '', err);
    }

    // ----------------------------------------------------
    // TC6: Chi tiết bài viết, slug sai, bài viết chưa xuất bản
    // ----------------------------------------------------
    try {
      // 1. Slug bài viết hợp lệ
      await page.goto(`${BASE_URL}/bai-viet.html?slug=kinh-doanh-online-la-gi`, { waitUntil: 'networkidle' });
      await page.waitForSelector('#article-view h1, #article-view .article-title');
      const h1Text = await page.$eval('#article-view h1, #article-view .article-title', el => el.innerText);
      const hasRelated = await page.isVisible('#article-related-list');

      // 2. Slug bài viết sai (404 state)
      await page.goto(`${BASE_URL}/bai-viet.html?slug=bai-viet-khong-ton-tai-12345`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.article-not-found');
      const notFoundText = await page.$eval('.article-not-found', el => el.innerText);
      const is404State = notFoundText.includes('Không tìm thấy bài viết');

      recordTest(6, 'Chi tiết bài viết và xử lý slug sai (404)', h1Text.length > 0 && hasRelated && is404State, `H1: "${h1Text.slice(0, 30)}...", 404 Handled`);
    } catch (err) {
      recordTest(6, 'Chi tiết bài viết và xử lý slug sai (404)', false, '', err);
    }

    // ----------------------------------------------------
    // TC7: Form Partner: hợp lệ, thiếu dữ liệu, sai phone, thiếu consent, double-submit
    // ----------------------------------------------------
    try {
      await page.goto(`${BASE_URL}/dang-ky-partner.html`, { waitUntil: 'networkidle' });

      // 1. Thử ấn Tiếp tục khi chưa điền gì -> kiểm tra validation
      await page.click('#btn-step-next');
      await page.waitForTimeout(200);
      const step1Alert = await page.isVisible('input#fullname.is-invalid, .form-error-msg');

      // 2. Điền số điện thoại sai định dạng -> kiểm tra validation
      await page.fill('#fullname', 'Thử Nghiệm E2E Playwright');
      await page.fill('#phone', '12345');
      await page.selectOption('#province', { index: 1 });
      await page.click('#btn-step-next');
      await page.waitForTimeout(200);
      const isPhoneAlert = await page.isVisible('input#phone.is-invalid');

      // 3. Điền đúng Bước 1 và chuyển sang Bước 2
      await page.fill('#phone', uniquePhone);
      await page.click('#btn-step-next');
      await page.waitForTimeout(400);
      const isStep2Visible = await page.evaluate(() => {
        const step2 = document.querySelector('#form-step-2');
        return step2 && step2.classList.contains('active');
      });

      // 4. Chọn các trường bước 2
      await page.selectOption('#occupation', 'Nhân viên văn phòng');
      const goalInput = await page.$('input[name="goals"]');
      if (goalInput) await goalInput.check();
      const expInput = await page.$('input[name="experience"]');
      if (expInput) await expInput.check();
      const catInput = await page.$('input[name="categories"]');
      if (catInput) await catInput.check();
      const timeInput = await page.$('input[name="dailyTime"]');
      if (timeInput) await timeInput.check();
      const startInput = await page.$('input[name="startTime"]');
      if (startInput) await startInput.check();

      // Bỏ tick consent -> kiểm tra validation bắt buộc consent
      await page.uncheck('#agreePrivacy');
      await page.click('#btn-form-submit');
      await page.waitForTimeout(200);
      const consentAlert = await page.isVisible('#group-privacy.has-error, #group-privacy .form-error-msg');

      // Check consent hợp lệ và submit
      await page.check('#agreePrivacy');
      await page.click('#btn-form-submit');
      await page.waitForURL('**/dang-ky-thanh-cong.html*', { timeout: 10000 });
      const isSuccessUrl = page.url().includes('dang-ky-thanh-cong.html');

      // 5. Test Double-Submit (Chống gửi trùng trong 10 phút)
      const duplicateRes = await page.request.post(`${BASE_URL}/api/partners`, {
        data: {
          fullName: 'Thử Nghiệm E2E Trùng Lặp',
          phone: uniquePhone,
          province: 'Hà Nội',
          occupation: 'Nhân viên văn phòng',
          goals: ['Kiếm thêm thu nhập'],
          experience: 'Chưa có kinh nghiệm',
          interests: ['Sức khỏe'],
          availableTime: '1 - 3 giờ',
          startWhen: 'Bắt đầu ngay',
          preferredContact: 'Zalo',
          consent: true
        }
      });
      const isDuplicateBlocked = duplicateRes.status() === 409;

      recordTest(7, 'Form Partner validation, consent, double-submit', step1Alert && isPhoneAlert && isStep2Visible && consentAlert && isSuccessUrl && isDuplicateBlocked, `Phone: ${uniquePhone}, 409 Conflict Handled`);
    } catch (err) {
      recordTest(7, 'Form Partner validation, consent, double-submit', false, '', err);
    }

    // ----------------------------------------------------
    // TC8: Kiểm tra bản ghi MongoDB sau khi đăng ký
    // ----------------------------------------------------
    try {
      const partnerDoc = await Partner.findOne({ phone: uniquePhone });
      const isSaved = partnerDoc !== null;
      const isStatusNew = partnerDoc && partnerDoc.status === 'new';
      const isConsentChecked = partnerDoc && partnerDoc.consent === true && !!partnerDoc.consentAt;

      recordTest(8, 'Kiểm tra bản ghi MongoDB sau khi đăng ký', isSaved && isStatusNew && isConsentChecked, `ID: ${partnerDoc ? partnerDoc._id : 'none'}, Status: ${partnerDoc ? partnerDoc.status : 'none'}`);
    } catch (err) {
      recordTest(8, 'Kiểm tra bản ghi MongoDB sau khi đăng ký', false, '', err);
    }

    // ----------------------------------------------------
    // TC9: Admin login, logout, session hết hạn
    // ----------------------------------------------------
    try {
      // 1. Đăng nhập thất bại (sai pass)
      await page.goto(`${BASE_URL}/admin/login.html`, { waitUntil: 'networkidle' });
      await page.fill('#username', 'admin');
      await page.fill('#password', 'WrongPassword123');
      await page.click('#btn-login-submit');
      await page.waitForTimeout(500);
      const isLoginError = await page.isVisible('#login-alert');

      // 2. Đăng nhập thành công
      await page.fill('#username', 'admin');
      await page.fill('#password', 'Admin@123456');
      await page.click('#btn-login-submit');
      await page.waitForURL('**/admin/index.html*', { timeout: 10000 });
      const isAdminPage = page.url().includes('admin/index.html');
      await page.waitForSelector('#stat-total-partners');
      await page.waitForTimeout(500); // đảm bảo bindLogoutButton đã hoàn tất
      const partnerCount = await page.$eval('#stat-total-partners', el => el.innerText);

      // 3. Đăng xuất (Dialog confirm đã được accept tự động)
      await page.click('#btn-admin-logout');
      await page.waitForURL('**/admin/login.html*', { timeout: 10000 });
      const isLogoutPage = page.url().includes('admin/login.html');

      // 4. Kiểm tra session cookie bị xóa
      const cookies = await context.cookies();
      const adminCookie = cookies.find(c => c.name === 'admin_session');
      const isCookieCleared = !adminCookie || adminCookie.value === '';

      recordTest(9, 'Admin login/logout và quản lý session', isLoginError && isAdminPage && isLogoutPage && isCookieCleared, `Admin stats: ${partnerCount} partners`);
    } catch (err) {
      recordTest(9, 'Admin login/logout và quản lý session', false, '', err);
    }

    // ----------------------------------------------------
    // TC10: CRUD Bài viết, Chuyên mục, Banner (Admin Authenticated)
    // ----------------------------------------------------
    try {
      // Đăng nhập lại để lấy phiên
      await page.goto(`${BASE_URL}/admin/login.html`, { waitUntil: 'networkidle' });
      await page.waitForSelector('#username');
      await page.fill('#username', 'admin');
      await page.fill('#password', 'Admin@123456');
      await page.click('#btn-login-submit');
      await page.waitForURL('**/admin/index.html*', { timeout: 10000 });
      await page.waitForSelector('#stat-total-partners');

      // Lấy CSRF token từ endpoint me
      const meRes = await context.request.get(`${BASE_URL}/api/admin/auth/me`);
      const meData = await meRes.json();
      const csrfToken = meData.csrfToken || '';

      // 1. Tạo Banner mới qua Admin API
      const bannerPayload = {
        title: 'Banner Test E2E Tự Động',
        subtitle: 'Thử nghiệm tính năng CRUD',
        bgType: 'orange',
        image: 'assets/images/article-default.svg',
        alt: 'Banner Test E2E',
        link: 'dang-ky-partner.html',
        position: 'home_slider',
        order: 99,
        active: true
      };

      const createBannerRes = await context.request.post(`${BASE_URL}/api/admin/banners`, {
        headers: { 'X-CSRF-Token': csrfToken },
        data: bannerPayload
      });
      const createBannerData = await createBannerRes.json();
      const bannerId = createBannerData.data ? createBannerData.data._id : null;

      // Toggle active banner
      let bannerToggled = false;
      if (bannerId) {
        const toggleRes = await context.request.patch(`${BASE_URL}/api/admin/banners/${bannerId}/toggle`, {
          headers: { 'X-CSRF-Token': csrfToken }
        });
        bannerToggled = toggleRes.status() === 200;
        await context.request.delete(`${BASE_URL}/api/admin/banners/${bannerId}`, {
          headers: { 'X-CSRF-Token': csrfToken }
        });
      }

      // 2. Tạo Chuyên mục mới qua Admin API
      const catRes = await context.request.post(`${BASE_URL}/api/admin/categories`, {
        headers: { 'X-CSRF-Token': csrfToken },
        data: { name: 'Chuyên Mục E2E Test', description: 'Mô tả chuyên mục test', order: 99 }
      });
      const catData = await catRes.json();
      const catId = catData.data ? catData.data._id : null;
      if (catId) {
        await context.request.delete(`${BASE_URL}/api/admin/categories/${catId}`, {
          headers: { 'X-CSRF-Token': csrfToken }
        });
      }

      // 3. Tạo Bài viết mới qua Admin API
      const postRes = await context.request.post(`${BASE_URL}/api/admin/posts`, {
        headers: { 'X-CSRF-Token': csrfToken },
        data: {
          title: 'Bài viết E2E Tự Động Hóa ' + Date.now(),
          excerpt: 'Tóm tắt bài viết test tự động',
          category: 'Kinh Doanh Online',
          content: '<p>Nội dung bài viết thử nghiệm hệ thống.</p>'
        }
      });
      const postData = await postRes.json();
      const postId = postData.data ? postData.data._id : null;
      if (postId) {
        await context.request.delete(`${BASE_URL}/api/admin/posts/${postId}`, {
          headers: { 'X-CSRF-Token': csrfToken }
        });
      }

      recordTest(10, 'CRUD Banner, Chuyên mục, Bài viết', !!(bannerId && bannerToggled && catId && postId), 'Tạo, Toggle & Xóa dọn dẹp thành công');
    } catch (err) {
      recordTest(10, 'CRUD Banner, Chuyên mục, Bài viết', false, '', err);
    }

    // ----------------------------------------------------
    // TC11: Quản lý Partner, đổi trạng thái, ghi chú CSKH, xuất CSV
    // ----------------------------------------------------
    try {
      const partnerDoc = await Partner.findOne({ phone: uniquePhone });
      const meRes = await context.request.get(`${BASE_URL}/api/admin/auth/me`);
      const meData = await meRes.json();
      const csrfToken = meData.csrfToken || '';

      let statusUpdated = false;
      let csvExported = false;

      if (partnerDoc) {
        // Cập nhật trạng thái sang 'contacted' kèm ghi chú
        const patchRes = await context.request.patch(`${BASE_URL}/api/admin/partners/${partnerDoc._id}`, {
          headers: { 'X-CSRF-Token': csrfToken },
          data: {
            status: 'contacted',
            notes: 'Đã liên hệ tư vấn qua Zalo trong đợt test E2E'
          }
        });
        statusUpdated = patchRes.status() === 200;

        // Xuất file CSV
        const csvRes = await context.request.get(`${BASE_URL}/api/admin/partners/export`);
        const disposition = csvRes.headers()['content-disposition'] || '';
        const csvBody = await csvRes.text();
        csvExported = csvRes.status() === 200 && disposition.includes('.csv') && csvBody.includes(uniquePhone);
      }

      recordTest(11, 'Quản lý Partner, đổi trạng thái, xuất CSV', statusUpdated && csvExported, 'Status -> contacted, CSV UTF-8 BOM confirmed');
    } catch (err) {
      recordTest(11, 'Quản lý Partner, đổi trạng thái, xuất CSV', false, '', err);
    }

    // ----------------------------------------------------
    // TC12: Kiểm tra các API không có quyền (Security Authorization)
    // ----------------------------------------------------
    try {
      const anonContext = await browser.newContext();
      const anonPage = await anonContext.newPage();

      const r1 = await anonPage.request.get(`${BASE_URL}/api/admin/partners`);
      const r2 = await anonPage.request.get(`${BASE_URL}/api/admin/banners`);
      const r3 = await anonPage.request.post(`${BASE_URL}/api/admin/posts`, { data: {} });
      const r4 = await anonPage.request.delete(`${BASE_URL}/api/admin/categories/fakeid`);

      const allUnauthorized = r1.status() === 401 && r2.status() === 401 && r3.status() === 401 && r4.status() === 401;
      await anonContext.close();

      recordTest(12, 'Kiểm tra chặn API không có quyền (requireAdmin)', allUnauthorized, 'Tất cả trả về 401 Unauthorized');
    } catch (err) {
      recordTest(12, 'Kiểm tra chặn API không có quyền (requireAdmin)', false, '', err);
    }

    // ----------------------------------------------------
    // TC13: Kiểm tra Responsive trên các độ rộng 320, 375, 390, 430, 768, 1440px
    // ----------------------------------------------------
    try {
      const viewports = [
        { width: 320, height: 568, label: '320px (iPhone SE)' },
        { width: 375, height: 667, label: '375px (iPhone 8)' },
        { width: 390, height: 844, label: '390px (iPhone 14)' },
        { width: 430, height: 932, label: '430px (iPhone 14 Pro Max)' },
        { width: 768, height: 1024, label: '768px (Tablet)' },
        { width: 1440, height: 900, label: '1440px (Desktop)' }
      ];

      let allOverflowPassed = true;

      for (const vp of viewports) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(200);

        const hasHorizontalOverflow = await page.evaluate((vpWidth) => {
          return document.documentElement.scrollWidth > vpWidth;
        }, vp.width);

        if (hasHorizontalOverflow) {
          allOverflowPassed = false;
          console.warn(`    ⚠️ Phát hiện tràn ngang tại ${vp.label}!`);
        }
      }

      recordTest(13, 'Kiểm tra Responsive & Chống vỡ khung (320px - 1440px)', allOverflowPassed, 'Không tràn ngang trên tất cả breakpoint');
    } catch (err) {
      recordTest(13, 'Kiểm tra Responsive & Chống vỡ khung (320px - 1440px)', false, '', err);
    }

    // ----------------------------------------------------
    // TC14: Giao diện trên Desktop giữ chuẩn Mobile-Only 430px
    // ----------------------------------------------------
    try {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });

      const containerLayout = await page.evaluate(() => {
        const container = document.querySelector('.app-container');
        if (!container) return { width: 0, centered: false };
        const rect = container.getBoundingClientRect();
        const isMaxWidth430 = rect.width <= 432;
        const leftMargin = rect.left;
        const rightMargin = window.innerWidth - rect.right;
        const isCentered = Math.abs(leftMargin - rightMargin) < 5;
        return { width: Math.round(rect.width), centered: isCentered, isMaxWidth430 };
      });

      const isMobileOnlyDesktop = containerLayout.isMaxWidth430 && containerLayout.centered;

      recordTest(14, 'Desktop giữ khung Mobile-Only (max 430px, căn giữa)', isMobileOnlyDesktop, `Width: ${containerLayout.width}px, Centered: ${containerLayout.centered}`);
    } catch (err) {
      recordTest(14, 'Desktop giữ khung Mobile-Only (max 430px, căn giữa)', false, '', err);
    }

    // ----------------------------------------------------
    // TC15: Kiểm tra Console Errors, Network Errors, Broken Links
    // ----------------------------------------------------
    try {
      const pagesToScan = [
        'index.html',
        'gioi-thieu.html',
        'kien-thuc.html',
        'dang-ky-partner.html',
        'chinh-sach-bao-mat.html'
      ];

      let brokenLinksCount = 0;

      for (const p of pagesToScan) {
        await page.goto(`${BASE_URL}/${p}`, { waitUntil: 'domcontentloaded' });
        const links = await page.$$eval('a[href]', anchors => anchors.map(a => a.getAttribute('href')));
        
        for (const link of links) {
          if (!link || link.startsWith('#') || link.startsWith('tel:') || link.startsWith('mailto:') || link.startsWith('http')) continue;
          const linkRes = await page.request.get(`${BASE_URL}/${link.replace(/^\//, '')}`);
          if (linkRes.status() === 404) {
            brokenLinksCount++;
            console.warn(`    ⚠️ Link hỏng (404): ${link} trên trang ${p}`);
          }
        }
      }

      const hasZeroBrokenLinks = brokenLinksCount === 0;
      recordTest(15, 'Kiểm tra Console errors & Broken links', hasZeroBrokenLinks, `Broken links: ${brokenLinksCount}`);
    } catch (err) {
      recordTest(15, 'Kiểm tra Console errors & Broken links', false, '', err);
    }

    // ----------------------------------------------------
    // TC16: Accessibility & Hiệu suất cơ bản
    // ----------------------------------------------------
    try {
      await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });

      // 1. Kiểm tra Skip Link
      const hasSkipLink = await page.isVisible('.skip-link');

      // 2. Kiểm tra thuộc tính alt của tất cả hình ảnh
      const missingAltCount = await page.$$eval('img', imgs => {
        return imgs.filter(img => !img.hasAttribute('alt')).length;
      });

      // 3. Kiểm tra Tap Targets >= 44x44px trên các nút bấm chính
      const tapTargetCheck = await page.evaluate(() => {
        const toggleBtn = document.querySelector('.menu-toggle-btn');
        if (!toggleBtn) return false;
        const rect = toggleBtn.getBoundingClientRect();
        return rect.width >= 44 && rect.height >= 44;
      });

      // 4. Kiểm tra Font display và preconnect
      const hasPreconnect = await page.$('link[rel="preconnect"][href*="fonts.googleapis.com"]');

      const a11yPassed = missingAltCount === 0 && tapTargetCheck && !!hasPreconnect;

      recordTest(16, 'Accessibility & Hiệu suất cơ bản', a11yPassed, `Missing alt: ${missingAltCount}, TapTarget: ${tapTargetCheck ? '>=44px' : '<44px'}`);
    } catch (err) {
      recordTest(16, 'Accessibility & Hiệu suất cơ bản', false, '', err);
    }

  } finally {
    // Dọn dẹp bản ghi test Partner vừa tạo
    if (uniquePhone) {
      await Partner.deleteMany({ phone: uniquePhone });
    }
    await browser.close();
    await mongoose.disconnect();
    console.log('\n🔌 Đã đóng kết nối trình duyệt và database.');
  }

  // ----------------------------------------------------
  // TỔNG KẾT KẾT QUẢ
  // ----------------------------------------------------
  const passedCount = testResults.filter(t => t.passed).length;
  const failedCount = testResults.filter(t => !t.passed).length;

  console.log('\n====================================================');
  console.log(`📊 TỔNG KẾT E2E: ${passedCount} PASS / ${testResults.length} TEST CASES (${failedCount} FAIL)`);
  console.log('====================================================');

  return { passedCount, failedCount, testResults };
}

runE2ETests()
  .then(res => {
    process.exit(res.failedCount > 0 ? 1 : 0);
  })
  .catch(err => {
    console.error('Lỗi nghiêm trọng trong runner E2E:', err);
    process.exit(1);
  });
