/* =================================================================
   Login & Forgot Password Handler (FINAL POLISHED V3 - UI Tweaks)
   - Manages visibility of the OTP 'Verify' button for a cleaner look.
   - All other functionality is preserved.
================================================================= */

(function () {
  document.addEventListener("components:loaded", initializeLoginLogic);

  function initializeLoginLogic() {
    const loginForm = document.getElementById("login-form");
    if (!loginForm) return;

    const API_BASE = "http://localhost:8080/routes/auth";
    const ROUTES = {
      login: `${API_BASE}/login.php`,
      sendResetCode: `${API_BASE}/forgot_password.php`,
      verifyResetCode: `${API_BASE}/verify_forgot_password_otp.php`,
      resetPassword: `${API_BASE}/reset_password.php`,
    };

    // ----- Forms -----
    const forgotForm = document.getElementById("forgot-password-form");
    const otpForm = document.getElementById("reset-otp-form");
    const resetForm = document.getElementById("reset-password-form");
    if (!forgotForm || !otpForm || !resetForm) return;

    // ----- Buttons / Links -----
    const linkShowForgot = document.getElementById("show-forgot-password-form");
    const btnBackFromForgot = document.getElementById(
      "back-to-login-from-forgot"
    );
    const btnBackFromOtp = document.getElementById("back-to-forgot-from-otp");
    const btnBackFromReset = document.getElementById("back-to-forgot-password");
    const btnResendOtp = document.getElementById("resend-otp-btn");

    const btnLoginSubmit = document.getElementById("login-submit-btn");
    const btnForgotSubmit = document.getElementById(
      "forgot-password-submit-btn"
    );
    const btnOtpVerify = document.getElementById("verify-reset-otp-btn");
    const btnResetSubmit = document.getElementById("reset-password-submit-btn");

    const btnToggleLoginPass = document.getElementById("toggle-login-password");
    const btnToggleResetPass = document.getElementById("toggle-reset-password");
    const btnToggleResetConfirm = document.getElementById(
      "toggle-reset-confirm-password"
    );

    // ----- Fields & Indicators -----
    const inputLoginEmail = document.getElementById("login-email");
    const inputLoginPass = document.getElementById("login-password");
    const inputForgotEmail = document.getElementById("forgot-email");
    const otpInputs = Array.from(
      document.querySelectorAll("#reset-otp-container .otp-input")
    );
    const inputNewPass = document.getElementById("reset-new-password");
    const inputConfirmPass = document.getElementById("reset-confirm-password");
    const strengthIndicator = document.getElementById(
      "reset-password-strength"
    );
    const confirmIndicator = document.getElementById(
      "reset-confirm-password-indicator"
    );
    const timerWrap = document.getElementById("timer-display");
    const timerCount = document.getElementById("timer-countdown");

    let resetEmail = "";
    let countdown = null;

    // ---------- Helpers ----------
    const hide = (el) => el && el.classList.add("hidden");
    const show = (el) => el && el.classList.remove("hidden");

    function setButtonLoadingState(button, isLoading) {
      if (!button) return;
      const btnText = button.querySelector(".btn-text");
      const btnLoading = button.querySelector(".btn-loading");

      button.disabled = isLoading;
      if (isLoading) {
        if (btnText) btnText.classList.add("hidden");
        if (btnLoading) btnLoading.classList.remove("hidden");
      } else {
        if (btnText) btnText.classList.remove("hidden");
        if (btnLoading) btnLoading.classList.add("hidden");
      }
    }

    function switchTo(formEl) {
      [loginForm, forgotForm, otpForm, resetForm].forEach(hide);
      show(formEl);

      // Hide the verify button by default when switching to the OTP form
      if (formEl === otpForm) {
        hide(btnOtpVerify);
      }
    }

    function isValidEmail(e) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());
    }

    function togglePasswordVisibility(input, button) {
      if (!input || !button) return;
      const icon = button.querySelector("i");
      const toText = input.type === "password";
      input.type = toText ? "text" : "password";
      icon.classList.toggle("ph-eye", !toText);
      icon.classList.toggle("ph-eye-slash", toText);
    }

    async function apiFetch(url, payload) {
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }
      const res = await fetch(url, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok || result.status !== "success") {
        const errorMsg =
          result.message || `Request failed with status ${res.status}`;
        throw new Error(errorMsg);
      }
      return result;
    }

    // ---------- OTP input UX ----------
    otpInputs.forEach((input, idx) => {
      input.addEventListener("input", (e) => {
        show(btnOtpVerify);
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 1);
        if (e.target.value && idx < otpInputs.length - 1) {
          otpInputs[idx + 1].focus();
        }
        const otp = gatherOtp();
        if (otp.length === otpInputs.length) {
          otpForm.requestSubmit();
        }
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !e.target.value && idx > 0)
          otpInputs[idx - 1].focus();
      });
      input.addEventListener("paste", (e) => {
        e.preventDefault();
        const data = (e.clipboardData.getData("text") || "")
          .replace(/\D/g, "")
          .slice(0, otpInputs.length);
        if (data.length > 0) {
          show(btnOtpVerify);
          data.split("").forEach((ch, i) => {
            if (otpInputs[i]) otpInputs[i].value = ch;
          });
          const lastInput =
            otpInputs[Math.min(data.length - 1, otpInputs.length - 1)];
          if (lastInput) lastInput.focus();
          if (data.length === otpInputs.length) {
            otpForm.requestSubmit();
          }
        }
      });
    });

    function startCountdown(seconds = 120) {
      clearInterval(countdown);
      let t = seconds;
      const update = () => {
        const minutes = String(Math.floor(t / 60)).padStart(2, "0");
        const secondsVal = String(t % 60).padStart(2, "0");
        if (timerCount) timerCount.textContent = `${minutes}:${secondsVal}`;
        if (t <= 0) {
          clearInterval(countdown);
          hide(timerWrap);
          show(btnResendOtp);
        }
        t--;
      };
      update();
      show(timerWrap);
      hide(btnResendOtp);
      countdown = setInterval(update, 1000);
    }

    function gatherOtp() {
      return otpInputs.map((i) => i.value).join("");
    }

    function calculatePasswordStrength(password) {
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

    function updatePasswordStrengthUI(password) {
      if (!strengthIndicator) return;
      if (!password) {
        strengthIndicator.innerHTML = "";
        return;
      }

      const {
        len,
        hasUpper,
        hasLower,
        hasDigit,
        hasSpec,
        strengthText,
        strengthClass,
      } = calculatePasswordStrength(password);
      const feedback = [
        { met: len, text: "At least 8 characters" },
        { met: hasUpper, text: "Contains uppercase letter" },
        { met: hasLower, text: "Contains lowercase letter" },
        { met: hasDigit, text: "Contains a number" },
        { met: hasSpec, text: "Contains a special character (!@#...)" },
      ];

      strengthIndicator.innerHTML = `
          <div class="space-y-1 text-xs bg-gray-50 p-3 rounded-lg border mt-2">
              <div class="font-semibold mb-2 ${strengthClass}">Password Strength: ${strengthText}</div>
              ${feedback
                .map(
                  (item) => `
                  <div class="${
                    item.met ? "text-green-600" : "text-red-600"
                  } flex items-center">
                      <span class="mr-2 text-base">${
                        item.met ? "✓" : "✗"
                      }</span>
                      ${item.text}
                  </div>`
                )
                .join("")}
          </div>`;
    }

    function checkConfirmPassword() {
      if (!confirmIndicator) return;
      const pass = inputNewPass.value;
      const confirmPass = inputConfirmPass.value;

      if (confirmPass === "") {
        confirmIndicator.innerHTML = "";
        return;
      }

      if (pass === confirmPass) {
        confirmIndicator.innerHTML =
          '<span class="text-green-500 flex items-center text-xs"><i class="ph ph-check-circle mr-1"></i> Passwords match</span>';
      } else {
        confirmIndicator.innerHTML =
          '<span class="text-red-500 flex items-center text-xs"><i class="ph ph-x-circle mr-1"></i> Passwords do not match</span>';
      }
    }

    // ---------- Event wiring ----------
    linkShowForgot?.addEventListener("click", (e) => {
      e.preventDefault();
      const email = ((inputLoginEmail && inputLoginEmail.value) || "").trim();
      if (email && isValidEmail(email)) inputForgotEmail.value = email;
      switchTo(forgotForm);
    });
    btnBackFromForgot?.addEventListener("click", () => switchTo(loginForm));
    btnBackFromOtp?.addEventListener("click", () => switchTo(forgotForm));
    btnBackFromReset?.addEventListener("click", () => switchTo(forgotForm));

    btnToggleLoginPass?.addEventListener("click", () =>
      togglePasswordVisibility(inputLoginPass, btnToggleLoginPass)
    );
    btnToggleResetPass?.addEventListener("click", () =>
      togglePasswordVisibility(inputNewPass, btnToggleResetPass)
    );
    btnToggleResetConfirm?.addEventListener("click", () =>
      togglePasswordVisibility(inputConfirmPass, btnToggleResetConfirm)
    );

    inputNewPass?.addEventListener("input", () => {
      updatePasswordStrengthUI(inputNewPass.value);
      checkConfirmPassword();
    });
    inputConfirmPass?.addEventListener("input", checkConfirmPassword);

    // ---- Login submit ----
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = (inputLoginEmail.value || "").trim();
      const pass = inputLoginPass.value || "";

      if (!isValidEmail(email)) {
        window.toast.error("Please enter a valid email address.");
        return;
      }
      if (!pass) {
        window.toast.error("Please enter your password.");
        return;
      }

      setButtonLoadingState(btnLoginSubmit, true);
      try {
        const resp = await apiFetch(ROUTES.login, { email, password: pass });

        // Store user data and role in localStorage using session manager
        if (resp.status === "success") {
          const userData = {
            user_id: resp.user_id,
            user_name: resp.user_name,
            role: resp.role || "user",
          };

          // Use session manager to save session with 7-day expiry
          if (
            window.userSessionManager &&
            window.userSessionManager.saveSession(userData)
          ) {
            // Check if user is trying to access admin area
            if (resp.role === "admin") {
              window.toast.warning(
                "Admin detected! Redirecting to admin panel..."
              );
              setTimeout(() => {
                window.location.href = "admin/index.html";
              }, 1500);
            } else {
              window.toast.success(
                resp.message || "Logged in successfully! Redirecting..."
              );
              setTimeout(() => {
                window.location.href = "index.html";
              }, 1500);
            }
          } else {
            window.toast.error("❌ Failed to save session. Please try again.");
          }
        } else {
          window.toast.error(
            resp.message || "Login failed. Please check your credentials."
          );
        }
      } catch (err) {
        window.toast.error(
          err.message || "Login failed. Please check your credentials."
        );
      } finally {
        setButtonLoadingState(btnLoginSubmit, false);
      }
    });

    // ---- Forgot: send code ----
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = (inputForgotEmail.value || "").trim();
      if (!isValidEmail(email)) {
        window.toast.error(
          "Please enter a valid email to reset your password."
        );
        return;
      }

      setButtonLoadingState(btnForgotSubmit, true);
      try {
        const resp = await apiFetch(ROUTES.sendResetCode, { email });
        resetEmail = email;
        otpInputs.forEach((i) => (i.value = ""));
        startCountdown(120);
        switchTo(otpForm);
        window.toast.success(
          resp.message || "Verification code sent to your email."
        );
      } catch (err) {
        window.toast.error(err.message || "Unable to send reset code.");
      } finally {
        setButtonLoadingState(btnForgotSubmit, false);
      }
    });

    // ---- Resend OTP (for forgot password) ----
    btnResendOtp?.addEventListener("click", async () => {
      if (!isValidEmail(resetEmail)) {
        window.toast.error(
          "Missing email. Please go back and enter your email again."
        );
        return;
      }

      btnResendOtp.disabled = true;
      try {
        const resp = await apiFetch(ROUTES.sendResetCode, {
          email: resetEmail,
        });
        otpInputs.forEach((i) => (i.value = ""));
        startCountdown(120);
        window.toast.success(resp.message || "A new code has been sent.");
      } catch (err) {
        window.toast.error(err.message || "Unable to resend code.");
        btnResendOtp.disabled = false;
      }
    });

    // ---- OTP verify ----
    otpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const otp = gatherOtp();
      if (!/^\d{4}$/.test(otp)) {
        window.toast.error("Please enter the complete 4-digit code.");
        return;
      }

      setButtonLoadingState(btnOtpVerify, true);
      try {
        const resp = await apiFetch(ROUTES.verifyResetCode, {
          email: resetEmail,
          otp,
        });
        window.toast.success(
          resp.message || "Code verified! Please set your new password."
        );
        switchTo(resetForm);
      } catch (err) {
        window.toast.error(
          err.message ||
            "Verification failed. The code may be incorrect or expired."
        );
      } finally {
        setButtonLoadingState(btnOtpVerify, false);
      }
    });

    // ---- Reset password ----
    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const new_password = inputNewPass.value || "";
      const confirm_password = inputConfirmPass.value || "";

      const strength = calculatePasswordStrength(new_password);
      if (!strength.allMet) {
        window.toast.error(
          "Your new password does not meet all the requirements."
        );
        return;
      }
      if (new_password !== confirm_password) {
        window.toast.error("Passwords do not match. Please re-enter them.");
        return;
      }

      setButtonLoadingState(btnResetSubmit, true);
      try {
        const resp = await apiFetch(ROUTES.resetPassword, {
          email: resetEmail,
          new_password,
          confirm_password,
        });
        window.toast.success(
          resp.message || "Password updated successfully! You can now log in."
        );

        if (inputLoginEmail && resetEmail) inputLoginEmail.value = resetEmail;
        switchTo(loginForm);
      } catch (err) {
        window.toast.error(
          err.message || "Password reset failed. Please try again."
        );
      } finally {
        setButtonLoadingState(btnResetSubmit, false);
      }
    });

    // QoL: prefill forgot email when leaving login email
    inputLoginEmail?.addEventListener("blur", () => {
      const v = (inputLoginEmail.value || "").trim();
      if (isValidEmail(v) && inputForgotEmail && !inputForgotEmail.value)
        inputForgotEmail.value = v;
    });

    // Initial view
    switchTo(loginForm);
    console.log(
      "Login page flow (final polished version) initialized successfully."
    );
  }
})();
