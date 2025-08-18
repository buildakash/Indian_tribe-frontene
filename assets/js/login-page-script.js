// Configuration for API base URL
window.AppConfig = {
    apiBaseUrl: 'http://localhost:8000/routes/auth'
};

// Login page functionality
document.addEventListener('components:loaded', initializeLoginLogic);

function initializeLoginLogic() {
    const loginForm = document.getElementById('login-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const otpForm = document.getElementById('otp-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    
    // If forms are not present (e.g., different page), exit gracefully
    if (!loginForm || !forgotPasswordForm || !otpForm || !resetPasswordForm) return;

    const forgotPasswordLink = document.getElementById('show-forgot-password-form');
    const backToLoginBtn = document.getElementById('back-to-login-from-forgot');
    const backToForgotBtn = document.getElementById('back-to-forgot-from-otp');
    const backToOtpBtn = document.getElementById('back-to-forgot-password');
    
    let currentEmail = '';
    let currentOtp = '';

    // Show/Hide forms
    function showForm(formId) {
        [loginForm, forgotPasswordForm, otpForm, resetPasswordForm].forEach(form => {
            if (form) form.style.display = 'none';
        });
        const formToShow = document.getElementById(formId);
        if (formToShow) formToShow.style.display = 'block';
    }

    // ... (The rest of your extensive JavaScript logic goes here) ...
    // ... I've omitted the full script for brevity, but you should copy the entire <script> content from your original file into here ...
    
    // Example of the logic that should be here:
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        // The rest of your login submission logic...
    });
    
    if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', function(e) { e.preventDefault(); showForm('forgot-password-form'); });

    // And so on for all your other functions and event listeners.
    
    console.log("Login page logic initialized.");
}