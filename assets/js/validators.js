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
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
      if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
      if (!/\d/.test(value)) return 'Password must contain at least one number';
      if (!/[@$!%*#?&]/.test(value)) return 'Password must contain at least one special character (@$!%*#?&)';
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



