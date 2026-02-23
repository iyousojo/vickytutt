let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    handleUserAuth();
    loadPageData();
    
    // Mobile Menu & Click-outside logic remains unchanged...
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.querySelector('.nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            navLinks.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }
});
function handleUserAuth() {
    const token = localStorage.getItem('vicky_token');
    // You named it userName here...
    const userName = localStorage.getItem('vicky_user_name'); 
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (token && userNameDisplay) {
        // ...so you must use userName here (not savedName)
        userNameDisplay.innerText = userName || "Welcome Back!";
    } else {
        if(userNameDisplay) userNameDisplay.innerText = "Guest User";
    }
}
async function loadPageData() {
    const shopGrid = document.getElementById('product-grid');
    const arrivalsGrid = document.getElementById('new-arrivals-grid');
    const categoryMenu = document.getElementById('category-dropdown');

    try {
        const response = await fetchAllProducts();
        let products = response?.data?.data || response?.data || response;

        if (!products || products.length === 0) {
            const msg = `<div class="empty-state-msg">Collection currently empty.</div>`;
            if (shopGrid) shopGrid.innerHTML = msg;
            return;
        }

        allProducts = products;

        // Render Shop Grid with Stock Check
        if (shopGrid) {
            shopGrid.innerHTML = allProducts.slice(0, 8).map(item => {
                // Check if any variant has stock
                const totalStock = item.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                const isSoldOut = totalStock <= 0;

                return `
                <div class="shop-card ${isSoldOut ? 'sold-out' : ''}">
                    <div class="shop-img-wrapper">
                        <img src="${fixImg(item.imageUrl || item.image)}" alt="${item.name}">
                        ${isSoldOut ? '<div class="out-of-stock-badge">Sold Out</div>' : ''}
                        <div class="cart-overlay">
                            ${isSoldOut 
                                ? `<button class="add-btn disabled" disabled>Out of Stock</button>` 
                                : `<button class="add-btn" onclick="addToBag('${item._id}')">Add to Cart</button>`
                            }
                        </div>
                    </div>
                    <div class="shop-info">
                        <p class="brand-tag">VICKY'S THRIFT</p>
                        <h4 class="product-name">${item.name}</h4>
                        <p class="product-price">₦${Number(item.price).toLocaleString()}</p>
                    </div>
                </div>`;
            }).join('');
        }
    } catch (e) {
        console.error("Load Error:", e);
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

    // 1. Get variant and stock
    const variant = product.variants?.[0] || null;
    const defaultSize = variant ? variant.size : "N/A";
    const availableStock = variant ? variant.stock : 0;

    // 2. Check local cart
    let cart = JSON.parse(localStorage.getItem('vicky_cart') || '[]');
    const existing = cart.find(item => item.id === productId && item.size === defaultSize);
    const currentQtyInCart = existing ? existing.quantity : 0;

    // 3. Validation
    if (currentQtyInCart >= availableStock) {
        alert(`Limit Reached: Only ${availableStock} items available in size ${defaultSize}.`);
        return;
    }

    // 4. Update Cart
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
    alert(`${product.name} added to bag!`);
}

async function initiateCheckout() {
    const token = localStorage.getItem('vicky_token');
    const cart = JSON.parse(localStorage.getItem('vicky_cart')) || [];
    
    if (cart.length === 0) return alert("Your bag is empty!");

    // Map items for backend
    const items = cart.map(item => ({
        productId: item.id,
        name: item.name,
        size: item.size,
        qty: item.quantity,
        price: item.price
    }));

    try {
        const response = await fetch('https://ecommerceapi-f6ep.onrender.com/api/orders/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items })
        });

        const data = await response.json();
        
        if (response.ok && data.paymentUrl) {
            window.location.href = data.paymentUrl;
        } else {
            // This captures backend stock validation errors
            alert(data.message || "Checkout failed. Some items may have gone out of stock.");
        }
    } catch (err) {
        console.error("Checkout Failed:", err);
    }
}function fixImg(url) {
    if (!url) return 'https://via.placeholder.com/300'; // Fallback image
    if (url.startsWith('http')) return url;
    return `https://ecommerceapi-f6ep.onrender.com/${url}`;
}