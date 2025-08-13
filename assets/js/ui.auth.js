// UI helpers for auth modals/forms
;(function() {
  const AuthUI = {
    showLogin() {
      toggle('login');
    },
    showSignup() {
      toggle('signup');
    },
    showOtp(email) {
      toggle('otp');
      const el = Utils.qs('#otp-email-display');
      if (el) el.textContent = email || '';
      focusFirst(['#otp-input-1']);
    },
    showForgot() {
      toggle('forgot');
    },
    showResetOtp(email) {
      toggle('reset-otp');
      const el = Utils.qs('#reset-otp-email-display');
      if (el) el.textContent = email || '';
      focusFirst(['#reset-otp-input-1']);
    },
    showResetPassword(email) {
      toggle('reset-password');
      const el = Utils.qs('#reset-email-display');
      if (el) el.textContent = email || '';
    },
  };

  function toggle(section) {
    const map = {
      login: ['#login-form', '#login-header'],
      signup: ['#signup-form', '#signup-header'],
      otp: ['#otp-form', '#otp-header'],
      forgot: ['#forgot-password-form', '#forgot-password-header'],
      'reset-otp': ['#reset-otp-form', '#reset-otp-header'],
      'reset-password': ['#reset-password-form', '#reset-password-header'],
    };
    Object.values(map).forEach(sel => sel.forEach(s => Utils.qs(s)?.classList.add('hidden')));
    (map[section] || []).forEach(s => Utils.qs(s)?.classList.remove('hidden'));
  }

  function focusFirst(ids) {
    for (const id of ids) {
      const el = Utils.qs(id);
      if (el) { el.focus(); break; }
    }
  }

  window.AuthUI = AuthUI;
})();



