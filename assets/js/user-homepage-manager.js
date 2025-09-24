/**
 * User Homepage Manager
 * Handles auto-login popup and logged-in experience
 */
class UserHomepageManager {
    constructor() {
        this.sessionManager = window.userSessionManager;
        this.isLoggedIn = false;
        this.currentUser = null;
    }

    /**
     * Initialize homepage manager
     */
    init() {
        // Initialize session manager
        if (this.sessionManager) {
            this.sessionManager.init();
            this.isLoggedIn = this.sessionManager.isLoggedIn();
            this.currentUser = this.sessionManager.getCurrentUser();
        }

        // Wait for components to load
        document.addEventListener('components:loaded', () => {
            this.handleUserState();
        });

        // If components are already loaded
        if (document.readyState === 'complete') {
            this.handleUserState();
        }
    }

    /**
     * Handle user state (logged in or not)
     */
    handleUserState() {
        if (this.isLoggedIn && this.currentUser) {
            this.showLoggedInExperience();
        } else {
            this.showLoginPopup();
        }
    }

    /**
     * Show login popup for non-logged-in users
     */
    showLoginPopup() {
        // Create login popup modal
        const loginModal = this.createLoginModal();
        document.body.appendChild(loginModal);

        // Show modal after a short delay
        setTimeout(() => {
            const modal = new bootstrap.Modal(loginModal);
            modal.show();
        }, 1000);

        // Handle modal events
        loginModal.addEventListener('hidden.bs.modal', () => {
            // If user still not logged in, show popup again after 30 seconds
            if (!this.sessionManager.isLoggedIn()) {
                setTimeout(() => {
                    this.showLoginPopup();
                }, 30000);
            }
        });
    }

    /**
     * Create login modal
     */
    createLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'userLoginModal';
        modal.setAttribute('data-bs-backdrop', 'static');
        modal.setAttribute('data-bs-keyboard', 'false');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-user-circle me-2"></i>
                            Welcome to Indian Tribe!
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-4">
                            <h6>Get the best shopping experience!</h6>
                            <p class="text-muted">Login to access exclusive deals, track orders, and save your favorites.</p>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="button" class="btn btn-primary btn-lg" onclick="window.userHomepageManager.openLoginPage()">
                                <i class="fas fa-sign-in-alt me-2"></i>
                                Login to Your Account
                            </button>
                            <button type="button" class="btn btn-outline-primary" onclick="window.userHomepageManager.openRegisterPage()">
                                <i class="fas fa-user-plus me-2"></i>
                                Create New Account
                            </button>
                            <button type="button" class="btn btn-link text-muted" data-bs-dismiss="modal">
                                Continue as Guest
                            </button>
                        </div>
                        
                        <div class="mt-4 text-center">
                            <small class="text-muted">
                                <i class="fas fa-shield-alt me-1"></i>
                                Your data is secure with us
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    /**
     * Show logged-in experience (Amazon-style)
     */
    showLoggedInExperience() {
        console.log('✅ User logged in:', this.currentUser.user_name);
        
        // Add welcome message to header
        this.addWelcomeMessage();
        
        // Show personalized content
        this.showPersonalizedContent();
        
        // Add user menu to header
        this.addUserMenu();
    }

    /**
     * Add welcome message to header
     */
    addWelcomeMessage() {
        const header = document.querySelector('#header-placeholder');
        if (header && this.currentUser) {
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'user-welcome-message';
            welcomeDiv.innerHTML = `
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <h4 class="mb-0 text-primary">
                                <i class="fas fa-user-circle me-2"></i>
                                Welcome back, ${this.currentUser.user_name}!
                            </h4>
                        </div>
                        <div class="col-md-6 text-end">
                            <div class="user-actions">
                                <button class="btn btn-outline-primary btn-sm me-2" onclick="window.userHomepageManager.showUserMenu()">
                                    <i class="fas fa-user me-1"></i>
                                    My Account
                                </button>
                                <button class="btn btn-outline-danger btn-sm" onclick="window.userHomepageManager.logout()">
                                    <i class="fas fa-sign-out-alt me-1"></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            header.appendChild(welcomeDiv);
        }
    }

    /**
     * Show personalized content
     */
    showPersonalizedContent() {
        // Add personalized product recommendations
        this.addPersonalizedProducts();
        
        // Add order history section
        this.addOrderHistory();
        
        // Add wishlist section
        this.addWishlist();
    }

    /**
     * Add personalized products section
     */
    addPersonalizedProducts() {
        const mainContent = document.querySelector('#main-content-placeholder');
        if (mainContent) {
            const personalizedSection = document.createElement('div');
            personalizedSection.className = 'personalized-section mt-4';
            personalizedSection.innerHTML = `
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <h3 class="mb-4">
                                <i class="fas fa-star me-2 text-warning"></i>
                                Recommended for You
                            </h3>
                            <div class="row" id="recommended-products">
                                <!-- Products will be loaded here -->
                                <div class="col-12 text-center">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="mt-2">Loading personalized recommendations...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            mainContent.appendChild(personalizedSection);
            
            // Load recommended products
            this.loadRecommendedProducts();
        }
    }

    /**
     * Add order history section
     */
    addOrderHistory() {
        const mainContent = document.querySelector('#main-content-placeholder');
        if (mainContent) {
            const orderSection = document.createElement('div');
            orderSection.className = 'order-history-section mt-4';
            orderSection.innerHTML = `
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <h3 class="mb-4">
                                <i class="fas fa-shopping-bag me-2 text-success"></i>
                                Recent Orders
                            </h3>
                            <div class="card">
                                <div class="card-body">
                                    <div class="text-center">
                                        <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                                        <h5>No recent orders</h5>
                                        <p class="text-muted">Start shopping to see your orders here!</p>
                                        <button class="btn btn-primary" onclick="window.location.href='shop.html'">
                                            <i class="fas fa-shopping-bag me-2"></i>
                                            Start Shopping
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            mainContent.appendChild(orderSection);
        }
    }

    /**
     * Add wishlist section
     */
    addWishlist() {
        const mainContent = document.querySelector('#main-content-placeholder');
        if (mainContent) {
            const wishlistSection = document.createElement('div');
            wishlistSection.className = 'wishlist-section mt-4';
            wishlistSection.innerHTML = `
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <h3 class="mb-4">
                                <i class="fas fa-heart me-2 text-danger"></i>
                                Your Wishlist
                            </h3>
                            <div class="card">
                                <div class="card-body">
                                    <div class="text-center">
                                        <i class="fas fa-heart fa-3x text-muted mb-3"></i>
                                        <h5>Your wishlist is empty</h5>
                                        <p class="text-muted">Add items to your wishlist to see them here!</p>
                                        <button class="btn btn-outline-primary" onclick="window.location.href='shop.html'">
                                            <i class="fas fa-search me-2"></i>
                                            Browse Products
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            mainContent.appendChild(wishlistSection);
        }
    }

    /**
     * Add user menu to header
     */
    addUserMenu() {
        // This will be implemented when we add the user menu
    }

    /**
     * Load recommended products
     */
    loadRecommendedProducts() {
        // This will load personalized product recommendations
        // For now, we'll show a placeholder
        setTimeout(() => {
            const productsContainer = document.querySelector('#recommended-products');
            if (productsContainer) {
                productsContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <p class="text-muted">Personalized recommendations will appear here based on your preferences.</p>
                        <button class="btn btn-primary" onclick="window.location.href='shop.html'">
                            <i class="fas fa-shopping-bag me-2"></i>
                            Browse All Products
                        </button>
                    </div>
                `;
            }
        }, 2000);
    }

    /**
     * Open login page
     */
    openLoginPage() {
        window.location.href = 'login.html';
    }

    /**
     * Open register page
     */
    openRegisterPage() {
        window.location.href = 'register.html';
    }

    /**
     * Show user menu
     */
    showUserMenu() {
        // This will show a dropdown menu with user options
        console.log('Show user menu');
    }

    /**
     * Logout user
     */
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            if (this.sessionManager) {
                this.sessionManager.clearSession();
            }
            window.location.reload();
        }
    }
}

// Create global instance
window.userHomepageManager = new UserHomepageManager();
