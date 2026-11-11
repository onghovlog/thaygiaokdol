/**
 * Admin Login Logic (ES Module)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Tuyệt đối KHÔNG lưu trữ mật khẩu, session token vào localStorage hay sessionStorage.
 * Sử dụng HttpOnly Cookie tự động quản lý bởi trình duyệt.
 */

const API_BASE = window.location.port === '3000' 
  ? `${window.location.protocol}//${window.location.hostname}:5000/api` 
  : '/api';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#admin-login-form');
  const alertBox = document.querySelector('#login-alert');
  const submitBtn = document.querySelector('#btn-login-submit');
  const togglePassBtn = document.querySelector('#btn-toggle-password');
  const passInput = document.querySelector('#password');

  // 1. Kiểm tra nếu đã có phiên đăng nhập hợp lệ -> chuyển thẳng vào Dashboard
  try {
    const res = await fetch(`${API_BASE}/admin/auth/me`, {
      method: 'GET',
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        window.location.href = 'index.html';
        return;
      }
    }
  } catch (err) {
    // Chưa đăng nhập, tiếp tục hiển thị form
  }

  // 2. Tương tác bật/tắt hiển thị mật khẩu
  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      togglePassBtn.textContent = isPass ? 'Ẩn' : 'Hiện';
    });
  }

  // 3. Xử lý Gửi Form Đăng Nhập
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const username = form.username.value.trim();
      const password = form.password.value;

      if (!username || !password) {
        showAlert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(`${API_BASE}/admin/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // Bắt buộc để nhận HttpOnly Cookie
          body: JSON.stringify({ username, password })
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Bạn đã thử đăng nhập thất bại quá nhiều lần. Vui lòng thử lại sau 15 phút.');
          }
          throw new Error(result.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
        }

        if (result && result.success) {
          // Thành công: Chuyển hướng vào trang quản trị
          window.location.href = 'index.html';
        } else {
          throw new Error(result.message || 'Đăng nhập không thành công.');
        }

      } catch (err) {
        setLoading(false);
        showAlert(err.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc thử lại.');
      }
    });
  }

  function showAlert(msg) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.style.display = 'block';
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.textContent = '';
    alertBox.style.display = 'none';
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    if (isLoading) {
      submitBtn.classList.add('is-loading');
      submitBtn.setAttribute('disabled', 'disabled');
      submitBtn.textContent = 'Đang xác thực...';
    } else {
      submitBtn.classList.remove('is-loading');
      submitBtn.removeAttribute('disabled');
      submitBtn.textContent = 'ĐĂNG NHẬP HỆ THỐNG';
    }
  }
});

