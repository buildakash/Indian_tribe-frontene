/**
 * Authentication System for Indian Tribe
 * Handles login, signup, OTP verification, and user session management
 */

class AuthSystem {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000/routes/auth'; // PHP API base URL
        this.currentUser = null;
        this.currentEmail = null; // Store email for OTP process
        this.init();
        
        // Debug: Log API configuration
        console.log('AuthSystem initialized with API:', this.apiBaseUrl);
    }

    init() {
        this.checkLoginStatus();
        this.setupEventListeners();
        this.initModal();
        this.initOTP();
    }

    // Check if user is logged in
    checkLoginStatus() {
        const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        const currentUser = localStorage.getItem('currentUser');
        
        if (userLoggedIn && currentUser) {
            this.currentUser = currentUser;
            this.updateHeaderForLoggedInUser();
            return true;
        }
        return false;
    }

    // Show login modal
    showLoginModal() {
        const modal = document.querySelector('.modal-newsletter');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // Hide login modal
    hideLoginModal() {
        const modal = document.querySelector('.modal-newsletter');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Initialize OTP functionality
    initOTP() {
        this.setupOTPFormEvents();
        this.setupOTPInputBehavior();
    }

    // Setup OTP Form Events
    setupOTPFormEvents() {
        const otpForm = document.getElementById('otp-form');
        const resendBtn = document.getElementById('resend-otp-btn');
        const backToSignupBtn = document.getElementById('back-to-signup');

        // OTP form submission
        if (otpForm) {
            otpForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const verifyBtn = document.getElementById('verify-otp-btn');
                
                // Show loading state
                this.showLoadingState(verifyBtn, 'Verifying...');
                
                try {
                    await this.verifyOTP();
                } catch (error) {
                    // Error already handled in verifyOTP
                } finally {
                    // Hide loading state
                    this.hideLoadingState(verifyBtn, 'Verify OTP');
                }
            });
        }

        // Resend OTP
        if (resendBtn) {
            resendBtn.addEventListener('click', async () => {
                // Show loading state
                const originalText = resendBtn.innerHTML;
                resendBtn.innerHTML = '<i class="ph ph-spinner animate-spin mr-1"></i>Resending...';
                resendBtn.disabled = true;
                
                try {
                    await this.resendOTP();
                } catch (error) {
                    // Error already handled in resendOTP
                } finally {
                    // Restore button
                    resendBtn.innerHTML = originalText;
                    resendBtn.disabled = false;
                }
            });
        }

        // Back to signup
        if (backToSignupBtn) {
            backToSignupBtn.addEventListener('click', () => this.showSignupForm());
        }
    }

    // Setup OTP Input Behavior
    setupOTPInputBehavior() {
        const inputs = ['otp-input-1', 'otp-input-2', 'otp-input-3', 'otp-input-4', 'otp-input-5', 'otp-input-6'];

        // Auto-focus next input
        inputs.forEach((inputId, index) => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', (e) => {
                    if (e.target.value.length === 1) {
                        if (index < inputs.length - 1) {
                            document.getElementById(inputs[index + 1]).focus();
                        }
                    }
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                        document.getElementById(inputs[index - 1]).focus();
                    }
                });
            }
        });
    }

    // Show OTP Form
    showOTPForm(email) {
        this.currentEmail = email;
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const otpForm = document.getElementById('otp-form');
        const loginHeader = document.getElementById('login-header');
        const signupHeader = document.getElementById('signup-header');
        const otpHeader = document.getElementById('otp-header');
        const emailDisplay = document.getElementById('otp-email-display');
        
        if (loginForm && signupForm && otpForm && emailDisplay) {
            // Hide other forms
            loginForm.classList.add('hidden');
            signupForm.classList.add('hidden');
            if (loginHeader) loginHeader.classList.add('hidden');
            if (signupHeader) signupHeader.classList.add('hidden');
            
            // Show OTP form
            otpForm.classList.remove('hidden');
            if (otpHeader) otpHeader.classList.remove('hidden');
            
            // Set email display
            emailDisplay.textContent = email;
            
            // Focus first input
            document.getElementById('otp-input-1').focus();
            
            // Start timer
            this.startOTPTimer();
        }
    }

    // Hide OTP Form
    hideOTPForm() {
        const otpForm = document.getElementById('otp-form');
        if (otpForm) {
            otpForm.classList.add('hidden');
            this.clearOTPInputs();
            this.stopOTPTimer();
        }
    }

    // Show signup form (from OTP)
    showSignupForm() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const otpForm = document.getElementById('otp-form');
        const loginHeader = document.getElementById('login-header');
        const signupHeader = document.getElementById('signup-header');
        const otpHeader = document.getElementById('otp-header');
        
        if (loginForm && signupForm && otpForm) {
            // Hide other forms
            loginForm.classList.add('hidden');
            otpForm.classList.add('hidden');
            if (loginHeader) loginHeader.classList.add('hidden');
            if (otpHeader) otpHeader.classList.add('hidden');
            
            // Show signup form
            signupForm.classList.remove('hidden');
            if (signupHeader) signupHeader.classList.remove('hidden');
        }
    }

    // Clear OTP inputs
    clearOTPInputs() {
        ['otp-input-1', 'otp-input-2', 'otp-input-3', 'otp-input-4', 'otp-input-5', 'otp-input-6'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
    }

    // Start OTP timer
    startOTPTimer() {
        let timeLeft = 120; // 2 minutes
        const timerElement = document.getElementById('timer-countdown');
        const resendBtn = document.getElementById('resend-otp-btn');
        const timerText = document.getElementById('timer-text');
        
        this.otpTimer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            if (timerElement) {
                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (timeLeft <= 0) {
                this.stopOTPTimer();
                if (resendBtn) resendBtn.classList.remove('hidden');
                if (timerText) timerText.textContent = 'Code expired. ';
            }
            
            timeLeft--;
        }, 1000);
    }

    // Stop OTP timer
    stopOTPTimer() {
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
            this.otpTimer = null;
        }
    }

    // Get OTP from inputs
    getOTPFromInputs() {
        const inputs = ['otp-input-1', 'otp-input-2', 'otp-input-3', 'otp-input-4', 'otp-input-5', 'otp-input-6'];
        return inputs.map(id => document.getElementById(id)?.value || '').join('');
    }

    // Send OTP (Registration)
        async sendOTP(email) {
        try {
            const signupData = JSON.parse(localStorage.getItem('pendingSignup'));
            if (!signupData) {
                throw new Error('Signup data not found');
            }

            const formData = new FormData();
            formData.append('name', signupData.name);
            formData.append('phone', signupData.phone);
            formData.append('email', email);
            formData.append('password', signupData.password);
            formData.append('confirm_password', signupData.confirmPassword);
            formData.append('agreed_terms', '1');

            const response = await fetch(`${this.apiBaseUrl}/register.php`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                window.toast.success('OTP sent to your email!');
                this.showOTPForm(email);
            } else {
                throw new Error(result.message || 'Failed to send OTP');
            }
        } catch (error) {
            // Handle network errors vs API errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                window.toast.error('Network error: Please check your internet connection');
            } else {
                window.toast.error(error.message);
            }
            throw error;
        }
    }

    // Verify OTP
    async verifyOTP() {
        try {
            const otp = this.getOTPFromInputs();
            
            if (otp.length !== 6) {
                this.showNotification('Please enter the complete 6-digit OTP', 'error');
                return;
            }

            const signupData = JSON.parse(localStorage.getItem('pendingSignup'));
            if (!signupData) {
                throw new Error('Signup data not found');
            }

            const formData = new FormData();
            formData.append('email', this.currentEmail);
            formData.append('otp', otp);
            formData.append('name', signupData.name);
            formData.append('phone', signupData.phone);
            formData.append('password', signupData.password);
            formData.append('confirm_password', signupData.confirmPassword);
            formData.append('agreed_terms', '1');

            const response = await fetch(`${this.apiBaseUrl}/verify_otp.php`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                window.toast.success('Account created successfully! Please login.');
                this.hideOTPForm();
                localStorage.removeItem('pendingSignup');
                
                // Switch back to login form
                this.showLoginForm();
                
                // Auto-fill email in login form
                const loginEmailInput = document.getElementById('login-email');
                if (loginEmailInput) {
                    loginEmailInput.value = this.currentEmail;
                }
            } else {
                throw new Error(result.message || 'Invalid OTP');
            }
        } catch (error) {
            // Handle network errors vs API errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                window.toast.error('Network error: Please check your internet connection');
            } else {
                window.toast.error(error.message);
            }
            this.clearOTPInputs();
        }
    }

    // Resend OTP
    async resendOTP() {
        try {
            const signupData = JSON.parse(localStorage.getItem('pendingSignup'));
            if (!signupData) {
                throw new Error('Signup data not found');
            }

            const formData = new FormData();
            formData.append('email', this.currentEmail);
            formData.append('purpose', 'signup');
            formData.append('name', signupData.name);

            const response = await fetch(`${this.apiBaseUrl}/resend_otp.php`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                window.toast.success('OTP resent to your email!');
                // Reset timer and hide resend button
                const resendBtn = document.getElementById('resend-otp-btn');
                const timerText = document.getElementById('timer-text');
                if (resendBtn) resendBtn.classList.add('hidden');
                if (timerText) timerText.textContent = 'Resend code in ';
                this.startOTPTimer();
            } else {
                throw new Error(result.message || 'Failed to resend OTP');
            }
        } catch (error) {
            // Handle network errors vs API errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                window.toast.error('Network error: Please check your internet connection');
            } else {
                window.toast.error(error.message);
            }
        }
    }



    // Toggle password visibility
    togglePasswordVisibility(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        
        if (toggle && input) {
            toggle.addEventListener('click', function() {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                
                // Toggle icon
                const icon = toggle.querySelector('i');
                if (icon) {
                    if (type === 'password') {
                        icon.className = 'ph ph-eye text-lg';
                    } else {
                        icon.className = 'ph ph-eye-slash text-lg';
                    }
                }
            });
        }
    }

    // Switch between login and signup forms
    switchToSignup() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const loginHeader = document.getElementById('login-header');
        const signupHeader = document.getElementById('signup-header');
        
        if (loginForm && signupForm) {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            
            // Hide login header and show signup header
            if (loginHeader) loginHeader.classList.add('hidden');
            if (signupHeader) signupHeader.classList.remove('hidden');
        }
    }

    switchToLogin() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const loginHeader = document.getElementById('login-header');
        const signupHeader = document.getElementById('signup-header');
        
        if (loginForm && signupForm) {
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            
            // Hide signup header and show login header
            if (signupHeader) signupHeader.classList.add('hidden');
            if (loginHeader) loginHeader.classList.remove('hidden');
        }
    }

        // Show login form (from OTP form)
    showLoginForm() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const otpForm = document.getElementById('otp-form');
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        const resetPasswordForm = document.getElementById('reset-password-form');
        const loginHeader = document.getElementById('login-header');
        const signupHeader = document.getElementById('signup-header');
        const otpHeader = document.getElementById('otp-header');
        const forgotPasswordHeader = document.getElementById('forgot-password-header');
        const resetPasswordHeader = document.getElementById('reset-password-header');

        if (loginForm && signupForm && otpForm && forgotPasswordForm && resetPasswordForm) {
            signupForm.classList.add('hidden');
            otpForm.classList.add('hidden');
            forgotPasswordForm.classList.add('hidden');
            resetPasswordForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            if (signupHeader) signupHeader.classList.add('hidden');
            if (otpHeader) otpHeader.classList.add('hidden');
            if (forgotPasswordHeader) forgotPasswordHeader.classList.add('hidden');
            if (resetPasswordHeader) resetPasswordHeader.classList.add('hidden');
            if (loginHeader) loginHeader.classList.remove('hidden');
        }
    }

    // Show forgot password form
    showForgotPasswordForm() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const otpForm = document.getElementById('otp-form');
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        const resetPasswordForm = document.getElementById('reset-password-form');
        const loginHeader = document.getElementById('login-header');
        const signupHeader = document.getElementById('signup-header');
        const otpHeader = document.getElementById('otp-header');
        const forgotPasswordHeader = document.getElementById('forgot-password-header');
        const resetPasswordHeader = document.getElementById('reset-password-header');

        if (loginForm && signupForm && otpForm && forgotPasswordForm && resetPasswordForm) {
            loginForm.classList.add('hidden');
            signupForm.classList.add('hidden');
            otpForm.classList.add('hidden');
            resetPasswordForm.classList.add('hidden');
            forgotPasswordForm.classList.remove('hidden');
            if (loginHeader) loginHeader.classList.add('hidden');
            if (signupHeader) signupHeader.classList.add('hidden');
            if (otpHeader) otpHeader.classList.add('hidden');
            if (resetPasswordHeader) resetPasswordHeader.classList.add('hidden');
            if (forgotPasswordHeader) forgotPasswordHeader.classList.remove('hidden');
        }
    }

    // Show reset OTP form
    showResetOTPForm(email) {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const otpForm = document.getElementById('otp-form');
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        const resetOTPForm = document.getElementById('reset-otp-form');
        const resetPasswordForm = document.getElementById('reset-password-form');
        const loginHeader = document.getElementById('login-header');
        const signupHeader = document.getElementById('signup-header');
        const otpHeader = document.getElementById('otp-header');
        const forgotPasswordHeader = document.getElementById('forgot-password-header');
        const resetOTPHeader = document.getElementById('reset-otp-header');
        const resetPasswordHeader = document.getElementById('reset-password-header');
        const resetOTPEmailDisplay = document.getElementById('reset-otp-email-display');

        if (loginForm && signupForm && otpForm && forgotPasswordForm && resetOTPForm && resetPasswordForm) {
            loginForm.classList.add('hidden');
            signupForm.classList.add('hidden');
            otpForm.classList.add('hidden');
            forgotPasswordForm.classList.add('hidden');
            resetPasswordForm.classList.add('hidden');
            resetOTPForm.classList.remove('hidden');
            if (loginHeader) loginHeader.classList.add('hidden');
            if (signupHeader) signupHeader.classList.add('hidden');
            if (otpHeader) otpHeader.classList.add('hidden');
            if (forgotPasswordHeader) forgotPasswordHeader.classList.add('hidden');
            if (resetPasswordHeader) resetPasswordHeader.classList.add('hidden');
            if (resetOTPHeader) resetOTPHeader.classList.remove('hidden');
            if (resetOTPEmailDisplay) resetOTPEmailDisplay.textContent = email;
        }
    }

    // Show reset password form (after OTP verification)
    showResetPasswordForm(email) {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const otpForm = document.getElementById('otp-form');
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        const resetOTPForm = document.getElementById('reset-otp-form');
        const resetPasswordForm = document.getElementById('reset-password-form');
        const loginHeader = document.getElementById('login-header');
        const signupHeader = document.getElementById('signup-header');
        const otpHeader = document.getElementById('otp-header');
        const forgotPasswordHeader = document.getElementById('forgot-password-header');
        const resetOTPHeader = document.getElementById('reset-otp-header');
        const resetPasswordHeader = document.getElementById('reset-password-header');
        const resetEmailDisplay = document.getElementById('reset-email-display');

        if (loginForm && signupForm && otpForm && forgotPasswordForm && resetOTPForm && resetPasswordForm) {
            loginForm.classList.add('hidden');
            signupForm.classList.add('hidden');
            otpForm.classList.add('hidden');
            forgotPasswordForm.classList.add('hidden');
            resetOTPForm.classList.add('hidden');
            resetPasswordForm.classList.remove('hidden');
            if (loginHeader) loginHeader.classList.add('hidden');
            if (signupHeader) signupHeader.classList.add('hidden');
            if (otpHeader) otpHeader.classList.add('hidden');
            if (forgotPasswordHeader) forgotPasswordHeader.classList.add('hidden');
            if (resetOTPHeader) resetOTPHeader.classList.add('hidden');
            if (resetPasswordHeader) resetPasswordHeader.classList.remove('hidden');
            if (resetEmailDisplay) resetEmailDisplay.textContent = email;
        }
    }

    // Handle login
    async handleLogin(email, password) {
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            const response = await fetch(`${this.apiBaseUrl}/login.php`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                // Login successful
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('currentUser', email);
                this.currentUser = email;

                this.hideLoginModal();
                this.updateHeaderForLoggedInUser();
                
                // Show success message
                window.toast.success('Welcome back! You are now logged in.');
                
                // Redirect to home page after successful login
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                
                return result;
            } else {
                throw new Error(result.message || 'Login failed');
            }
        } catch (error) {
            // Handle network errors vs API errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                window.toast.error('Network error: Please check your internet connection');
            } else {
                window.toast.error(error.message);
            }
            throw error;
        }
    }

    // Handle signup
    async handleSignup(name, email, phone, password, confirmPassword) {
        try {
            // Validate inputs
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match. Please try again.');
            }

            // Validate password strength (backend requirements)
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long.');
            }

            // Validate phone number (must be exactly 10 digits)
            if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
                throw new Error('Please enter a valid 10-digit phone number.');
            }

            // Store signup data for after OTP verification
            const signupData = {
                name: name,
                email: email,
                phone: phone,
                password: password,
                confirmPassword: confirmPassword
            };
            localStorage.setItem('pendingSignup', JSON.stringify(signupData));

            // Send OTP first
            await this.sendOTP(email);
            
        } catch (error) {
            window.toast.error(error.message);
            throw error;
        }
    }

    // Handle forgot password
    async handleForgotPassword(email) {
        if (!email) {
            window.toast.error('Email is required');
            return;
        }

        if (!this.isValidEmail(email)) {
            window.toast.error('Please enter a valid email address');
            return;
        }

        const button = document.getElementById('forgot-password-submit-btn');
        const originalText = button.innerHTML;

        try {
            this.showLoadingState(button, 'Sending...');

            const formData = new FormData();
            formData.append('email', email);

            const response = await fetch(`${this.apiBaseUrl}/forgot_password.php`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                window.toast.success('Password reset OTP sent to your email!');
                this.showResetOTPForm(email);
            } else {
                throw new Error(result.message || 'Failed to send reset OTP');
            }
        } catch (error) {
            // Handle network errors vs API errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                window.toast.error('Network error: Please check your internet connection');
            } else {
                window.toast.error(error.message);
            }
            throw error;
        } finally {
            this.hideLoadingState(button, originalText);
        }
    }

    // Handle reset OTP verification
    async handleResetOTPVerification(email, otp) {
        if (!email || !otp) {
            window.toast.error('Email and OTP are required');
            return;
        }

        if (otp.length !== 4) {
            window.toast.error('Please enter a 4-digit OTP');
            return;
        }

        const button = document.getElementById('verify-reset-otp-btn');
        const originalText = button.innerHTML;

        try {
            this.showLoadingState(button, 'Verifying...');

            const formData = new FormData();
            formData.append('email', email);
            formData.append('otp', otp);

            const response = await fetch(`${this.apiBaseUrl}/verify_forgot_password_otp.php`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                window.toast.success('OTP verified successfully! Please enter your new password.');
                this.showResetPasswordForm(email);
            } else {
                throw new Error(result.message || 'Invalid OTP');
            }
        } catch (error) {
            // Handle network errors vs API errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                window.toast.error('Network error: Please check your internet connection');
            } else {
                window.toast.error(error.message);
            }
            throw error;
        } finally {
            this.hideLoadingState(button, originalText);
        }
    }

    // Handle reset password
    async handleResetPassword(email, newPassword, confirmPassword) {
        if (!email || !newPassword || !confirmPassword) {
            window.toast.error('All fields are required');
            return;
        }

        if (newPassword.length < 6) {
            window.toast.error('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            window.toast.error('Passwords do not match');
            return;
        }

        const button = document.getElementById('reset-password-submit-btn');
        const originalText = button.innerHTML;

        try {
            this.showLoadingState(button, 'Resetting...');

            const formData = new FormData();
            formData.append('email', email);
            formData.append('new_password', newPassword);
            formData.append('confirm_password', confirmPassword);

            const response = await fetch(`${this.apiBaseUrl}/reset_password.php`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                window.toast.success('Password reset successfully! Please login with your new password.');
                this.showLoginForm();
                // Pre-fill the email in login form
                const loginEmailInput = document.getElementById('login-email');
                if (loginEmailInput) {
                    loginEmailInput.value = email;
                }
            } else {
                throw new Error(result.message || 'Failed to reset password');
            }
        } catch (error) {
            // Handle network errors vs API errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                window.toast.error('Network error: Please check your internet connection');
            } else {
                window.toast.error(error.message);
            }
            throw error;
        } finally {
            this.hideLoadingState(button, originalText);
        }
    }

    // Logout user
    logout() {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('pendingSignup');
        this.currentUser = null;
        
        // Reload page to update header
        location.reload();
    }

    // Update header for logged in user
    updateHeaderForLoggedInUser() {
        const userIcon = document.querySelector('.user-icon');
        if (userIcon && this.currentUser) {
            const loginPopup = userIcon.querySelector('.login-popup');
            
            if (loginPopup) {
                loginPopup.innerHTML = `
                    <div class="text-center mb-3">
                        <div class="text-sm font-medium">Welcome, ${this.currentUser}!</div>
                    </div>
                    <a href="my-account.html" class="button-main w-full text-center">My Account</a>
                    <button class="button-main bg-white text-black border border-black w-full text-center mt-3" id="logout-btn">Logout</button>
                `;
                
                // Add logout functionality
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => this.logout());
                }
            }
        }
    }

    // Show notification (legacy method - now uses toast system)
    showNotification(message, type = 'info') {
        if (window.toast) {
            switch (type) {
                case 'success':
                    window.toast.success(message);
                    break;
                case 'error':
                    window.toast.error(message);
                    break;
                case 'warning':
                    window.toast.warning(message);
                    break;
                default:
                    window.toast.info(message);
            }
        } else {
            // Fallback if toast system is not available
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Initialize modal behavior
    initModal() {
        // If user is already logged in, don't show popup
        if (this.checkLoginStatus()) {
            return;
        }
        
        // Check if user has already seen the popup
        const hasSeenPopup = localStorage.getItem('popupSeen') === 'true';
        if (hasSeenPopup) {
            return;
        }
        
        // Show popup after a short delay
        setTimeout(() => {
            this.showLoginModal();
        }, 2000);
    }

    // Setup event listeners
    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const closeBtn = document.querySelector('.close-newsletter-btn');
        const showSignupBtn = document.getElementById('show-signup-form');
        const showLoginBtn = document.getElementById('show-login-form');
        const modal = document.querySelector('.modal-newsletter');

        // Login form submission
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('login-email')?.value.trim();
                const password = document.getElementById('login-password')?.value;
                const submitBtn = document.getElementById('login-submit-btn');
                
                if (!email || !password) {
                    window.toast.error('Please fill in all fields');
                    return;
                }
                
                if (!this.isValidEmail(email)) {
                    window.toast.error('Please enter a valid email address');
                    return;
                }
                
                // Show loading state
                this.showLoadingState(submitBtn, 'Signing In...');
                
                try {
                    await this.handleLogin(email, password);
                } catch (error) {
                    // Error is already handled in handleLogin
                } finally {
                    // Hide loading state
                    this.hideLoadingState(submitBtn, 'Sign In');
                }
            });
        }

        // Signup form submission
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const name = document.getElementById('signup-name')?.value.trim();
                const email = document.getElementById('signup-email')?.value.trim();
                const phone = document.getElementById('signup-phone')?.value.trim();
                const password = document.getElementById('signup-password')?.value;
                const confirmPassword = document.getElementById('signup-confirm-password')?.value;
                const agreeTerms = document.getElementById('agree-terms')?.checked;
                const submitBtn = document.getElementById('signup-submit-btn');
                
                if (!name || !email || !phone || !password || !confirmPassword) {
                    window.toast.error('Please fill in all fields');
                    return;
                }
                
                if (!this.isValidEmail(email)) {
                    window.toast.error('Please enter a valid email address');
                    return;
                }
                
                if (!agreeTerms) {
                    window.toast.error('Please agree to the Terms of Service and Privacy Policy');
                    return;
                }
                
                // Show loading state
                this.showLoadingState(submitBtn, 'Creating Account...');
                
                try {
                    await this.handleSignup(name, email, phone, password, confirmPassword);
                } catch (error) {
                    // Error is already handled in handleSignup
                } finally {
                    // Hide loading state
                    this.hideLoadingState(submitBtn, 'Create Account');
                }
            });
        }

        // Switch to signup form
        if (showSignupBtn) {
            showSignupBtn.addEventListener('click', () => this.switchToSignup());
        }

        // Switch to login form
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => this.switchToLogin());
        }

        // Right column signup button
        const showSignupBtnRight = document.getElementById('show-signup-form-right');
        if (showSignupBtnRight) {
            showSignupBtnRight.addEventListener('click', () => this.switchToSignup());
        }

        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideLoginModal();
                localStorage.setItem('popupSeen', 'true');
            });
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideLoginModal();
                    localStorage.setItem('popupSeen', 'true');
                }
            });
        }

        // Password visibility toggles
        this.togglePasswordVisibility('login-password', 'toggle-password');
        this.togglePasswordVisibility('signup-password', 'toggle-signup-password');
        this.togglePasswordVisibility('signup-confirm-password', 'toggle-signup-confirm-password');
        
        // Phone number input restrictions
        this.setupPhoneInputRestrictions();
        
        // Email validation feedback
        this.setupEmailValidation();
        
        // Password strength validation
        this.setupPasswordStrengthValidation();
        
        // Confirm password validation
        this.setupConfirmPasswordValidation();
        
        // Forgot password form submission
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('forgot-email')?.value.trim();
                const submitBtn = document.getElementById('forgot-password-submit-btn');
                
                if (!email) {
                    this.showNotification('Please enter your email address', 'error');
                    return;
                }
                
                if (!this.isValidEmail(email)) {
                    this.showNotification('Please enter a valid email address', 'error');
                    return;
                }
                
                try {
                    await this.handleForgotPassword(email);
                } catch (error) {
                    // Error is already handled in handleForgotPassword
                }
            });
        }

        // Reset OTP form submission
        const resetOTPForm = document.getElementById('reset-otp-form');
        if (resetOTPForm) {
            resetOTPForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('reset-otp-email-display')?.textContent;
                const otp = this.getResetOTPFromInputs();
                const submitBtn = document.getElementById('verify-reset-otp-btn');
                
                if (!email || !otp) {
                    window.toast.error('Please fill in all fields');
                    return;
                }
                
                if (otp.length !== 4) {
                    window.toast.error('Please enter a 4-digit OTP');
                    return;
                }
                
                try {
                    await this.handleResetOTPVerification(email, otp);
                } catch (error) {
                    // Error is already handled in handleResetOTPVerification
                }
            });
        }

        // Reset password form submission
        const resetPasswordForm = document.getElementById('reset-password-form');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('reset-email-display')?.textContent;
                const newPassword = document.getElementById('reset-new-password')?.value;
                const confirmPassword = document.getElementById('reset-confirm-password')?.value;
                const submitBtn = document.getElementById('reset-password-submit-btn');
                
                if (!email || !newPassword || !confirmPassword) {
                    window.toast.error('Please fill in all fields');
                    return;
                }
                
                if (newPassword.length < 6) {
                    window.toast.error('Password must be at least 6 characters');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    window.toast.error('Passwords do not match');
                    return;
                }
                
                try {
                    await this.handleResetPassword(email, newPassword, confirmPassword);
                } catch (error) {
                    // Error is already handled in handleResetPassword
                }
            });
        }

        // Show forgot password form
        const showForgotPasswordBtn = document.getElementById('show-forgot-password-form');
        if (showForgotPasswordBtn) {
            showForgotPasswordBtn.addEventListener('click', () => this.showForgotPasswordForm());
        }

        // Back to login from forgot password
        const backToLoginFromForgotBtn = document.getElementById('back-to-login-from-forgot');
        if (backToLoginFromForgotBtn) {
            backToLoginFromForgotBtn.addEventListener('click', () => this.showLoginForm());
        }

        // Back to login from forgot password
        const backToLoginFromForgotBtn = document.getElementById('back-to-login-from-forgot');
        if (backToLoginFromForgotBtn) {
            backToLoginFromForgotBtn.addEventListener('click', () => this.showLoginForm());
        }

        // Back to forgot password from reset password
        const backToForgotPasswordBtn = document.getElementById('back-to-forgot-password');
        if (backToForgotPasswordBtn) {
            backToForgotPasswordBtn.addEventListener('click', () => this.showForgotPasswordForm());
        }

        // Back to forgot password from reset OTP
        const backToForgotFromResetOTPBtn = document.getElementById('back-to-forgot-from-otp');
        if (backToForgotFromResetOTPBtn) {
            backToForgotFromResetOTPBtn.addEventListener('click', () => this.showForgotPasswordForm());
        }

        // Back to forgot password from reset OTP
        const backToForgotFromOTPBtn = document.getElementById('back-to-forgot-from-otp');
        if (backToForgotFromOTPBtn) {
            backToForgotFromOTPBtn.addEventListener('click', () => this.showForgotPasswordForm());
        }

        // Back to signup from OTP form
        const backToSignupBtn = document.getElementById('back-to-signup');
        if (backToSignupBtn) {
            backToSignupBtn.addEventListener('click', () => this.showSignupForm());
        }

        // Setup reset password OTP input behavior
        this.setupResetOTPInputBehavior();
        
        // Setup reset password strength validation
        this.setupResetPasswordStrengthValidation();
        
        // Setup reset confirm password validation
        this.setupResetConfirmPasswordValidation();
        
        // Password visibility toggles for reset password
        this.togglePasswordVisibility('reset-new-password', 'toggle-reset-password');
        this.togglePasswordVisibility('reset-confirm-password', 'toggle-reset-confirm-password');

        // Resend OTP button
        const resendOtpBtn = document.getElementById('resend-otp-btn');
        if (resendOtpBtn) {
            resendOtpBtn.addEventListener('click', async () => {
                try {
                    await this.resendOTP();
                } catch (error) {
                    // Error already handled in resendOTP
                }
            });
        }
    }
    
    // Setup phone input restrictions
    setupPhoneInputRestrictions() {
        const phoneInput = document.getElementById('signup-phone');
        if (phoneInput) {
            // Only allow numbers
            phoneInput.addEventListener('input', function(e) {
                // Remove any non-digit characters
                this.value = this.value.replace(/\D/g, '');
                
                // Limit to 10 digits
                if (this.value.length > 10) {
                    this.value = this.value.slice(0, 10);
                }
            });
            
            // Prevent non-numeric keys
            phoneInput.addEventListener('keypress', function(e) {
                // Allow: backspace, delete, tab, escape, enter, and numbers
                if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true)) {
                    return;
                }
                
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
                    (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });
        }
    }
    
    // Setup email validation with real-time feedback
    setupEmailValidation() {
        const loginEmail = document.getElementById('login-email');
        const signupEmail = document.getElementById('signup-email');
        
        // Function to validate email and show feedback
        const validateEmail = (input) => {
            const email = input.value.trim();
            const errorClass = 'border-red-500';
            const successClass = 'border-green-500';
            
            // Remove existing error/success classes
            input.classList.remove(errorClass, successClass);
            
            if (email === '') {
                // No validation message for empty field
                return;
            }
            
            if (!this.isValidEmail(email)) {
                input.classList.add(errorClass);
                // Show error message
                this.showEmailError(input, 'Please enter a valid email address with @ symbol');
            } else {
                input.classList.add(successClass);
                // Remove error message if exists
                this.removeEmailError(input);
            }
        };
        
        // Add event listeners for real-time validation
        if (loginEmail) {
            loginEmail.addEventListener('blur', () => validateEmail(loginEmail));
            loginEmail.addEventListener('input', () => {
                // Remove error styling on input
                loginEmail.classList.remove('border-red-500', 'border-green-500');
                this.removeEmailError(loginEmail);
            });
        }
        
        if (signupEmail) {
            signupEmail.addEventListener('blur', () => validateEmail(signupEmail));
            signupEmail.addEventListener('input', () => {
                // Remove error styling on input
                signupEmail.classList.remove('border-red-500', 'border-green-500');
                this.removeEmailError(signupEmail);
            });
        }
    }
    
    // Show email error message
    showEmailError(input, message) {
        // Remove existing error message
        this.removeEmailError(input);
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-xs mt-1';
        errorDiv.textContent = message;
        errorDiv.id = input.id + '-error';
        
        // Insert after the input
        input.parentNode.appendChild(errorDiv);
    }
    
    // Remove email error message
    removeEmailError(input) {
        const errorDiv = document.getElementById(input.id + '-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Email validation
    isValidEmail(email) {
        // Check if email contains @ symbol
        if (!email.includes('@')) {
            return false;
        }
        
        // Check if email has proper format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show loading state
    showLoadingState(button, loadingText) {
        if (button) {
            button.disabled = true;
            button.innerHTML = `
                <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ${loadingText}
                </div>
            `;
        }
    }

    // Hide loading state
    hideLoadingState(button, originalText) {
        if (button) {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }

    // Setup password strength validation
    setupPasswordStrengthValidation() {
        const passwordInput = document.getElementById('signup-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.checkPasswordStrength(e.target.value);
            });
        }
    }

    // Check password strength
    checkPasswordStrength(password) {
        const strengthIndicator = document.getElementById('password-strength');
        if (!strengthIndicator) return;

        if (!password) {
            strengthIndicator.innerHTML = '';
            strengthIndicator.className = 'text-xs mt-1';
            return;
        }

        let strength = 0;
        let feedback = [];

        // Check length
        if (password.length >= 6) {
            strength += 1;
            feedback.push('✓ At least 6 characters');
        } else {
            feedback.push('✗ At least 6 characters');
        }

        // Check for uppercase
        if (/[A-Z]/.test(password)) {
            strength += 1;
            feedback.push('✓ Contains uppercase letter');
        } else {
            feedback.push('✗ Contains uppercase letter');
        }

        // Check for lowercase
        if (/[a-z]/.test(password)) {
            strength += 1;
            feedback.push('✓ Contains lowercase letter');
        } else {
            feedback.push('✗ Contains lowercase letter');
        }

        // Check for numbers
        if (/\d/.test(password)) {
            strength += 1;
            feedback.push('✓ Contains number');
        } else {
            feedback.push('✗ Contains number');
        }

        // Check for special characters
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            strength += 1;
            feedback.push('✓ Contains special character');
        } else {
            feedback.push('✗ Contains special character');
        }

        // Set strength level and color
        let strengthText = '';
        let strengthClass = '';
        let progressClass = '';

        if (strength <= 1) {
            strengthText = 'Very Weak';
            strengthClass = 'text-red-500';
            progressClass = 'bg-red-500';
        } else if (strength === 2) {
            strengthText = 'Weak';
            strengthClass = 'text-orange-500';
            progressClass = 'bg-orange-500';
        } else if (strength === 3) {
            strengthText = 'Fair';
            strengthClass = 'text-yellow-500';
            progressClass = 'bg-yellow-500';
        } else if (strength === 4) {
            strengthText = 'Good';
            strengthClass = 'text-blue-500';
            progressClass = 'bg-blue-500';
        } else {
            strengthText = 'Strong';
            strengthClass = 'text-green-500';
            progressClass = 'bg-green-500';
        }

        const progressWidth = (strength / 5) * 100;

        strengthIndicator.innerHTML = `
            <div class="mb-3">
                <div class="flex justify-between items-center mb-1">
                    <span class="font-medium ${strengthClass}">${strengthText}</span>
                    <span class="text-xs text-gray-500">${strength}/5</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-300 ${progressClass}" style="width: ${progressWidth}%"></div>
                </div>
            </div>
            <div class="space-y-1 text-xs bg-gray-50 p-3 rounded-lg border">
                <div class="font-medium text-gray-700 mb-2">Password Requirements:</div>
                ${feedback.map(item => `<div class="${item.startsWith('✓') ? 'text-green-600' : 'text-red-600'} flex items-center">
                    <span class="mr-2">${item.startsWith('✓') ? '✓' : '✗'}</span>
                    ${item.replace('✓ ', '').replace('✗ ', '')}
                </div>`).join('')}
            </div>
        `;
    }

    // Setup confirm password validation
    setupConfirmPasswordValidation() {
        const passwordInput = document.getElementById('signup-password');
        const confirmInput = document.getElementById('signup-confirm-password');
        const confirmIndicator = document.getElementById('confirm-password-indicator');

        if (passwordInput && confirmInput) {
            confirmInput.addEventListener('input', () => {
                this.checkConfirmPassword(passwordInput.value, confirmInput.value);
            });
        }
    }

    // Check confirm password
    checkConfirmPassword(password, confirmPassword) {
        const confirmIndicator = document.getElementById('confirm-password-indicator');
        if (!confirmIndicator) return;

        if (confirmPassword === '') {
            confirmIndicator.innerHTML = '';
            return;
        }

        if (password === confirmPassword) {
            confirmIndicator.innerHTML = '<span class="text-green-500 flex items-center"><i class="ph ph-check-circle mr-1"></i>Confirmed</span>';
        } else {
            confirmIndicator.innerHTML = '<span class="text-red-500 flex items-center"><i class="ph ph-x-circle mr-1"></i>Passwords do not match</span>';
        }
    }

    // Get reset OTP from inputs
    getResetOTPFromInputs() {
        const inputs = [
            'reset-otp-input-1',
            'reset-otp-input-2', 
            'reset-otp-input-3',
            'reset-otp-input-4'
        ];
        
        return inputs.map(id => document.getElementById(id)?.value || '').join('');
    }

    // Setup reset OTP input behavior
    setupResetOTPInputBehavior() {
        const inputs = [
            'reset-otp-input-1',
            'reset-otp-input-2',
            'reset-otp-input-3', 
            'reset-otp-input-4'
        ];

        inputs.forEach((inputId, index) => {
            const input = document.getElementById(inputId);
            if (input) {
                // Handle input
                input.addEventListener('input', (e) => {
                    const value = e.target.value;
                    
                    // Only allow numbers
                    if (!/^\d*$/.test(value)) {
                        e.target.value = value.replace(/\D/g, '');
                        return;
                    }
                    
                    // Move to next input if current is filled
                    if (value && index < inputs.length - 1) {
                        const nextInput = document.getElementById(inputs[index + 1]);
                        if (nextInput) {
                            nextInput.focus();
                        }
                    }
                });

                // Handle backspace
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !e.target.value && index > 0) {
                        const prevInput = document.getElementById(inputs[index - 1]);
                        if (prevInput) {
                            prevInput.focus();
                        }
                    }
                });

                // Handle paste
                input.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text');
                    const numbers = pastedData.replace(/\D/g, '').slice(0, 4);
                    
                    // Fill all inputs with pasted data
                    numbers.split('').forEach((num, i) => {
                        if (i < inputs.length) {
                            const targetInput = document.getElementById(inputs[i]);
                            if (targetInput) {
                                targetInput.value = num;
                            }
                        }
                    });
                    
                    // Focus last filled input or first empty input
                    const lastFilledIndex = Math.min(numbers.length - 1, inputs.length - 1);
                    const nextEmptyIndex = numbers.length < inputs.length ? numbers.length : inputs.length - 1;
                    const focusIndex = numbers.length === inputs.length ? lastFilledIndex : nextEmptyIndex;
                    const focusInput = document.getElementById(inputs[focusIndex]);
                    if (focusInput) {
                        focusInput.focus();
                    }
                });
            }
        });
    }

    // Setup reset password strength validation
    setupResetPasswordStrengthValidation() {
        const passwordInput = document.getElementById('reset-new-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.checkResetPasswordStrength(e.target.value);
            });
        }
    }

    // Check reset password strength
    checkResetPasswordStrength(password) {
        const strengthIndicator = document.getElementById('reset-password-strength');
        if (!strengthIndicator) return;

        if (!password) {
            strengthIndicator.innerHTML = '';
            strengthIndicator.className = 'text-xs mt-1';
            return;
        }

        let strength = 0;
        let feedback = [];

        // Check length
        if (password.length >= 6) {
            strength += 1;
            feedback.push('✓ At least 6 characters');
        } else {
            feedback.push('✗ At least 6 characters');
        }

        // Check for uppercase
        if (/[A-Z]/.test(password)) {
            strength += 1;
            feedback.push('✓ Contains uppercase letter');
        } else {
            feedback.push('✗ Contains uppercase letter');
        }

        // Check for lowercase
        if (/[a-z]/.test(password)) {
            strength += 1;
            feedback.push('✓ Contains lowercase letter');
        } else {
            feedback.push('✗ Contains lowercase letter');
        }

        // Check for numbers
        if (/\d/.test(password)) {
            strength += 1;
            feedback.push('✓ Contains number');
        } else {
            feedback.push('✗ Contains number');
        }

        // Check for special characters
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            strength += 1;
            feedback.push('✓ Contains special character');
        } else {
            feedback.push('✗ Contains special character');
        }

        // Set strength level and color
        let strengthText = '';
        let strengthClass = '';
        let progressClass = '';

        if (strength <= 1) {
            strengthText = 'Very Weak';
            strengthClass = 'text-red-500';
            progressClass = 'bg-red-500';
        } else if (strength === 2) {
            strengthText = 'Weak';
            strengthClass = 'text-orange-500';
            progressClass = 'bg-orange-500';
        } else if (strength === 3) {
            strengthText = 'Fair';
            strengthClass = 'text-yellow-500';
            progressClass = 'bg-yellow-500';
        } else if (strength === 4) {
            strengthText = 'Good';
            strengthClass = 'text-blue-500';
            progressClass = 'bg-blue-500';
        } else {
            strengthText = 'Strong';
            strengthClass = 'text-green-500';
            progressClass = 'bg-green-500';
        }

        const progressWidth = (strength / 5) * 100;

        strengthIndicator.innerHTML = `
            <div class="mb-3">
                <div class="flex justify-between items-center mb-1">
                    <span class="font-medium ${strengthClass}">${strengthText}</span>
                    <span class="text-xs text-gray-500">${strength}/5</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-300 ${progressClass}" style="width: ${progressWidth}%"></div>
                </div>
            </div>
            <div class="space-y-1 text-xs bg-gray-50 p-3 rounded-lg border">
                <div class="font-medium text-gray-700 mb-2">Password Requirements:</div>
                ${feedback.map(item => `<div class="${item.startsWith('✓') ? 'text-green-600' : 'text-red-600'} flex items-center">
                    <span class="mr-2">${item.startsWith('✓') ? '✓' : '✗'}</span>
                    ${item.replace('✓ ', '').replace('✗ ', '')}
                </div>`).join('')}
            </div>
        `;
    }

    // Setup reset confirm password validation
    setupResetConfirmPasswordValidation() {
        const passwordInput = document.getElementById('reset-new-password');
        const confirmInput = document.getElementById('reset-confirm-password');
        const confirmIndicator = document.getElementById('reset-confirm-password-indicator');

        if (passwordInput && confirmInput) {
            confirmInput.addEventListener('input', () => {
                this.checkResetConfirmPassword(passwordInput.value, confirmInput.value);
            });
        }
    }

    // Check reset confirm password
    checkResetConfirmPassword(password, confirmPassword) {
        const confirmIndicator = document.getElementById('reset-confirm-password-indicator');
        if (!confirmIndicator) return;

        if (confirmPassword === '') {
            confirmIndicator.innerHTML = '';
            return;
        }

        if (password === confirmPassword) {
            confirmIndicator.innerHTML = '<span class="text-green-500 flex items-center"><i class="ph ph-check-circle mr-1"></i>Confirmed</span>';
        } else {
            confirmIndicator.innerHTML = '<span class="text-red-500 flex items-center"><i class="ph ph-x-circle mr-1"></i>Passwords do not match</span>';
        }
    }
}

// Initialize authentication system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing AuthSystem...');
    window.authSystem = new AuthSystem();
    console.log('AuthSystem initialized successfully!');
    
    // Debug: Check if all forms are found
    setTimeout(() => {
        const forms = {
            login: document.getElementById('login-form'),
            signup: document.getElementById('signup-form'),
            otp: document.getElementById('otp-form'),
            forgotPassword: document.getElementById('forgot-password-form'),
            resetOtp: document.getElementById('reset-otp-form'),
            resetPassword: document.getElementById('reset-password-form')
        };
        
        console.log('Forms found:', forms);
        
        // Check if auth system is working
        if (window.authSystem) {
            console.log('AuthSystem methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.authSystem)));
        }
    }, 1000);
}); 