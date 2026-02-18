// fetch.js
const API_URL = 'https://ecommerceapi-f6ep.onrender.com/api';

// fetch.js
async function fetchAllProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        // Log this to your console so you can see the real structure!
        console.log("Products API Response:", data); 
        return data; 
    } catch (error) {
        console.error("Fetch failed:", error);
        return [];
    }
}

async function fetchAllOrders() {
    const token = localStorage.getItem('vicky_admin_token');
    try {
        const response = await fetch(`${API_URL}/admin/orders`, { 
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (response.ok) return { success: true, data: data.data || data };
        return { success: false, message: data.message || "Access Denied" };
    } catch (error) {
        return { success: false, message: "Server connection failed" };
    }
}

function logoutAdmin() {
    localStorage.clear();
    window.location.replace('adminlogin.html');
}