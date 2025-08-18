// Index Page Script - Loads all components for the index page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Index page script loaded');
    
    // Load the main content component first
    loadComponent('index-main-content', 'components/index-main-content.html', function() {
        // After main content is loaded, load all the individual sections
        loadComponent('hero-slider-placeholder', 'components/hero-slider.html');
        loadComponent('benefits-section-placeholder', 'components/benefits-section.html');
        loadComponent('banner-section-placeholder', 'components/banner-section.html');
        loadComponent('tab-features-placeholder', 'components/tab-features-section.html');
        loadComponent('featured-product-placeholder', 'components/featured-product-section.html');
        loadComponent('banner-toys-kids-placeholder', 'components/banner-toys-kids.html');
        loadComponent('best-sellers-placeholder', 'components/best-sellers-section.html');
        loadComponent('testimonials-placeholder', 'components/testimonials-section.html');
        loadComponent('news-placeholder', 'components/news-section.html');
    });
});

// Function to load a component into a placeholder
function loadComponent(placeholderId, componentPath, callback) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.warn(`Placeholder with id '${placeholderId}' not found`);
        return;
    }

    fetch(componentPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            placeholder.innerHTML = html;
            if (callback && typeof callback === 'function') {
                callback();
            }
        })
        .catch(error => {
            console.error(`Error loading component from ${componentPath}:`, error);
            placeholder.innerHTML = `<div class="error">Error loading component: ${componentPath}</div>`;
        });
}
