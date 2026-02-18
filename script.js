let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize core data
    handleUserAuth();
    loadPageData();
    
    // 2. Mobile Menu / Sidebar Logic
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents the 'document click' below from closing it instantly
            navLinks.classList.toggle('active');
            
            // Toggle icon between bars and X
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });

        // Close menu when a link inside is clicked (useful for one-page navigation)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
            });
        });
    }

    // 3. Close everything (sidebar & user dropdown) when clicking outside
    document.addEventListener('click', (e) => {
        // Close Sidebar
        if (navLinks && navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
            navLinks.classList.remove('active');
            menuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
        }
        
        // Close User Dropdown
        const dropdown = document.getElementById('userDropdown');
        if (dropdown && dropdown.classList.contains('active')) {
            dropdown.classList.remove('active');
        }
    });
});

// ... (Rest of your loadPageData, handleUserAuth, and addToBag functions remain the same)

async function loadPageData() {
    const shopGrid = document.getElementById('product-grid');
    const arrivalsGrid = document.getElementById('new-arrivals-grid');
    const categoryMenu = document.getElementById('category-dropdown');
    const viewMoreBtn = document.getElementById('view-more-btn');

    try {
        const response = await fetchAllProducts();
        let products = response?.data;

        if (products && products.data) products = products.data;

        if (!products || products.length === 0) {
            const msg = `<div class="empty-state-msg">Collection currently empty.</div>`;
            if (shopGrid) shopGrid.innerHTML = msg;
            if (arrivalsGrid) arrivalsGrid.innerHTML = msg;
            return;
        }

        allProducts = products;

        // 1. Render Categories
        if (categoryMenu) {
            const cats = [...new Set(products.map(i => i.category))].filter(Boolean);
            categoryMenu.innerHTML = `<a href="sections.html">All Items</a>` +
                cats.map(c => `<a href="sections.html?cat=${encodeURIComponent(c)}">${c}</a>`).join('');
        }

        // 2. Render New Arrivals
        if (arrivalsGrid) {
            const newArrivals = allProducts.filter(item => item.isNewArrival === true || item.isNewArrival === "true");
            if (newArrivals.length === 0) {
                arrivalsGrid.innerHTML = `<p class="empty-state-msg" style="grid-column: 1/-1;">Check back soon for new pieces!</p>`;
            } else {
                arrivalsGrid.innerHTML = newArrivals.slice(0, 3).map(item => `
                    <div class="wardrobe-item">
                        <img src="${fixImg(item.imageUrl || item.image)}" alt="${item.name}">
                        <div class="item-overlay" onclick="location.href='sections.html?item=${item._id}'">
                            <span>View Detail</span>
                        </div>
                    </div>
                `).join('');
            }
        }

        // 3. Render Shop Grid
        if (shopGrid) {
            const standardProducts = allProducts.filter(item => !item.isNewArrival || item.isNewArrival === "false" || item.isNewArrival === false);
            const displayItems = standardProducts.length > 0 ? standardProducts.slice(0, 8) : allProducts.slice(0, 8);

            shopGrid.innerHTML = displayItems.map(item => `
                <div class="shop-card">
                    <div class="shop-img-wrapper">
                        <img src="${fixImg(item.imageUrl || item.image)}" alt="${item.name}">
                        <div class="cart-overlay">
                            <button class="add-btn" onclick="addToBag('${item._id}')">Add to Cart</button>
                        </div>
                    </div>
                    <div class="shop-info">
                        <p class="brand-tag">VICKY'S THRIFT</p>
                        <h4 class="product-name">${item.name}</h4>
                        <p class="product-price">₦${Number(item.price).toLocaleString()}</p>
                    </div>
                </div>
            `).join('');
        }

        if (viewMoreBtn && products.length > 8) {
            viewMoreBtn.classList.remove('hidden');
        }

    } catch (e) {
        console.error("Load Error:", e);
        if (shopGrid) shopGrid.innerHTML = `<div class="empty-state-msg">Store temporarily unavailable.</div>`;
    }
}

function handleUserAuth() {
    const userBtn = document.getElementById('userIconBtn');
    const dropdown = document.getElementById('userDropdown');
    const nameDisplay = document.getElementById('userNameDisplay');
    const userData = localStorage.getItem('vicky_user');

    if (userData) {
        const user = JSON.parse(userData);
        nameDisplay.innerText = user.firstName || "Customer";
        userBtn.removeAttribute('href');
        userBtn.style.cursor = 'pointer';

        userBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => dropdown.classList.remove('active'));
    }
}

function addToBag(productId) {
    const token = localStorage.getItem('vicky_token');
    if (!token) {
        alert("Please login first.");
        window.location.href = 'signupform.html';
        return;
    }
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('vicky_cart') || '[]');
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product._id,
            name: product.name,
            price: product.price,
            image: fixImg(product.imageUrl || product.image),
            quantity: 1
        });
    }
    localStorage.setItem('vicky_cart', JSON.stringify(cart));
    alert(`${product.name} added to bag!`);
}

function logoutUser() {
    localStorage.removeItem('vicky_token');
    localStorage.removeItem('vicky_user');
    window.location.reload();
}

async function initiateCheckout() {
    const cart = JSON.parse(localStorage.getItem('vicky_cart'));
    if (!cart || cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const items = cart.map(item => ({
        productId: item.id,
        qty: item.quantity
    }));

    try {
        const response = await fetch('https://ecommerceapi-f6ep.onrender.com/api/orders/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('vicky_token')}`
            },
            body: JSON.stringify({ items })
        });

        const data = await response.json();
        if (data.paymentUrl) {
            window.location.href = data.paymentUrl;
        } else {
            throw new Error(data.error || "Unknown error");
        }
    } catch (err) {
        console.error("Checkout Failed:", err);
        alert("Checkout error: " + err.message);
    }
}