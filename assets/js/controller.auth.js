// Orchestrates auth flows, wires UI + API + validation
;(function() {
  class AuthController {
    constructor() {
      this.currentUser = null;
      this.currentEmail = null;
      this.otpTimer = null;
      this.init();
    }

    init() {
      this.restoreSession();
      this.updateHeader(); // Update header based on login status
      this.bindEvents();
      this.bindUserIconEvents(); // Ensure user icon events are bound
      this.initOtpInputs();
      this.initResetOtpInputs();
      this.setupPasswordToggles();
      this.maybeShowModal();
      
      // Ensure modal is hidden if user is logged in
      if (localStorage.getItem('userLoggedIn') === 'true') {
        this.hideModal();
      }
    }

    // Session
    restoreSession() {
      const loggedIn = localStorage.getItem('userLoggedIn') === 'true';
      const user = localStorage.getItem('currentUser');
      if (loggedIn && user) {
        this.currentUser = user;
        this.updateHeader();
      }
    }

    persistLogin(email) {
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('currentUser', email);
      // Clear popupSeen so user can see popup again if they log out
      localStorage.removeItem('popupSeen');
      this.currentUser = email;
      this.updateHeader();
    }

    logout() {
      localStorage.removeItem('userLoggedIn');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('pendingSignup');
      // Clear popupSeen so user can see popup again after logout
      localStorage.removeItem('popupSeen');
      this.currentUser = null;
      location.reload();
    }

    updateHeader() {
      const userIcon = document.querySelector('.user-icon');
      const loginPopup = document.querySelector('.login-popup');
      if (!userIcon || !loginPopup) return;
      
      if (this.currentUser) {
        // User is logged in - update popup content
        loginPopup.innerHTML = `
          <div class="text-center mb-3">
            <div class="text-sm font-medium">Welcome, ${this.currentUser}!</div>
          </div>
          <a href="my-account.html" class="button-main w-full text-center">My Account</a>
          <button class="button-main bg-white text-black border border-black w-full text-center mt-3" id="logout-btn">Logout</button>
        `;
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
      } else {
        // User is not logged in - restore original content
        loginPopup.innerHTML = `
          <a href="login.html" class="button-main w-full text-center">Login</a>
          <div class="text-secondary text-center mt-3 pb-4">
            Don't have an account?
            <a href="signup.html" class="text-black pl-1 hover:underline">Register</a>
          </div>
          <a href="my-account.html" class="button-main bg-white text-black border border-black w-full text-center">Dashboard</a>
          <div class="bottom mt-4 pt-4 border-t border-line"></div>
          <a href="#!" class="body1 hover:underline">Support</a>
        `;
      }
    }

    bindUserIconEvents() {
      const userIcon = document.querySelector('.user-icon');
      const loginPopup = document.querySelector('.login-popup');
      console.log('Looking for user icon elements:', { userIcon: !!userIcon, loginPopup: !!loginPopup });
      
      if (userIcon && loginPopup) {
        console.log('User icon found, binding events...');
        
        // Add click event to user icon
        userIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('User icon clicked!');
          loginPopup.classList.toggle('hidden');
          console.log('Popup toggled, hidden:', loginPopup.classList.contains('hidden'));
        });
        
        // Close popup when clicking outside
        document.addEventListener('click', (e) => {
          if (!userIcon.contains(e.target) && !loginPopup.contains(e.target)) {
            loginPopup.classList.add('hidden');
          }
        });
        
        console.log('User icon events bound successfully');
      } else {
        console.log('User icon or popup not found:', { userIcon: !!userIcon, loginPopup: !!loginPopup });
        // Try to find them again after a short delay
        setTimeout(() => {
          const retryUserIcon = document.querySelector('.user-icon');
          const retryLoginPopup = document.querySelector('.login-popup');
          console.log('Retry - User icon elements:', { userIcon: !!retryUserIcon, loginPopup: !!retryLoginPopup });
        }, 1000);
      }
    }

    // Modal
    maybeShowModal() {
      // Only show modal on index.html page
      if (window.location.pathname !== '/index.html' && window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html')) {
        return;
      }
      // Don't show modal if user is already logged in
      if (localStorage.getItem('userLoggedIn') === 'true') {
        return;
      }
      // Don't show modal if user has already seen it (for non-logged in users)
      if (localStorage.getItem('popupSeen') === 'true') {
        return;
      }
      setTimeout(() => this.showModal(), window.AppConfig?.modalDelayMs || 2000);
    }
    showModal() { document.querySelector('.modal-newsletter')?.style && (document.querySelector('.modal-newsletter').style.display = 'flex'); }
    hideModal() { const m = document.querySelector('.modal-newsletter'); if (m) m.style.display = 'none'; }

    // Bind UI events
    bindEvents() {
      // Close modal
      document.querySelector('.close-newsletter-btn')?.addEventListener('click', () => { this.hideModal(); localStorage.setItem('popupSeen', 'true'); });
      const modal = document.querySelector('.modal-newsletter');
      modal?.addEventListener('click', (e) => { if (e.target === modal) { this.hideModal(); localStorage.setItem('popupSeen', 'true'); }});

      // Bind user icon events
      this.bindUserIconEvents();

      // Switchers
      document.getElementById('show-signup-form')?.addEventListener('click', () => AuthUI.showSignup());
      document.getElementById('show-login-form')?.addEventListener('click', () => AuthUI.showLogin());
      document.getElementById('back-to-signup')?.addEventListener('click', () => AuthUI.showSignup());
      document.getElementById('back-to-login-from-forgot')?.addEventListener('click', () => AuthUI.showLogin());
      document.getElementById('back-to-forgot-from-otp')?.addEventListener('click', () => AuthUI.showForgot());
      document.getElementById('back-to-forgot-password')?.addEventListener('click', () => AuthUI.showForgot());
      document.getElementById('show-forgot-password-form')?.addEventListener('click', () => AuthUI.showForgot());

      // Forms
      document.getElementById('login-form')?.addEventListener('submit', (e) => this.onLogin(e));
      document.getElementById('signup-form')?.addEventListener('submit', (e) => this.onSignup(e));
      document.getElementById('otp-form')?.addEventListener('submit', (e) => this.onVerifySignupOtp(e));
      document.getElementById('resend-otp-btn')?.addEventListener('click', () => this.onResendOtp());
      document.getElementById('forgot-password-form')?.addEventListener('submit', (e) => this.onForgot(e));
      document.getElementById('reset-otp-form')?.addEventListener('submit', (e) => this.onVerifyForgotOtp(e));
      document.getElementById('reset-password-form')?.addEventListener('submit', (e) => this.onResetPassword(e));

      // Live validations
      this.setupLiveValidation();
    }

    // Password toggles
    setupPasswordToggles() {
      this.bindToggle('login-password', 'toggle-password');
      this.bindToggle('signup-password', 'toggle-signup-password');
      this.bindToggle('signup-confirm-password', 'toggle-signup-confirm-password');
      this.bindToggle('reset-new-password', 'toggle-reset-password');
      this.bindToggle('reset-confirm-password', 'toggle-reset-confirm-password');
    }
    bindToggle(inputId, toggleId) {
      const input = document.getElementById(inputId);
      const toggle = document.getElementById(toggleId);
      toggle?.addEventListener('click', () => {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        const icon = toggle.querySelector('i');
        if (icon) icon.className = type === 'password' ? 'ph ph-eye text-lg' : 'ph ph-eye-slash text-lg';
      });
    }

    // Live validation
    setupLiveValidation() {
      const loginEmail = document.getElementById('login-email');
      const signupEmail = document.getElementById('signup-email');
      loginEmail?.addEventListener('blur', () => { if (!Utils.isValidEmail(loginEmail.value)) this.setFieldError(loginEmail, 'Please enter a valid email address'); });
      loginEmail?.addEventListener('input', () => this.clearFieldState(loginEmail));
      signupEmail?.addEventListener('blur', () => { if (!Utils.isValidEmail(signupEmail.value)) this.setFieldError(signupEmail, 'Please enter a valid email address'); });
      signupEmail?.addEventListener('input', () => this.clearFieldState(signupEmail));
      // Phone restrictions
      const phone = document.getElementById('signup-phone');
      phone?.addEventListener('input', function() { this.value = this.value.replace(/\D/g, '').slice(0, 10); });
    }

    setFieldError(input, message) {
      input.classList.add('border-red-500');
      let err = document.getElementById(input.id + '-error');
      if (!err) {
        err = document.createElement('div');
        err.id = input.id + '-error';
        err.className = 'text-red-500 text-xs mt-1';
        input.parentNode.appendChild(err);
      }
      err.textContent = message;
    }
    clearFieldState(input) {
      input.classList.remove('border-red-500', 'border-green-500');
      document.getElementById(input.id + '-error')?.remove();
    }

    // OTP inputs
    initOtpInputs() { this.bindOtpInputs(['otp-input-1', 'otp-input-2', 'otp-input-3', 'otp-input-4']); }
    initResetOtpInputs() { this.bindOtpInputs(['reset-otp-input-1', 'reset-otp-input-2', 'reset-otp-input-3', 'reset-otp-input-4']); }
    bindOtpInputs(ids) {
      ids.forEach((id, idx) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', (e) => { if (e.target.value.length === 1 && idx < ids.length - 1) document.getElementById(ids[idx + 1]).focus(); });
        el.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !e.target.value && idx > 0) document.getElementById(ids[idx - 1]).focus(); });
      });
    }
    readOtp(ids) { return ids.map(id => document.getElementById(id)?.value || '').join(''); }

    // Handlers
    async onLogin(e) {
      e.preventDefault();
      const email = document.getElementById('login-email')?.value.trim();
      const password = document.getElementById('login-password')?.value;
      const btn = document.getElementById('login-submit-btn');
      const err = Validators.require(email, 'Email') || Validators.email(email) || Validators.require(password, 'Password');
      if (err) return window.toast.error(err);
      try {
        Utils.setLoading(btn, 'Signing In...');
        const res = await AuthAPI.login({ email, password });
        if (res.status === 'success') {
          this.persistLogin(email);
          this.hideModal();
          window.toast.success('Welcome back! You are now logged in.');
          setTimeout(() => { window.location.href = 'index.html'; }, 1200);
        } else { window.toast.error(res.message || 'Login failed'); }
      } catch (e1) { window.toast.error('Network error. Please try again.'); }
      finally { Utils.clearLoading(btn); }
    }

    async onSignup(e) {
      e.preventDefault();
      const name = document.getElementById('signup-name')?.value.trim();
      const email = document.getElementById('signup-email')?.value.trim();
      const phone = document.getElementById('signup-phone')?.value.trim();
      const password = document.getElementById('signup-password')?.value;
      const confirm = document.getElementById('signup-confirm-password')?.value;
      const btn = document.getElementById('signup-submit-btn');

      let err = Validators.require(name, 'Name') || Validators.name?.(name) || Validators.require(email, 'Email') || Validators.email(email) || Validators.phone10(phone) || Validators.password(password) || Validators.confirmPassword(password, confirm);
      if (err) return window.toast.error(err);

      try {
        Utils.setLoading(btn, 'Creating Account...');
        localStorage.setItem('pendingSignup', JSON.stringify({ name, email, phone, password, confirm_password: confirm }));
        const res = await AuthAPI.registerSendOtp({ name, email, phone, password, confirm_password: confirm });
        if (res.status === 'success') {
          this.currentEmail = email;
          window.toast.success('OTP sent to your email!');
          AuthUI.showOtp(email);
          this.startOtpTimer();
        } else { window.toast.error(res.message || 'Failed to send OTP'); }
      } catch (e1) { window.toast.error('Network error. Please try again.'); }
      finally { Utils.clearLoading(btn); }
    }

    async onVerifySignupOtp(e) {
      e.preventDefault();
      const otp = this.readOtp(['otp-input-1','otp-input-2','otp-input-3','otp-input-4']);
      const err = Validators.otp4(otp);
      if (err) return window.toast.error(err);
      const payload = JSON.parse(localStorage.getItem('pendingSignup') || '{}');
      try {
        const res = await AuthAPI.verifySignupOtp({ ...payload, email: payload.email, otp });
        if (res.status === 'success') {
          window.toast.success('Email verified successfully! Please login.');
          localStorage.removeItem('pendingSignup');
          // Redirect to login page with email pre-filled
          setTimeout(() => { 
            window.location.href = `login.html?email=${encodeURIComponent(payload.email)}`; 
          }, 1500);
        } else { window.toast.error(res.message || 'Invalid OTP'); }
      } catch (e1) { window.toast.error('Network error. Please try again.'); }
    }

    async onResendOtp() {
      if (!this.currentEmail) return;
      try {
        const res = await AuthAPI.resendOtp({ email: this.currentEmail, purpose: 'signup' });
        if (res.status === 'success') {
          window.toast.success('OTP resent to your email');
          this.startOtpTimer();
        } else { window.toast.error(res.message || 'Failed to resend OTP'); }
      } catch (e1) { window.toast.error('Network error. Please try again.'); }
    }

    async onForgot(e) {
      e.preventDefault();
      const email = document.getElementById('forgot-email')?.value.trim();
      const btn = document.getElementById('forgot-password-submit-btn');
      const err = Validators.require(email, 'Email') || Validators.email(email);
      if (err) return window.toast.error(err);
      try {
        Utils.setLoading(btn, 'Sending...');
        const res = await AuthAPI.forgotPassword({ email });
        if (res.status === 'success') {
          this.currentEmail = email;
          window.toast.success('Password reset OTP sent to your email!');
          AuthUI.showResetOtp(email);
          this.startOtpTimer();
        } else { window.toast.error(res.message || 'Failed to send reset OTP'); }
      } catch (e1) { window.toast.error('Network error. Please try again.'); }
      finally { Utils.clearLoading(btn); }
    }

    async onVerifyForgotOtp(e) {
      e.preventDefault();
      const email = this.currentEmail;
      const otp = this.readOtp(['reset-otp-input-1','reset-otp-input-2','reset-otp-input-3','reset-otp-input-4']);
      const err = Validators.otp4(otp);
      if (err) return window.toast.error(err);
      try {
        const res = await AuthAPI.verifyForgotOtp({ email, otp });
        if (res.status === 'success') {
          window.toast.success('OTP verified successfully! Set your new password.');
          AuthUI.showResetPassword(email);
        } else { window.toast.error(res.message || 'Invalid OTP'); }
      } catch (e1) { window.toast.error('Network error. Please try again.'); }
    }

    async onResetPassword(e) {
      e.preventDefault();
      const email = this.currentEmail;
      const newPassword = document.getElementById('reset-new-password')?.value;
      const confirm = document.getElementById('reset-confirm-password')?.value;
      const btn = document.getElementById('reset-password-submit-btn');
      let err = Validators.password(newPassword) || Validators.confirmPassword(newPassword, confirm);
      if (err) return window.toast.error(err);
      try {
        Utils.setLoading(btn, 'Resetting...');
        const res = await AuthAPI.resetPassword({ email, new_password: newPassword, confirm_password: confirm });
        if (res.status === 'success') {
          window.toast.success('Password reset successfully! Please login.');
          AuthUI.showLogin();
          const loginEmail = document.getElementById('login-email');
          if (loginEmail) loginEmail.value = email;
        } else { window.toast.error(res.message || 'Failed to reset password'); }
      } catch (e1) { window.toast.error('Network error. Please try again.'); }
      finally { Utils.clearLoading(btn); }
    }

    // OTP Timer
    startOtpTimer() {
      this.stopOtpTimer();
      let timeLeft = 120;
      const timerElement = document.getElementById('timer-countdown');
      const resendBtn = document.getElementById('resend-otp-btn');
      const timerText = document.getElementById('timer-text');
      if (resendBtn) resendBtn.classList.add('hidden');
      this.otpTimer = setInterval(() => {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        if (timerElement) timerElement.textContent = `${m}:${s}`;
        if (timeLeft <= 0) {
          this.stopOtpTimer();
          if (resendBtn) resendBtn.classList.remove('hidden');
          if (timerText) timerText.textContent = 'Code expired. ';
        }
        timeLeft--;
      }, 1000);
    }
    stopOtpTimer() { if (this.otpTimer) { clearInterval(this.otpTimer); this.otpTimer = null; } }
  }

  // bootstrap
  window.addEventListener('DOMContentLoaded', () => {
    window.Auth = new AuthController();
  });
})();


