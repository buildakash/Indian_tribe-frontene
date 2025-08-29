# Shop Components

This directory contains the modular components for the shop page, following the same pattern as the main index page.

## Component Structure

### 1. `breadcrumb.html`
- **Purpose**: Shop page breadcrumb navigation and category filters
- **Features**: 
  - Page title and breadcrumb navigation
  - Category filter tabs (t-shirt, dress, top, swimwear, shirt)
  - Responsive design with proper spacing

### 2. `sidebar.html`
- **Purpose**: Shop sidebar with all filtering options
- **Features**:
  - Product type filters (t-shirt, dress, top, etc.)
  - Size filters (XS, S, M, L, XL, 2XL, Freesize)
  - Price range slider
  - Color filters with visual color swatches
  - Brand filters with checkboxes
  - All filters are interactive and responsive

### 3. `product-list.html`
- **Purpose**: Main product display area with controls
- **Features**:
  - Layout toggle (grid/list view)
  - Sale filter checkbox
  - Sort dropdown (Best Selling, Best Discount, Price High/Low)
  - Product grid container
  - Pagination area
  - Filtered tags display

### 4. `main-content.html`
- **Purpose**: Wrapper component that contains sidebar and product list
- **Features**:
  - Responsive layout container
  - Flexbox layout for sidebar and product list
  - Mobile-first responsive design

## Usage

### In shop-modular.html:
```html
<!-- Placeholders for Components -->
<div id="top-nav-placeholder"></div>
<div id="header-placeholder"></div>
<div id="shop-breadcrumb-placeholder"></div>
<div id="shop-main-content-placeholder"></div>
<div id="footer-placeholder"></div>
<div id="modals-placeholder"></div>
```

### Component Loading Order:
1. Main components (top-nav, header, footer, modals)
2. Shop breadcrumb
3. Shop main content wrapper
4. Shop sidebar (loaded into shop-sidebar-placeholder)
5. Shop product list (loaded into shop-product-list-placeholder)

## Benefits of Modular Structure

1. **Maintainability**: Each component can be updated independently
2. **Reusability**: Components can be reused across different shop pages
3. **Performance**: Components are loaded asynchronously
4. **Organization**: Clear separation of concerns
5. **Scalability**: Easy to add new shop features or modify existing ones

## File Structure
```
components/shop/
├── README.md
├── breadcrumb.html
├── sidebar.html
├── product-list.html
└── main-content.html
```

## Dependencies

- Requires `shop.js` for shop-specific functionality
- Uses existing CSS classes from `style.css` and `output-scss.css`
- Depends on Phosphor Icons and Swiper libraries
- Integrates with existing auth and utility scripts
