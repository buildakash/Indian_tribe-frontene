/**
 * Toast Notification System for Indian Tribe
 * Provides beautiful, responsive toast notifications for user feedback
 */

class ToastSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.createToastContainer();
        }
        this.container = document.getElementById('toast-container');
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        
        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = this.getToastStyles();
        document.head.appendChild(style);
        
        document.body.appendChild(container);
    }

    getToastStyles() {
        return `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .toast {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                margin-bottom: 10px;
                padding: 16px 20px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                transform: translateX(100%);
                transition: transform 0.3s ease-in-out;
                border-left: 4px solid #ddd;
                min-width: 300px;
                max-width: 400px;
            }

            .toast.show {
                transform: translateX(0);
            }

            .toast.success {
                border-left-color: #10b981;
                background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            }

            .toast.error {
                border-left-color: #ef4444;
                background: linear-gradient(135deg, #fef2f2 0%, #fef2f2 100%);
            }

            .toast.warning {
                border-left-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            }

            .toast.info {
                border-left-color: #3b82f6;
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            }

            .toast-icon {
                flex-shrink: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                font-size: 14px;
            }

            .toast.success .toast-icon {
                background: #10b981;
                color: white;
            }

            .toast.error .toast-icon {
                background: #ef4444;
                color: white;
            }

            .toast.warning .toast-icon {
                background: #f59e0b;
                color: white;
            }

            .toast.info .toast-icon {
                background: #3b82f6;
                color: white;
            }

            .toast-content {
                flex: 1;
                min-width: 0;
            }

            .toast-title {
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 4px;
                color: #1f2937;
            }

            .toast-message {
                font-size: 13px;
                color: #6b7280;
                line-height: 1.4;
                word-wrap: break-word;
            }

            .toast-close {
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s;
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .toast-close:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #6b7280;
            }

            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 0 0 8px 8px;
                overflow: hidden;
            }

            .toast-progress-bar {
                height: 100%;
                background: currentColor;
                transition: width linear;
                border-radius: 0 0 8px 8px;
            }

            .toast.success .toast-progress-bar {
                background: #10b981;
            }

            .toast.error .toast-progress-bar {
                background: #ef4444;
            }

            .toast.warning .toast-progress-bar {
                background: #f59e0b;
            }

            .toast.info .toast-progress-bar {
                background: #3b82f6;
            }

            @media (max-width: 768px) {
                .toast-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }

                .toast {
                    min-width: auto;
                    max-width: none;
                }
            }

            @media (max-width: 480px) {
                .toast {
                    padding: 12px 16px;
                    margin-bottom: 8px;
                }

                .toast-title {
                    font-size: 13px;
                }

                .toast-message {
                    font-size: 12px;
                }
            }
        `;
    }

    show(options) {
        const {
            type = 'info',
            title = '',
            message = '',
            duration = 5000,
            closable = true,
            onClose = null
        } = options;

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Set icon based on type
        const icon = this.getIcon(type);
        
        // Create toast HTML
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            ${closable ? '<button class="toast-close" aria-label="Close">×</button>' : ''}
            <div class="toast-progress">
                <div class="toast-progress-bar"></div>
            </div>
        `;

        // Add to container
        this.container.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Handle close button
        if (closable) {
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => {
                this.hide(toast);
                if (onClose) onClose();
            });
        }

        // Auto-hide after duration
        if (duration > 0) {
            // Animate progress bar
            const progressBar = toast.querySelector('.toast-progress-bar');
            progressBar.style.width = '100%';
            progressBar.style.transition = `width ${duration}ms linear`;

            setTimeout(() => {
                this.hide(toast);
                if (onClose) onClose();
            }, duration);
        }

        return toast;
    }

    hide(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    // Convenience methods
    success(message, title = 'Success', options = {}) {
        return this.show({
            type: 'success',
            title,
            message,
            ...options
        });
    }

    error(message, title = 'Error', options = {}) {
        return this.show({
            type: 'error',
            title,
            message,
            duration: 8000, // Longer duration for errors
            ...options
        });
    }

    warning(message, title = 'Warning', options = {}) {
        return this.show({
            type: 'warning',
            title,
            message,
            ...options
        });
    }

    info(message, title = 'Info', options = {}) {
        return this.show({
            type: 'info',
            title,
            message,
            ...options
        });
    }

    // Clear all toasts
    clear() {
        const toasts = this.container.querySelectorAll('.toast');
        toasts.forEach(toast => this.hide(toast));
    }

    // Clear specific type
    clearType(type) {
        const toasts = this.container.querySelectorAll(`.toast.${type}`);
        toasts.forEach(toast => this.hide(toast));
    }
}

// Create global toast instance
window.toast = new ToastSystem();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToastSystem;
}
