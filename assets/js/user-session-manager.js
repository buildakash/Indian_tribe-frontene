/**
 * User Session Manager
 * Handles localStorage with 7-day expiry and session persistence for users
 */
class UserSessionManager {
    constructor() {
        this.SESSION_KEY = 'user_session';
        this.SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        this.USER_DATA_KEY = 'user_data';
        this.LAST_ACTIVITY_KEY = 'user_last_activity';
    }

    /**
     * Save user session data with expiry
     */
    saveSession(userData) {
        const sessionData = {
            user: userData,
            timestamp: Date.now(),
            expires: Date.now() + this.SESSION_DURATION
        };

        try {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
            localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
            localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
            
            // Also set individual keys for compatibility
            localStorage.setItem('user_id', userData.user_id);
            localStorage.setItem('user_name', userData.user_name);
            localStorage.setItem('user_role', userData.role || 'user');
            
            console.log('✅ User session saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to save user session:', error);
            return false;
        }
    }

    /**
     * Check if user session is valid and not expired
     */
    isSessionValid() {
        try {
            const sessionData = localStorage.getItem(this.SESSION_KEY);
            if (!sessionData) {
                return false;
            }

            const session = JSON.parse(sessionData);
            const now = Date.now();

            // Check if session is expired
            if (now > session.expires) {
                this.clearSession();
                return false;
            }

            // Check if user has been inactive for more than 7 days
            const lastActivity = localStorage.getItem(this.LAST_ACTIVITY_KEY);
            if (lastActivity && (now - parseInt(lastActivity)) > this.SESSION_DURATION) {
                this.clearSession();
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ User session validation error:', error);
            this.clearSession();
            return false;
        }
    }

    /**
     * Get current user data
     */
    getCurrentUser() {
        if (!this.isSessionValid()) {
            return null;
        }

        try {
            const userData = localStorage.getItem(this.USER_DATA_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('❌ Failed to get user data:', error);
            return null;
        }
    }

    /**
     * Update last activity timestamp
     */
    updateActivity() {
        try {
            localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
        } catch (error) {
            console.error('❌ Failed to update user activity:', error);
        }
    }

    /**
     * Clear all session data
     */
    clearSession() {
        try {
            localStorage.removeItem(this.SESSION_KEY);
            localStorage.removeItem(this.USER_DATA_KEY);
            localStorage.removeItem(this.LAST_ACTIVITY_KEY);
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_role');
            console.log('✅ User session cleared');
        } catch (error) {
            console.error('❌ Failed to clear user session:', error);
        }
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.isSessionValid() && this.getCurrentUser() !== null;
    }

    /**
     * Initialize session management
     */
    init() {
        // Update activity on page load
        this.updateActivity();
        
        // Update activity on user interaction
        const events = ['click', 'keypress', 'scroll', 'mousemove'];
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.updateActivity();
            }, { passive: true });
        });

        // Check session validity every 5 minutes
        setInterval(() => {
            if (!this.isSessionValid()) {
                console.log('🔄 User session expired');
                this.clearSession();
                // Don't redirect automatically for users, let them continue browsing
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
}

// Create global instance
window.userSessionManager = new UserSessionManager();
