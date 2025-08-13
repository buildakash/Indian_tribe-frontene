# Modular Structure for Registration Page

This document explains the modular structure implemented for the registration page, similar to the login page structure.

## Overview

The registration page has been refactored to use a modular component-based architecture, making it easier to maintain and reuse components across different pages.

## File Structure

### Components Directory (`/components/`)
- `register-content.html` - Main registration form content
- `register-breadcrumb.html` - Breadcrumb navigation for register page
- `header.html` - Updated header with breadcrumb placeholder
- `top-nav.html` - Top navigation bar
- `footer.html` - Footer component
- `mobile-bottom-bar.html` - Mobile bottom navigation
- `modals-and-helpers.html` - Modal dialogs and helper components

### JavaScript Files (`/assets/js/`)
- `register-page-script.js` - Registration form functionality and validation
- `loadComponents.js` - Component loader for different pages
- `api.auth.js` - Authentication API functions
- `controller.auth.js` - Authentication controller
- `auth.js` - Core authentication logic
- `toast.js` - Toast notification system

### CSS Files (`/assets/css/`)
- `register-custom.css` - Custom styles for registration page
- `style.css` - Main stylesheet
- Other CSS files for third-party libraries

## How It Works

### 1. Component Loading
The `loadComponents.js` file automatically detects the current page and loads the appropriate components:

```javascript
// Detect current page
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

// Define components for different pages
const pageComponents = {
    'register.html': {
        '#top-nav-placeholder': './components/top-nav.html',
        '#header-placeholder': './components/header.html',
        '#mobile-bottom-bar-placeholder': './components/mobile-bottom-bar.html',
        '#main-content-placeholder': './components/register-content.html',
        '#footer-placeholder': './components/footer.html',
        '#modals-and-helpers-placeholder': './components/modals-and-helpers.html',
        '#breadcrumb-placeholder': './components/register-breadcrumb.html'
    }
    // ... other pages
};
```

### 2. Main Page Structure
The `register.html` file now contains only the basic HTML structure with placeholders:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <!-- Asset links -->
    </head>
    <body>
        <!-- Component placeholders -->
        <div id="top-nav-placeholder"></div>
        <div id="header-placeholder"></div>
        <div id="mobile-bottom-bar-placeholder"></div>
        <div id="main-content-placeholder"></div>
        <div id="footer-placeholder"></div>
        <div id="modals-and-helpers-placeholder"></div>
        
        <!-- Scripts -->
        <script src="./assets/js/loadComponents.js"></script>
    </body>
</html>
```

### 3. Registration Form Features
The registration page includes:

- **Multi-step form**: Registration → OTP Verification → Success
- **Form validation**: Real-time validation with error messages
- **Password strength indicator**: Visual feedback on password strength
- **OTP verification**: 6-digit OTP with timer and resend functionality
- **Responsive design**: Mobile-friendly interface
- **Loading states**: Visual feedback during API calls
- **Toast notifications**: User feedback for actions

## Benefits of Modular Structure

1. **Maintainability**: Each component is in its own file, making it easier to update
2. **Reusability**: Components can be shared between different pages
3. **Separation of Concerns**: HTML, CSS, and JavaScript are properly separated
4. **Scalability**: Easy to add new pages by creating new component configurations
5. **Debugging**: Easier to identify and fix issues in specific components

## Adding New Pages

To add a new page with the modular structure:

1. Create the main HTML file with placeholders
2. Create component files in `/components/`
3. Add page configuration to `loadComponents.js`
4. Create page-specific JavaScript and CSS files

## Example: Adding a New Page

```javascript
// In loadComponents.js
'new-page.html': {
    '#top-nav-placeholder': './components/top-nav.html',
    '#header-placeholder': './components/header.html',
    '#main-content-placeholder': './components/new-page-content.html',
    '#footer-placeholder': './components/footer.html'
}
```

## Dependencies

- **Phosphor Icons**: Icon library
- **Swiper**: Carousel/slider functionality
- **Toast System**: Custom notification system
- **Authentication API**: Backend PHP integration

## Browser Support

The modular structure works in all modern browsers that support:
- ES6+ JavaScript features
- Fetch API
- CSS Grid and Flexbox
- CSS Custom Properties

## Troubleshooting

### Common Issues

1. **Components not loading**: Check browser console for fetch errors
2. **Styles not applying**: Ensure CSS files are properly linked
3. **JavaScript errors**: Verify all required scripts are loaded in correct order

### Debug Mode

Enable debug logging by adding this to the console:
```javascript
localStorage.setItem('debug', 'true');
```

## Future Enhancements

- **Lazy Loading**: Load components only when needed
- **Component Caching**: Cache components for better performance
- **Dynamic Routing**: Client-side routing for SPA-like experience
- **State Management**: Centralized state management for complex forms
