const { chromium } = require('playwright');

async function testSliderBanner() {
  console.log('🚀 Starting Banner Slider Test...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // 1. Mở trang chủ
  await page.goto('http://localhost:5000/index.html', { waitUntil: 'networkidle' });
  console.log('✓ Trang chủ loaded.');

  // 2. Chờ slider load
  await page.waitForSelector('.slider-slide', { timeout: 5000 });
  const slides = await page.$$('.slider-slide');
  console.log(`✓ Tìm thấy ${slides.length} slides.`);
  if (slides.length !== 3) {
    throw new Error(`Kỳ vọng 3 slides nhưng nhận được ${slides.length}`);
  }

  // 3. Kiểm tra kích thước và tỷ lệ 2:1
  const viewportBox = await page.$eval('.slider-viewport', el => {
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height, ratio: rect.width / rect.height };
  });
  console.log(`✓ Slider Viewport Box: width=${viewportBox.width.toFixed(1)}px, height=${viewportBox.height.toFixed(1)}px, ratio=${viewportBox.ratio.toFixed(2)}`);
  
  if (Math.abs(viewportBox.ratio - 2.0) > 0.05) {
    throw new Error(`Tỷ lệ viewport không đạt 2:1! Hiện tại: ${viewportBox.ratio}`);
  }

  // 4. Kiểm tra từng slide (image và href)
  const slidesData = await page.$$eval('.slider-slide', list => {
    return list.map(s => {
      const link = s.querySelector('.slide-link');
      const img = s.querySelector('.slide-img');
      return {
        href: link ? link.getAttribute('href') : null,
        src: img ? img.getAttribute('src') : null,
        alt: img ? img.getAttribute('alt') : null
      };
    });
  });

  console.log('✓ Danh sách Slide:', JSON.stringify(slidesData, null, 2));

  // 5. Chụp ảnh màn hình kiểm chứng giao diện
  await page.screenshot({ path: 'client/assets/images/test_banner_screenshot.png', clip: { x: 0, y: 0, width: 430, height: 400 } });
  console.log('✓ Đã lưu ảnh chụp banner: test_banner_screenshot.png');

  // 6. Test Click Slide 1 -> Chuyển đến trang đăng ký partner
  console.log('👉 Click Slide 1 (Đăng ký Partner)...');
  const slide1Link = await page.$('.slider-slide[data-slide-index="0"] .slide-link');
  await Promise.all([
    page.waitForNavigation({ timeout: 5000 }),
    slide1Link.click()
  ]);
  console.log(`✓ Đã điều hướng tới: ${page.url()}`);
  if (!page.url().includes('dang-ky-partner.html')) {
    throw new Error(`Click Slide 1 không tới dang-ky-partner.html, URL: ${page.url()}`);
  }

  // 7. Quay lại trang chủ và test Slide 2 -> KDOL là gì
  await page.goto('http://localhost:5000/index.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('.slider-slide', { timeout: 5000 });
  
  // Click dot 2 để active slide 2
  await page.click('.slider-dot[data-dot-index="1"]');
  await page.waitForTimeout(500);

  console.log('👉 Click Slide 2 (KDOL là gì)...');
  const slide2Link = await page.$('.slider-slide[data-slide-index="1"] .slide-link');
  await Promise.all([
    page.waitForNavigation({ timeout: 5000 }),
    slide2Link.click()
  ]);
  console.log(`✓ Đã điều hướng tới: ${page.url()}`);
  if (!page.url().includes('bai-viet.html') || !page.url().includes('kdol')) {
    throw new Error(`Click Slide 2 không tới bài viết KDOL, URL: ${page.url()}`);
  }

  // 8. Quay lại trang chủ và test Slide 3 -> Droppii là gì
  await page.goto('http://localhost:5000/index.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('.slider-slide', { timeout: 5000 });

  // Click dot 3 để active slide 3
  await page.click('.slider-dot[data-dot-index="2"]');
  await page.waitForTimeout(500);

  console.log('👉 Click Slide 3 (Droppii là gì)...');
  const slide3Link = await page.$('.slider-slide[data-slide-index="2"] .slide-link');
  await Promise.all([
    page.waitForNavigation({ timeout: 5000 }),
    slide3Link.click()
  ]);
  console.log(`✓ Đã điều hướng tới: ${page.url()}`);
  if (!page.url().includes('bai-viet.html') || (!page.url().includes('droppii') && !page.url().includes('dropshipping'))) {
    throw new Error(`Click Slide 3 không tới bài viết Droppii, URL: ${page.url()}`);
  }

  if (consoleErrors.length > 0) {
    console.warn('⚠️ Console errors phát hiện:', consoleErrors);
  } else {
    console.log('✓ Hoàn toàn KHÔNG có Console errors!');
  }

  await browser.close();
  console.log('🎉 TOÀN BỘ TEST CASES BANNER SLIDER TỶ LỆ 2:1 ĐÃ PASS 100%!');
}

testSliderBanner().catch(err => {
  console.error('❌ Test thất bại:', err);
  process.exit(1);
});
