/* -------------------------------------------
   Registration Form Handler (CORRECTED)
   - Initializes using the 'components:loaded' event.
   - Uses the global window.toast system for all notifications.
   - Uses the correct absolute API path for backend communication.
   - Design and HTML are untouched.
------------------------------------------- */

// Registration Form Class
class RegistrationForm {
  constructor() {
    // <<< FIX: Define the correct, absolute base URL for the API
    this.apiBaseUrl = 'http://localhost/Indian%20Tribe/backend_php/routes/auth';

    this.currentStep = 1;
    this.formData = {};
    this.otpExpiryTime = null;
    this.otpTimer = null;

    this.initializeElements();
    this.bindEvents();
    this.initializePasswordIndicators();
  }

  initializeElements() {
    // Sections
    this.registrationForm = document.getElementById('registrationForm');
    this.otpVerification  = document.getElementById('otpVerification');
    this.successMessage   = document.getElementById('successMessage');

    // Inputs
    this.nameInput            = document.getElementById('name');
    this.phoneInput           = document.getElementById('phone');
    this.emailInput           = document.getElementById('email');
    this.passwordInput        = document.getElementById('password');
    this.confirmPasswordInput = document.getElementById('confirmPassword');
    this.rememberCheckbox     = document.getElementById('remember');

    // Buttons
    this.registerBtn   = document.getElementById('registerBtn');
    this.verifyOtpBtn  = document.getElementById('verifyOtpBtn');
    this.resendOtpBtn  = document.getElementById('resendOtpBtn');
    this.backToFormBtn = document.getElementById('backToForm');

    // Eye toggle buttons
    this.togglePasswordBtn        = document.getElementById('togglePassword');
    this.toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');

    // OTP
    this.otpInputs       = document.querySelectorAll('.otp-digit');
    this.otpEmail        = document.getElementById('otpEmail');
    this.otpTimerElement = document.getElementById('otpTimer');

    // Errors
    this.errorElements = {
      name:            document.getElementById('nameError'),
      phone:           document.getElementById('phoneError'),
      email:           document.getElementById('emailError'),
      password:        document.getElementById('passwordError'),
      confirmPassword: document.getElementById('confirmPasswordError'),
    };

    // Password indicator dots
    this.dotLen  = document.getElementById('dotLen');
    this.dotCase = document.getElementById('dotCase');
    this.dotMix  = document.getElementById('dotMix');
  }

  bindEvents() {
    // Submit handlers
    this.registrationForm.addEventListener('submit', (e) => this.handleRegistrationSubmit(e));
    this.otpVerification.querySelector('#otpForm').addEventListener('submit', (e) => this.handleOtpSubmit(e));

    // Live validation
    this.nameInput.addEventListener('input', () => this.validateName());
    this.phoneInput.addEventListener('input', (e) => this.handlePhoneInput(e));
    this.phoneInput.addEventListener('keydown', (e) => this.handlePhoneKeydown(e));
    this.emailInput.addEventListener('input', () => this.validateEmail());
    this.passwordInput.addEventListener('input', () => this.validatePassword());
    this.confirmPasswordInput.addEventListener('input', () => this.validateConfirmPassword());
    this.rememberCheckbox.addEventListener('change', () => this.validateTerms());

    // Eye toggles
    this.togglePasswordBtn.addEventListener('click', () =>
      this.togglePasswordVisibility(this.passwordInput, this.togglePasswordBtn)
    );
    this.toggleConfirmPasswordBtn.addEventListener('click', () =>
      this.togglePasswordVisibility(this.confirmPasswordInput, this.toggleConfirmPasswordBtn)
    );

    // OTP input behavior
    this.otpInputs.forEach((input) => {
      input.addEventListener('input', (e) => this.handleOtpInput(e));
      input.addEventListener('keydown', (e) => this.handleOtpKeydown(e));
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
        if (!text) return;
        this.otpInputs.forEach((i) => (i.value = ''));
        [...text].forEach((ch, idx) => { if (this.otpInputs[idx]) this.otpInputs[idx].value = ch; });
        const otp = Array.from(this.otpInputs).map((i) => i.value).join('');
        if (otp.length === 6) this.otpVerification.querySelector('#otpForm').requestSubmit();
      });
    });

    // Other buttons
    this.resendOtpBtn.addEventListener('click', () => this.resendOtp());
    this.backToFormBtn.addEventListener('click', () => this.showStep(1));
  }

  // ===== Password Indicators (3 dots) =====
  initializePasswordIndicators() {
    this.passwordInput.addEventListener('input', () => {
      const checks = this.calculatePasswordIndicators(this.passwordInput.value || '');
      this.updatePasswordIndicators(checks);
    });
  }

  calculatePasswordIndicators(password) {
    const len = password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpec  = /[^A-Za-z0-9]/.test(password);
    return { len, caseMix: hasLower && hasUpper, numSpec: hasDigit && hasSpec };
  }

  updatePasswordIndicators({ len, caseMix, numSpec }) {
    this.dotLen.classList.toggle('active', !!len);
    this.dotCase.classList.toggle('active', !!caseMix);
    this.dotMix.classList.toggle('active', !!numSpec);
  }

  // ===== Validation =====
  validateName() {
    const v = this.nameInput.value.trim();
    if (v.length < 2) { this.showError('name', 'Name must be at least 2 characters long'); return false; }
    this.hideError('name'); return true;
  }
  validatePhone() {
    const phone = this.phoneInput.value.replace(/\D/g, '');
    if (phone.length !== 10) { this.showError('phone', 'Phone number must be exactly 10 digits'); return false; }
    this.hideError('phone'); return true;
  }
  validateEmail() {
    const email = this.emailInput.value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) { this.showError('email', 'Please enter a valid email address'); return false; }
    this.hideError('email'); return true;
  }
  validatePassword() {
    const p = this.passwordInput.value || '';
    const checks = this.calculatePasswordIndicators(p);
    this.updatePasswordIndicators(checks);
    const ok = checks.len && checks.caseMix && checks.numSpec;
    if (!ok) {
      this.showError('password', 'Password must be 8+ chars and include upper, lower, number, and special.');
      return false;
    }
    this.hideError('password'); return true;
  }
  validateConfirmPassword() {
    if ((this.passwordInput.value || '') !== (this.confirmPasswordInput.value || '')) {
      this.showError('confirmPassword', 'Passwords do not match'); return false;
    }
    this.hideError('confirmPassword'); return true;
  }
  validateTerms() { return !!this.rememberCheckbox.checked; }

  // ===== Submits =====
  async handleRegistrationSubmit(e) {
    e.preventDefault();
    if (!this.validateAll()) {
      // <<< FIX: Use the global window.toast system
      window.toast.error('Please fix the errors in the form before submitting.');
      return;
    }
    this.formData = {
      name: this.nameInput.value.trim(),
      phone: this.phoneInput.value.replace(/\D/g, ''),
      email: this.emailInput.value.trim(),
      password: this.passwordInput.value,
      confirm_password: this.confirmPasswordInput.value,
      agreed_terms: this.rememberCheckbox.checked ? '1' : '0',
    };
    this.setLoading(this.registerBtn, true);
    try {
        const fd = new FormData();
        // Send all fields to register.php as per your original auth.js
        for (const key in this.formData) {
            fd.append(key, this.formData[key]);
        }
      
      // <<< FIX: Use the correct, absolute URL
      const response = await fetch(`${this.apiBaseUrl}/register.php`, {
        method: 'POST',
        body: fd,
      });
      const result = await response.json();
      if (result.status === 'success') {
        window.toast.success(result.message || 'OTP sent successfully!');
        this.showStep(2);
        this.startOtpTimer();
      } else {
        // <<< FIX: Use the global window.toast system
        window.toast.error(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error("Registration Error:", err);
      // <<< FIX: Use the global window.toast system
      window.toast.error('A network error occurred. Please check your connection and try again.');
    } finally {
      this.setLoading(this.registerBtn, false);
    }
  }

  async handleOtpSubmit(e) {
    e.preventDefault();
    const otp = Array.from(this.otpInputs).map((i) => i.value).join('');
    if (otp.length !== 6) {
      // <<< FIX: Use the global window.toast system
      window.toast.error('Please enter the complete 6-digit OTP.');
      return;
    }
    this.setLoading(this.verifyOtpBtn, true);
    try {
      const fd = new FormData();
      // Append original form data plus the OTP
      for (const key in this.formData) {
        fd.append(key, this.formData[key]);
      }
      fd.append('otp', otp);
      
      // <<< FIX: Use the correct, absolute URL
      const response = await fetch(`${this.apiBaseUrl}/verify_otp.php`, {
        method: 'POST',
        body: fd,
      });
      const result = await response.json();
      if (result.status === 'success') {
        this.showStep(3);
        this.stopOtpTimer();
      } else {
        // <<< FIX: Use the global window.toast system
        window.toast.error(result.message || 'Invalid OTP');
      }
    } catch (err) {
        console.error("OTP Verification Error:", err);
      // <<< FIX: Use the global window.toast system
      window.toast.error('A network error occurred. Please try again.');
    } finally {
      this.setLoading(this.verifyOtpBtn, false);
    }
  }

  async resendOtp() {
    this.resendOtpBtn.disabled = true; // Disable immediately
    try {
      const fd = new FormData();
      fd.append('email', this.formData.email);
      fd.append('name', this.formData.name); // resend_otp.php might need the name
      
      // <<< FIX: Use the correct, absolute URL
      const response = await fetch(`${this.apiBaseUrl}/resend_otp.php`, {
        method: 'POST',
        body: fd,
      });
      const result = await response.json();
      if (result.status === 'success') {
        // <<< FIX: Use the global window.toast system
        window.toast.success('A new OTP has been sent!');
        this.startOtpTimer();
        this.clearOtpInputs();
      } else {
        // <<< FIX: Use the global window.toast system
        window.toast.error(result.message || 'Unable to resend OTP');
        this.resendOtpBtn.disabled = false; // Re-enable if failed
      }
    } catch (err) {
        console.error("Resend OTP Error:", err);
      // <<< FIX: Use the global window.toast system
      window.toast.error('A network error occurred. Please try again.');
      this.resendOtpBtn.disabled = false; // Re-enable if failed
    }
  }

  // ===== Helpers =====
  validateAll() {
    // Run all validators and store results. This ensures all error messages show, not just the first one.
    const isNameValid = this.validateName();
    const isPhoneValid = this.validatePhone();
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();
    const isConfirmPasswordValid = this.validateConfirmPassword();
    const areTermsAgreed = this.validateTerms();
    if(!areTermsAgreed) {
      window.toast.error("You must agree to the Terms of Use.");
    }
    return isNameValid && isPhoneValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && areTermsAgreed;
  }

  showStep(step) {
    this.currentStep = step;
    this.registrationForm.style.display = (step === 1) ? 'block' : 'none';
    this.otpVerification.style.display  = (step === 2) ? 'block' : 'none';
    this.successMessage.style.display   = (step === 3) ? 'block' : 'none';

    if (step === 2) {
      this.otpEmail.textContent = this.formData.email;
      this.clearOtpInputs();
    }
  }

  startOtpTimer() {
    this.stopOtpTimer(); // Clear any existing timer
    let timeLeft = 60;
    this.otpExpiryTime = Date.now() + timeLeft * 1000;
    this.updateTimer();
    this.resendOtpBtn.disabled = true;
    this.otpTimer = setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer() {
    const timeLeft = Math.max(0, Math.round((this.otpExpiryTime - Date.now()) / 1000));
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    this.otpTimerElement.textContent = `${m}:${s}`;
    if (timeLeft <= 0) {
      this.stopOtpTimer();
      this.resendOtpBtn.disabled = false;
    }
  }

  stopOtpTimer() {
    if (this.otpTimer) clearInterval(this.otpTimer);
    this.otpTimer = null;
  }

  clearOtpInputs() {
    this.otpInputs.forEach((i) => (i.value = ''));
    if(this.otpInputs.length > 0) this.otpInputs[0].focus();
  }

  handleOtpInput(e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, '').slice(0, 1);
    const index = +input.dataset.index;
    if (input.value && index < 5) this.otpInputs[index + 1].focus();
    const otp = Array.from(this.otpInputs).map((i) => i.value).join('');
    if (otp.length === 6) this.otpVerification.querySelector('#otpForm').requestSubmit();
  }

  handleOtpKeydown(e) {
    const input = e.target;
    const index = +input.dataset.index;
    if (e.key === 'Backspace' && !input.value && index > 0) {
      this.otpInputs[index - 1].focus();
    }
  }

  togglePasswordVisibility(input, button) {
    const icon = button.querySelector('i');
    const toText = input.type === 'password';
    input.type = toText ? 'text' : 'password';
    icon.classList.toggle('ph-eye', !toText);
    icon.classList.toggle('ph-eye-slash', toText);
  }

  handlePhoneInput(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 10) v = v.slice(0, 10);
    e.target.value = v;
  }

  handlePhoneKeydown(e) {
    const allowed = [8, 9, 27, 13, 46, 37, 39, 38, 40];
    if (allowed.includes(e.keyCode) || (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))) return;
    if (e.key.length === 1 && (e.key < '0' || e.key > '9')) e.preventDefault();
  }

  setLoading(button, loading) {
    if (!button) return;
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    if (loading) {
      button.disabled = true;
      if (btnText) btnText.classList.add('hidden');
      if (btnLoading) btnLoading.classList.remove('hidden');
    } else {
      button.disabled = false;
      if (btnText) btnText.classList.remove('hidden');
      if (btnLoading) btnLoading.classList.add('hidden');
    }
  }

  showError(field, message) {
    if(this.errorElements[field]) {
      this.errorElements[field].textContent = message;
      this.errorElements[field].classList.remove('hidden');
    }
  }
  hideError(field) {
    if(this.errorElements[field]) {
      this.errorElements[field].classList.add('hidden');
    }
  }

  // <<< FIX: REMOVED the old showNotification function to avoid conflicts.
}

// <<< FIX: Initialize using the reliable 'components:loaded' event.
document.addEventListener('components:loaded', () => {
  // Check if we are on the register page by looking for the form
  if (document.getElementById('registrationForm')) {
    new RegistrationForm();
    console.log("Registration form initialized successfully.");
  }
});