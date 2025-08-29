/* =================================================================
   Registration Form Handler (FINAL POLISHED & FIXED)
   - Correctly sends all user data during OTP resend.
   - Includes stricter, detailed password strength UI with a summary.
   - Includes all polished features (loading animations, toggles, etc.).
================================================================= */

// Registration Form Class
class RegistrationForm {
  constructor() {
    this.apiBaseUrl = "http://localhost/Indian%20Tribe/backend_php/routes/auth";
    this.currentStep = 1;
    this.formData = {}; // This will hold all user data across steps
    this.otpExpiryTime = null;
    this.otpTimer = null;

    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    // Sections
    this.registrationForm = document.getElementById("registrationForm");
    this.otpVerification = document.getElementById("otpVerification");
    this.successMessage = document.getElementById("successMessage");

    // Inputs
    this.nameInput = document.getElementById("name");
    this.phoneInput = document.getElementById("phone");
    this.emailInput = document.getElementById("email");
    this.passwordInput = document.getElementById("password");
    this.confirmPasswordInput = document.getElementById("confirmPassword");
    this.rememberCheckbox = document.getElementById("remember");

    // Buttons
    this.registerBtn = document.getElementById("registerBtn");
    this.verifyOtpBtn = document.getElementById("verifyOtpBtn");
    this.resendOtpBtn = document.getElementById("resendOtpBtn");
    this.backToFormBtn = document.getElementById("backToForm");
    this.togglePasswordBtn = document.getElementById("togglePassword");
    this.toggleConfirmPasswordBtn = document.getElementById(
      "toggleConfirmPassword"
    );

    // OTP
    this.otpInputs = document.querySelectorAll(".otp-digit");
    this.otpEmail = document.getElementById("otpEmail");
    this.otpTimerElement = document.getElementById("otpTimer");

    // Errors & Indicators
    this.errorElements = {
      name: document.getElementById("nameError"),
      phone: document.getElementById("phoneError"),
      email: document.getElementById("emailError"),
      password: document.getElementById("passwordError"),
      confirmPassword: document.getElementById("confirmPasswordError"),
    };
    this.strengthIndicator = document.getElementById(
      "password-strength-indicator"
    );
    this.confirmIndicator = document.getElementById(
      "confirm-password-indicator"
    );
  }

  bindEvents() {
    this.registrationForm.addEventListener("submit", (e) =>
      this.handleRegistrationSubmit(e)
    );
    this.otpVerification
      .querySelector("#otpForm")
      .addEventListener("submit", (e) => this.handleOtpSubmit(e));

    // Live validation
    this.nameInput.addEventListener("input", () => this.validateName());
    this.phoneInput.addEventListener("input", (e) => this.handlePhoneInput(e));
    this.emailInput.addEventListener("input", () => this.validateEmail());
    this.passwordInput.addEventListener("input", () => {
      this.updatePasswordStrengthUI(this.passwordInput.value);
      this.checkConfirmPassword();
    });
    this.confirmPasswordInput.addEventListener("input", () =>
      this.checkConfirmPassword()
    );
    this.rememberCheckbox.addEventListener("change", () =>
      this.validateTerms()
    );

    // Toggles
    this.togglePasswordBtn?.addEventListener("click", () =>
      this.togglePasswordVisibility(this.passwordInput, this.togglePasswordBtn)
    );
    this.toggleConfirmPasswordBtn?.addEventListener("click", () =>
      this.togglePasswordVisibility(
        this.confirmPasswordInput,
        this.toggleConfirmPasswordBtn
      )
    );

    // OTP Inputs
    this.otpInputs.forEach((input) => {
      input.addEventListener("input", (e) => this.handleOtpInput(e));
      input.addEventListener("keydown", (e) => this.handleOtpKeydown(e));
      input.addEventListener("paste", (e) => this.handleOtpPaste(e));
    });

    // Other Buttons
    this.resendOtpBtn?.addEventListener("click", () => this.resendOtp());
    this.backToFormBtn?.addEventListener("click", () => this.showStep(1));

    // --- Tooltip handling ---
    const infoIcon = document.getElementById("passwordInfoIcon");
    const tooltip = document.getElementById("passwordInfoTooltip");
    if (infoIcon && tooltip) {
      infoIcon.addEventListener("mouseenter", () =>
        tooltip.classList.remove("hidden")
      );
      infoIcon.addEventListener("mouseleave", () =>
        tooltip.classList.add("hidden")
      );
    }
  }

  calculatePasswordStrength(password) {
    const checks = {
      len: password.length >= 8,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasDigit: /[0-9]/.test(password),
      hasSpec: /[^A-Za-z0-9]/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    let strengthText = "Very Weak";
    let strengthClass = "text-red-500";

    if (score >= 5) {
      strengthText = "Strong";
      strengthClass = "text-green-600";
    } else if (score >= 3) {
      strengthText = "Fair";
      strengthClass = "text-yellow-500";
    }

    checks.allMet = score === 5;
    checks.strengthText = strengthText;
    checks.strengthClass = strengthClass;
    return checks;
  }

  updatePasswordStrengthUI(password) {
    if (!this.strengthIndicator) return;

    // Clear existing bars
    this.strengthIndicator.innerHTML = "";

    // Create 5 bars
    const totalBars = 5;
    for (let i = 0; i < totalBars; i++) {
      const bar = document.createElement("div");
      bar.classList.add("bar");
      this.strengthIndicator.appendChild(bar);
    }

    // Score calculation
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const bars = this.strengthIndicator.querySelectorAll(".bar");
    bars.forEach((bar, idx) => {
      if (idx < score) {
        if (score <= 2) bar.style.backgroundColor = "#ef4444"; // red
        else if (score === 3) bar.style.backgroundColor = "#f59e0b"; // orange
        else bar.style.backgroundColor = "#10b981"; // green
      } else {
        bar.style.backgroundColor = "#e5e7eb"; // gray
      }
    });
  }

  checkConfirmPassword() {
    if (this.confirmPasswordInput) {
      // Block paste (no toast, only clear and message)
      this.confirmPasswordInput.addEventListener("paste", (e) => {
        e.preventDefault();
        this.confirmPasswordInput.value = "";
        this.confirmIndicator.innerHTML =
          '<span style="color: #ef4444; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 0.25rem;"><i class="ph ph-x-circle"></i> Please type your password manually</span>';
        this.confirmPasswordInput.focus();
      });

      // Check match while typing
      this.confirmPasswordInput.addEventListener("input", () => {
        const pass = this.passwordInput.value;
        const confirm = this.confirmPasswordInput.value;
        if (confirm.length > 0) {
          if (pass === confirm) {
            this.confirmIndicator.innerHTML =
              '<span style="color: #16a34a; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 0.25rem;"><i class="ph ph-check-circle"></i> Looks good! Password match</span>';
          } else {
            this.confirmIndicator.innerHTML =
              '<span style="color: #ef4444; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 0.25rem;"><i class="ph ph-x-circle"></i> Oops! Password do not match</span>';
          }
        } else {
          this.confirmIndicator.innerHTML = "";
        }
      });
    }
  }

  validateName() {
    const v = this.nameInput.value.trim();
    if (v.length < 2) {
      this.showError("name", "Name must be at least 2 characters long");
      return false;
    }
    this.hideError("name");
    return true;
  }
  validatePhone() {
    const phone = this.phoneInput.value.replace(/\D/g, "");
    if (phone.length !== 10) {
      this.showError("phone", "Phone number must be exactly 10 digits");
      return false;
    }
    this.hideError("phone");
    return true;
  }
  validateEmail() {
    const email = this.emailInput.value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      this.showError("email", "Please enter a valid email address");
      return false;
    }
    this.hideError("email");
    return true;
  }
  validatePassword() {
    const strength = this.calculatePasswordStrength(this.passwordInput.value);

    if (!strength.allMet) {
      this.showError("password", "Password does not meet all requirements.");
      return false;
    }
    this.hideError("password");
    return true;
  }
  validateConfirmPassword() {
    if (this.passwordInput.value !== this.confirmPasswordInput.value) {
      this.showError("confirmPassword", "Passwords do not match");
      return false;
    }
    this.hideError("confirmPassword");
    return true;
  }
  validateTerms() {
    return !!this.rememberCheckbox.checked;
  }

  async handleRegistrationSubmit(e) {
    e.preventDefault();
    if (!this.validateAll()) {
      window.toast.error(
        "Please fix the errors in the form before submitting."
      );
      return;
    }
    this.formData = {
      name: this.nameInput.value.trim(),
      phone: this.phoneInput.value.replace(/\D/g, ""),
      email: this.emailInput.value.trim(),
      password: this.passwordInput.value,
      confirm_password: this.confirmPasswordInput.value,
      agreed_terms: this.rememberCheckbox.checked ? "1" : "0",
    };
    this.setLoading(this.registerBtn, true);
    try {
      const fd = new FormData();
      for (const key in this.formData) {
        fd.append(key, this.formData[key]);
      }

      const response = await fetch(`${this.apiBaseUrl}/register.php`, {
        method: "POST",
        body: fd,
      });
      const result = await response.json();

      if (result.status === "success") {
        window.toast.success(result.message || "OTP sent successfully!");
        this.showStep(2);
        this.startOtpTimer(120);
      } else {
        window.toast.error(result.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      window.toast.error("A network error occurred. Please try again.");
    } finally {
      this.setLoading(this.registerBtn, false);
    }
  }

  async handleOtpSubmit(e) {
    e.preventDefault();
    const otp = Array.from(this.otpInputs)
      .map((i) => i.value)
      .join("");
    if (otp.length !== 6) {
      window.toast.error("Please enter the complete 6-digit OTP.");
      return;
    }
    this.setLoading(this.verifyOtpBtn, true);
    try {
      const fd = new FormData();
      for (const key in this.formData) {
        fd.append(key, this.formData[key]);
      }
      fd.append("otp", otp);

      const response = await fetch(`${this.apiBaseUrl}/verify_otp.php`, {
        method: "POST",
        body: fd,
      });
      const result = await response.json();

      if (result.status === "success") {
        this.showStep(3);
        this.stopOtpTimer();
      } else {
        window.toast.error(result.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      window.toast.error("A network error occurred. Please try again.");
    } finally {
      this.setLoading(this.verifyOtpBtn, false);
    }
  }

  async resendOtp() {
    this.resendOtpBtn.disabled = true;
    try {
      const fd = new FormData();
      for (const key in this.formData) {
        fd.append(key, this.formData[key]);
      }

      const response = await fetch(`${this.apiBaseUrl}/resend_otp.php`, {
        method: "POST",
        body: fd,
      });
      const result = await response.json();

      if (result.status === "success") {
        window.toast.success("A new OTP has been sent!");
        this.startOtpTimer(120);
        this.clearOtpInputs();
      } else {
        window.toast.error(result.message || "Unable to resend OTP");
        this.resendOtpBtn.disabled = false;
      }
    } catch (err) {
      console.error("Resend OTP Error:", err);
      window.toast.error("A network error occurred. Please try again.");
      this.resendOtpBtn.disabled = false;
    }
  }

  validateAll() {
    const checks = [
      this.validateName(),
      this.validatePhone(),
      this.validateEmail(),
      this.validatePassword(),
      this.validateConfirmPassword(),
      this.validateTerms(),
    ];
    if (!checks[5]) {
      window.toast.error("You must agree to the Terms of Use.");
    }
    return checks.every(Boolean);
  }

  showStep(step) {
    this.registrationForm.style.display = step === 1 ? "block" : "none";
    this.otpVerification.style.display = step === 2 ? "block" : "none";
    this.successMessage.style.display = step === 3 ? "block" : "none";
    if (step === 2) {
      this.otpEmail.textContent = this.formData.email;
      this.clearOtpInputs();
    }
  }

  startOtpTimer(seconds = 120) {
    this.stopOtpTimer();
    this.otpExpiryTime = Date.now() + seconds * 1000;
    this.updateTimer();
    this.resendOtpBtn.disabled = true;
    this.otpTimer = setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer() {
    const timeLeft = Math.max(
      0,
      Math.round((this.otpExpiryTime - Date.now()) / 1000)
    );
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
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
    this.otpInputs.forEach((i) => (i.value = ""));
    if (this.otpInputs.length > 0) this.otpInputs[0].focus();
  }

  handleOtpInput(e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, "").slice(0, 1);
    const index = +input.dataset.index;
    if (input.value && index < 5) this.otpInputs[index + 1].focus();
    const otp = Array.from(this.otpInputs)
      .map((i) => i.value)
      .join("");
    if (otp.length === 6)
      this.otpVerification.querySelector("#otpForm").requestSubmit();
  }

  handleOtpPaste(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!text) return;
    this.otpInputs.forEach((i) => (i.value = ""));
    [...text].forEach((ch, idx) => {
      if (this.otpInputs[idx]) this.otpInputs[idx].value = ch;
    });
    const lastInput = this.otpInputs[Math.min(text.length - 1, 5)];
    if (lastInput) lastInput.focus();
    if (text.length === 6)
      this.otpVerification.querySelector("#otpForm").requestSubmit();
  }

  handleOtpKeydown(e) {
    const input = e.target;
    const index = +input.dataset.index;
    if (e.key === "Backspace" && !input.value && index > 0) {
      this.otpInputs[index - 1].focus();
    }
  }

  togglePasswordVisibility(input, button) {
    if (!input || !button) return;
    const icon = button.querySelector("i");
    const toText = input.type === "password";
    input.type = toText ? "text" : "password";
    icon.classList.toggle("ph-eye", !toText);
    icon.classList.toggle("ph-eye-slash", toText);
  }

  handlePhoneInput(e) {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 10) v = v.slice(0, 10);
    e.target.value = v;
  }

  handlePhoneKeydown(e) {
    const allowed = [8, 9, 27, 13, 46, 37, 39, 38, 40];
    if (
      allowed.includes(e.keyCode) ||
      (e.ctrlKey && ["a", "c", "v", "x"].includes(e.key.toLowerCase()))
    )
      return;
    if (e.key.length === 1 && (e.key < "0" || e.key > "9")) e.preventDefault();
  }

  setLoading(button, loading) {
    if (!button) return;
    const btnText = button.querySelector(".btn-text");
    const btnLoading = button.querySelector(".btn-loading");
    if (loading) {
      button.disabled = true;
      if (btnText) btnText.classList.add("hidden");
      if (btnLoading) btnLoading.classList.remove("hidden");
    } else {
      button.disabled = false;
      if (btnText) btnText.classList.remove("hidden");
      if (btnLoading) btnLoading.classList.add("hidden");
    }
  }

  showError(field, message) {
    if (this.errorElements[field]) {
      this.errorElements[field].textContent = message;
      this.errorElements[field].classList.remove("hidden");
    }
  }
  hideError(field) {
    if (this.errorElements[field]) {
      this.errorElements[field].classList.add("hidden");
    }
  }
}

document.addEventListener("components:loaded", () => {
  if (document.getElementById("registrationForm")) {
    new RegistrationForm();
    console.log(
      "Registration form (final polished & fixed version) initialized successfully."
    );
  }
});
