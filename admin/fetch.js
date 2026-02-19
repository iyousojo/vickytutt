// fetch.js
const API_URL = 'https://ecommerceapi-f6ep.onrender.com/api';

async function loginUser(email, password) {
    try {
        // CHANGED: Using the consistent API_URL instead of the old vickys-thrift URL
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.message || "Login failed" };
        }

        return { success: true, user: data.user, token: data.token };
    } catch (error) {
        // This triggers if the server is down or blocked by CORS
        console.error("Fetch error:", error);
        return { success: false, error: "Cannot connect to server. Check your internet or backend status." };
    }
}

async function fetchAllProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
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