document.addEventListener("DOMContentLoaded", () => {
    const loadHtmlComponent = (selector, filePath) => {
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Could not load ${filePath}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                const element = document.querySelector(selector);
                if (element) {
                    element.innerHTML = data;
                } else {
                    console.warn(`Placeholder with selector "${selector}" not found.`);
                }
            })
            .catch(error => console.error('Error loading component:', error));
    };

    // Detect current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Define components for different pages
    const pageComponents = {
        'login.html': {
            '#top-nav-placeholder': './components/top-nav.html',
            '#header-placeholder': './components/header.html',
            '#mobile-bottom-bar-placeholder': './components/mobile-bottom-bar.html',
            '#main-content-placeholder': './components/login-content.html',
            '#footer-placeholder': './components/footer.html',
            '#modals-and-helpers-placeholder': './components/modals-and-helpers.html'
        },
        'register.html': {
            '#top-nav-placeholder': './components/top-nav.html',
            '#header-placeholder': './components/header.html',
            '#mobile-bottom-bar-placeholder': './components/mobile-bottom-bar.html',
            '#main-content-placeholder': './components/register-content.html',
            '#footer-placeholder': './components/footer.html',
            '#modals-and-helpers-placeholder': './components/modals-and-helpers.html',
            '#breadcrumb-placeholder': './components/register-breadcrumb.html'
        },
        'index.html': {
            '#top-nav-placeholder': './components/top-nav.html',
            '#header-placeholder': './components/header.html',
            '#mobile-bottom-bar-placeholder': './components/mobile-bottom-bar.html',
            '#footer-placeholder': './components/footer.html',
            '#modals-and-helpers-placeholder': './components/modals-and-helpers.html'
        }
    };

    // Get components for current page, fallback to login if not found
    const components = pageComponents[currentPage] || pageComponents['login.html'];

    // Load all components for the current page
    for (const [selector, path] of Object.entries(components)) {
        loadHtmlComponent(selector, path);
    }
});