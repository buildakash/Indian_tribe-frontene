/**
 * Error Handler Utility for Indian Tribe
 * Provides centralized error handling for API responses, validation, and network issues
 */

class ErrorHandler {
    constructor() {
        this.errorTypes = {
            VALIDATION: 'validation',
            API: 'api',
            NETWORK: 'network',
            AUTH: 'authentication',
            SERVER: 'server',
            UNKNOWN: 'unknown'
        };
    }

    /**
     * Handle API response errors
     * @param {Response} response - Fetch API response object
     * @param {string} defaultMessage - Default error message
     * @returns {Object} Error object with type and message
     */
    handleAPIResponse(response, defaultMessage = 'API request failed') {
        if (!response.ok) {
            const error = {
                type: this.errorTypes.API,
                status: response.status,
                statusText: response.statusText,
                message: defaultMessage
            };

            // Handle specific HTTP status codes
            switch (response.status) {
                case 400:
                    error.message = 'Bad request - Please check your input';
                    error.type = this.errorTypes.VALIDATION;
                    break;
                case 401:
                    error.message = 'Unauthorized - Please login again';
                    error.type = this.errorTypes.AUTH;
                    break;
                case 403:
                    error.message = 'Forbidden - You don\'t have permission';
                    error.type = this.errorTypes.AUTH;
                    break;
                case 404:
                    error.message = 'Resource not found';
                    error.type = this.errorTypes.API;
                    break;
                case 422:
                    error.message = 'Validation failed - Please check your input';
                    error.type = this.errorTypes.VALIDATION;
                    break;
                case 429:
                    error.message = 'Too many requests - Please wait and try again';
                    error.type = this.errorTypes.API;
                    break;
                case 500:
                    error.message = 'Server error - Please try again later';
                    error.type = this.errorTypes.SERVER;
                    break;
                case 502:
                case 503:
                case 504:
                    error.message = 'Service temporarily unavailable - Please try again later';
                    error.type = this.errorTypes.SERVER;
                    break;
                default:
                    error.message = defaultMessage;
            }

            return error;
        }

        return null;
    }

    /**
     * Handle fetch errors (network issues)
     * @param {Error} error - Fetch error object
     * @returns {Object} Error object with type and message
     */
    handleFetchError(error) {
        let errorType = this.errorTypes.UNKNOWN;
        let message = 'An unexpected error occurred';

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorType = this.errorTypes.NETWORK;
            message = 'Network error - Please check your internet connection';
        } else if (error.name === 'AbortError') {
            errorType = this.errorTypes.API;
            message = 'Request was cancelled';
        } else if (error.message) {
            message = error.message;
        }

        return {
            type: errorType,
            message: message,
            originalError: error
        };
    }

    /**
     * Handle JSON parsing errors
     * @param {Error} error - JSON parse error
     * @returns {Object} Error object with type and message
     */
    handleJSONError(error) {
        return {
            type: this.errorTypes.API,
            message: 'Invalid response format from server',
            originalError: error
        };
    }

    /**
     * Handle validation errors
     * @param {Array} errors - Array of validation errors
     * @returns {Object} Error object with type and message
     */
    handleValidationErrors(errors) {
        return {
            type: this.errorTypes.VALIDATION,
            message: 'Please fix the following errors:',
            details: errors,
            originalError: errors
        };
    }

    /**
     * Handle backend API response errors
     * @param {Object} response - Backend API response
     * @returns {Object|null} Error object or null if no error
     */
    handleBackendResponse(response) {
        if (!response) {
            return {
                type: this.errorTypes.API,
                message: 'No response received from server'
            };
        }

        if (response.status === 'error') {
            return {
                type: this.errorTypes.API,
                message: response.message || 'Backend error occurred',
                details: response.details || null,
                code: response.code || null
            };
        }

        if (response.status === 'warning') {
            return {
                type: this.errorTypes.VALIDATION,
                message: response.message || 'Warning',
                details: response.details || null,
                isWarning: true
            };
        }

        return null;
    }

    /**
     * Get user-friendly error message
     * @param {Object} error - Error object
     * @returns {string} User-friendly error message
     */
    getUserFriendlyMessage(error) {
        if (!error) return 'An error occurred';

        // Handle different error types
        switch (error.type) {
            case this.errorTypes.VALIDATION:
                if (error.details && Array.isArray(error.details)) {
                    return error.details.join(', ');
                }
                return error.message || 'Please check your input';

            case this.errorTypes.AUTH:
                return error.message || 'Authentication failed';

            case this.errorTypes.NETWORK:
                return error.message || 'Network connection issue';

            case this.errorTypes.SERVER:
                return error.message || 'Server error';

            case this.errorTypes.API:
                return error.message || 'API error';

            default:
                return error.message || 'An unexpected error occurred';
        }
    }

    /**
     * Log error for debugging
     * @param {Object} error - Error object
     * @param {string} context - Context where error occurred
     */
    logError(error, context = '') {
        const errorLog = {
            timestamp: new Date().toISOString(),
            context: context,
            error: error,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        console.error('Error Handler Log:', errorLog);

        // In production, you might want to send this to a logging service
        if (window.AppConfig && window.AppConfig.debug) {
            console.group('Detailed Error Information');
            console.log('Context:', context);
            console.log('Error Type:', error.type);
            console.log('Message:', error.message);
            console.log('Details:', error.details);
            console.log('Original Error:', error.originalError);
            console.groupEnd();
        }
    }

    /**
     * Show error in toast notification
     * @param {Object} error - Error object
     * @param {string} context - Context where error occurred
     */
    showErrorToast(error, context = '') {
        if (!window.toast) {
            console.error('Toast system not available');
            return;
        }

        const message = this.getUserFriendlyMessage(error);
        const title = this.getErrorTitle(error.type);

        // Log error for debugging
        this.logError(error, context);

        // Show appropriate toast based on error type
        switch (error.type) {
            case this.errorTypes.VALIDATION:
                window.toast.warning(message, title);
                break;
            case this.errorTypes.AUTH:
                window.toast.error(message, title);
                break;
            case this.errorTypes.NETWORK:
                window.toast.error(message, title, { duration: 10000 });
                break;
            case this.errorTypes.SERVER:
                window.toast.error(message, title, { duration: 8000 });
                break;
            default:
                window.toast.error(message, title);
        }
    }

    /**
     * Get error title based on error type
     * @param {string} errorType - Type of error
     * @returns {string} Error title
     */
    getErrorTitle(errorType) {
        const titles = {
            [this.errorTypes.VALIDATION]: 'Validation Error',
            [this.errorTypes.API]: 'API Error',
            [this.errorTypes.NETWORK]: 'Connection Error',
            [this.errorTypes.AUTH]: 'Authentication Error',
            [this.errorTypes.SERVER]: 'Server Error',
            [this.errorTypes.UNKNOWN]: 'Error'
        };

        return titles[errorType] || 'Error';
    }

    /**
     * Handle complete API request with error handling
     * @param {Promise} apiCall - API call promise
     * @param {string} context - Context for error logging
     * @param {string} defaultMessage - Default error message
     * @returns {Promise} Promise that resolves with result or rejects with handled error
     */
    async handleAPIRequest(apiCall, context = '', defaultMessage = 'Request failed') {
        try {
            const response = await apiCall;
            
            // Check for HTTP errors
            const httpError = this.handleAPIResponse(response, defaultMessage);
            if (httpError) {
                throw httpError;
            }

            // Try to parse JSON response
            let result;
            try {
                result = await response.json();
            } catch (parseError) {
                throw this.handleJSONError(parseError);
            }

            // Check for backend errors
            const backendError = this.handleBackendResponse(result);
            if (backendError) {
                throw backendError;
            }

            return result;

        } catch (error) {
            // Handle fetch errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                const networkError = this.handleFetchError(error);
                throw networkError;
            }

            // Re-throw if it's already a handled error
            if (error.type) {
                throw error;
            }

            // Handle unknown errors
            throw {
                type: this.errorTypes.UNKNOWN,
                message: error.message || defaultMessage,
                originalError: error
            };
        }
    }

    /**
     * Validate form data
     * @param {Object} data - Form data to validate
     * @param {Object} rules - Validation rules
     * @returns {Object} Validation result
     */
    validateForm(data, rules) {
        const errors = [];
        const warnings = [];

        for (const [field, rule] of Object.entries(rules)) {
            const value = data[field];
            const fieldErrors = [];

            // Required field validation
            if (rule.required && (!value || value.toString().trim() === '')) {
                fieldErrors.push(`${rule.label || field} is required`);
            }

            // Skip other validations if field is empty and not required
            if (!value && !rule.required) continue;

            // Type validation
            if (rule.type && value) {
                switch (rule.type) {
                    case 'email':
                        if (!this.isValidEmail(value)) {
                            fieldErrors.push(`${rule.label || field} must be a valid email address`);
                        }
                        break;
                    case 'phone':
                        if (!this.isValidPhone(value)) {
                            fieldErrors.push(`${rule.label || field} must be a valid phone number`);
                        }
                        break;
                    case 'password':
                        if (rule.minLength && value.length < rule.minLength) {
                            fieldErrors.push(`${rule.label || field} must be at least ${rule.minLength} characters long`);
                        }
                        if (rule.pattern && !rule.pattern.test(value)) {
                            fieldErrors.push(rule.patternMessage || `${rule.label || field} format is invalid`);
                        }
                        break;
                }
            }

            // Length validation
            if (rule.minLength && value && value.length < rule.minLength) {
                fieldErrors.push(`${rule.label || field} must be at least ${rule.minLength} characters long`);
            }
            if (rule.maxLength && value && value.length > rule.maxLength) {
                fieldErrors.push(`${rule.label || field} must be no more than ${rule.maxLength} characters long`);
            }

            // Custom validation
            if (rule.custom && typeof rule.custom === 'function') {
                const customResult = rule.custom(value, data);
                if (customResult !== true) {
                    fieldErrors.push(customResult);
                }
            }

            if (fieldErrors.length > 0) {
                errors.push({
                    field: field,
                    label: rule.label || field,
                    errors: fieldErrors
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number format
     * @param {string} phone - Phone number to validate
     * @returns {boolean} True if valid
     */
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
}

// Create global error handler instance
window.errorHandler = new ErrorHandler();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}
