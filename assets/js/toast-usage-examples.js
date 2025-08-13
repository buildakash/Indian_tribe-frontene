/**
 * Toast Notification Usage Examples
 * This file shows how to use the toast notification system across the entire ecommerce site
 */

// Example 1: Product added to cart
function addToCart(productId) {
    fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
    })
    .then(response => response.json())
    .then(data => {
        // Handle backend response with toast
        window.toast.handleBackendResponse(data, 'Product added to cart successfully!');
    })
    .catch(error => {
        window.toast.error('Failed to add product to cart');
    });
}

// Example 2: Wishlist operations
function addToWishlist(productId) {
    fetch('/api/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
    })
    .then(response => response.json())
    .then(data => {
        window.toast.handleBackendResponse(data, 'Product added to wishlist!');
    })
    .catch(error => {
        window.toast.showNetworkError();
    });
}

// Example 3: Search functionality
function searchProducts(query) {
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
        if (data.results && data.results.length > 0) {
            window.toast.info(`Found ${data.results.length} products`);
        } else {
            window.toast.warning('No products found for your search');
        }
    })
    .catch(error => {
        window.toast.error('Search failed. Please try again.');
    });
}

// Example 4: Newsletter subscription
function subscribeNewsletter(email) {
    fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        window.toast.handleBackendResponse(data, 'Successfully subscribed to newsletter!');
    })
    .catch(error => {
        window.toast.error('Failed to subscribe to newsletter');
    });
}

// Example 5: Contact form submission
function submitContactForm(formData) {
    fetch('/api/contact', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        window.toast.handleBackendResponse(data, 'Message sent successfully!');
    })
    .catch(error => {
        window.toast.error('Failed to send message. Please try again.');
    });
}

// Example 6: Product review submission
function submitReview(productId, rating, comment) {
    fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            product_id: productId,
            rating: rating,
            comment: comment
        })
    })
    .then(response => response.json())
    .then(data => {
        window.toast.handleBackendResponse(data, 'Review submitted successfully!');
    })
    .catch(error => {
        window.toast.error('Failed to submit review');
    });
}

// Example 7: Checkout process
function processCheckout(orderData) {
    fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.toast.success('Order placed successfully! Redirecting to payment...');
            // Redirect to payment gateway
            setTimeout(() => {
                window.location.href = data.payment_url;
            }, 2000);
        } else {
            window.toast.handleBackendResponse(data);
        }
    })
    .catch(error => {
        window.toast.error('Checkout failed. Please try again.');
    });
}

// Example 8: User profile update
function updateProfile(profileData) {
    fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
    })
    .then(response => response.json())
    .then(data => {
        window.toast.handleBackendResponse(data, 'Profile updated successfully!');
    })
    .catch(error => {
        window.toast.error('Failed to update profile');
    });
}

// Example 9: Password change
function changePassword(oldPassword, newPassword) {
    fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword
        })
    })
    .then(response => response.json())
    .then(data => {
        window.toast.handleBackendResponse(data, 'Password changed successfully!');
    })
    .catch(error => {
        window.toast.error('Failed to change password');
    });
}

// Example 10: Address management
function addAddress(addressData) {
    fetch('/api/addresses/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData)
    })
    .then(response => response.json())
    .then(data => {
        window.toast.handleBackendResponse(data, 'Address added successfully!');
    })
    .catch(error => {
        window.toast.error('Failed to add address');
    });
}

// Example 11: Order tracking
function trackOrder(orderId) {
    fetch(`/api/orders/${orderId}/track`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.toast.info(`Order status: ${data.order_status}`);
        } else {
            window.toast.handleBackendResponse(data);
        }
    })
    .catch(error => {
        window.toast.error('Failed to track order');
    });
}

// Example 12: Coupon application
function applyCoupon(couponCode) {
    fetch('/api/cart/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon_code: couponCode })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.toast.success(`Coupon applied! Discount: ${data.discount_amount}`);
        } else {
            window.toast.error(data.message || 'Invalid coupon code');
        }
    })
    .catch(error => {
        window.toast.error('Failed to apply coupon');
    });
}

// Example 13: Stock availability check
function checkStock(productId) {
    fetch(`/api/products/${productId}/stock`)
    .then(response => response.json())
    .then(data => {
        if (data.in_stock) {
            window.toast.success('Product is in stock!');
        } else {
            window.toast.warning('Product is out of stock');
        }
    })
    .catch(error => {
        window.toast.error('Failed to check stock');
    });
}

// Example 14: Price alert
function setPriceAlert(productId, targetPrice) {
    fetch('/api/price-alerts/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            product_id: productId,
            target_price: targetPrice
        })
    })
    .then(response => response.json())
    .then(data => {
        window.toast.handleBackendResponse(data, 'Price alert set successfully!');
    })
    .catch(error => {
        window.toast.error('Failed to set price alert');
    });
}

// Example 15: Social sharing
function shareProduct(productId, platform) {
    fetch('/api/social/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            product_id: productId,
            platform: platform
        })
    })
    .then(response => response.json())
    .then(data => {
        window.toast.handleBackendResponse(data, 'Shared successfully!');
    })
    .catch(error => {
        window.toast.error('Failed to share product');
    });
}

// Example 16: Product comparison
function addToCompare(productId) {
    fetch('/api/compare/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
    })
    .then(response => response.json())
    .then(data => {
        window.toast.handleBackendResponse(data, 'Product added to comparison!');
    })
    .catch(error => {
        window.toast.error('Failed to add to comparison');
    });
}

// Example 17: Quick view
function quickView(productId) {
    fetch(`/api/products/${productId}/quick-view`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Show quick view modal
            showQuickViewModal(data.product);
            window.toast.info('Quick view loaded');
        } else {
            window.toast.error('Failed to load quick view');
        }
    })
    .catch(error => {
        window.toast.error('Failed to load quick view');
    });
}

// Example 18: Recently viewed
function addToRecentlyViewed(productId) {
    fetch('/api/recently-viewed/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
    })
    .then(response => response.json())
    .then(data => {
        // Silently add to recently viewed, no toast needed
        console.log('Added to recently viewed');
    })
    .catch(error => {
        console.error('Failed to add to recently viewed');
    });
}

// Example 19: Product recommendations
function getRecommendations(userId) {
    fetch(`/api/recommendations/${userId}`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success' && data.recommendations.length > 0) {
            window.toast.info(`Found ${data.recommendations.length} personalized recommendations`);
        }
    })
    .catch(error => {
        console.error('Failed to load recommendations');
    });
}

// Example 20: Inventory check
function checkInventory(productId, quantity) {
    fetch(`/api/inventory/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            product_id: productId,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.available) {
            window.toast.success('Quantity available!');
        } else {
            window.toast.warning(`Only ${data.available_quantity} items left in stock`);
        }
    })
    .catch(error => {
        window.toast.error('Failed to check inventory');
    });
}

// Utility function to show quick view modal (placeholder)
function showQuickViewModal(product) {
    // Implementation for showing quick view modal
    console.log('Show quick view for:', product);
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addToCart,
        addToWishlist,
        searchProducts,
        subscribeNewsletter,
        submitContactForm,
        submitReview,
        processCheckout,
        updateProfile,
        changePassword,
        addAddress,
        trackOrder,
        applyCoupon,
        checkStock,
        setPriceAlert,
        shareProduct,
        addToCompare,
        quickView,
        addToRecentlyViewed,
        getRecommendations,
        checkInventory
    };
}
