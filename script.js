let allProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. MOBILE SIDEBAR LOGIC ---
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents immediate closing from the document listener
            navLinks.classList.toggle('active');
            
            // Toggle icon between bars and X
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });

        // Close sidebar when clicking anywhere outside of it
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                if (icon) icon.classList.replace('fa-times', 'fa-bars');
            }
        });
    }

    // --- 2. AUTH & SESSION CLEANUP ---
    const rawUser = localStorage.getItem('vicky_user');
    if (rawUser && (rawUser.includes('userName') || rawUser === "undefined")) {
        console.log("Cleaning old data format...");
        localStorage.removeItem('vicky_user');
    }

    handleUserAuth(); 
    await syncUserSession();
    loadPageData();

    // --- 3. USER DROPDOWN TOGGLE ---
    const userIconBtn = document.getElementById('userIconBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userIconBtn && userDropdown) {
        userIconBtn.addEventListener('click', (e) => {
            const token = localStorage.getItem('vicky_token');
            if (token) {
                e.preventDefault();
                userDropdown.classList.toggle('active');
            }
        });
    }
});

// --- API HELPERS ---

async function fetchAllProducts() {
    const response = await fetch('https://ecommerceapi-f6ep.onrender.com/api/products');
    return await response.json();
}

async function syncUserSession() {
    const token = localStorage.getItem('vicky_token');
    if (!token) return;

    try {
        const response = await fetch('https://ecommerceapi-f6ep.onrender.com/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('vicky_user', JSON.stringify(data.user));
            handleUserAuth();
        }
    } catch (err) {
        console.warn("Sync failed, using cache.");
    }
}

// --- UI RENDERING ---

function handleUserAuth() {
    const token = localStorage.getItem('vicky_token');
    const rawUser = localStorage.getItem('vicky_user');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (token && rawUser && rawUser !== "undefined" && userNameDisplay) {
        try {
            const user = JSON.parse(rawUser);
            const name = user.firstName || "Member";
            const size = user.default_size || "N/A";

            userNameDisplay.innerHTML = `
                <span style="font-weight: bold; color: #2D1B14; text-transform: uppercase;">${name}</span>
                <br> 
                <span style="font-size: 0.75rem; color: #D1B3FF; font-weight: 900;">SIZE: ${size}</span>
            `;
            
            const userIconBtn = document.getElementById('userIconBtn');
            if(userIconBtn) userIconBtn.href = "javascript:void(0)"; 
        } catch (e) {
            console.error("JSON Parse Error", e);
        }
    }
}

async function loadPageData() {
    const shopGrid = document.getElementById('product-grid');
    const newArrivalsGrid = document.getElementById('new-arrivals-grid');
    if (!shopGrid) return;

    const rawUser = localStorage.getItem('vicky_user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    const preferredSize = user ? user.default_size : null;

    try {
        const response = await fetchAllProducts(); 
        let products = response?.data || response;

        if (!Array.isArray(products)) return;

        // --- 1. HANDLE NEW ARRIVALS SECTION ---
        if (newArrivalsGrid) {
            const newArrivals = products.filter(item => item.isNewArrival === true);
            if (newArrivals.length > 0) {
                renderNewArrivals(newArrivals, newArrivalsGrid);
            } else {
                newArrivalsGrid.innerHTML = '<p class="empty-state-msg">New pieces coming soon!</p>';
            }
        }

        // --- 2. HANDLE MAIN SHOP GRID (Size Filtering) ---
        if (preferredSize && preferredSize !== "N/A") {
            const userSz = normalizeSize(preferredSize);
            allProducts = products.filter(item => {
                const itemSize = item.size || (item.variants && item.variants[0]?.size);
                return normalizeSize(itemSize) === userSz;
            });
            // If no products match the user's size, show all products instead of an empty screen
            if (allProducts.length === 0) allProducts = products;
        } else {
            allProducts = products;
        }

        renderProducts(allProducts, shopGrid);
    } catch (e) {
        console.error("Load Error:", e);
    }
}

// Separate render function for the New Arrivals gallery (Lifestyle section)
function renderNewArrivals(products, container) {
    container.innerHTML = products.map(item => `
        <div class="wardrobe-item">
            <img src="${item.imageUrl || item.image || 'placeholder.jpg'}" alt="${item.name}">
            <div class="wardrobe-overlay">
                <div class="wardrobe-info">
                    <span class="category-tag">${item.category || 'Luxury'}</span>
                    <h3>${item.name}</h3>
                    <button class="btn-shop-now" onclick="addToBag('${item._id}')">Add to Bag</button>
                </div>
            </div>
        </div>
    `).join('');
}
function renderProducts(products, container) {
    if (!container) return;
    
    const rawUser = localStorage.getItem('vicky_user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    const userPreferredSize = user ? normalizeSize(user.default_size) : null;

    container.innerHTML = products.map(item => {
        const itemSize = item.size || (item.variants && item.variants[0]?.size);
        const normalizedItemSize = normalizeSize(itemSize);
        
        const totalStock = item.variants 
            ? item.variants.reduce((sum, v) => sum + v.stock, 0) 
            : (item.stock || 0);
        
        const isSoldOut = totalStock <= 0;
        
        const sizeMismatch = userPreferredSize && 
                             userPreferredSize !== "N/A" && 
                             userPreferredSize !== "OS" && 
                             normalizedItemSize !== userPreferredSize;

        return `
            <div class="shop-card ${isSoldOut ? 'sold-out-fade' : ''}">
                <div class="shop-img-wrapper">
                    <div class="size-badge">${normalizedItemSize}</div>
                    ${isSoldOut ? '<div class="out-of-stock-badge">SOLD OUT</div>' : ''}
                    <img src="${item.imageUrl || item.image || 'placeholder.jpg'}" 
                         alt="${item.name}" 
                         style="${isSoldOut ? 'filter: grayscale(1);' : ''}">
                    <div class="cart-overlay">
                        <button class="add-btn" 
                                onclick="addToBag('${item._id}')" 
                                ${isSoldOut ? 'disabled' : ''}>
                            ${isSoldOut ? 'Unavailable' : 'Add to Bag'}
                        </button>
                    </div>
                </div>
                <div class="shop-info">
                    <p class="brand-tag">VICKY'S LUXURY</p>
                    <h4 class="product-name">${item.name}</h4>
                    <p class="product-price">₦${Number(item.price).toLocaleString()}</p>
                    ${sizeMismatch ? 
                        `<p style="color: #d35400; font-size: 0.7rem; font-weight: bold; margin-top: 5px;">
                            <i class="fa-solid fa-circle-info"></i> NOT YOUR SIZE (${userPreferredSize})
                         </p>` : ''
                    }
                </div>
            </div>`;
    }).join('');
}
// Function to fetch unique categories from the products API
async function fetchCategories() {
    try {
        const response = await fetch('https://ecommerceapi-f6ep.onrender.com/api/products');
        const data = await response.json();
        const products = data?.data || data;

        if (Array.isArray(products)) {
            // Extract unique categories and filter out nulls/undefined
            const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
            renderCategoryDropdown(categories);
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
        const container = document.getElementById('category-dropdown');
        if (container) container.innerHTML = '<a href="#">Error loading categories</a>';
    }
}

// Function to render the categories into the HTML
function renderCategoryDropdown(categories) {
    const container = document.getElementById('category-dropdown');
    if (!container) return;

    // Start with the "All Collections" option
    let html = `<a href="#" onclick="filterByCategory('all')">All Collections</a>`;

    // Map through unique categories and create links
    html += categories.map(cat => `
        <a href="#" onclick="filterByCategory('${cat}')">${cat}</a>
    `).join('');

    container.innerHTML = html;
}

// Optional: Function to handle the actual filtering logic
async function filterByCategory(category) {
    const shopGrid = document.getElementById('product-grid');
    if (!shopGrid) return;

    shopGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Filtering...</p>';

    try {
        const response = await fetchAllProducts();
        let products = response?.data || response;

        if (category !== 'all') {
            products = products.filter(p => p.category === category);
        }

        renderProducts(products, shopGrid);
    } catch (e) {
        console.error("Filtering error:", e);
    }
}

// Call fetchCategories when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
});

function normalizeSize(rawSize) {
    if (!rawSize || rawSize === "null") return "OS";
    const s = rawSize.toString().trim().toUpperCase();
    const map = { 'SMALL': 'S', 'MEDIUM': 'M', 'LARGE': 'L', 'EXTRA LARGE': 'XL' };
    return map[s] || s;
}

// --- ADD TO BAG LOGIC ---
function addToBag(productId) {
    // 1. Get existing cart or initialize empty array
    let cart = JSON.parse(localStorage.getItem('vicky_cart')) || [];
    
    // 2. Find if product is already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Find product details from our global allProducts array
        const product = allProducts.find(p => p._id === productId);
        if (product) {
            cart.push({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.imageUrl || product.image,
                size: product.size || (product.variants && product.variants[0]?.size),
                quantity: 1
            });
        }
    }

    // 3. Save back to localStorage
    localStorage.setItem('vicky_cart', JSON.stringify(cart));
    
    // 4. Feedback to user
    alert("Item added to your bag!");
    
    // Optional: Refresh cart count icon if you have one
    // updateCartCount(); 
}

// --- UPDATED LOAD PAGE DATA ---
async function loadPageData() {
    const shopGrid = document.getElementById('product-grid');
    const newArrivalsGrid = document.getElementById('new-arrivals-grid');
    if (!shopGrid) return;

    try {
        const response = await fetchAllProducts(); 
        let products = response?.data || response;
        if (!Array.isArray(products)) return;

        // Store globally so addToBag can find details
        allProducts = products;

        // --- Handle New Arrivals Section ---
        if (newArrivalsGrid) {
            const newArrivals = products.filter(item => item.isNewArrival === true);
            if (newArrivals.length > 0) {
                renderNewArrivals(newArrivals, newArrivalsGrid);
            } else {
                newArrivalsGrid.innerHTML = '<p class="empty-state-msg">New pieces coming soon!</p>';
            }
        }

        // --- Handle Main Shop Grid ---
        const rawUser = localStorage.getItem('vicky_user');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const preferredSize = user ? user.default_size : null;

        let filteredProducts = products;
        if (preferredSize && preferredSize !== "N/A") {
            const userSz = normalizeSize(preferredSize);
            filteredProducts = products.filter(item => {
                const itemSize = item.size || (item.variants && item.variants[0]?.size);
                return normalizeSize(itemSize) === userSz;
            });
            if (filteredProducts.length === 0) filteredProducts = products;
        }

        renderProducts(filteredProducts, shopGrid);
    } catch (e) {
        console.error("Load Error:", e);
    }
}

// Ensure the New Arrivals use the same button logic
function renderNewArrivals(products, container) {
    container.innerHTML = products.map(item => `
        <div class="wardrobe-item">
            <img src="${item.imageUrl || item.image || 'placeholder.jpg'}" alt="${item.name}">
            <div class="wardrobe-overlay">
                <div class="wardrobe-info">
                    <span class="category-tag">${item.category || 'Luxury'}</span>
                    <h3>${item.name}</h3>
                    <p style="color:white; margin-bottom:10px;">₦${Number(item.price).toLocaleString()}</p>
                    <button class="btn-shop-now" onclick="addToBag('${item._id}')">Add to Bag</button>
                </div>
            </div>
        </div>
    `).join('');
}

function logoutUser() {
    localStorage.clear();
    window.location.href = 'index.html';
}