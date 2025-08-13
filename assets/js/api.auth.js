// Authentication API layer
;(function() {
  const base = () => (window.AppConfig?.apiBaseUrl || '');

  async function post(url, data) {
    const res = await fetch(url, { method: 'POST', body: data });
    return res.json();
  }

  const AuthAPI = {
    login({ email, password }) {
      return post(`${base()}/login.php`, Utils.toFormData({ email, password }));
    },
    registerSendOtp({ email, name, phone, password, confirm_password }) {
      // Backend uses register.php to initiate with full payload
      return post(`${base()}/register.php`, Utils.toFormData({ email, name, phone, password, confirm_password, agreed_terms: '1' }));
    },
    verifySignupOtp({ email, otp, name, phone, password, confirm_password }) {
      return post(`${base()}/verify_otp.php`, Utils.toFormData({ email, otp, name, phone, password, confirm_password, agreed_terms: '1' }));
    },
    resendOtp({ email, purpose = 'signup' }) {
      return post(`${base()}/resend_otp.php`, Utils.toFormData({ email, purpose }));
    },
    forgotPassword({ email }) {
      return post(`${base()}/forgot_password.php`, Utils.toFormData({ email }));
    },
    verifyForgotOtp({ email, otp }) {
      return post(`${base()}/verify_forgot_password_otp.php`, Utils.toFormData({ email, otp }));
    },
    resetPassword({ email, new_password, confirm_password }) {
      return post(`${base()}/reset_password.php`, Utils.toFormData({ email, new_password, confirm_password }));
    },
  };

  window.AuthAPI = AuthAPI;
})();



