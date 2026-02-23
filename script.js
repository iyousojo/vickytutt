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
            e.stopPropagation(); 
            navLinks.classList.toggle('active');
            
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
            });
        });
    }

    // 3. Close everything (sidebar & user dropdown) when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks && navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
            navLinks.classList.remove('active');
            menuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
        }
        
        const dropdown = document.getElementById('userDropdown');
        if (dropdown && dropdown.classList.contains('active')) {
            dropdown.classList.remove('active');
        }
    });
});

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

        if (categoryMenu) {
            const cats = [...new Set(products.map(i => i.category))].filter(Boolean);
            categoryMenu.innerHTML = `<a href="sections.html">All Items</a>` +
                cats.map(c => `<a href="sections.html?cat=${encodeURIComponent(c)}">${c}</a>`).join('');
        }

        if (arrivalsGrid) {
            const newArrivals = allProducts.filter(item => item.isNewArrival === true || String(item.isNewArrival) === "true");
            if (newArrivals.length === 0) {
                arrivalsGrid.innerHTML = `<p class="empty-state-msg" style="grid-column: 1/-1;">Check back soon!</p>`;
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

        if (shopGrid) {
            const standardProducts = allProducts.filter(item => !item.isNewArrival || String(item.isNewArrival) === "false");
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
        if (nameDisplay) nameDisplay.innerText = user.firstName || "Customer";
        if (userBtn) {
            userBtn.removeAttribute('href');
            userBtn.style.cursor = 'pointer';
            userBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dropdown) dropdown.classList.toggle('active');
            });
        }
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

    // 1. Identify the variant (size) and its available stock
    const variant = product.variants && product.variants.length > 0 
        ? product.variants[0] 
        : null;

    const defaultSize = variant ? variant.size : "N/A";
    const availableStock = variant ? variant.stock : 0;

    // 2. Load the current cart
    let cart = JSON.parse(localStorage.getItem('vicky_cart') || '[]');
    const existing = cart.find(item => item.id === productId && item.size === defaultSize);

    // 3. CHECK STOCK LIMITS
    const currentQtyInCart = existing ? existing.quantity : 0;

    if (currentQtyInCart >= availableStock) {
        alert(`Sorry, only ${availableStock} items are available in size ${defaultSize}.`);
        return; // Stop here, do not add more
    }

    // 4. Update or Push to Cart
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product._id,
            name: product.name,
            price: product.price,
            image: fixImg(product.imageUrl || product.image),
            size: defaultSize,
            quantity: 1
        });
    }

    localStorage.setItem('vicky_cart', JSON.stringify(cart));
    alert(`${product.name} (Size: ${defaultSize}) added to bag!`);
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

    // Map cart items to include Name and Size for the Order Record
    const items = cart.map(item => ({
        productId: item.id,
        name: item.name,      // IMPORTANT
        size: item.size,      // IMPORTANT
        qty: item.quantity,
        price: item.price
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
        if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
        } else {
            alert("Checkout Error: " + (data.message || "Could not init payment"));
        }
    } catch (err) {
        console.error("Checkout Failed:", err);
    }
}