const API_BASE = "http://localhost/Indian%20Tribe/Indian_tribe-Backend/routes/shop";

// Get stored IDs
const USER_ID = localStorage.getItem("user_id");
const SHOP_ID = localStorage.getItem("shop_id");

// --- Sidebar Navigation ---
function setupSidebar(selector) {
  document.querySelectorAll(selector).forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelectorAll(selector).forEach(l => l.classList.remove("active"));
      this.classList.add("active");

      document.querySelectorAll(".section").forEach(s => s.classList.add("d-none"));
      const targetId = this.getAttribute("data-target");
      document.getElementById(targetId).classList.remove("d-none");

      if (targetId === "dashboard") loadDashboard();
      if (targetId === "categories") loadCategories();
      if (targetId === "products") loadProducts();
      if (targetId === "blogs") loadBlogs();
      if (targetId === "orders") loadOrders();
    });
  });
}
setupSidebar("#sidebarNav .nav-link");
setupSidebar("#sidebarNavMobile .nav-link");

// --- Dashboard ---
async function loadDashboard() {
  let resProd = await fetch(`${API_BASE}/get_my_products.php?shop_id=${SHOP_ID}`);
  let prods = await resProd.json();

  let resCat = await fetch(`${API_BASE}/get_categories.php?shop_id=${SHOP_ID}`);
  let cats = await resCat.json();

  let resBlog = await fetch(`${API_BASE}/get_blogs.php`);
  let blogs = await resBlog.json();

  let resOrders = await fetch(`${API_BASE}/get_orders.php?user_id=${USER_ID}`);
  let orders = await resOrders.json();

  document.getElementById("cardProducts").innerText = prods.success ? prods.products.length : 0;
  document.getElementById("cardCategories").innerText = cats.success ? cats.categories.length : 0;
  document.getElementById("cardBlogs").innerText = blogs.success ? blogs.blogs.length : 0;
  document.getElementById("cardOrders").innerText = orders.success ? orders.orders.length : 0;
}

// --- Categories ---
async function loadCategories() {
  let res = await fetch(`${API_BASE}/get_categories.php?shop_id=${SHOP_ID}`);
  let data = await res.json();
  let list = document.getElementById("categoryList");
  list.innerHTML = "";
  if (data.success) {
    data.categories.forEach(cat => {
      list.innerHTML += `<div class="p-2 border-bottom">${cat.name} <small class="text-muted">(${cat.slug})</small></div>`;
    });
  } else {
    list.innerHTML = "No categories yet";
  }
}
document.getElementById("categoryForm").addEventListener("submit", async e => {
  e.preventDefault();
  let name = document.getElementById("catName").value;
  let slug = document.getElementById("catSlug").value;
  let formData = new FormData();
  formData.append("shop_id", SHOP_ID);
  formData.append("name", name);
  formData.append("slug", slug);

  let res = await fetch(`${API_BASE}/add_category.php`, { method: "POST", body: formData });
  let data = await res.json();
  if (data.success) {
    loadCategories();
    e.target.reset();
  } else {
    alert("Error adding category");
  }
});

// --- Products ---
async function loadProducts() {
  // Populate category dropdown
  let catRes = await fetch(`${API_BASE}/get_categories.php?shop_id=${SHOP_ID}`);
  let catData = await catRes.json();
  let select = document.getElementById("prodCategory");
  select.innerHTML = '<option value="">Select Category</option>';
  if (catData.success) {
    catData.categories.forEach(cat => {
      select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });
  }

  // Load product list
  let res = await fetch(`${API_BASE}/get_my_products.php?shop_id=${SHOP_ID}`);
  let data = await res.json();
  let list = document.getElementById("productList");
  list.innerHTML = "";
  if (data.success) {
    data.products.forEach(p => {
      list.innerHTML += `<div class="p-2 border-bottom"><b>${p.name}</b> - ₹${p.price}</div>`;
    });
  } else {
    list.innerHTML = "No products yet";
  }
}
document.getElementById("productForm").addEventListener("submit", async e => {
  e.preventDefault();
  let formData = new FormData(e.target);
  formData.append("shop_id", SHOP_ID);

  let res = await fetch(`${API_BASE}/add_product.php`, { method: "POST", body: formData });
  let data = await res.json();
  if (data.success) {
    loadProducts();
    e.target.reset();
  } else {
    alert("Error: " + data.message);
  }
});

// --- Orders ---
async function loadOrders() {
  let res = await fetch(`${API_BASE}/get_orders.php?user_id=${USER_ID}`);
  let data = await res.json();
  let list = document.getElementById("orderList");
  list.innerHTML = "";
  if (data.success) {
    data.orders.forEach(o => {
      list.innerHTML += `<div class="p-2 border-bottom">#${o.order_id} - ₹${o.total_amount} - <span class="badge bg-secondary">${o.status}</span></div>`;
    });
  } else {
    list.innerHTML = "No orders yet";
  }
}

// --- Blogs ---
async function loadBlogs() {
  let res = await fetch(`${API_BASE}/get_blogs.php`);
  let data = await res.json();
  let list = document.getElementById("blogList");
  list.innerHTML = "";
  if (data.success) {
    data.blogs.forEach(b => {
      list.innerHTML += `<div class="p-2 border-bottom"><b>${b.title}</b></div>`;
    });
  } else {
    list.innerHTML = "No blogs yet";
  }
}
document.getElementById("blogForm").addEventListener("submit", async e => {
  e.preventDefault();
  let formData = new FormData(e.target);
  let res = await fetch(`${API_BASE}/add_blog.php`, { method: "POST", body: formData });
  let data = await res.json();
  if (data.success) {
    loadBlogs();
    e.target.reset();
  } else {
    alert("Error adding blog");
  }
});

// --- Login State ---
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const profileLink = document.getElementById("profileLink");

if (USER_ID && SHOP_ID) {
  loginBtn.classList.add("d-none");
  logoutBtn.classList.remove("d-none");
  profileLink.classList.remove("d-none");
} else {
  if (!window.location.href.includes("login.html")) {
    window.location.href = "login.html";
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("shop_id");
    alert("✅ Logged out successfully");
    window.location.href = "login.html";
  });
}

// Load default dashboard
loadDashboard();
