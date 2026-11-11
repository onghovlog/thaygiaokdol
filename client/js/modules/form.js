/**
 * Module Xử Lý Form Đăng Ký Partner 2 Bước (Multi-step Form)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 * 
 * Tính năng:
 * - Form 2 bước tối ưu cho điện thoại di động:
 *   + Bước 1: Thông tin liên hệ (Họ tên, SĐT/Zalo, Tỉnh/Thành phố, Email).
 *   + Bước 2: Nhu cầu hợp tác (Nghề nghiệp, Mục tiêu, Kinh nghiệm, Ngành hàng, Thời gian, Thời điểm, Kênh liên hệ, Điều khoản).
 * - Thanh tiến trình (Progress Indicator) bước 1/2 và 2/2 trực quan.
 * - Validation tiếng Việt với thông báo lỗi hiển thị ngay cạnh trường vi phạm.
 * - Bảo lưu 100% dữ liệu khi chuyển đổi qua lại giữa các bước (In-Memory State).
 * - Trạng thái tương tác hoàn chỉnh: Loading state, Error state, Success redirect.
 * - Tuân thủ bảo mật: KHÔNG lưu thông tin cá nhân vào localStorage.
 * - Cung cấp hàm submitPartner(data) sẵn sàng tích hợp REST API Backend.
 */

import { registerPartner } from '../api.js';

// Bộ nhớ đệm tạm thời cho form (In-Memory State - không ghi vào localStorage)
const formState = {
  currentStep: 1,
  isSubmitting: false,
  data: {
    fullname: '',
    phone: '',
    province: '',
    email: '',
    occupation: '',
    goals: [],
    experience: '',
    categories: [],
    dailyTime: '',
    startTime: '',
    contactChannel: '',
    agreePrivacy: false
  }
};

/**
 * HÀM GỌI API ĐĂNG KÝ PARTNER (Tích hợp REST API MongoDB Atlas)
 * Kết nối trực tiếp POST /api/partners với kiểm soát dữ liệu chặt chẽ.
 */
export async function submitPartner(data) {
  // 1. Kiểm tra dữ liệu bắt buộc phía client-service
  if (!data.fullname || !data.phone || !data.province || !data.agreePrivacy) {
    const error = new Error('Vui lòng điền đầy đủ các thông tin bắt buộc trước khi gửi.');
    error.status = 400;
    throw error;
  }

  // 2. Trích xuất nguồn chiến dịch từ URL query params (ví dụ: ?source=tiktok_live)
  const urlParams = new URLSearchParams(window.location.search);
  const rawSource = urlParams.get('source') || urlParams.get('utm_source') || 'website';
  const allowedSources = ['website', 'tiktok_live', 'facebook', 'zalo'];
  const source = allowedSources.includes(rawSource.toLowerCase().trim()) 
    ? rawSource.toLowerCase().trim() 
    : 'website';

  // 3. Đọc trường honeypot chống bot
  const hpInput = document.querySelector('input[name="hp_confirm"]');
  const hpVal = hpInput ? hpInput.value : '';

  // 4. Chuẩn bị payload gửi lên máy chủ Express & MongoDB Atlas
  const payload = {
    fullName: data.fullname,
    phone: data.phone,
    email: data.email || undefined,
    province: data.province,
    occupation: data.occupation,
    goals: data.goals,
    experience: data.experience,
    interests: data.categories,
    availableTime: data.dailyTime,
    startWhen: data.startTime,
    preferredContact: data.contactChannel || 'Zalo',
    consent: Boolean(data.agreePrivacy),
    policyVersion: '1.0',
    source: source,
    hp_confirm: hpVal
  };

  // 5. Gọi REST API thực tế (Không mock, không swallow error)
  const res = await registerPartner(payload);
  return res;
}

/**
 * Khởi tạo toàn bộ tương tác cho Form Đăng ký Partner
 */
export function initPartnerForm(formSelector = '#partner-register-form') {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const step1Panel = form.querySelector('#form-step-1');
  const step2Panel = form.querySelector('#form-step-2');
  const btnNext = form.querySelector('#btn-step-next');
  const btnBack = form.querySelector('#btn-step-back');
  const btnSubmit = form.querySelector('#btn-form-submit');
  const formAlert = form.querySelector('#form-global-alert');

  if (!step1Panel || !step2Panel) return;

  // 1. Gắn sự kiện chọn thẻ (Choice Card Checkbox/Radio) để đồng bộ trạng thái active
  bindChoiceCardInteractions(form);

  // 2. Chuyển từ Bước 1 sang Bước 2
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      clearFormAlert(formAlert);
      if (validateStep1(form)) {
        saveStep1Data(form);
        goToStep(2);
      }
    });
  }

  // 3. Quay lại từ Bước 2 về Bước 1
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      clearFormAlert(formAlert);
      saveStep2Data(form); // Bảo lưu lựa chọn bước 2
      goToStep(1);
    });
  }

  // 4. Xử lý Gửi Form ở Bước 2
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormAlert(formAlert);

    if (formState.currentStep !== 2) return;

    // Chống double-submit khi đang có yêu cầu đang xử lý
    if (formState.isSubmitting) return;

    if (!validateStep2(form)) {
      return;
    }

    saveStep2Data(form);

    // Kích hoạt trạng thái Loading & khóa submit
    formState.isSubmitting = true;
    setLoadingState(btnSubmit, true);

    try {
      const response = await submitPartner(formState.data);

      if (response && response.success) {
        // CHỈ chuyển sang trang thành công khi server xác nhận đã lưu
        // Tuyệt đối KHÔNG lưu thông tin cá nhân vào localStorage hoặc URL
        window.location.href = 'dang-ky-thanh-cong.html';
      } else {
        throw new Error(response.message || 'Không thể lưu hồ sơ. Vui lòng thử lại.');
      }
    } catch (err) {
      formState.isSubmitting = false;
      setLoadingState(btnSubmit, false);

      let userMessage = err.message || 'Đã có lỗi xảy ra trong quá trình xử lý.';

      // Phân loại thông điệp lỗi rõ ràng cho người dùng
      if (err.status === 409) {
        userMessage = err.message || 'Số điện thoại này vừa gửi thông tin đăng ký cách đây ít phút. Thầy Giáo KDOL đã ghi nhận và sẽ liên hệ sớm. Nếu bạn muốn gửi lại, vui lòng thử lại sau 10 phút.';
      } else if (err.status === 429) {
        userMessage = 'Bạn đã gửi yêu cầu quá nhiều lần trong thời gian ngắn. Vui lòng thử lại sau 15 phút.';
      } else if (err.status === 0) {
        userMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng của bạn và thử lại.';
      } else if (err.status >= 500) {
        userMessage = 'Máy chủ đang gặp sự cố tạm thời hoặc kết nối dữ liệu bị gián đoạn. Vui lòng thử lại sau ít phút hoặc nhắn tin trực tiếp qua Zalo.';
      }

      showFormAlert(formAlert, userMessage);
    }
  });

  // 5. Xóa thông báo lỗi khi người dùng thay đổi dữ liệu
  form.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('input', () => clearFieldError(element));
    element.addEventListener('change', () => clearFieldError(element));
  });
}

/**
 * Điều hướng giữa các bước
 */
function goToStep(stepNumber) {
  formState.currentStep = stepNumber;

  const step1Panel = document.querySelector('#form-step-1');
  const step2Panel = document.querySelector('#form-step-2');
  const progressBar = document.querySelector('#stepper-bar-fill');
  const stepLabel = document.querySelector('#stepper-step-label');
  const stepCounter = document.querySelector('#stepper-step-counter');
  const tabStep1 = document.querySelector('#tab-step-1');
  const tabStep2 = document.querySelector('#tab-step-2');

  if (stepNumber === 1) {
    if (step1Panel) step1Panel.classList.add('active');
    if (step2Panel) step2Panel.classList.remove('active');

    if (progressBar) progressBar.style.width = '50%';
    if (stepLabel) stepLabel.textContent = 'Bước 1: Thông tin liên hệ';
    if (stepCounter) stepCounter.textContent = '1/2';

    if (tabStep1) {
      tabStep1.className = 'stepper-tab active';
    }
    if (tabStep2) {
      tabStep2.className = 'stepper-tab';
    }
  } else if (stepNumber === 2) {
    if (step1Panel) step1Panel.classList.remove('active');
    if (step2Panel) step2Panel.classList.add('active');

    if (progressBar) progressBar.style.width = '100%';
    if (stepLabel) stepLabel.textContent = 'Bước 2: Nhu cầu hợp tác';
    if (stepCounter) stepCounter.textContent = '2/2';

    if (tabStep1) {
      tabStep1.className = 'stepper-tab completed';
    }
    if (tabStep2) {
      tabStep2.className = 'stepper-tab active';
    }
  }

  // Cuộn mượt về đầu biểu mẫu
  const formElement = document.querySelector('#partner-register-form');
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Kiểm tra tính hợp lệ của Bước 1 (Thông tin liên hệ)
 */
function validateStep1(form) {
  let isValid = true;
  let firstInvalidEl = null;

  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 1. Họ và tên
  const nameInput = form.querySelector('[name="fullname"]');
  if (nameInput) {
    const val = nameInput.value.trim();
    if (!val) {
      showFieldError(nameInput, 'Vui lòng nhập họ và tên của bạn.');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = nameInput;
    } else if (val.length < 2) {
      showFieldError(nameInput, 'Họ và tên quá ngắn (tối thiểu 2 ký tự).');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = nameInput;
    } else {
      clearFieldError(nameInput);
    }
  }

  // 2. Số điện thoại (Zalo)
  const phoneInput = form.querySelector('[name="phone"]');
  if (phoneInput) {
    const phoneVal = phoneInput.value.trim().replace(/\s+/g, '');
    if (!phoneVal) {
      showFieldError(phoneInput, 'Vui lòng nhập số điện thoại hoặc Zalo.');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = phoneInput;
    } else if (!phoneRegex.test(phoneVal)) {
      showFieldError(phoneInput, 'Số điện thoại không hợp lệ (cần 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = phoneInput;
    } else {
      clearFieldError(phoneInput);
    }
  }

  // 3. Tỉnh/Thành phố
  const provinceSelect = form.querySelector('[name="province"]');
  if (provinceSelect) {
    if (!provinceSelect.value) {
      showFieldError(provinceSelect, 'Vui lòng chọn Tỉnh/Thành phố bạn đang sinh sống.');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = provinceSelect;
    } else {
      clearFieldError(provinceSelect);
    }
  }

  // 4. Email (Không bắt buộc, nhưng nếu nhập thì phải đúng định dạng)
  const emailInput = form.querySelector('[name="email"]');
  if (emailInput && emailInput.value.trim()) {
    if (!emailRegex.test(emailInput.value.trim())) {
      showFieldError(emailInput, 'Địa chỉ email không đúng định dạng (Ví dụ: name@gmail.com).');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = emailInput;
    } else {
      clearFieldError(emailInput);
    }
  }

  if (firstInvalidEl) {
    firstInvalidEl.focus();
  }

  return isValid;
}

/**
 * Kiểm tra tính hợp lệ của Bước 2 (Nhu cầu hợp tác)
 */
function validateStep2(form) {
  let isValid = true;
  let firstInvalidEl = null;

  // 1. Nghề nghiệp hiện tại
  const occupationSelect = form.querySelector('[name="occupation"]');
  if (occupationSelect) {
    if (!occupationSelect.value) {
      showFieldError(occupationSelect, 'Vui lòng chọn nghề nghiệp hiện tại của bạn.');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = occupationSelect;
    } else {
      clearFieldError(occupationSelect);
    }
  }

  // 2. Mục tiêu (ít nhất 1 checkbox)
  const goalCheckboxes = form.querySelectorAll('input[name="goals"]:checked');
  const goalsGroup = form.querySelector('#group-goals');
  if (goalsGroup) {
    if (goalCheckboxes.length === 0) {
      showGroupError(goalsGroup, 'Vui lòng chọn ít nhất 1 mục tiêu mong muốn.');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = goalsGroup;
    } else {
      clearGroupError(goalsGroup);
    }
  }

  // 3. Kinh nghiệm
  const experienceRadio = form.querySelector('input[name="experience"]:checked');
  const experienceGroup = form.querySelector('#group-experience');
  if (experienceGroup) {
    if (!experienceRadio) {
      showGroupError(experienceGroup, 'Vui lòng chọn mức độ kinh nghiệm của bạn.');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = experienceGroup;
    } else {
      clearGroupError(experienceGroup);
    }
  }

  // 4. Ngành hàng quan tâm (ít nhất 1 checkbox)
  const categoryCheckboxes = form.querySelectorAll('input[name="categories"]:checked');
  const categoriesGroup = form.querySelector('#group-categories');
  if (categoriesGroup) {
    if (categoryCheckboxes.length === 0) {
      showGroupError(categoriesGroup, 'Vui lòng chọn ít nhất 1 ngành hàng quan tâm.');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = categoriesGroup;
    } else {
      clearGroupError(categoriesGroup);
    }
  }

  // 5. Thời gian có thể dành mỗi ngày
  const dailyTimeRadio = form.querySelector('input[name="dailyTime"]:checked');
  const dailyTimeGroup = form.querySelector('#group-daily-time');
  if (dailyTimeGroup) {
    if (!dailyTimeRadio) {
      showGroupError(dailyTimeGroup, 'Vui lòng chọn quỹ thời gian bạn có thể dành mỗi ngày.');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = dailyTimeGroup;
    } else {
      clearGroupError(dailyTimeGroup);
    }
  }

  // 6. Thời điểm bắt đầu
  const startTimeRadio = form.querySelector('input[name="startTime"]:checked');
  const startTimeGroup = form.querySelector('#group-start-time');
  if (startTimeGroup) {
    if (!startTimeRadio) {
      showGroupError(startTimeGroup, 'Vui lòng chọn thời điểm bạn dự định bắt đầu.');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = startTimeGroup;
    } else {
      clearGroupError(startTimeGroup);
    }
  }

  // 7. Kênh liên hệ ưu tiên
  const contactChannelRadio = form.querySelector('input[name="contactChannel"]:checked');
  const contactChannelGroup = form.querySelector('#group-contact-channel');
  if (contactChannelGroup) {
    if (!contactChannelRadio) {
      showGroupError(contactChannelGroup, 'Vui lòng chọn kênh bạn muốn nhận liên hệ tư vấn.');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = contactChannelGroup;
    } else {
      clearGroupError(contactChannelGroup);
    }
  }

  // 8. Đồng ý xử lý dữ liệu cá nhân (Bắt buộc)
  const agreePrivacyCheckbox = form.querySelector('input[name="agreePrivacy"]');
  const privacyGroup = form.querySelector('#group-privacy');
  if (agreePrivacyCheckbox && privacyGroup) {
    if (!agreePrivacyCheckbox.checked) {
      showGroupError(privacyGroup, 'Bạn cần đồng ý với chính sách xử lý dữ liệu để tiếp tục.');
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = privacyGroup;
    } else {
      clearGroupError(privacyGroup);
    }
  }

  if (firstInvalidEl) {
    firstInvalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return isValid;
}

/**
 * Lưu dữ liệu Bước 1 vào bộ nhớ tạm
 */
function saveStep1Data(form) {
  const nameInput = form.querySelector('[name="fullname"]');
  const phoneInput = form.querySelector('[name="phone"]');
  const provinceSelect = form.querySelector('[name="province"]');
  const emailInput = form.querySelector('[name="email"]');

  if (nameInput) formState.data.fullname = nameInput.value.trim();
  if (phoneInput) formState.data.phone = phoneInput.value.trim();
  if (provinceSelect) formState.data.province = provinceSelect.value;
  if (emailInput) formState.data.email = emailInput.value.trim();
}

/**
 * Lưu dữ liệu Bước 2 vào bộ nhớ tạm
 */
function saveStep2Data(form) {
  const occupationSelect = form.querySelector('[name="occupation"]');
  if (occupationSelect) formState.data.occupation = occupationSelect.value;

  // Checkboxes Goals
  const goalsChecked = Array.from(form.querySelectorAll('input[name="goals"]:checked')).map(cb => cb.value);
  formState.data.goals = goalsChecked;

  // Radio Experience
  const expRadio = form.querySelector('input[name="experience"]:checked');
  formState.data.experience = expRadio ? expRadio.value : '';

  // Checkboxes Categories
  const catChecked = Array.from(form.querySelectorAll('input[name="categories"]:checked')).map(cb => cb.value);
  formState.data.categories = catChecked;

  // Radio DailyTime
  const timeRadio = form.querySelector('input[name="dailyTime"]:checked');
  formState.data.dailyTime = timeRadio ? timeRadio.value : '';

  // Radio StartTime
  const startRadio = form.querySelector('input[name="startTime"]:checked');
  formState.data.startTime = startRadio ? startRadio.value : '';

  // Radio ContactChannel
  const channelRadio = form.querySelector('input[name="contactChannel"]:checked');
  formState.data.contactChannel = channelRadio ? channelRadio.value : '';

  // Checkbox Privacy
  const privacyCb = form.querySelector('input[name="agreePrivacy"]');
  formState.data.agreePrivacy = privacyCb ? privacyCb.checked : false;
}

/**
 * Tương tác Choice Card (Highlight khi checked)
 */
function bindChoiceCardInteractions(form) {
  const choiceCards = form.querySelectorAll('.choice-card');

  choiceCards.forEach(card => {
    const input = card.querySelector('input[type="checkbox"], input[type="radio"]');
    if (!input) return;

    // Thiết lập trạng thái ban đầu
    card.classList.toggle('is-selected', input.checked);

    input.addEventListener('change', () => {
      if (input.type === 'radio') {
        // Xóa class của các radio cùng name
        form.querySelectorAll(`input[name="${input.name}"]`).forEach(r => {
          const parent = r.closest('.choice-card');
          if (parent) parent.classList.remove('is-selected');
        });
      }
      card.classList.toggle('is-selected', input.checked);
    });
  });
}

function showFieldError(element, message) {
  element.classList.add('is-invalid');
  const group = element.closest('.form-group');
  if (group) {
    group.classList.add('has-error');
    let errorEl = group.querySelector('.form-error-msg');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }
}

function clearFieldError(element) {
  element.classList.remove('is-invalid');
  const group = element.closest('.form-group');
  if (group) {
    group.classList.remove('has-error');
    const errorEl = group.querySelector('.form-error-msg');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }
}

function showGroupError(groupElement, message) {
  groupElement.classList.add('has-error');
  const errorEl = groupElement.querySelector('.form-error-msg');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

function clearGroupError(groupElement) {
  groupElement.classList.remove('has-error');
  const errorEl = groupElement.querySelector('.form-error-msg');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
}

function showFormAlert(alertElement, message) {
  if (!alertElement) return;
  alertElement.innerHTML = `
    <div style="padding: 12px 14px; background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: var(--radius-xs); color: #DC2626; font-size: var(--font-size-xs); line-height: 1.4; margin-bottom: var(--spacing-md);">
      <strong>Thông báo:</strong> ${escapeHtml(message)}
    </div>
  `;
  alertElement.style.display = 'block';
}

function clearFormAlert(alertElement) {
  if (alertElement) {
    alertElement.innerHTML = '';
    alertElement.style.display = 'none';
  }
}

function setLoadingState(button, isLoading) {
  if (!button) return;
  if (isLoading) {
    button.classList.add('is-loading');
    button.setAttribute('disabled', 'disabled');
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }
    button.textContent = 'Đang xử lý hồ sơ...';
  } else {
    button.classList.remove('is-loading');
    button.removeAttribute('disabled');
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}
