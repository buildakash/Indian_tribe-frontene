/* assets/js/login-page-script.js
   Works with your provided HTML (login/forgot/reset-otp/reset-password forms)
   No design change: only toggles `.hidden`
*/

(function () {
    // --- Config (adjust paths if your backend differs) ---
    const API_BASE = (window.AppConfig && window.AppConfig.apiBaseUrl) || '';
    const ROUTES = {
      login:                `${API_BASE}/login`,
      sendResetCode:        `${API_BASE}/forgot-password/send-code`,
      verifyResetCode:      `${API_BASE}/forgot-password/verify`,
      resetPassword:        `${API_BASE}/forgot-password/reset`,
    };
  
    // Wait until components are injected
    document.addEventListener('components:loaded', initializeLoginLogic);
    // Fallback if this event isn’t fired on this page:
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(() => initializeLoginLogic(), 0);
    }
  
    function initializeLoginLogic() {
      // ----- Forms -----
      const loginForm  = document.getElementById('login-form');
      const forgotForm = document.getElementById('forgot-password-form');
      const otpForm    = document.getElementById('reset-otp-form');        // <- IMPORTANT: your HTML id
      const resetForm  = document.getElementById('reset-password-form');
  
      if (!loginForm || !forgotForm || !otpForm || !resetForm) return;
  
      // ----- Buttons / Links -----
      const linkShowForgot   = document.getElementById('show-forgot-password-form');
      const btnBackFromForgot= document.getElementById('back-to-login-from-forgot');
      const btnBackFromOtp   = document.getElementById('back-to-forgot-from-otp');
      const btnBackFromReset = document.getElementById('back-to-forgot-password');
      const btnResendOtp     = document.getElementById('resend-otp-btn');
  
      const btnLoginSubmit   = document.getElementById('login-submit-btn');
      const btnForgotSubmit  = document.getElementById('forgot-password-submit-btn');
      const btnOtpVerify     = document.getElementById('verify-reset-otp-btn');
      const btnResetSubmit   = document.getElementById('reset-password-submit-btn');
  
      // ----- Fields -----
      const inputLoginEmail  = document.getElementById('login-email');
      const inputLoginPass   = document.getElementById('login-password');
      const inputForgotEmail = document.getElementById('forgot-email');
      const otpInputs        = Array.from(document.querySelectorAll('#reset-otp-container .otp-input'));
      const inputNewPass     = document.getElementById('reset-new-password');
      const inputConfirmPass = document.getElementById('reset-confirm-password');
  
      // ----- Messages -----
      const msgGlobalSuccess = document.getElementById('success-message');
      const msgGlobalError   = document.getElementById('error-message');
      const msgLoginEmailErr = document.getElementById('login-email-error');
      const msgLoginPassErr  = document.getElementById('login-passrword-error'); // note: id is spelled like this in your HTML
      const msgForgotEmailErr= document.getElementById('forgot-email-error');
      const msgOtpErr        = document.getElementById('reset-otp-error');
      const msgNewPassErr    = document.getElementById('new-password-error');
      const msgConfirmErr    = document.getElementById('confirm-password-error');
  
      // ----- Timer -----
      const timerWrap   = document.getElementById('timer-display');
      const timerCount  = document.getElementById('timer-countdown');
  
      // ----- Local state (email/otp to carry through) -----
      let resetEmail = '';
      let lastOtp    = '';
      let countdown  = null;
  
      // ---------- Helpers ----------
      const hide = el => el && el.classList.add('hidden');
      const show = el => el && el.classList.remove('hidden');
      const setText = (el, t) => { if (el) el.textContent = t || ''; };
      const clearText = el => setText(el, '');
  
      function clearInlineErrors() {
        [msgLoginEmailErr, msgLoginPassErr, msgForgotEmailErr, msgOtpErr, msgNewPassErr, msgConfirmErr].forEach(clearText);
      }
      function clearGlobal() {
        clearText(msgGlobalSuccess); clearText(msgGlobalError);
      }
  
      function switchTo(formEl) {
        [loginForm, forgotForm, otpForm, resetForm].forEach(hide);
        show(formEl);
        clearInlineErrors();
        clearGlobal();
      }
  
      function isValidEmail(e) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e||'').trim());
      }
      function isStrongPassword(pw) {
        return pw && pw.length >= 8 &&
          /[a-z]/.test(pw) && /[A-Z]/.test(pw) &&
          /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);
      }
  
      async function apiFetch(url, payload) {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload || {})
        });
        let data = null;
        try { data = await res.json(); } catch {}
        if (!res.ok) {
          const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
          throw new Error(msg);
        }
        return data || {};
      }
  
      // ---------- OTP input UX ----------
      otpInputs.forEach((input, idx) => {
        input.addEventListener('input', e => {
          e.target.value = e.target.value.replace(/\D/g, '').slice(0,1);
          if (e.target.value && idx < otpInputs.length - 1) otpInputs[idx + 1].focus();
        });
        input.addEventListener('keydown', e => {
          if (e.key === 'Backspace' && !e.target.value && idx > 0) otpInputs[idx - 1].focus();
        });
        input.addEventListener('paste', e => {
          const data = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, otpInputs.length);
          if (data.length > 1) {
            e.preventDefault();
            data.split('').forEach((ch, i) => { if (otpInputs[i]) otpInputs[i].value = ch; });
            otpInputs[Math.min(data.length, otpInputs.length)-1].focus();
          }
        });
      });
  
      function startCountdown(seconds = 60) {
        clearInterval(countdown);
        let t = seconds;
        setText(timerCount, t);
        show(timerWrap); hide(btnResendOtp);
        countdown = setInterval(() => {
          t -= 1;
          setText(timerCount, Math.max(t,0));
          if (t <= 0) {
            clearInterval(countdown);
            hide(timerWrap);
            show(btnResendOtp);
          }
        }, 1000);
      }
  
      function gatherOtp() {
        return otpInputs.map(i => i.value).join('');
      }
  
      // ---------- Event wiring ----------
      linkShowForgot?.addEventListener('click', e => {
        e.preventDefault();
        // Prefill forgot email from login if available
        const email = (inputLoginEmail && inputLoginEmail.value || '').trim();
        if (email && isValidEmail(email)) inputForgotEmail.value = email;
        switchTo(forgotForm);
      });
  
      btnBackFromForgot?.addEventListener('click', () => switchTo(loginForm));
      btnBackFromOtp?.addEventListener('click', () => switchTo(forgotForm));
      btnBackFromReset?.addEventListener('click', () => switchTo(forgotForm));
  
      // ---- Login submit ----
      loginForm.addEventListener('submit', async e => {
        e.preventDefault(); clearInlineErrors(); clearGlobal();
  
        const email = (inputLoginEmail.value || '').trim();
        const pass  = inputLoginPass.value || '';
  
        if (!isValidEmail(email)) { setText(msgLoginEmailErr, 'Please enter a valid email.'); return; }
        if (!pass) { setText(msgLoginPassErr, 'Please enter your password.'); return; }
  
        const btnOld = btnLoginSubmit.textContent;
        btnLoginSubmit.textContent = 'Logging in...';
        btnLoginSubmit.disabled = true;
  
        try {
          const resp = await apiFetch(ROUTES.login, { email, password: pass });
          setText(msgGlobalSuccess, resp.message || 'Logged in successfully.');
          // TODO: window.location.href = '...';
        } catch (err) {
          setText(msgGlobalError, err.message || 'Login failed.');
        } finally {
          btnLoginSubmit.textContent = btnOld;
          btnLoginSubmit.disabled = false;
        }
      });
  
      // ---- Forgot: send code ----
      forgotForm.addEventListener('submit', async e => {
        e.preventDefault(); clearInlineErrors(); clearGlobal();
  
        const email = (inputForgotEmail.value || '').trim();
        if (!isValidEmail(email)) { setText(msgForgotEmailErr, 'Enter a valid email.'); return; }
  
        const btnOld = btnForgotSubmit.textContent;
        btnForgotSubmit.textContent = 'Sending...';
        btnForgotSubmit.disabled = true;
  
        try {
          const resp = await apiFetch(ROUTES.sendResetCode, { email });
          resetEmail = email;
          // If backend returns code in dev, capture it (optional)
          lastOtp = (resp && (resp.code || resp.otp)) || '';
          otpInputs.forEach(i => i.value = '');
          startCountdown(60);
          switchTo(otpForm);
  
          // Dev hint if code returned (remove in prod)
          if (lastOtp) setText(msgGlobalSuccess, `Code sent. (Dev hint: ${lastOtp})`);
          else setText(msgGlobalSuccess, 'Verification code sent to your email.');
        } catch (err) {
          setText(msgGlobalError, err.message || 'Unable to send reset code.');
        } finally {
          btnForgotSubmit.textContent = btnOld;
          btnForgotSubmit.disabled = false;
        }
      });
  
      // ---- Resend OTP ----
      btnResendOtp?.addEventListener('click', async () => {
        clearInlineErrors(); clearGlobal();
        if (!isValidEmail(resetEmail)) { setText(msgGlobalError, 'Missing email. Go back and enter your email.'); return; }
        try {
          const resp = await apiFetch(ROUTES.sendResetCode, { email: resetEmail });
          lastOtp = (resp && (resp.code || resp.otp)) || '';
          otpInputs.forEach(i => i.value = '');
          startCountdown(60);
          if (lastOtp) setText(msgGlobalSuccess, `New code sent. (Dev: ${lastOtp})`);
          else setText(msgGlobalSuccess, 'New verification code sent.');
        } catch (err) {
          setText(msgGlobalError, err.message || 'Unable to resend code.');
        }
      });
  
      // ---- OTP verify ----
      otpForm.addEventListener('submit', async e => {
        e.preventDefault(); clearInlineErrors(); clearGlobal();
  
        const code = gatherOtp();
        if (!/^\d{4}$/.test(code)) { setText(msgOtpErr, 'Enter the 4-digit code.'); return; }
  
        const btnOld = btnOtpVerify.textContent;
        btnOtpVerify.textContent = 'Verifying...';
        btnOtpVerify.disabled = true;
  
        try {
          const resp = await apiFetch(ROUTES.verifyResetCode, { email: resetEmail, code });
          // Optionally save token/nonce from backend if returned
          // e.g., window.sessionStorage.setItem('reset_token', resp.token)
          setText(msgGlobalSuccess, resp.message || 'Code verified. Set your new password.');
          switchTo(resetForm);
          lastOtp = code; // keep the verified code for reset if backend expects it
        } catch (err) {
          setText(msgOtpErr, err.message || 'Verification failed.');
        } finally {
          btnOtpVerify.textContent = btnOld;
          btnOtpVerify.disabled = false;
        }
      });
  
      // ---- Reset password ----
      resetForm.addEventListener('submit', async e => {
        e.preventDefault(); clearInlineErrors(); clearGlobal();
  
        const pw  = inputNewPass.value || '';
        const cpw = inputConfirmPass.value || '';
  
        if (!isStrongPassword(pw)) {
          setText(msgNewPassErr, 'Use 8+ chars incl. upper, lower, number & special.');
          return;
        }
        if (pw !== cpw) {
          setText(msgConfirmErr, 'Passwords do not match.');
          return;
        }
  
        const btnOld = btnResetSubmit.textContent;
        btnResetSubmit.textContent = 'Resetting...';
        btnResetSubmit.disabled = true;
  
        try {
          // If your backend returns a reset token at verify step, send it here instead of OTP.
          // const token = sessionStorage.getItem('reset_token');
          const resp = await apiFetch(ROUTES.resetPassword, {
            email: resetEmail,
            code:  lastOtp,      // or token if your API uses token-based reset
            password: pw
          });
  
          setText(msgGlobalSuccess, resp.message || 'Password updated. You can now log in.');
          // Prefill login email and go back
          if (inputLoginEmail && resetEmail) inputLoginEmail.value = resetEmail;
          switchTo(loginForm);
        } catch (err) {
          setText(msgGlobalError, err.message || 'Password reset failed.');
        } finally {
          btnResetSubmit.textContent = btnOld;
          btnResetSubmit.disabled = false;
        }
      });
  
      // QoL: prefill forgot email when leaving login email
      inputLoginEmail?.addEventListener('blur', () => {
        const v = (inputLoginEmail.value || '').trim();
        if (isValidEmail(v) && inputForgotEmail && !inputForgotEmail.value) inputForgotEmail.value = v;
      });
  
      // Initial view
      switchTo(loginForm);
      console.log('Login page flow initialized.');
    }
  })();
  