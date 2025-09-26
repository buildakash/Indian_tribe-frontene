/**
 * Header Profile Manager
 * Handles dynamic profile section in header based on login status
 */
class HeaderProfileManager {
    constructor() {
        this.sessionManager = window.userSessionManager;
        this.isLoggedIn = false;
        this.currentUser = null;
        this.loginPopup = null;
        this.userProfileSection = null;
    }

    /**
     * Initialize header profile manager
     */
    init() {
        console.log('🚀 Initializing Header Profile Manager');
        console.log('📄 Document ready state:', document.readyState);
        console.log('🔍 Session manager available:', !!this.sessionManager);
        
        // Wait for components to load
        document.addEventListener('components:loaded', () => {
            console.log('📦 Components loaded event fired');
            this.initializeElements();
            this.updateProfileSection();
            this.bindEvents();
        });

        // If components are already loaded
        if (document.readyState === 'complete') {
            console.log('📄 Document already complete, initializing with delay');
            setTimeout(() => {
                this.initializeElements();
                this.updateProfileSection();
                this.bindEvents();
            }, 100);
        }

        // Fallback initialization
        setTimeout(() => {
            console.log('🔄 Fallback initialization check');
            if (!this.userProfileSection) {
                console.log('⚠️ User profile section not found, retrying...');
                this.initializeElements();
                this.updateProfileSection();
                this.bindEvents();
            } else {
                console.log('✅ User profile section found');
            }
        }, 1000);

        // Additional fallback after 3 seconds
        setTimeout(() => {
            console.log('🔄 Final fallback initialization');
            this.initializeElements();
            this.updateProfileSection();
            this.bindEvents();
        }, 3000);
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        console.log('🔍 Initializing elements...');
        
        // Try multiple selectors for user profile section
        this.userProfileSection = document.querySelector('.user-icon') || 
                                 document.querySelector('#userProfileSection') ||
                                 document.querySelector('[class*="user-icon"]');
        
        // Try multiple selectors for login popup
        this.loginPopup = document.querySelector('.login-popup') || 
                         document.querySelector('#loginPopup') ||
                         document.querySelector('[class*="login-popup"]');
        
        console.log('🔍 Element search results:');
        console.log('- userProfileSection:', this.userProfileSection);
        console.log('- loginPopup:', this.loginPopup);
        
        if (this.userProfileSection) {
            console.log('✅ User profile section found');
            console.log('- Element classes:', this.userProfileSection.className);
            console.log('- Element HTML:', this.userProfileSection.outerHTML.substring(0, 200) + '...');
        } else {
            console.error('❌ User profile section not found!');
            console.log('🔍 Available elements with "user" in class:', 
                Array.from(document.querySelectorAll('[class*="user"]')).map(el => ({
                    tag: el.tagName,
                    classes: el.className,
                    id: el.id
                }))
            );
        }
        
        if (this.loginPopup) {
            console.log('✅ Login popup found');
            console.log('- Element classes:', this.loginPopup.className);
            console.log('- Current content length:', this.loginPopup.innerHTML.length);
        } else {
            console.error('❌ Login popup not found!');
            console.log('🔍 Available elements with "login" in class:', 
                Array.from(document.querySelectorAll('[class*="login"]')).map(el => ({
                    tag: el.tagName,
                    classes: el.className,
                    id: el.id
                }))
            );
        }
    }

    /**
     * Update profile section based on login status
     */
    updateProfileSection() {
        console.log('🔄 Updating profile section...');
        
        if (!this.userProfileSection) {
            console.error('❌ User profile section not found, cannot update');
            return;
        }

        if (!this.loginPopup) {
            console.error('❌ Login popup not found, cannot update');
            return;
        }

        // Check login status
        this.isLoggedIn = this.sessionManager ? this.sessionManager.isLoggedIn() : false;
        this.currentUser = this.sessionManager ? this.sessionManager.getCurrentUser() : null;

        // Additional debugging - check localStorage directly
        const userSession = localStorage.getItem('user_session');
        const userData = localStorage.getItem('user_data');
        const userId = localStorage.getItem('user_id');
        const userName = localStorage.getItem('user_name');

        console.log('🔄 Login status check:');
        console.log('- isLoggedIn (session manager):', this.isLoggedIn);
        console.log('- currentUser (session manager):', this.currentUser);
        console.log('- userSession:', userSession);
        console.log('- userData:', userData);
        console.log('- userId:', userId);
        console.log('- userName:', userName);

        // Fallback check - if session manager fails, check localStorage directly
        if (!this.isLoggedIn && (userId || userName || userData)) {
            console.log('🔄 Fallback: Found user data in localStorage, treating as logged in');
            this.isLoggedIn = true;
            try {
                this.currentUser = userData ? JSON.parse(userData) : { user_name: userName, user_id: userId };
            } catch (e) {
                console.error('❌ Error parsing user data:', e);
                this.currentUser = { user_name: userName, user_id: userId };
            }
        }

        console.log('🔄 Final status:');
        console.log('- isLoggedIn:', this.isLoggedIn);
        console.log('- currentUser:', this.currentUser);

        if (this.isLoggedIn && this.currentUser) {
            console.log('✅ Showing logged in profile');
            this.showLoggedInProfile();
        } else {
            console.log('❌ Showing login profile');
            this.showLoginProfile();
        }
    }

    /**
     * Show login profile (not logged in)
     */
    showLoginProfile() {
        console.log('🔐 Showing login profile...');
        
        if (!this.loginPopup) {
            console.error('❌ Login popup not found, cannot show login profile');
            return;
        }

        // Reset to original login content
        const loginContent = `
            <a href="login.html" class="button-main w-full text-center">Login</a>
            <div class="text-secondary text-center mt-3 pb-4">
                Don't have an account?
                <a href="register.html" class="text-black pl-1 hover:underline">Register</a>
            </div>
            <a href="my-account.html" class="button-main bg-white text-black border border-black w-full text-center">Dashboard</a>
            <div class="bottom mt-4 pt-4 border-t border-line"></div>
            <a href="#!" class="body1 hover:underline">Support</a>
        `;

        console.log('🔐 Updating popup to login content...');
        this.loginPopup.innerHTML = loginContent;
        
        console.log('✅ Login profile content updated');
        console.log('- Popup element:', this.loginPopup);
        console.log('- Popup innerHTML length:', this.loginPopup.innerHTML.length);
    }

    /**
     * Show logged in profile
     */
    showLoggedInProfile() {
        console.log('👤 Showing logged in profile...');
        console.log('- Current user:', this.currentUser);
        
        if (!this.loginPopup) {
            console.error('❌ Login popup not found, cannot show logged in profile');
            return;
        }

        const userName = this.currentUser.user_name || this.currentUser.name || 'User';
        const userEmail = this.currentUser.email || this.currentUser.user_email || 'user@example.com';
        
        console.log('👤 User details:');
        console.log('- Name:', userName);
        console.log('- Email:', userEmail);

        // Update content for logged in user
        const newContent = `
            <div class="user-info mb-4">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <i class="ph-bold ph-user text-white text-xl"></i>
                    </div>
                    <div>
                        <h6 class="font-semibold mb-0">${userName}</h6>
                        <p class="text-secondary text-sm mb-0">${userEmail}</p>
                    </div>
                </div>
            </div>
            
            <div class="user-actions">
                <a href="my-account.html" class="button-main w-full text-center mb-3">My Account</a>
                <a href="orders.html" class="button-main bg-white text-black border border-black w-full text-center mb-3">My Orders</a>
                <button class="button-main bg-red-500 text-white border border-red-500 w-full text-center" id="logoutBtn">
                    <i class="ph-bold ph-sign-out me-2"></i>
                    Logout
                </button>
            </div>
            
            <div class="bottom mt-4 pt-4 border-t border-line"></div>
            <a href="#!" class="body1 hover:underline">Support</a>
        `;

        console.log('👤 Updating popup content...');
        console.log('- New content length:', newContent.length);
        
        this.loginPopup.innerHTML = newContent;
        
        // Add direct event listener to logout button
        const logoutBtn = this.loginPopup.querySelector('#logoutBtn');
        if (logoutBtn) {
            console.log('🔗 Adding direct event listener to logout button');
            logoutBtn.addEventListener('click', (e) => {
                console.log('🚪 Direct logout button click');
                e.preventDefault();
                e.stopPropagation();
                this.handleLogout();
            });
        } else {
            console.error('❌ Logout button not found after content update');
        }
        
        console.log('✅ Logged in profile content updated');
        console.log('- Popup element:', this.loginPopup);
        console.log('- Popup innerHTML length:', this.loginPopup.innerHTML.length);
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        console.log('🔗 Binding events...');
        
        // Toggle popup visibility on click
        if (this.userProfileSection) {
            console.log('✅ Binding click event to user profile section');
            this.userProfileSection.addEventListener('click', (e) => {
                console.log('🖱️ User profile section clicked');
                e.stopPropagation();
                this.togglePopup();
            });
        } else {
            console.error('❌ User profile section not found for event binding');
        }

        // Close popup when clicking outside (with delay to prevent immediate closing)
        document.addEventListener('click', (e) => {
            // Only close if clicking outside both the user profile section AND the modal
            if (this.userProfileSection && 
                !this.userProfileSection.contains(e.target) && 
                (!this.loginPopup || !this.loginPopup.contains(e.target))) {
                // Add small delay to prevent immediate closing
                setTimeout(() => {
                    this.closePopup();
                }, 100);
            }
        });

        // Handle logout button click (event delegation)
        document.addEventListener('click', (e) => {
            console.log('🖱️ Document click detected:', e.target);
            
            // Check if clicked element is logout button or contains logout button
            const logoutBtn = e.target.closest('#logoutBtn') || e.target;
            
            if (logoutBtn && logoutBtn.id === 'logoutBtn') {
                console.log('🚪 Logout button clicked');
                e.preventDefault();
                e.stopPropagation();
                this.handleLogout();
                return false;
            }
        });

        // Handle modal links (ensure they work properly)
        document.addEventListener('click', (e) => {
            // Check if click is on a link inside the modal
            if (this.loginPopup && this.loginPopup.contains(e.target)) {
                const link = e.target.closest('a');
                if (link) {
                    console.log('🔗 Modal link clicked:', link.href);
                    // Allow the link to work normally
                    // Don't prevent default or stop propagation
                }
            }
        });

        // Listen for login status changes
        window.addEventListener('userLogin', () => {
            console.log('🔔 User login event received');
            this.updateProfileSection();
        });

        window.addEventListener('userLogout', () => {
            console.log('🔔 User logout event received');
            this.updateProfileSection();
        });
        
        console.log('✅ Events bound successfully');
    }

    /**
     * Toggle popup visibility
     */
    togglePopup() {
        console.log('🔄 Toggling popup, isLoggedIn:', this.isLoggedIn);
        
        if (!this.loginPopup) {
            console.error('❌ Login popup not found, cannot toggle');
            return;
        }

        const isVisible = this.loginPopup.style.display === 'block';
        console.log('🔍 Current popup state:', isVisible ? 'visible' : 'hidden');
        
        if (isVisible) {
            console.log('👁️ Hiding popup');
            this.loginPopup.style.display = 'none';
        } else {
            console.log('👁️ Showing popup');
            this.loginPopup.style.display = 'block';
            // Ensure popup is visible
            this.loginPopup.style.visibility = 'visible';
            this.loginPopup.style.opacity = '1';
        }
        
        console.log('✅ Popup toggled to:', isVisible ? 'hidden' : 'visible');
        console.log('🔍 Popup computed style:', window.getComputedStyle(this.loginPopup).display);
    }

    /**
     * Close popup
     */
    closePopup() {
        console.log('❌ Closing popup...');
        
        if (this.loginPopup) {
            this.loginPopup.style.display = 'none';
            this.loginPopup.style.visibility = 'hidden';
            this.loginPopup.style.opacity = '0';
            console.log('✅ Popup closed');
        } else {
            console.error('❌ Login popup not found, cannot close');
        }
    }

    /**
     * Handle logout
     */
    handleLogout() {
        console.log('🚪 Handling logout...');
        
        if (confirm('Are you sure you want to logout?')) {
            console.log('✅ Logout confirmed');
            
            // Clear all user data from localStorage
            this.clearAllUserData();
            
            // Reset login status
            this.isLoggedIn = false;
            this.currentUser = null;
            
            // Update profile section
            this.updateProfileSection();
            
            // Dispatch logout event
            window.dispatchEvent(new CustomEvent('userLogout'));
            
            // Show success message
            this.showLogoutMessage();
            
            // Close popup
            this.closePopup();
            
            console.log('✅ Logout completed');
        } else {
            console.log('❌ Logout cancelled');
        }
    }

    /**
     * Clear all user data from localStorage
     */
    clearAllUserData() {
        console.log('🧹 Clearing all user data from localStorage...');
        
        try {
            // Clear session data
            if (this.sessionManager) {
                console.log('🧹 Clearing session manager data...');
                this.sessionManager.clearSession();
            }
            
            // Get all localStorage keys first
            const allKeys = Object.keys(localStorage);
            console.log('📋 All localStorage keys before clearing:', allKeys);
            
            // Clear additional user-related data
            const userKeys = [
                'user_session',
                'user_data', 
                'user_last_activity',
                'user_id',
                'user_name',
                'user_role',
                'user_email',
                'email',
                'shop_id',
                'cart_items',
                'wishlist_items',
                'recent_products',
                'user_preferences',
                'admin',
                'auth_token',
                'access_token',
                'refresh_token',
                'login_time',
                'last_login'
            ];
            
            // Clear specific keys
            userKeys.forEach(key => {
                if (localStorage.getItem(key)) {
                    console.log(`🧹 Removing key: ${key}`);
                    localStorage.removeItem(key);
                }
            });
            
            // Clear any keys that contain 'user', 'session', 'auth', 'login'
            allKeys.forEach(key => {
                if (key.toLowerCase().includes('user') || 
                    key.toLowerCase().includes('session') || 
                    key.toLowerCase().includes('auth') || 
                    key.toLowerCase().includes('login')) {
                    console.log(`🧹 Removing key: ${key}`);
                    localStorage.removeItem(key);
                }
            });
            
            // Verify clearing
            const remainingKeys = Object.keys(localStorage);
            console.log('📋 Remaining localStorage keys after clearing:', remainingKeys);
            
            console.log('✅ All user data cleared from localStorage');
        } catch (error) {
            console.error('❌ Error clearing user data:', error);
        }
    }

    /**
     * Show logout success message
     */
    showLogoutMessage() {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="ph-bold ph-check-circle"></i>
                <span>Logged out successfully!</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    /**
     * Refresh profile section (public method)
     */
    refresh() {
        this.updateProfileSection();
    }

    /**
     * Force check login status and update (for debugging)
     */
    forceCheckLogin() {
        console.log('🔍 Force checking login status...');
        
        // Check all possible localStorage keys
        const allKeys = Object.keys(localStorage);
        const userKeys = allKeys.filter(key => 
            key.includes('user') || 
            key.includes('session') || 
            key.includes('auth') ||
            key.includes('login')
        );
        
        console.log('📋 All localStorage keys:', allKeys);
        console.log('👤 User-related keys:', userKeys);
        
        // Check each user key
        userKeys.forEach(key => {
            console.log(`🔑 ${key}:`, localStorage.getItem(key));
        });
        
        // Force update
        this.updateProfileSection();
    }

    /**
     * Manually set user as logged in (for testing)
     */
    setUserLoggedIn(userData) {
        console.log('🧪 Manually setting user as logged in:', userData);
        this.isLoggedIn = true;
        this.currentUser = userData;
        this.updateProfileSection();
    }

    /**
     * Force update the modal content (for debugging)
     */
    forceUpdateModal() {
        console.log('🔄 Force updating modal...');
        console.log('Current elements:');
        console.log('- userProfileSection:', this.userProfileSection);
        console.log('- loginPopup:', this.loginPopup);
        
        if (this.loginPopup) {
            console.log('Current popup content:', this.loginPopup.innerHTML.substring(0, 200) + '...');
        }
        
        this.updateProfileSection();
    }

    /**
     * Force logout and reset everything
     */
    forceLogout() {
        console.log('🚪 Force logout...');
        
        // Clear all data
        this.clearAllUserData();
        
        // Reset state
        this.isLoggedIn = false;
        this.currentUser = null;
        
        // Update profile
        this.updateProfileSection();
        
        // Close popup
        this.closePopup();
        
        console.log('✅ Force logout completed');
    }

    /**
     * Force open modal (for testing)
     */
    forceOpenModal() {
        console.log('🧪 Force opening modal...');
        
        if (this.loginPopup) {
            this.loginPopup.style.display = 'block';
            this.loginPopup.style.visibility = 'visible';
            this.loginPopup.style.opacity = '1';
            console.log('✅ Modal force opened');
        } else {
            console.error('❌ Login popup not found');
        }
    }

    /**
     * Test modal links (for debugging)
     */
    testModalLinks() {
        console.log('🧪 Testing modal links...');
        
        if (this.loginPopup) {
            const links = this.loginPopup.querySelectorAll('a');
            console.log('🔗 Found links in modal:', links.length);
            
            links.forEach((link, index) => {
                console.log(`Link ${index + 1}:`, {
                    text: link.textContent.trim(),
                    href: link.href,
                    target: link.target
                });
            });
        } else {
            console.error('❌ Login popup not found');
        }
    }

    /**
     * Test logout button (for debugging)
     */
    testLogoutButton() {
        console.log('🧪 Testing logout button...');
        
        if (this.loginPopup) {
            const logoutBtn = this.loginPopup.querySelector('#logoutBtn');
            if (logoutBtn) {
                console.log('✅ Logout button found:', logoutBtn);
                console.log('Button text:', logoutBtn.textContent.trim());
                console.log('Button classes:', logoutBtn.className);
                
                // Simulate click
                console.log('🖱️ Simulating logout button click...');
                logoutBtn.click();
            } else {
                console.error('❌ Logout button not found in modal');
            }
        } else {
            console.error('❌ Login popup not found');
        }
    }
}

// Create global instance
window.headerProfileManager = new HeaderProfileManager();