document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Check
    const token = localStorage.getItem('vicky_admin_token');
    if (!token) return window.location.replace('adminlogin.html');

    // 2. Sidebar Toggle
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    if (menuBtn && sidebar) {
        menuBtn.onclick = () => sidebar.classList.toggle('active');
    }

    // 3. Load Stats
    try {
        const [products, orders] = await Promise.all([
            fetchAllProducts(),
            fetchAllOrders()
        ]);

        // --- FIXED PRODUCT LOGIC ---
        if (products) {
            // Handle different API response structures safely
            const productArray = products.products || products.data || (Array.isArray(products) ? products : []);
            document.getElementById('stat-products').innerText = productArray.length;
        }

        // --- FIXED ORDER LOGIC ---
        if (orders && orders.success) {
            const orderData = orders.data || [];
            document.getElementById('stat-orders').innerText = orderData.length;
            
            const revenue = orderData
                .filter(o => o.status === 'paid')
                .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
            
            document.getElementById('stat-revenue').innerText = `₦${revenue.toLocaleString()}`;

            const container = document.getElementById('recent-orders-container');
            if (container) {
                container.innerHTML = '<h4>Recent Orders</h4>' + orderData.slice(0, 5).map(o => `
                    <div class="order-item" style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                        <span>#${o._id.slice(-5).toUpperCase()}</span>
                        <span>₦${Number(o.totalAmount || 0).toLocaleString()}</span>
                        <span class="status ${o.status}">${o.status}</span>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        console.error("Dashboard failed to load stats:", err);
    }
});

// Global Logout function
function logoutAdmin() {
    localStorage.clear();
    window.location.replace('adminlogin.html');
}