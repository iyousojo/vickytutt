document.addEventListener('DOMContentLoaded', () => {
    loadProductsPage();
    
    // Sidebar Toggle
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
        menuBtn.onclick = () => {
            document.getElementById('sidebar').classList.toggle('active');
        };
    }
});

async function loadProductsPage() {
    const container = document.getElementById('productListContainer');
    // Using API_URL from fetch.js or fallback
    const base_url = typeof API_URL !== 'undefined' ? API_URL.replace('/api', '') : "https://ecommerceapi-f6ep.onrender.com";
    
    try {
        const res = await fetchAllProducts();
        
        // Handle nested data structures: { success: true, data: [...] } or { products: [...] }
        let products = res.data || res.products || (Array.isArray(res) ? res : []);

        if (products.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; margin-top: 50px; grid-column: 1/-1;">
                    <h2>Your inventory is empty</h2>
                    <p>Please add products to see them here.</p>
                    <a href="adminorder.html" class="btn" style="text-decoration:none; display:inline-block; margin-top:10px; background:#000; color:#fff; padding:10px 20px; border-radius:5px;">➕ Add Your First Product</a>
                </div>`;
            return;
        }

       container.innerHTML = products.map(p => {
    const imgPath = p.image_url || p.imageUrl || '';
    const imageSrc = imgPath.startsWith('http') ? imgPath : `${API_BASE}${imgPath}`;

    return `
        <div class="product-row">
            <img src="${imageSrc}" alt="${p.name}" onerror="this.src='placeholder.jpg'"/>
            
            <div class="product-details">
                <h4>${p.name}</h4>
                <p>${p.category || 'General'}</p>
            </div>

            <div class="product-price">
                ₦${Number(p.price).toLocaleString()}
            </div>

            <button class="btn-delete-small" onclick="deleteItem('${p._id}')">
                Delete
            </button>
        </div>
    `;
}).join('');

    } catch (err) {
        console.error("Render Error:", err);
        container.innerHTML = `<p style="color: red; text-align: center; grid-column: 1/-1;">Error loading products. Please try again.</p>`;
    }
}

// Keep this function outside DOMContentLoaded so HTML 'onclick' can find it!
async function deleteItem(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const token = localStorage.getItem('vicky_admin_token');
    
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const res = await response.json();

        if (response.ok) {
            alert("🗑️ Product deleted successfully!");
            loadProductsPage(); // Refresh list without reloading whole page
        } else {
            alert("Delete failed: " + (res.message || "Unauthorized"));
        }
    } catch (err) {
        console.error("Delete Error:", err);
        alert("Failed to connect to the server.");
    }
}