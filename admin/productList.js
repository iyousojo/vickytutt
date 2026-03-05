document.addEventListener('DOMContentLoaded', () => {
    loadProductsPage();
    
    // Sidebar Toggle
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
        menuBtn.onclick = () => {
            const sidebar = document.getElementById('sidebar');
            if(sidebar) sidebar.classList.toggle('active');
        };
    }
});

async function loadProductsPage() {
    const container = document.getElementById('productListContainer');
    
    try {
        // fetchAllProducts() should be defined in fetch.js
        const res = await fetchAllProducts();
        
        // Handle nested data structures
        let products = res.data || res.products || (Array.isArray(res) ? res : []);

        if (products.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; margin-top: 50px; grid-column: 1/-1;">
                    <h2 style="color: #333;">Your inventory is empty</h2>
                    <p style="color: #777;">Please add products to see them here.</p>
                    <a href="adminorder.html" class="btn" style="text-decoration:none; display:inline-block; margin-top:10px; background:#d4af37; color:#fff; padding:12px 25px; border-radius:4px; font-weight:600;">➕ Add Your First Product</a>
                </div>`;
            return;
        }

        container.innerHTML = products.map(p => {
            // Image handling (Cloudinary or Local)
            const imgPath = p.image_url || p.imageUrl || p.image || '';
            const imageSrc = imgPath.startsWith('http') ? imgPath : `${API_BASE}${imgPath}`;

            // Stock Styling Logic
            const isOutOfStock = Number(p.stock) <= 0;
            const stockColor = isOutOfStock ? '#e74c3c' : (Number(p.stock) < 5 ? '#f39c12' : '#27ae60');

            return `
                <div class="product-row" style="display: grid; grid-template-columns: 80px 2fr 1fr 1fr 1fr auto; gap: 15px; align-items: center; background: white; padding: 15px; border-bottom: 1px solid #eee;">
                    <img src="${imageSrc}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://via.placeholder.com/60?text=No+Img'"/>
                    
                    <div class="product-details">
                        <h4 style="margin: 0; font-size: 1rem;">${p.name}</h4>
                        <small style="color: #888; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 1px;">${p.category || 'General'}</small>
                    </div>

                    <div class="product-size">
                        <span style="background: #f0f0f0; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; border: 1px solid #ddd;">
                            ${p.size || 'N/A'}
                        </span>
                    </div>

                    <div class="product-stock" style="color: ${stockColor}; font-weight: 600; font-size: 0.9rem;">
                        ${isOutOfStock ? 'SOLD OUT' : p.stock + ' in stock'}
                    </div>

                    <div class="product-price" style="font-weight: 700; color: #121212;">
                        ₦${Number(p.price).toLocaleString()}
                    </div>

                    <button class="btn-delete-small" onclick="deleteItem('${p._id}')" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-weight: 600; font-size: 0.85rem;">
                        <i class="fa-solid fa-trash-can"></i> Delete
                    </button>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error("Render Error:", err);
        container.innerHTML = `<p style="color: red; text-align: center; grid-column: 1/-1; padding: 40px;">Error connecting to the collection. Please refresh the page.</p>`;
    }
}

// Global Delete Function
async function deleteItem(id) {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

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
            alert("🗑️ Product removed from inventory.");
            loadProductsPage(); // Refresh the UI
        } else {
            alert("Delete failed: " + (res.message || "Unauthorized access"));
        }
    } catch (err) {
        console.error("Delete Error:", err);
        alert("Failed to connect to the server. Check your internet connection.");
    }
}