// Authentication API layer with timeout, unified shape, mock fallback, and debug logs
;(function() {
  const base = () => (window.AppConfig?.apiBaseUrl || '');
  const DEBUG = !!window.AppConfig?.debugAuth;
  const USE_MOCK = !!window.AppConfig?.useMockAuth;
  const TIMEOUT_MS = 15000;

  function logDebug(label, payload) { if (DEBUG) { try { console.log(`[AUTH:${label}]`, redacted(payload)); } catch(_) {} } }
  function redacted(obj) {
    try {
      const clone = JSON.parse(JSON.stringify(obj));
      const secretKeys = ['password','new_password','confirm_password'];
      const mask = v => (typeof v === 'string' ? '*'.repeat(Math.min(v.length, 8)) : v);
      const walk = (o) => { if (!o || typeof o !== 'object') return; for (const k of Object.keys(o)) { if (secretKeys.includes(k)) o[k] = mask(o[k]); else walk(o[k]); } };
      walk(clone);
      return clone;
    } catch(_) { return obj; }
  }

  async function withTimeout(promise, ms = TIMEOUT_MS) {
    return Promise.race([
      promise,
      new Promise((_, rej) => setTimeout(() => rej(new Error('Request timeout')), ms))
    ]);
  }

  async function post(url, formData) {
    logDebug('REQ', { url, formData: Object.fromEntries(formData.entries()) });
    const res = await withTimeout(fetch(url, { method: 'POST', body: formData }));
    let data = null;
    try { data = await res.json(); } catch(_) { data = { status: 'error', message: 'Invalid server response' }; }
    if (!res.ok) {
      const message = data?.message || `HTTP ${res.status}`;
      logDebug('RES_ERR', { url, status: res.status, data });
      return { ok: false, status: 'error', message };
    }
    logDebug('RES', { url, data });
    // Normalize
    const status = data?.status === 'success' ? 'success' : (data?.status || 'error');
    return { ok: status === 'success', status, message: data?.message || '', data };
  }

  // Mock service (in-memory/localStorage) for fallback
  const MockAuth = (() => {
    const SLEEP = (ms) => new Promise(r => setTimeout(r, ms));
    const STORE = () => JSON.parse(localStorage.getItem('mock_auth_store') || '{}');
    const SAVE = (obj) => localStorage.setItem('mock_auth_store', JSON.stringify(obj));
    const genOTP = () => String(Math.floor(100000 + Math.random()*900000));
    const hash = (s) => btoa(unescape(encodeURIComponent(s))).split('').reverse().join('');
    return {
      async sendCode(email) {
        await SLEEP(600);
        const st = STORE();
        st.otp = genOTP();
        st.email = email;
        st.otpExpiresAt = Date.now() + 60_000;
        SAVE(st);
        return { ok: true, status: 'success', message: 'If an account exists, we sent a code.' };
      },
      async verifyOtp(email, otp) {
        await SLEEP(400);
        const st = STORE();
        if (st.email !== email || Date.now() > (st.otpExpiresAt||0) || st.otp !== otp) {
          return { ok: false, status: 'error', message: 'Invalid or expired code' };
        }
        st.verified = true; SAVE(st);
        return { ok: true, status: 'success', message: 'Verified' };
      },
      async resetPassword(email, otp, newPassword) {
        await SLEEP(500);
        const st = STORE();
        if (st.email !== email || st.otp !== otp || !st.verified) {
          return { ok: false, status: 'error', message: 'OTP not verified' };
        }
        st.passwordHash = hash(newPassword);
        SAVE(st);
        return { ok: true, status: 'success', message: 'Password reset successfully' };
      },
      async login(email, password) {
        await SLEEP(400);
        const st = STORE();
        if (st.email === email && st.passwordHash === hash(password)) {
          return { ok: true, status: 'success', message: 'Login successful' };
        }
        return { ok: false, status: 'error', message: 'Invalid email or password' };
      }
    };
  })();

  const AuthAPI = {
    // Aliases matching required service names
    sendCode(email) { return this.forgotPassword({ email }); },
    verifyOtp(email, otp) { return this.verifyForgotOtp({ email, otp }); },
    resetPasswordUnified(email, otp, newPassword) { return this.resetPassword({ email, new_password: newPassword, confirm_password: newPassword, otp }); },
    loginUnified(email, password) { return this.login({ email, password }); },
    async login({ email, password }) {
      if (USE_MOCK) return MockAuth.login(email, password);
      return post(`${base()}/login.php`, Utils.toFormData({ email, password }));
    },
    async registerSendOtp({ email, name, phone, password, confirm_password }) {
      if (USE_MOCK) return MockAuth.sendCode(email);
      return post(`${base()}/register.php`, Utils.toFormData({ email, name, phone, password, confirm_password, agreed_terms: '1' }));
    },
    async verifySignupOtp({ email, otp, name, phone, password, confirm_password }) {
      if (USE_MOCK) return MockAuth.verifyOtp(email, otp);
      return post(`${base()}/verify_otp.php`, Utils.toFormData({ email, otp, name, phone, password, confirm_password, agreed_terms: '1' }));
    },
    async resendOtp({ email, purpose = 'signup', name = '' }) {
      if (USE_MOCK) return MockAuth.sendCode(email);
      return post(`${base()}/resend_otp.php`, Utils.toFormData({ email, purpose, name }));
    },
    async forgotPassword({ email }) {
      if (USE_MOCK) return MockAuth.sendCode(email);
      return post(`${base()}/forgot_password.php`, Utils.toFormData({ email }));
    },
    async verifyForgotOtp({ email, otp }) {
      if (USE_MOCK) return MockAuth.verifyOtp(email, otp);
      return post(`${base()}/verify_forgot_password_otp.php`, Utils.toFormData({ email, otp }));
    },
    async resetPassword({ email, new_password, confirm_password, otp }) {
      if (USE_MOCK) return MockAuth.resetPassword(email, otp || '', new_password);
      // Backend verifies OTP previously; here we submit new passwords only
      return post(`${base()}/reset_password.php`, Utils.toFormData({ email, new_password, confirm_password }));
    },
  };

  window.AuthAPI = AuthAPI;
})();



