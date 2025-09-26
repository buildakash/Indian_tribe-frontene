// REMOVED: document.addEventListener('DOMContentLoaded', () => { ... });
// The script now runs immediately when called by your loader.

// Sidebar Toggle Logic
const filterSidebarBtn = document.querySelector(".filter-sidebar-btn");
const sidebar = document.querySelector(".sidebar");
const sidebarMain = document.querySelector(".sidebar .sidebar-main");
const closeSidebarBtn = document.querySelector(
  ".sidebar .sidebar-main .close-sidebar-btn"
);

if (filterSidebarBtn && sidebar) {
  filterSidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  if (sidebarMain) {
    sidebar.addEventListener("click", () => {
      sidebar.classList.remove("open");
    });

    sidebarMain.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener("click", () => {
        sidebar.classList.remove("open");
      });
    }
  }
}

// Product Listing and Pagination Variables
const productContainer = document.querySelector(".list-product-block");
const productList = document.querySelector(".list-product-block .list-product");
const listPagination = document.querySelector(".list-pagination");

// Make sure the essential containers exist before proceeding
if (!productContainer || !productList || !listPagination) {
  console.error(
    "Shop product containers not found. Check if product-list.html loaded correctly."
  );
} else {
  let currentPage = 1;
  let productsPerPage = Number(productList.getAttribute("data-item")) || 9;
  let productsData = [];

  // Price Range Filter Logic
  const rangeInput = document.querySelectorAll(".range-input input");
  const progress = document.querySelector(".tow-bar-block .progress");
  const minPriceEl = document.querySelector(".min-price");
  const maxPriceEl = document.querySelector(".max-price");
  let priceGap = 10;

  if (rangeInput.length > 0 && progress && minPriceEl && maxPriceEl) {
    rangeInput.forEach((input) => {
      input.addEventListener("input", (e) => {
        let minValue = parseInt(rangeInput[0].value);
        let maxValue = parseInt(rangeInput[1].value);

        if (maxValue - minValue < priceGap) {
          if (e.target.className.includes("range-min")) {
            rangeInput[0].value = maxValue - priceGap;
          } else {
            rangeInput[1].value = minValue + priceGap;
          }
        } else {
          progress.style.left = (minValue / rangeInput[0].max) * 100 + "%";
          progress.style.right =
            100 - (maxValue / rangeInput[1].max) * 100 + "%";
        }

        minPriceEl.innerHTML = "$" + rangeInput[0].value;
        maxPriceEl.innerHTML = "$" + rangeInput[1].value;
      });

      input.addEventListener("mouseup", () => {
        handleFiltersChange();
      });
    });
  }

  // Main Function to Fetch and Initialize Products
  function fetchProducts() {
    // Get shop_id from localStorage like admin page does
    const shopId = localStorage.getItem("shop_id") || "8"; // fallback to 1 if not set
    console.log("Using shop_id:", shopId);

    // Fetch real products from API - use the same endpoint as admin page
    fetch(`http://localhost:2034/api/v1/shop/get_my_products?shop_id=${shopId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log("API Response:", data);
        if (data.success && data.products) {
          console.log("Products found:", data.products.length);
          // Transform API data to match expected format
          productsData = data.products.map((product) => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            originPrice: parseFloat(product.price) * 1.2, // Mock original price
            quantity: parseInt(product.stock) + Math.floor(Math.random() * 20), // Mock total quantity
            sold: Math.floor(Math.random() * parseInt(product.stock)), // Mock sold quantity
            new: product.is_new_arrival === 1,
            sale: Math.random() > 0.7, // Random sale status
            category: product.category_name || "Uncategorized",
            thumbImage:
              product.images && product.images.length > 0
                ? product.images.map(
                    (img) =>
                      `http://localhost:2034/api/v1/uploads/products/${img}`
                  )
                : [
                    "http://localhost:2034/api/v1/uploads/products/default-product.jpg",
                  ],
          }));
          initializeShop();
        } else {
          console.error("API Error:", data);
          throw new Error(data.message || "Failed to fetch products");
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);

        // Try fallback shop_id if the first one fails
        if (shopId !== "1") {
          console.log("Trying fallback shop_id=1");
          fetch("http://localhost:2034/api/v1/shop/get_my_products?shop_id=1")
            .then((response) => response.json())
            .then((data) => {
              console.log("Fallback API Response:", data);
              if (data.success && data.products) {
                console.log("Fallback products found:", data.products.length);
                // Transform API data to match expected format
                productsData = data.products.map((product) => ({
                  id: product.id,
                  name: product.name,
                  price: parseFloat(product.price),
                  originPrice: parseFloat(product.price) * 1.2,
                  quantity:
                    parseInt(product.stock) + Math.floor(Math.random() * 20),
                  sold: Math.floor(Math.random() * parseInt(product.stock)),
                  new: product.is_new_arrival === 1,
                  sale: Math.random() > 0.7,
                  category: product.category_name || "Uncategorized",
                  thumbImage:
                    product.images && product.images.length > 0
                      ? product.images.map(
                          (img) =>
                            `http://localhost:2034/api/v1/uploads/products/${img}`
                        )
                      : [
                          "http://localhost:2034/api/v1/uploads/products/default-product.jpg",
                        ],
                }));
                initializeShop();
              } else {
                throw new Error(data.message || "Fallback also failed");
              }
            })
            .catch((fallbackError) => {
              console.error("Fallback also failed:", fallbackError);
              if (productList)
                productList.innerHTML = `<p class="col-span-full text-center text-red-500">No products found. Please check if products exist in the database.</p>`;
            });
        } else {
          if (productList)
            productList.innerHTML = `<p class="col-span-full text-center text-red-500">${error.message}</p>`;
        }
      });
  }

  // Function to set up all event listeners and initial render
  function initializeShop() {
    renderProducts(currentPage, productsData);
    renderPagination(productsData);
    addEventListenersToFilters();
  }

  // All other functions (renderProducts, handleFiltersChange, etc.) remain exactly the same as the previous version.
  // I am omitting them here for brevity, but you should keep them in your file.
  // ...
  // [Paste the rest of the functions from the previous shop.js answer here]
  // ...

  function renderProducts(page, products = []) {
    if (!productList) return;
    productList.innerHTML = "";

    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const displayedProducts = products.slice(startIndex, endIndex);

    if (displayedProducts.length === 0) {
      productList.innerHTML = `<div class="list-empty col-span-full text-center py-10"><p class="text-gray-500 text-base">No products found matching your criteria.</p></div>`;
      return;
    }

    displayedProducts.forEach((product) => {
      const productItem = document.createElement("div");
      productItem.setAttribute("data-item", product.id);
      let productTags = "";
      if (product.new) {
        productTags += `<div class="product-tag text-button-uppercase bg-green px-3 py-0.5 inline-block rounded-full absolute top-3 left-3 z-[1]">New</div>`;
      }
      if (product.sale) {
        productTags += `<div class="product-tag text-button-uppercase text-white bg-red px-3 py-0.5 inline-block rounded-full absolute top-3 left-3 z-[1]">Sale</div>`;
      }

      let productImages = "";
      product.thumbImage.forEach((img, index) => {
        // Use the full API URL directly (already includes http://localhost:2034)
        let imagePath = img;
        productImages += `<img key="${index}" class="w-full h-full object-cover duration-700" src="${imagePath}" alt="img">`;
      });

      if (!productContainer.classList.contains("style-list")) {
        // Default to grid
        productItem.className = "product-item grid-type";
        productItem.innerHTML = `
                    <div class="product-main cursor-pointer block" data-item="${
                      product.id
                    }">
                        <div class="product-thumb bg-white relative overflow-hidden rounded-2xl">
                            ${productTags}
                            <div class="list-action-right absolute top-3 right-3 max-lg:hidden">
                                <div class="add-wishlist-btn w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative">
                                    <div class="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">Add To Wishlist</div>
                                    <i class="ph ph-heart text-lg"></i>
                                </div>
                                <div class="compare-btn w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative mt-2">
                                    <div class="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">Compare Product</div>
                                    <i class="ph ph-arrow-counter-clockwise text-lg compare-icon"></i>
                                    <i class="ph ph-check-circle text-lg checked-icon"></i>
                                </div>
                            </div>
                            <div class="product-img w-full h-full aspect-[3/4]">${productImages}</div>
                            <div class="list-action grid grid-cols-2 gap-3 px-5 absolute w-full bottom-5 max-lg:hidden">
                                <div class="quick-view-btn w-full text-button-uppercase py-2 text-center rounded-full duration-300 bg-white hover:bg-black hover:text-white">Quick View</div>
                                <div class="add-cart-btn w-full text-button-uppercase py-2 text-center rounded-full duration-500 bg-white hover:bg-black hover:text-white">Add To Cart</div>
                            </div>
                        </div>
                        <div class="product-infor mt-4 lg:mb-7">
                             <div class="product-sold sm:pb-4 pb-2">
                                <div class="progress bg-line h-1.5 w-full rounded-full overflow-hidden relative">
                                    <div class='progress-sold bg-red absolute left-0 top-0 h-full' style="width: ${Math.floor(
                                      (product.sold / product.quantity) * 100
                                    )}%"></div>
                                </div>
                                <div class="flex items-center justify-between gap-3 gap-y-1 flex-wrap mt-2">
                                    <div class="text-button-uppercase"><span class='text-secondary2 max-sm:text-xs'>Sold: </span><span class='max-sm:text-xs'>${
                                      product.sold
                                    }</span></div>
                                    <div class="text-button-uppercase"><span class='text-secondary2 max-sm:text-xs'>Available: </span><span class='max-sm:text-xs'>${
                                      product.quantity - product.sold
                                    }</span></div>
                                </div>
                            </div>
                            <div class="product-name text-title duration-300">${
                              product.name
                            }</div>
                            <div class="product-price-block flex items-center gap-2 flex-wrap mt-1 duration-300 relative z-[1]">
                                <div class="product-price text-title">$${product.price.toFixed(
                                  2
                                )}</div>
                                ${
                                  product.originPrice > product.price
                                    ? `
                                <div class="product-origin-price caption1 text-secondary2"><del>$${product.originPrice.toFixed(
                                  2
                                )}</del></div>
                                <div class="product-sale caption1 font-medium bg-green px-3 py-0.5 inline-block rounded-full">-${Math.floor(
                                  100 -
                                    (product.price / product.originPrice) * 100
                                )}%</div>
                                `
                                    : ""
                                }
                            </div>
                        </div>
                    </div>`;
      } else {
        // List view
        productItem.className = "product-item list-type";
        productItem.innerHTML = `
                    <div class="product-main flex gap-5 items-start" data-item="${
                      product.id
                    }">
                        <div class="thumb-wrap relative shrink-0 w-[140px] sm:w-[180px] md:w-[220px] rounded-2xl overflow-hidden bg-white">
                            ${productTags}
                            <div class="product-img w-full h-full aspect-[3/4]">${productImages}</div>
                        </div>
                        <div class="content flex-1">
                            <div class="product-name text-title">${
                              product.name
                            }</div>
                            <div class="product-price-block flex items-center gap-2 flex-wrap mt-2">
                                <div class="product-price text-title">$${product.price.toFixed(
                                  2
                                )}</div>
                                ${
                                  product.originPrice > product.price
                                    ? `
                                <div class="product-origin-price caption1 text-secondary2"><del>$${product.originPrice.toFixed(
                                  2
                                )}</del></div>
                                <div class="product-sale caption1 font-medium bg-green px-3 py-0.5 inline-block rounded-full">-${Math.floor(
                                  100 -
                                    (product.price / product.originPrice) * 100
                                )}%</div>
                                `
                                    : ""
                                }
                            </div>
                            <div class="product-sold sm:pb-3 pb-2 mt-3">
                                <div class="progress bg-line h-1.5 w-full rounded-full overflow-hidden relative">
                                    <div class='progress-sold bg-red absolute left-0 top-0 h-full' style="width: ${Math.floor(
                                      (product.sold / product.quantity) * 100
                                    )}%"></div>
                                </div>
                                <div class="flex items-center gap-4 mt-2">
                                    <div class="text-button-uppercase"><span class='text-secondary2'>Sold: </span>${
                                      product.sold
                                    }</div>
                                    <div class="text-button-uppercase"><span class='text-secondary2'>Available: </span>${
                                      product.quantity - product.sold
                                    }</div>
                                </div>
                            </div>
                            <div class="actions flex items-center gap-3 mt-4">
                                <div class="quick-view-btn text-button-uppercase px-5 py-2 text-center rounded-full duration-300 bg-white border border-line hover:bg-black hover:text-white">Quick View</div>
                                <div class="add-cart-btn text-button-uppercase px-5 py-2 text-center rounded-full duration-500 bg-black text-white hover:opacity-90">Add To Cart</div>
                            </div>
                        </div>
                    </div>`;
      }
      productList.appendChild(productItem);
    });
  }

  function handleFiltersChange() {
    /* ... same as before ... */
  }
  function addEventListenersToFilters() {
    /* ... same as before ... */
  }
  function renderPagination(products = []) {
    /* ... same as before ... */
  }

  // Initial fetch of products
  fetchProducts();
}
