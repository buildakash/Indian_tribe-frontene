// Lightweight validators aligned with backend
;(function() {
  const Validators = {
    require(value, name) {
      if (!value) return `${name} is required`;
      return '';
    },
    email(value) {
      return Utils.isValidEmail(value) ? '' : 'Please enter a valid email address';
    },
    password(value) {
      if (!value || value.length < 6) return 'Password must be at least 6 characters';
      return '';
    },
    confirmPassword(pass, confirm) {
      if (pass !== confirm) return 'Passwords do not match';
      return '';
    },
    phone10(value) {
      if (!/^\d{10}$/.test(value || '')) return 'Please enter a valid 10-digit phone number';
      return '';
    },
    otp4(value) {
      if (!/^\d{4}$/.test(value || '')) return 'Please enter the complete 4-digit OTP';
      return '';
    }
  };

  window.Validators = Validators;
})();



