// Registration Form Handler
class RegistrationForm {
    constructor() {
        this.currentStep = 1;
        this.formData = {};
        this.otpExpiryTime = null;
        this.otpTimer = null;
        
        this.initializeElements();
        this.bindEvents();
        this.initializePasswordStrength();
    }

    initializeElements() {
        // Form elements
        this.registrationForm = document.getElementById('registrationForm');
        this.otpVerification = document.getElementById('otpVerification');
        this.successMessage = document.getElementById('successMessage');
        
        // Input elements
        this.nameInput = document.getElementById('name');
        this.phoneInput = document.getElementById('phone');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirmPassword');
        this.rememberCheckbox = document.getElementById('remember');
        
        // Button elements
        this.registerBtn = document.getElementById('registerBtn');
        this.verifyOtpBtn = document.getElementById('verifyOtpBtn');
        this.resendOtpBtn = document.getElementById('resendOtpBtn');
        this.backToFormBtn = document.getElementById('backToForm');
        
        // Toggle password buttons
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
        
        // OTP elements
        this.otpInputs = document.querySelectorAll('.otp-digit');
        this.otpEmail = document.getElementById('otpEmail');
        this.otpTimerElement = document.getElementById('otpTimer');
        
        // Error elements
        this.errorElements = {
            name: document.getElementById('nameError'),
            phone: document.getElementById('phoneError'),
            email: document.getElementById('emailError'),
            password: document.getElementById('passwordError'),
            confirmPassword: document.getElementById('confirmPasswordError')
        };
        
        // Password strength elements
        this.strengthFill = document.getElementById('strengthFill');
        this.strengthText = document.getElementById('strengthText');
    }

    bindEvents() {
        // Form submission
        this.registrationForm.addEventListener('submit', (e) => this.handleRegistrationSubmit(e));
        this.otpVerification.querySelector('#otpForm').addEventListener('submit', (e) => this.handleOtpSubmit(e));
        
        // Input validation
        this.nameInput.addEventListener('input', () => this.validateName());
        this.phoneInput.addEventListener('input', (e) => this.handlePhoneInput(e));
        this.phoneInput.addEventListener('keydown', (e) => this.handlePhoneKeydown(e));
        this.emailInput.addEventListener('input', () => this.validateEmail());
        this.passwordInput.addEventListener('input', () => this.validatePassword());
        this.confirmPasswordInput.addEventListener('input', () => this.validateConfirmPassword());
        this.rememberCheckbox.addEventListener('change', () => this.validateTerms());
        
        // Password visibility toggle
        this.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility(this.passwordInput, this.togglePasswordBtn));
        this.toggleConfirmPasswordBtn.addEventListener('click', () => this.togglePasswordVisibility(this.confirmPasswordInput, this.toggleConfirmPasswordBtn));
        
        // OTP handling
        this.otpInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleOtpInput(e));
            input.addEventListener('keydown', (e) => this.handleOtpKeydown(e));
        });
        
        // Other buttons
        this.resendOtpBtn.addEventListener('click', () => this.resendOtp());
        this.backToFormBtn.addEventListener('click', () => this.showStep(1));
    }

    initializePasswordStrength() {
        this.passwordInput.addEventListener('input', () => {
            const password = this.passwordInput.value;
            const strength = this.calculatePasswordStrength(password);
            this.updatePasswordStrength(strength);
        });
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        return score;
    }

    updatePasswordStrength(strength) {
        const percentage = (strength / 5) * 100;
        let color = '#ef4444';
        let text = 'Very Weak';
        
        if (strength >= 4) {
            color = '#10b981';
            text = 'Strong';
        } else if (strength >= 3) {
            color = '#f59e0b';
            text = 'Good';
        } else if (strength >= 2) {
            color = '#f59e0b';
            text = 'Fair';
        }
        
        this.strengthFill.style.width = percentage + '%';
        this.strengthFill.style.backgroundColor = color;
        this.strengthText.textContent = text;
    }

    // Validation methods
    validateName() {
        const name = this.nameInput.value.trim();
        if (name.length < 2) {
            this.showError('name', 'Name must be at least 2 characters long');
            return false;
        }
        this.hideError('name');
        return true;
    }

    validatePhone() {
        const phone = this.phoneInput.value.replace(/\D/g, '');
        if (phone.length !== 10) {
            this.showError('phone', 'Phone number must be exactly 10 digits');
            return false;
        }
        this.hideError('phone');
        return true;
    }

    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('email', 'Please enter a valid email address');
            return false;
        }
        this.hideError('email');
        return true;
    }

    validatePassword() {
        const password = this.passwordInput.value;
        if (password.length < 8) {
            this.showError('password', 'Password must be at least 8 characters long');
            return false;
        }
        this.hideError('password');
        return true;
    }

    validateConfirmPassword() {
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        if (password !== confirmPassword) {
            this.showError('confirmPassword', 'Passwords do not match');
            return false;
        }
        this.hideError('confirmPassword');
        return true;
    }

    validateTerms() {
        if (!this.rememberCheckbox.checked) {
            return false;
        }
        return true;
    }

    // Form submission handlers
    async handleRegistrationSubmit(e) {
        e.preventDefault();
        
        if (!this.validateAll()) {
            this.showNotification('Please fix the errors in the form', 'error');
            return;
        }
        
        // Collect form data
        this.formData = {
            name: this.nameInput.value.trim(),
            phone: this.phoneInput.value.replace(/\D/g, ''),
            email: this.emailInput.value.trim(),
            password: this.passwordInput.value,
            confirm_password: this.confirmPasswordInput.value,
            agreed_terms: this.rememberCheckbox.checked
        };
        
        this.setLoading(this.registerBtn, true);
        
        try {
            const formData = new FormData();
            formData.append('email', this.formData.email);
            formData.append('name', this.formData.name);

            const response = await fetch('../Backend _php/routes/auth/register.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                this.showStep(2);
                this.startOtpTimer();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.setLoading(this.registerBtn, false);
        }
    }

    async handleOtpSubmit(e) {
        e.preventDefault();
        
        const otp = Array.from(this.otpInputs).map(input => input.value).join('');
        if (otp.length !== 6) {
            this.showNotification('Please enter the complete 6-digit OTP', 'error');
            return;
        }

        this.setLoading(this.verifyOtpBtn, true);
        
        try {
            const formData = new FormData();
            formData.append('email', this.formData.email);
            formData.append('otp', otp);
            formData.append('name', this.formData.name);
            formData.append('phone', this.formData.phone);
            formData.append('password', this.formData.password);
            formData.append('confirm_password', this.formData.confirm_password);
            formData.append('agreed_terms', this.formData.agreed_terms);

            const response = await fetch('../Backend _php/routes/auth/verify_otp.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                this.showStep(3);
                this.stopOtpTimer();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.setLoading(this.verifyOtpBtn, false);
        }
    }

    async resendOtp() {
        try {
            const formData = new FormData();
            formData.append('email', this.formData.email);
            formData.append('name', this.formData.name);

            const response = await fetch('../Backend _php/routes/auth/resend_otp.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                this.showNotification('New OTP sent successfully!', 'success');
                this.startOtpTimer();
                this.clearOtpInputs();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        }
    }

    // Utility methods
    validateAll() {
        return this.validateName() && 
               this.validatePhone() && 
               this.validateEmail() && 
               this.validatePassword() && 
               this.validateConfirmPassword() && 
               this.validateTerms();
    }

    showStep(step) {
        this.currentStep = step;
        
        switch (step) {
            case 1:
                this.registrationForm.style.display = 'block';
                this.otpVerification.style.display = 'none';
                this.successMessage.style.display = 'none';
                break;
            case 2:
                this.registrationForm.style.display = 'none';
                this.otpVerification.style.display = 'block';
                this.successMessage.style.display = 'none';
                this.otpEmail.textContent = this.formData.email;
                this.clearOtpInputs();
                break;
            case 3:
                this.registrationForm.style.display = 'none';
                this.otpVerification.style.display = 'none';
                this.successMessage.style.display = 'block';
                break;
        }
    }

    startOtpTimer() {
        let timeLeft = 60;
        this.otpExpiryTime = Date.now() + (timeLeft * 1000);
        
        this.updateTimer();
        this.otpTimer = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                this.stopOtpTimer();
                this.resendOtpBtn.disabled = false;
                this.otpTimerElement.textContent = '00:00';
            } else {
                this.updateTimer();
            }
        }, 1000);
        
        this.resendOtpBtn.disabled = true;
    }

    updateTimer() {
        const timeLeft = Math.max(0, Math.ceil((this.otpExpiryTime - Date.now()) / 1000));
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        this.otpTimerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    stopOtpTimer() {
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
            this.otpTimer = null;
        }
    }

    clearOtpInputs() {
        this.otpInputs.forEach(input => input.value = '');
        this.otpInputs[0].focus();
    }

    handleOtpInput(e) {
        const input = e.target;
        const value = input.value;
        const index = parseInt(input.dataset.index);
        
        if (value && index < 5) {
            this.otpInputs[index + 1].focus();
        }
    }

    handleOtpKeydown(e) {
        const input = e.target;
        const index = parseInt(input.dataset.index);
        
        if (e.key === 'Backspace' && !input.value && index > 0) {
            this.otpInputs[index - 1].focus();
        }
    }

    togglePasswordVisibility(input, button) {
        if (input.type === 'password') {
            input.type = 'text';
            button.innerHTML = '<i class="ph ph-eye-slash text-lg"></i>';
        } else {
            input.type = 'password';
            button.innerHTML = '<i class="ph ph-eye text-lg"></i>';
        }
    }

    handlePhoneInput(e) {
        const input = e.target;
        let value = input.value.replace(/\D/g, ''); // Remove all non-digits
        
        // Limit to 10 digits
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        // Update input value
        input.value = value;
    }

    handlePhoneKeydown(e) {
        // Allow: backspace, delete, tab, escape, enter, and navigation keys
        if ([8, 9, 27, 13, 46, 37, 39, 38, 40].indexOf(e.keyCode) !== -1 ||
            // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
            return;
        }
        
        // Allow only numbers (0-9)
        if (e.keyCode >= 48 && e.keyCode <= 57) {
            // Check if we're already at 10 digits
            if (e.target.value.replace(/\D/g, '').length >= 10) {
                e.preventDefault();
                return;
            }
            return;
        }
        
        // Prevent all other keys
        e.preventDefault();
    }

    setLoading(button, loading) {
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');
        
        if (loading) {
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
            button.disabled = true;
        } else {
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            button.disabled = false;
        }
    }

    showError(field, message) {
        this.errorElements[field].textContent = message;
        this.errorElements[field].classList.remove('hidden');
    }

    hideError(field) {
        this.errorElements[field].classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // Remove on click
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }
}

// Initialize the registration form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationForm();
});
