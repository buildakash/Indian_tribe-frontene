# Registration System Documentation

## Overview
The registration system has been updated to integrate with the backend PHP API and includes OTP verification for enhanced security. The system now provides a user-friendly, multi-step registration process with real-time validation and proper error handling.

## Features

### 🔐 **Multi-Step Registration Process**
1. **Step 1**: User fills out registration form with validation
2. **Step 2**: OTP verification via email
3. **Step 3**: Success confirmation and redirect to login

### ✅ **Real-Time Validation**
- **Name**: Minimum 2 characters required
- **Phone**: Valid 10-digit Indian phone number (starts with 6-9)
- **Email**: Valid email format validation
- **Password**: Strong password requirements with visual strength indicator
- **Confirm Password**: Must match password
- **Terms**: Must be agreed to

### 🔒 **Security Features**
- **OTP Verification**: 6-digit OTP sent to email
- **Password Strength**: Visual indicator with 5 levels (Very Weak to Strong)
- **Input Sanitization**: Proper data cleaning before API calls
- **Session Management**: Form data preserved during OTP verification

### 📱 **User Experience**
- **Responsive Design**: Works on all device sizes
- **Loading States**: Visual feedback during API calls
- **Error Messages**: Clear, specific error messages for each field
- **Success Notifications**: Toast-style notifications for user feedback
- **Password Visibility Toggle**: Show/hide password functionality

## API Integration

### **Backend Endpoints Used**
1. **`../Backend _php/routes/auth/register.php`** - Send registration OTP
2. **`../Backend _php/routes/auth/verify_otp.php`** - Verify OTP and complete registration
3. **`../Backend _php/routes/auth/resend_otp.php`** - Resend OTP if expired

### **API Request Format**
```javascript
// Registration Request
{
    name: "Full Name",
    phone: "9876543210",
    email: "user@example.com",
    password: "StrongPass123!",
    confirm_password: "StrongPass123!",
    agreed_terms: "1"
}

// OTP Verification Request
{
    email: "user@example.com",
    otp: "123456",
    name: "Full Name",
    phone: "9876543210",
    password: "StrongPass123!",
    confirm_password: "StrongPass123!",
    agreed_terms: "1"
}
```

## File Structure

```
new-homepage/
├── register.html              # Main registration page
├── test-registration.html     # API testing page
├── README_REGISTRATION.md     # This documentation
└── assets/
    ├── css/
    │   └── style.css         # Main stylesheet
    └── js/
        └── main.js           # Main JavaScript file
```

## Password Requirements

The system enforces strong password requirements:
- **Minimum 8 characters**
- **At least 1 uppercase letter (A-Z)**
- **At least 1 lowercase letter (a-z)**
- **At least 1 number (0-9)**
- **At least 1 special character (@$!%*#?&)**

## OTP System

### **OTP Features**
- **6-digit numeric code**
- **60-second expiration**
- **Email delivery**
- **Resend functionality** (after expiration)
- **Auto-focus navigation** between input fields

### **OTP Input Behavior**
- Auto-advance to next field on input
- Backspace support for previous field
- Visual focus indicators
- Complete 6-digit validation

## Usage Instructions

### **For Users**
1. **Fill Registration Form**
   - Enter your full name
   - Provide valid Indian phone number
   - Use a strong email address
   - Create a strong password
   - Confirm password
   - Agree to terms

2. **Verify Email OTP**
   - Check your email for 6-digit OTP
   - Enter OTP in the verification form
   - Wait for confirmation

3. **Complete Registration**
   - Redirected to login page
   - Use your credentials to sign in

### **For Developers**
1. **Testing**: Use `test-registration.html` to test API endpoints
2. **Customization**: Modify validation rules in the JavaScript class
3. **Styling**: Update CSS variables for theme changes
4. **API Changes**: Update endpoint URLs in the JavaScript code

## Error Handling

### **Client-Side Validation Errors**
- Field-specific error messages
- Real-time validation feedback
- Form submission prevention on errors

### **API Error Handling**
- Network error detection
- Server response parsing
- User-friendly error messages
- Retry mechanisms for failed requests

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+
- **Features Used**: ES6 Classes, Async/Await, Fetch API, CSS Grid/Flexbox

## Security Considerations

### **Frontend Security**
- Input sanitization before API calls
- No sensitive data stored in localStorage
- CSRF protection through proper form handling
- XSS prevention through proper DOM manipulation

### **API Security**
- HTTPS recommended for production
- Rate limiting on backend (implemented in PHP)
- OTP expiration and verification
- Password hashing on backend

## Troubleshooting

### **Common Issues**
1. **OTP Not Received**
   - Check spam folder
   - Verify email address
   - Wait for resend option

2. **Validation Errors**
   - Ensure all fields meet requirements
   - Check password strength indicator
   - Verify phone number format

3. **API Connection Issues**
   - Check backend server status
   - Verify API endpoint URLs
   - Check network connectivity

### **Debug Mode**
Use the browser's developer console to:
- Monitor API requests/responses
- Check for JavaScript errors
- Validate form data before submission

## Customization

### **Styling Changes**
```css
/* Update color scheme */
:root {
    --primary-color: #your-color;
    --error-color: #your-error-color;
    --success-color: #your-success-color;
}
```

### **Validation Rules**
```javascript
// Modify validation methods in RegistrationForm class
validatePhone() {
    // Custom phone validation logic
}
```

### **API Endpoints**
```javascript
// Update API URLs in form submission methods
const response = await fetch('your-api-endpoint', {
    method: 'POST',
    body: formData
});
```

## Support

For technical support or customization requests:
1. Check the browser console for errors
2. Verify backend API functionality
3. Test with the provided test page
4. Review this documentation for configuration options

## Version History

- **v2.0**: Complete API integration with OTP verification
- **v1.0**: Basic HTML form without backend integration

---

**Note**: This registration system is designed to work with the Indian Tribe backend PHP API. Ensure the backend is properly configured and accessible before testing the frontend functionality.
