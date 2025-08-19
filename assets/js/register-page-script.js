/* -------------------------------------------
   Registration Form Handler (FULL FILE)
   - Initializes AFTER component is injected
   - Eye icon toggles fixed
   - Button shows "Register" by default
   - OTP flow with timer + autosubmit
   - Three-dot password indicators (len, case, num+spec)
------------------------------------------- */

// Utility: wait until a selector exists in DOM (works with injected HTML)
const waitFor = (sel, cb) => {
    const el = document.querySelector(sel);
    if (el) return cb(el);
    const mo = new MutationObserver(() => {
      const el2 = document.querySelector(sel);
      if (el2) { mo.disconnect(); cb(el2); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  };
  
  // Registration Form Class
  class RegistrationForm {
    constructor() {
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
  
    // Return { len, caseMix, numSpec } booleans
    calculatePasswordIndicators(password) {
      const len = password.length >= 8;
      const hasLower = /[a-z]/.test(password);
      const hasUpper = /[A-Z]/.test(password);
      const hasDigit = /[0-9]/.test(password);
      const hasSpec  = /[^A-Za-z0-9]/.test(password);
      return {
        len,
        caseMix: hasLower && hasUpper,
        numSpec: hasDigit && hasSpec,
      };
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
        this.showError(
          'password',
          'Password must be 8+ chars and include upper, lower, number, and special.'
        );
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
        this.showNotification('Please fix the errors in the form', 'error');
        return;
      }
  
      // Collect data
      this.formData = {
        name: this.nameInput.value.trim(),
        phone: this.phoneInput.value.replace(/\D/g, ''),
        email: this.emailInput.value.trim(),
        password: this.passwordInput.value,
        confirm_password: this.confirmPasswordInput.value,
        agreed_terms: this.rememberCheckbox.checked,
      };
  
      this.setLoading(this.registerBtn, true);
  
      try {
        const fd = new FormData();
        fd.append('email', this.formData.email);
        fd.append('name', this.formData.name);
  
        // IMPORTANT: avoid spaces in folder names -> ../backend_php/...
        const response = await fetch('../backend_php/routes/auth/register.php', {
          method: 'POST',
          body: fd,
        });
  
        const result = await response.json();
  
        if (result.status === 'success') {
          this.showStep(2);
          this.startOtpTimer();
        } else {
          this.showNotification(result.message || 'Registration failed', 'error');
        }
      } catch (err) {
        this.showNotification('Network error. Please try again.', 'error');
      } finally {
        this.setLoading(this.registerBtn, false);
      }
    }
  
    async handleOtpSubmit(e) {
      e.preventDefault();
  
      const otp = Array.from(this.otpInputs).map((i) => i.value).join('');
      if (otp.length !== 6) {
        this.showNotification('Please enter the complete 6-digit OTP', 'error');
        return;
      }
  
      this.setLoading(this.verifyOtpBtn, true);
  
      try {
        const fd = new FormData();
        fd.append('email', this.formData.email);
        fd.append('otp', otp);
        fd.append('name', this.formData.name);
        fd.append('phone', this.formData.phone);
        fd.append('password', this.formData.password);
        fd.append('confirm_password', this.formData.confirm_password);
        fd.append('agreed_terms', this.formData.agreed_terms);
  
        const response = await fetch('../backend_php/routes/auth/verify_otp.php', {
          method: 'POST',
          body: fd,
        });
  
        const result = await response.json();
  
        if (result.status === 'success') {
          this.showStep(3);
          this.stopOtpTimer();
        } else {
          this.showNotification(result.message || 'Invalid OTP', 'error');
        }
      } catch (err) {
        this.showNotification('Network error. Please try again.', 'error');
      } finally {
        this.setLoading(this.verifyOtpBtn, false);
      }
    }
  
    async resendOtp() {
      try {
        const fd = new FormData();
        fd.append('email', this.formData.email);
        fd.append('name', this.formData.name);
  
        const response = await fetch('../backend_php/routes/auth/resend_otp.php', {
          method: 'POST',
          body: fd,
        });
  
        const result = await response.json();
  
        if (result.status === 'success') {
          this.showNotification('New OTP sent successfully!', 'success');
          this.startOtpTimer();
          this.clearOtpInputs();
        } else {
          this.showNotification(result.message || 'Unable to resend OTP', 'error');
        }
      } catch (err) {
        this.showNotification('Network error. Please try again.', 'error');
      }
    }
  
    // ===== Helpers =====
    validateAll() {
      return (
        this.validateName() &&
        this.validatePhone() &&
        this.validateEmail() &&
        this.validatePassword() &&
        this.validateConfirmPassword() &&
        this.validateTerms()
      );
    }
  
    showStep(step) {
      this.currentStep = step;
      if (step === 1) {
        this.registrationForm.style.display = 'block';
        this.otpVerification.style.display  = 'none';
        this.successMessage.style.display   = 'none';
      } else if (step === 2) {
        this.registrationForm.style.display = 'none';
        this.otpVerification.style.display  = 'block';
        this.successMessage.style.display   = 'none';
        this.otpEmail.textContent = this.formData.email;
        this.clearOtpInputs();
      } else if (step === 3) {
        this.registrationForm.style.display = 'none';
        this.otpVerification.style.display  = 'none';
        this.successMessage.style.display   = 'block';
      }
    }
  
    startOtpTimer() {
      let timeLeft = 60;
      this.otpExpiryTime = Date.now() + timeLeft * 1000;
  
      this.updateTimer();
      this.resendOtpBtn.disabled = true;
  
      this.otpTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
          this.stopOtpTimer();
          this.resendOtpBtn.disabled = false;
          this.otpTimerElement.textContent = '00:00';
        } else {
          this.updateTimer();
        }
      }, 1000);
    }
  
    updateTimer() {
      const timeLeft = Math.max(0, Math.ceil((this.otpExpiryTime - Date.now()) / 1000));
      const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
      const s = (timeLeft % 60).toString().padStart(2, '0');
      this.otpTimerElement.textContent = `${m}:${s}`;
    }
  
    stopOtpTimer() {
      if (this.otpTimer) {
        clearInterval(this.otpTimer);
        this.otpTimer = null;
      }
    }
  
    clearOtpInputs() {
      this.otpInputs.forEach((i) => (i.value = ''));
      this.otpInputs[0].focus();
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
      // allow nav/edit keys and Ctrl combos
      const allowed = [8,9,27,13,46,37,39,38,40];
      if (allowed.includes(e.keyCode) ||
          (e.keyCode === 65 && e.ctrlKey) ||
          (e.keyCode === 67 && e.ctrlKey) ||
          (e.keyCode === 86 && e.ctrlKey) ||
          (e.keyCode === 88 && e.ctrlKey)) return;
  
      // numbers only, limit 10
      if (e.keyCode >= 48 && e.keyCode <= 57) {
        if (e.target.value.replace(/\D/g, '').length >= 10) e.preventDefault();
        return;
      }
      e.preventDefault();
    }
  
    setLoading(button, loading) {
      if (!button) return;
      button.classList.toggle('loading', !!loading);
      button.disabled = !!loading;
    }
  
    showError(field, message) {
      this.errorElements[field].textContent = message;
      this.errorElements[field].classList.remove('hidden');
    }
    hideError(field) {
      this.errorElements[field].classList.add('hidden');
    }
  
    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[9999] max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error'   ? 'bg-red-500 text-white'   :
                             'bg-blue-500 text-white'
      }`;
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
      notification.addEventListener('click', () => notification.remove());
    }
  }
  
  // Initialize AFTER the component is injected
  document.addEventListener('DOMContentLoaded', () => {
    waitFor('#registrationForm', () => new RegistrationForm());
  });
  