/**
 * Admin Dashboard Script - Complete Shop API Integration
 * Handles all admin operations: Products, Categories, Orders, Blogs
 */

const API_BASE = "http://localhost:2034/api/v1/shop";

// Global variables
let currentUser = null;
let currentShop = null;
let categories = [];
let products = [];
let orders = [];
let blogs = [];

// Initialize admin dashboard
document.addEventListener("DOMContentLoaded", () => {
  initializeAdmin();
});

/**
 * Initialize admin dashboard
 */
async function initializeAdmin() {
  try {
    // Get current user from session
    if (window.sessionManager) {
      currentUser = window.sessionManager.getCurrentUser();
      if (!currentUser) {
        window.location.href = "login.html";
        return;
      }
    } else {
      // Fallback to localStorage if session manager not available
      const userId = localStorage.getItem("user_id");
      const userName = localStorage.getItem("user_name");
      const userRole = localStorage.getItem("user_role");

      if (!userId) {
        window.location.href = "login.html";
        return;
      }

      currentUser = {
        user_id: userId,
        user_name: userName,
        role: userRole || "admin",
      };
    }

    // Get shop ID from localStorage
    const shopId = localStorage.getItem("shop_id");
    if (!shopId) {
      console.error("No shop ID found");
      showToast("❌ Shop ID not found. Please login again.", "error");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
      return;
    }
    currentShop = { id: shopId };

    console.log("✅ Current user:", currentUser);
    console.log("✅ Current shop:", currentShop);

    // Setup navigation
    console.log("🔧 Setting up navigation...");
    setupNavigation();

    // Load initial data
    console.log("📊 Loading dashboard...");
    await loadDashboard();

    // Setup forms
    console.log("📝 Setting up forms...");
    setupForms();

    console.log("✅ Admin dashboard initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize admin:", error);
  }
}

/**
 * Setup navigation
 */
function setupNavigation() {
  console.log("🔧 Setting up navigation...");

  // Desktop sidebar
  const sidebarLinks = document.querySelectorAll("#adminSidebar .nav-link");
  console.log("📋 Found sidebar links:", sidebarLinks.length);

  sidebarLinks.forEach((link, index) => {
    console.log(
      `🔗 Setting up link ${index + 1}:`,
      link.getAttribute("data-target")
    );
    link.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("🖱️ Link clicked:", this.getAttribute("data-target"));
      handleNavigation(this);
    });
  });

  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    console.log("📱 Setting up mobile sidebar toggle");
    sidebarToggle.addEventListener("click", function () {
      document.getElementById("adminSidebar").classList.toggle("show");
    });
  } else {
    console.log("⚠️ Mobile sidebar toggle not found");
  }

  console.log("✅ Navigation setup complete");
}

/**
 * Handle navigation
 */
function handleNavigation(link) {
  console.log("🔄 Navigation clicked:", link);

  // Remove active class from all links
  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));
  link.classList.add("active");

  // Hide all sections
  document.querySelectorAll(".section").forEach((s) => {
    s.classList.add("d-none");
    console.log("📦 Hiding section:", s.id);
  });

  // Show target section
  const targetId = link.getAttribute("data-target");
  console.log("🎯 Target section:", targetId);

  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    targetSection.classList.remove("d-none");
    console.log("✅ Showing section:", targetId);
  } else {
    console.error("❌ Section not found:", targetId);
  }

  // Load section data
  switch (targetId) {
    case "dashboard":
      console.log("📊 Loading dashboard...");
      loadDashboard();
      break;
    case "categories":
      console.log("📁 Loading categories...");
      loadCategories();
      break;
    case "products":
      console.log("📦 Loading products...");
      loadProducts();
      break;
    case "orders":
      console.log("🛒 Loading orders...");
      loadOrders();
      break;
    case "blogs":
      console.log("📝 Loading blogs...");
      loadBlogs();
      break;
    default:
      console.log("❓ Unknown section:", targetId);
  }
}

/**
 * Load dashboard data
 */
async function loadDashboard() {
  try {
    showLoading("dashboard");

    // Load all data in parallel
    const [productsRes, categoriesRes, ordersRes, blogsRes] = await Promise.all(
      [
        fetch(`${API_BASE}/get_my_products?shop_id=${currentShop.id}`),
        fetch(`${API_BASE}/get_categories?shop_id=${currentShop.id}`),
        fetch(`${API_BASE}/get_orders?shop_id=${currentShop.id}`), // Use shop_id for admin orders
        fetch(`${API_BASE}/get_blogs`),
      ]
    );

    const [productsData, categoriesData, ordersData, blogsData] =
      await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        ordersRes.json(),
        blogsRes.json(),
      ]);

    // Update dashboard cards
    document.getElementById("cardProducts").innerText = productsData.success
      ? productsData.products.length
      : 0;
    document.getElementById("cardCategories").innerText = categoriesData.success
      ? categoriesData.categories.length
      : 0;
    document.getElementById("cardOrders").innerText = ordersData.success
      ? ordersData.orders.length
      : 0;
    document.getElementById("cardBlogs").innerText = blogsData.success
      ? blogsData.blogs.length
      : 0;

    hideLoading("dashboard");
  } catch (error) {
    console.error("❌ Failed to load dashboard:", error);
    hideLoading("dashboard");
    showToast("❌ Failed to load dashboard data", "error");
  }
}

/**
 * Load categories
 */
async function loadCategories() {
  try {
    showLoading("categories");

    const response = await fetch(
      `${API_BASE}/get_categories?shop_id=${currentShop.id}`
    );
    const data = await response.json();

    const list = document.getElementById("categoryList");
    list.innerHTML = "";

    if (data.success && data.categories.length > 0) {
      categories = data.categories;
      data.categories.forEach((cat) => {
        list.innerHTML += `
                    <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
                        <div>
                            <h6 class="mb-1">${cat.name}</h6>
                            <small class="text-muted">Slug: ${cat.slug}</small>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary" onclick="editCategory(${cat.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${cat.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
      });
    } else {
      list.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-folder fa-3x text-muted mb-3"></i>
                    <h5>No categories yet</h5>
                    <p class="text-muted">Add your first category to get started!</p>
                </div>
            `;
    }

    hideLoading("categories");
  } catch (error) {
    console.error("❌ Failed to load categories:", error);
    hideLoading("categories");
    showToast("❌ Failed to load categories", "error");
  }
}

/**
 * Load products
 */
async function loadProducts() {
  try {
    showLoading("products");

    // Load categories for dropdown
    await loadCategoriesForDropdown();

    // Load products
    const response = await fetch(
      `${API_BASE}/get_my_products?shop_id=${currentShop.id}`
    );
    const data = await response.json();

    const list = document.getElementById("productList");
    list.innerHTML = "";

    if (data.success && data.products.length > 0) {
      products = data.products;
      data.products.forEach((product) => {
        const statusBadge =
          product.status === "active" ? "success" : "secondary";
        const newArrivalBadge = product.is_new_arrival ? "warning" : "light";

        list.innerHTML += `
                    <div class="product-card">
                        <div class="product-card-content">
                            <div class="row align-items-center">
                                <div class="col-md-2">
                                    ${
                                      product.images &&
                                      product.images.length > 0
                                        ? createProductGallery(
                                            product.images,
                                            product.id
                                          )
                                        : `<div class="no-image-placeholder">
                                            <i class="fas fa-image"></i>
                                        </div>`
                                    }
                                </div>
                                <div class="col-md-6">
                                    <h6 class="product-name">${
                                      product.name
                                    }</h6>
                                    <p class="product-description">${
                                      product.description || "No description"
                                    }</p>
                                    <div class="product-badges">
                                        <span class="badge status-badge bg-${statusBadge}">${
          product.status
        }</span>
                                        ${
                                          product.is_new_arrival
                                            ? '<span class="badge new-arrival-badge">New Arrival</span>'
                                            : ""
                                        }
                                    </div>
                                    <small class="product-category">Category: ${
                                      product.category_name || "Uncategorized"
                                    }</small>
                                </div>
                                <div class="col-md-2 text-center">
                                    <h6 class="product-price">₹${
                                      product.price
                                    }</h6>
                                    <small class="product-stock">Stock: ${
                                      product.stock
                                    }</small>
                                </div>
                                <div class="col-md-2">
                                    <div class="product-actions">
                                        <button class="btn btn-edit" onclick="editProduct(${
                                          product.id
                                        })">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                        <button class="btn btn-delete" onclick="deleteProduct(${
                                          product.id
                                        })">
                                            <i class="fas fa-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      });
    } else {
      list.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-box fa-3x text-muted mb-3"></i>
                    <h5>No products yet</h5>
                    <p class="text-muted">Add your first product to get started!</p>
                </div>
            `;
    }

    hideLoading("products");
  } catch (error) {
    console.error("❌ Failed to load products:", error);
    hideLoading("products");
    showToast("❌ Failed to load products", "error");
  }
}

/**
 * Load categories for dropdown
 */
async function loadCategoriesForDropdown() {
  try {
    const response = await fetch(
      `${API_BASE}/get_categories?shop_id=${currentShop.id}`
    );
    const data = await response.json();

    const select = document.getElementById("prodCategory");
    select.innerHTML = '<option value="">Select Category</option>';

    if (data.success && data.categories.length > 0) {
      data.categories.forEach((cat) => {
        select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
      });
    }
  } catch (error) {
    console.error("❌ Failed to load categories for dropdown:", error);
  }
}

/**
 * Load orders
 */
async function loadOrders() {
  try {
    showLoading("orders");

    const response = await fetch(
      `${API_BASE}/get_orders?shop_id=${currentShop.id}`
    );
    const data = await response.json();

    const list = document.getElementById("orderList");
    list.innerHTML = "";

    if (data.success && data.orders.length > 0) {
      orders = data.orders;
      data.orders.forEach((order) => {
        const statusBadge = getOrderStatusBadge(order.status);
        list.innerHTML += `
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-3">
                                    <h6 class="mb-1">Order #${
                                      order.order_id
                                    }</h6>
                                    <small class="text-muted">${new Date(
                                      order.created_at
                                    ).toLocaleDateString()}</small>
                                </div>
                                <div class="col-md-3">
                                    <p class="mb-1">Customer: ${
                                      order.customer_name || "N/A"
                                    }</p>
                                    <small class="text-muted">${
                                      order.customer_email || "N/A"
                                    }</small>
                                </div>
                                <div class="col-md-2 text-center">
                                    <h6 class="text-success mb-1">₹${
                                      order.total_amount
                                    }</h6>
                                    <small class="text-muted">${
                                      order.items_count
                                    } items</small>
                                </div>
                                <div class="col-md-2 text-center">
                                    <span class="badge bg-${statusBadge}">${
          order.status
        }</span>
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-sm btn-outline-primary w-100" onclick="viewOrder(${
                                      order.order_id
                                    })">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      });
    } else {
      list.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5>No orders yet</h5>
                    <p class="text-muted">Orders will appear here when customers place them!</p>
                </div>
            `;
    }

    hideLoading("orders");
  } catch (error) {
    console.error("❌ Failed to load orders:", error);
    hideLoading("orders");
    showToast("❌ Failed to load orders", "error");
  }
}

/**
 * Load blogs
 */
async function loadBlogs() {
  try {
    showLoading("blogs");

    const response = await fetch(`${API_BASE}/get_blogs`);
    const data = await response.json();

    const list = document.getElementById("blogList");
    list.innerHTML = "";

    if (data.success && data.blogs.length > 0) {
      blogs = data.blogs;
      data.blogs.forEach((blog) => {
        list.innerHTML += `
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-2">
                                    ${
                                      blog.image
                                        ? `<img src="http://localhost:2034/api/v1/uploads/blogs/${blog.image}" 
                                              class="img-fluid rounded" style="height: 80px; object-fit: cover;">`
                                        : `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 80px;">
                                            <i class="fas fa-image text-muted"></i>
                                        </div>`
                                    }
                                </div>
                                <div class="col-md-8">
                                    <h6 class="mb-1">${blog.title}</h6>
                                    <p class="text-muted mb-1">${
                                      blog.content
                                        ? blog.content.substring(0, 100) + "..."
                                        : "No content"
                                    }</p>
                                    <small class="text-muted">Slug: ${
                                      blog.slug
                                    }</small>
                                </div>
                                <div class="col-md-2">
                                    <div class="btn-group-vertical w-100">
                                        <button class="btn btn-sm btn-outline-primary" onclick="editBlog(${
                                          blog.id
                                        })">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteBlog(${
                                          blog.id
                                        })">
                                            <i class="fas fa-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      });
    } else {
      list.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-blog fa-3x text-muted mb-3"></i>
                    <h5>No blogs yet</h5>
                    <p class="text-muted">Add your first blog post to get started!</p>
                </div>
            `;
    }

    hideLoading("blogs");
  } catch (error) {
    console.error("❌ Failed to load blogs:", error);
    hideLoading("blogs");
    showToast("❌ Failed to load blogs", "error");
  }
}

/**
 * Setup forms
 */
function setupForms() {
  // Category form
  const categoryForm = document.getElementById("categoryForm");
  if (categoryForm) {
    categoryForm.addEventListener("submit", handleCategorySubmit);
    // Additional prevention
    categoryForm.onsubmit = function (e) {
      e.preventDefault();
      return false;
    };
  }

  // Product form
  const productForm = document.getElementById("productForm");
  if (productForm) {
    productForm.addEventListener("submit", handleProductSubmit);
    // Additional prevention
    productForm.onsubmit = function (e) {
      e.preventDefault();
      return false;
    };
  }

  // Blog form
  const blogForm = document.getElementById("blogForm");
  if (blogForm) {
    blogForm.addEventListener("submit", handleBlogSubmit);
    // Additional prevention
    blogForm.onsubmit = function (e) {
      e.preventDefault();
      return false;
    };
  }
}

/**
 * Handle category form submission
 */
async function handleCategorySubmit(e) {
  e.preventDefault();
  e.stopPropagation();

  console.log("Category form submitted, preventing default behavior");

  const formData = new FormData(e.target);
  formData.append("shop_id", currentShop.id);

  try {
    showLoading("categories");

    const response = await fetch(`${API_BASE}/add_category`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    hideLoading("categories");

    if (data.success) {
      showToast("✅ Category added successfully!", "success");
      e.target.reset();
      loadCategories();
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch (error) {
    console.error("❌ Failed to add category:", error);
    hideLoading("categories");
    showToast("❌ Failed to add category", "error");
  }

  return false; // Additional prevention
}

/**
 * Handle product form submission
 */
async function handleProductSubmit(e) {
  e.preventDefault();
  e.stopPropagation();

  const formData = new FormData(e.target);
  formData.append("shop_id", currentShop.id);

  try {
    showLoading("products");

    const response = await fetch(`${API_BASE}/add_product`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    hideLoading("products");

    if (data.success) {
      showToast("✅ Product added successfully!", "success");
      e.target.reset();
      loadProducts();
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch (error) {
    console.error("❌ Failed to add product:", error);
    hideLoading("products");
    showToast("❌ Failed to add product", "error");
  }

  return false; // Additional prevention
}

/**
 * Handle blog form submission
 */
async function handleBlogSubmit(e) {
  e.preventDefault();
  e.stopPropagation();

  console.log("Blog form submitted, preventing default behavior");

  const formData = new FormData(e.target);

  try {
    showLoading("blogs");

    const response = await fetch(`${API_BASE}/add_blog`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    hideLoading("blogs");

    if (data.success) {
      showToast("✅ Blog added successfully!", "success");
      e.target.reset();
      loadBlogs();
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch (error) {
    console.error("❌ Failed to add blog:", error);
    hideLoading("blogs");
    showToast("❌ Failed to add blog", "error");
  }

  return false; // Additional prevention
}

/**
 * Delete product
 */
async function deleteProduct(productId) {
  showPopup(
    "Delete Product",
    "Are you sure you want to delete this product? This action cannot be undone.",
    "warning",
    async () => {
      try {
        const formData = new FormData();
        formData.append("product_id", productId);

        const response = await fetch(`${API_BASE}/delete_product`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          showToast("✅ Product deleted successfully!", "success");
          loadProducts();
        } else {
          showToast("❌ " + data.message, "error");
        }
      } catch (error) {
        console.error("❌ Failed to delete product:", error);
        showToast("❌ Failed to delete product", "error");
      }
    }
  );
}

/**
 * Edit product
 */
async function editProduct(productId) {
  const product = products.find((p) => p.id == productId);
  if (!product) {
    showToast("❌ Product not found", "error");
    return;
  }

  // Load categories for dropdown first
  await loadCategoriesForDropdown();

  // Fill form with product data
  document.getElementById("prodId").value = product.id;
  document.getElementById("prodName").value = product.name;
  document.getElementById("prodSlug").value = product.slug;
  document.getElementById("prodDesc").value = product.description || "";
  document.getElementById("prodPrice").value = product.price;
  document.getElementById("prodStock").value = product.stock;

  // Set category value - ensure it's set after dropdown is populated
  const setCategoryValue = () => {
    const categorySelect = document.getElementById("prodCategory");

    // Try different possible field names for category ID
    let categoryId =
      product.category_id ||
      product.categoryId ||
      product.cat_id ||
      product.catId;

    // Check if category_id exists and is valid
    if (!categoryId || categoryId === null || categoryId === undefined) {
      return;
    }

    const targetValue = categoryId.toString();

    // Check if the target category exists in the dropdown
    const optionExists = Array.from(categorySelect.options).some(
      (option) => option.value === targetValue
    );

    if (optionExists) {
      categorySelect.value = targetValue;
    } else {
    }
  };

  // Try to set immediately, then with a small delay as fallback
  setCategoryValue();
  setTimeout(setCategoryValue, 50);

  document.getElementById("prodStatus").value = product.status || "active";
  document.getElementById("prodNew").checked = product.is_new_arrival == 1;

  // Switch to edit mode
  switchToEditMode("product");

  // Scroll to form
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });

  showToast("📝 Product data loaded for editing", "info");
}

/**
 * Edit category
 */
function editCategory(categoryId) {
  const category = categories.find((c) => c.id == categoryId);
  if (!category) {
    showToast("❌ Category not found", "error");
    return;
  }

  // Fill form with category data
  document.getElementById("catId").value = category.id;
  document.getElementById("catName").value = category.name;
  document.getElementById("catSlug").value = category.slug;

  // Switch to edit mode
  switchToEditMode("category");

  // Scroll to form
  document.getElementById("categories").scrollIntoView({ behavior: "smooth" });

  showToast("📝 Category data loaded for editing", "info");
}

/**
 * Edit blog
 */
function editBlog(blogId) {
  const blog = blogs.find((b) => b.id == blogId);
  if (!blog) {
    showToast("❌ Blog not found", "error");
    return;
  }

  // Fill form with blog data
  document.getElementById("blogId").value = blog.id;
  document.getElementById("blogTitle").value = blog.title;
  document.getElementById("blogSlug").value = blog.slug;
  document.getElementById("blogContent").value = blog.content || "";

  // Switch to edit mode
  switchToEditMode("blog");

  // Scroll to form
  document.getElementById("blogs").scrollIntoView({ behavior: "smooth" });

  showToast("📝 Blog data loaded for editing", "info");
}

/**
 * Switch to edit mode
 */
function switchToEditMode(type) {
  const formTitle = document.getElementById(`${type}FormTitle`);
  const submitBtn = document.getElementById(`${type}SubmitBtn`);
  const editControls = document.getElementById(`${type}EditControls`);

  // Update form title
  formTitle.innerHTML = `<i class="fas fa-edit text-warning me-2"></i>Edit ${
    type.charAt(0).toUpperCase() + type.slice(1)
  }`;

  // Hide submit button and show edit controls
  submitBtn.style.display = "none";
  editControls.style.display = "block";

  // Add event listeners for save and cancel
  setupEditControls(type);
}

/**
 * Switch back to add mode
 */
function switchToAddMode(type) {
  const formTitle = document.getElementById(`${type}FormTitle`);
  const submitBtn = document.getElementById(`${type}SubmitBtn`);
  const editControls = document.getElementById(`${type}EditControls`);
  const form = document.getElementById(`${type}Form`);

  // Update form title
  formTitle.innerHTML = `<i class="fas fa-plus-circle text-primary me-2"></i>Add New ${
    type.charAt(0).toUpperCase() + type.slice(1)
  }`;

  // Show submit button and hide edit controls
  submitBtn.style.display = "inline-block";
  editControls.style.display = "none";

  // Reset form
  form.reset();

  // Get the correct ID field name based on type
  let idFieldName;
  switch (type) {
    case "product":
      idFieldName = "prodId";
      break;
    case "category":
      idFieldName = "catId";
      break;
    case "blog":
      idFieldName = "blogId";
      break;
    default:
      idFieldName = `${type}Id`;
  }

  document.getElementById(idFieldName).value = "";
}

/**
 * Setup edit controls
 */
function setupEditControls(type) {
  const saveBtn = document.getElementById(`${type}SaveBtn`);
  const cancelBtn = document.getElementById(`${type}CancelBtn`);

  // Remove existing event listeners
  saveBtn.replaceWith(saveBtn.cloneNode(true));
  cancelBtn.replaceWith(cancelBtn.cloneNode(true));

  // Add new event listeners
  document.getElementById(`${type}SaveBtn`).onclick = () => saveEdit(type);
  document.getElementById(`${type}CancelBtn`).onclick = () =>
    switchToAddMode(type);
}

/**
 * Save edit
 */
async function saveEdit(type) {
  const form = document.getElementById(`${type}Form`);
  const formData = new FormData(form);

  // Get the correct ID field name based on type
  let idFieldName;
  switch (type) {
    case "product":
      idFieldName = "prodId";
      break;
    case "category":
      idFieldName = "catId";
      break;
    case "blog":
      idFieldName = "blogId";
      break;
    default:
      idFieldName = `${type}Id`;
  }

  const id = document.getElementById(idFieldName).value;

  console.log(`Saving edit for ${type}, ID: ${id}`);

  if (!id) {
    showToast("❌ No item selected for editing", "error");
    return;
  }

  try {
    showLoading(type);

    // Add edit flag to form data
    formData.append("edit", "1");
    formData.append("id", id);

    // Add shop_id for category and product
    if (type === "category" || type === "product") {
      formData.append("shop_id", currentShop.id);
    }

    let endpoint = "";
    switch (type) {
      case "category":
        endpoint = `${API_BASE}/add_category`;
        break;
      case "product":
        endpoint = `${API_BASE}/edit_product`;
        break;
      case "blog":
        endpoint = `${API_BASE}/add_blog`;
        break;
    }

    console.log(`Sending request to: ${endpoint}`);
    console.log("Form data:", Object.fromEntries(formData));
    console.log("Form data entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value} (type: ${typeof value})`);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed response data:", data);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      console.log("Response was not valid JSON. Raw response:", responseText);
      hideLoading(type);
      showToast("❌ Server returned invalid response", "error");
      return;
    }

    hideLoading(type);

    if (data.success) {
      showToast(
        `✅ ${
          type.charAt(0).toUpperCase() + type.slice(1)
        } updated successfully!`,
        "success"
      );
      switchToAddMode(type);

      // Reload the appropriate list
      switch (type) {
        case "category":
          loadCategories();
          break;
        case "product":
          loadProducts();
          break;
        case "blog":
          loadBlogs();
          break;
      }
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch (error) {
    console.error(`❌ Failed to update ${type}:`, error);
    hideLoading(type);
    showToast(`❌ Failed to update ${type}`, "error");
  }
}

/**
 * Delete category
 */
async function deleteCategory(categoryId) {
  showPopup(
    "Delete Category",
    "Are you sure you want to delete this category?",
    "warning",
    async () => {
      try {
        const formData = new FormData();
        formData.append("delete", "1");
        formData.append("id", categoryId);

        const response = await fetch(`${API_BASE}/add_category`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          showToast("✅ Category deleted successfully!", "success");
          loadCategories();
        } else {
          showToast("❌ " + data.message, "error");
        }
      } catch (error) {
        console.error("❌ Failed to delete category:", error);
        showToast("❌ Failed to delete category", "error");
      }
    }
  );
}

/**
 * View order
 */
function viewOrder(orderId) {
  showToast("📋 Order details view not implemented yet", "info");
}

/**
 * Delete blog
 */
function deleteBlog(blogId) {
  showPopup(
    "Delete Blog",
    "Are you sure you want to delete this blog post? This action cannot be undone.",
    "warning",
    () => {
      showToast("⚠️ Blog deletion not implemented yet", "warning");
    }
  );
}

/**
 * Get order status badge color
 */
function getOrderStatusBadge(status) {
  switch (status.toLowerCase()) {
    case "pending":
      return "warning";
    case "confirmed":
      return "info";
    case "shipped":
      return "primary";
    case "delivered":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
}

/**
 * Show loading state
 */
function showLoading(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    const loadingDiv = document.createElement("div");
    loadingDiv.id = `${sectionId}-loading`;
    loadingDiv.className = "text-center p-4";
    loadingDiv.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading...</p>
        `;
    section.appendChild(loadingDiv);
  }
}

/**
 * Hide loading state
 */
function hideLoading(sectionId) {
  const loadingDiv = document.getElementById(`${sectionId}-loading`);
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

/**
 * Create product image gallery
 */
function createProductGallery(images, productId) {
  console.log("Creating gallery for product:", productId, "Images:", images);

  if (!images || images.length === 0) {
    console.log("No images found for product:", productId);
    return `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 80px;">
                    <i class="fas fa-image text-muted"></i>
                </div>`;
  }

  // If only one image, show as normal single photo
  if (images.length === 1) {
    const imageUrl = `http://localhost:2034/api/v1/uploads/products/${images[0]}`;
    console.log("Single image URL:", imageUrl);
    return `<div class="single-image-container" onclick="openImageModal(${productId}, 0)">
                    <img src="${imageUrl}" 
                         class="single-product-image" 
                         alt="Product Image"
                         onload="console.log('Image loaded successfully:', this.src)"
                         onerror="console.log('Image failed to load:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="image-error-fallback" style="display: none;">
                        <i class="fas fa-image"></i>
                    </div>
                </div>`;
  }

  // Multiple images - show as gallery
  const maxDisplay = 4; // Show max 4 thumbnails
  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  let galleryHTML = '<div class="product-gallery">';

  displayImages.forEach((image, index) => {
    const imageUrl = `http://localhost:2034/api/v1/uploads/products/${image}`;
    galleryHTML += `
            <div class="gallery-thumbnail" onclick="openImageModal(${productId}, ${index})">
                <img src="${imageUrl}" alt="Product Image ${index + 1}">
                <div class="gallery-overlay">
                    <i class="fas fa-search-plus"></i>
                </div>
            </div>
        `;
  });

  // Add count badge if there are more than 4 images
  if (remainingCount > 0) {
    galleryHTML += `
            <div class="gallery-thumbnail" onclick="openImageModal(${productId}, ${maxDisplay})">
                <div class="bg-light d-flex align-items-center justify-content-center" style="height: 100%;">
                    <span class="text-muted">+${remainingCount}</span>
                </div>
                <div class="gallery-count">${images.length}</div>
            </div>
        `;
  }

  galleryHTML += "</div>";
  return galleryHTML;
}

/**
 * Open image modal
 */
function openImageModal(productId, startIndex = 0) {
  const product = products.find((p) => p.id == productId);
  if (!product || !product.images || product.images.length === 0) {
    showToast("❌ No images found for this product", "error");
    return;
  }

  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("imageModalImg");
  const modalCounter = document.getElementById("imageModalCounter");
  const prevBtn = document.getElementById("imageModalPrev");
  const nextBtn = document.getElementById("imageModalNext");

  let currentIndex = startIndex;
  const totalImages = product.images.length;

  function updateModal() {
    const imageUrl = `http://localhost:2034/api/v1/uploads/products/${product.images[currentIndex]}`;
    modalImg.src = imageUrl;
    modalImg.alt = `Product Image ${currentIndex + 1}`;
    modalCounter.textContent = `${currentIndex + 1} / ${totalImages}`;

    // Show/hide navigation buttons
    prevBtn.style.display = totalImages > 1 ? "flex" : "none";
    nextBtn.style.display = totalImages > 1 ? "flex" : "none";
  }

  // Navigation functions
  function showPrev() {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
    updateModal();
  }

  function showNext() {
    currentIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
    updateModal();
  }

  // Event listeners
  prevBtn.onclick = showPrev;
  nextBtn.onclick = showNext;

  // Keyboard navigation
  const handleKeydown = (e) => {
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "Escape") closeImageModal();
  };

  document.addEventListener("keydown", handleKeydown);

  // Close modal
  const closeModal = () => {
    modal.classList.remove("show");
    document.removeEventListener("keydown", handleKeydown);
  };

  document.getElementById("imageModalClose").onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Initialize and show modal
  updateModal();
  modal.classList.add("show");
}

/**
 * Close image modal
 */
function closeImageModal() {
  const modal = document.getElementById("imageModal");
  modal.classList.remove("show");
}

/**
 * Show popup modal
 */
function showPopup(title, message, type = "info", callback = null) {
  const modal = document.getElementById("popupModal");
  const titleEl = document.getElementById("popupTitle");
  const messageEl = document.getElementById("popupMessage");
  const iconEl = document.getElementById("popupIcon");
  const okBtn = document.getElementById("popupOk");
  const closeBtn = document.getElementById("popupClose");

  // Set content
  titleEl.textContent = title;
  messageEl.textContent = message;

  // Set icon and colors based on type
  const iconMap = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  };

  iconEl.className = `popup-icon ${type}`;
  iconEl.innerHTML = `<i class="${iconMap[type] || iconMap.info}"></i>`;

  // Show modal
  modal.classList.add("show");

  // Close handlers
  const closeModal = () => {
    modal.classList.remove("show");
    if (callback) callback();
  };

  okBtn.onclick = closeModal;
  closeBtn.onclick = closeModal;

  // Close on backdrop click
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);
}

/**
 * Show toast notification
 */
function showToast(message, type = "info") {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
    toastContainer.style.zIndex = "1055";
    document.body.appendChild(toastContainer);
  }

  // Create toast
  const toastId = "toast-" + Date.now();
  const toast = document.createElement("div");
  toast.id = toastId;
  toast.className = `toast align-items-center text-white bg-${
    type === "error"
      ? "danger"
      : type === "success"
      ? "success"
      : type === "warning"
      ? "warning"
      : "info"
  } border-0`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

  toastContainer.appendChild(toast);

  // Show toast
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();

  // Remove toast after it's hidden
  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove();
  });
}
