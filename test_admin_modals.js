const { chromium } = require('playwright');

async function testAdminModals() {
  console.log('🚀 Bắt đầu kiểm thử Modal Tạo/Sửa Bài Viết và Chuyên Mục trong Admin...');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 } // Pixel 7 Mobile Viewport
  });

  const page = await context.newPage();

  // Auto-accept confirm dialogs (for delete & logout)
  page.on('dialog', async dialog => {
    console.log(`💬 Dialog [${dialog.type()}]: "${dialog.message()}" -> Chấp nhận (Accept)`);
    await dialog.accept();
  });

  try {
    // 1. Đăng nhập Admin
    console.log('1️⃣ Đăng nhập Admin...');
    await page.goto('http://localhost:5000/admin/login.html', { waitUntil: 'networkidle' });
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Admin@123456');
    await page.click('#btn-login-submit');
    await page.waitForURL('**/admin/index.html', { timeout: 10000 });
    console.log('✅ Đăng nhập Admin thành công!');

    // Chờ tải trang hoàn tất
    await page.waitForTimeout(1000);

    // ==========================================
    // 2. KIỂM THỬ MODAL CHUYÊN MỤC (CATEGORY)
    // ==========================================
    console.log('\n2️⃣ Kiểm thử Phân hệ Chuyên Mục...');
    // Click tab Chuyên mục
    await page.click('button[data-tab="categories"]');
    await page.waitForTimeout(600);

    // Mở modal thêm chuyên mục
    console.log(' - Mở modal Thêm Chuyên Mục...');
    await page.click('#btn-open-create-category');
    await page.waitForSelector('#category-modal', { state: 'visible' });

    // Điền form chuyên mục
    const testCatName = `Chuyên Mục Test ${Date.now().toString().slice(-4)}`;
    await page.fill('#category-name', testCatName);
    await page.click('#btn-generate-category-slug');
    const genSlug = await page.inputValue('#category-slug');
    console.log(` - Sinh slug tự động: "${genSlug}"`);
    await page.fill('#category-order', '99');
    await page.fill('#category-description', 'Mô tả chuyên mục kiểm thử tự động');

    // Lưu chuyên mục
    await page.click('#btn-submit-category');
    await page.waitForSelector('#category-modal', { state: 'hidden' });
    console.log('✅ Đã lưu Chuyên Mục mới qua Modal!');

    // Kiểm tra chuyên mục xuất hiện trong danh sách
    await page.waitForTimeout(800);
    const catListText = await page.textContent('#admin-categories-list');
    if (!catListText.includes(testCatName)) {
      throw new Error(`Chuyên mục vừa tạo "${testCatName}" không xuất hiện trong danh sách!`);
    }
    console.log(`✅ Chuyên mục "${testCatName}" đã hiển thị trong danh sách!`);

    // Sửa chuyên mục: Click nút "Sửa" trên thẻ vừa tạo
    console.log(' - Kiểm tra Sửa Chuyên Mục...');
    const catCard = page.locator('#admin-categories-list .card', { hasText: testCatName });
    await catCard.locator('button:has-text("Sửa")').click();
    await page.waitForSelector('#category-modal', { state: 'visible' });

    const editCatHeading = await page.textContent('#category-modal-heading');
    console.log(` - Tiêu đề modal sửa: "${editCatHeading}"`);

    // Thay đổi mô tả
    await page.fill('#category-description', 'Mô tả đã được cập nhật qua modal!');
    await page.click('#btn-submit-category');
    await page.waitForSelector('#category-modal', { state: 'hidden' });
    await page.waitForTimeout(800);
    console.log('✅ Đã cập nhật Chuyên Mục thành công!');

    // ==========================================
    // 3. KIỂM THỬ MODAL BÀI VIẾT (POST)
    // ==========================================
    console.log('\n3️⃣ Kiểm thử Phân hệ Bài Viết...');
    // Click tab Bài viết
    await page.click('button[data-tab="posts"]');
    await page.waitForTimeout(600);

    // Mở modal thêm bài viết
    console.log(' - Mở modal Thêm Bài Viết...');
    await page.click('#btn-open-create-post');
    await page.waitForSelector('#post-modal', { state: 'visible' });

    // Kiểm tra dropdown Chuyên mục đã được nạp danh mục vừa tạo
    const categoryOptions = await page.$$eval('#post-category option', opts => opts.map(o => o.value));
    console.log(` - Danh sách chuyên mục trong dropdown: ${categoryOptions.filter(Boolean).join(', ')}`);
    if (!categoryOptions.includes(testCatName)) {
      console.warn(` ⚠️ Lưu ý: Option "${testCatName}" chưa có trong dropdown post-category`);
    }

    // Điền form bài viết
    const testPostTitle = `Bài Viết Test Modal ${Date.now().toString().slice(-4)}`;
    await page.fill('#post-title', testPostTitle);
    await page.click('#btn-generate-post-slug');
    const postSlug = await page.inputValue('#post-slug');
    console.log(` - Sinh slug bài viết: "${postSlug}"`);

    // Chọn chuyên mục (nếu có chuyên mục test thì chọn, không thì chọn option đầu tiên hợp lệ)
    if (categoryOptions.includes(testCatName)) {
      await page.selectOption('#post-category', testCatName);
    } else if (categoryOptions.length > 1) {
      await page.selectOption('#post-category', categoryOptions[1]);
    }

    await page.fill('#post-readtime', '3 phút đọc');
    await page.fill('#post-excerpt', 'Đoạn tóm tắt bài viết phục vụ kiểm thử tự động hệ thống modal.');
    await page.fill('#post-tags', 'KDOL, Test, Automation');
    await page.fill('#post-content', '<p>Nội dung bài viết thử nghiệm qua modal.</p><h3>Tiêu đề phụ</h3><p>Đoạn văn kết bài.</p>');
    await page.selectOption('#post-status', 'published');
    await page.check('#post-featured');

    // Lưu bài viết
    await page.click('#btn-submit-post');
    await page.waitForSelector('#post-modal', { state: 'hidden' });
    console.log('✅ Đã lưu Bài Viết mới qua Modal!');

    // Kiểm tra bài viết xuất hiện trong danh sách admin
    await page.waitForTimeout(800);
    const postListText = await page.textContent('#admin-posts-list');
    if (!postListText.includes(testPostTitle)) {
      throw new Error(`Bài viết vừa tạo "${testPostTitle}" không hiển thị trong danh sách!`);
    }
    console.log(`✅ Bài viết "${testPostTitle}" hiển thị đúng trên Admin!`);

    // Sửa bài viết: Click nút Sửa trên card vừa tạo
    console.log(' - Kiểm tra Sửa Bài Viết...');
    const postCard = page.locator('#admin-posts-list .card', { hasText: testPostTitle });
    await postCard.locator('button:has-text("Sửa")').click();
    await page.waitForSelector('#post-modal', { state: 'visible' });

    const editPostHeading = await page.textContent('#post-modal-heading');
    console.log(` - Tiêu đề modal sửa bài viết: "${editPostHeading}"`);

    // Thay đổi trạng thái thành bản nháp
    await page.selectOption('#post-status', 'draft');
    await page.click('#btn-submit-post');
    await page.waitForSelector('#post-modal', { state: 'hidden' });
    await page.waitForTimeout(800);

    // Xác nhận badge trạng thái đổi sang "Bản nháp"
    const updatedPostCard = page.locator('#admin-posts-list .card', { hasText: testPostTitle });
    const postCardHtml = await updatedPostCard.innerHTML();
    if (!postCardHtml.includes('Bản nháp')) {
      throw new Error('Trạng thái bài viết chưa chuyển thành Bản nháp!');
    }
    console.log('✅ Đã cập nhật Bài Viết sang trạng thái Bản nháp thành công!');

    // ==========================================
    // 4. KIỂM THỬ TÌM KIẾM & BỘ LỌC BÀI VIẾT
    // ==========================================
    console.log('\n4️⃣ Kiểm thử Tìm kiếm & Bộ lọc Bài viết...');
    await page.fill('#post-search-input', testPostTitle);
    await page.waitForTimeout(500);
    const searchResultCount = await page.locator('#admin-posts-list .card').count();
    console.log(` - Kết quả tìm kiếm theo tiêu đề: ${searchResultCount} bài viết`);
    if (searchResultCount === 0) {
      throw new Error('Bộ tìm kiếm không tìm thấy bài viết vừa tạo!');
    }

    // Đặt lại ô tìm kiếm
    await page.fill('#post-search-input', '');
    await page.waitForTimeout(500);

    // ==========================================
    // 5. DỌN DẸP DỮ LIỆU TEST (DELETE CRUD)
    // ==========================================
    console.log('\n5️⃣ Dọn dẹp dữ liệu kiểm thử...');
    // Xóa bài viết test
    const deletePostCard = page.locator('#admin-posts-list .card', { hasText: testPostTitle });
    await deletePostCard.locator('button:has-text("Xóa")').click();
    await page.waitForTimeout(800);
    const postListAfterDelete = await page.textContent('#admin-posts-list');
    if (postListAfterDelete.includes(testPostTitle)) {
      throw new Error('Bài viết chưa được xóa thành công!');
    }
    console.log('✅ Đã xóa Bài viết test thành công!');

    // Xóa chuyên mục test
    await page.click('button[data-tab="categories"]');
    await page.waitForTimeout(600);
    const deleteCatCard = page.locator('#admin-categories-list .card', { hasText: testCatName });
    await deleteCatCard.locator('button:has-text("Xóa")').click();
    await page.waitForTimeout(800);
    const catListAfterDelete = await page.textContent('#admin-categories-list');
    if (catListAfterDelete.includes(testCatName)) {
      throw new Error('Chuyên mục chưa được xóa thành công!');
    }
    console.log('✅ Đã xóa Chuyên mục test thành công!');

    console.log('\n======================================================');
    console.log('🎉 TẤT CẢ CÁC BƯỚC KIỂM THỬ MODAL ADMIN ĐÃ ĐẠT 100% PASS!');
    console.log('======================================================');

  } catch (err) {
    console.error('\n❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testAdminModals();

