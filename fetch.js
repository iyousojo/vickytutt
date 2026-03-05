const IMG_PREFIX = "https://ecommerceapi-f6ep.onrender.com"; //[cite: 5]

async function fetchAllProducts() {
    try {
        const response = await fetch(`${IMG_PREFIX}/api/products`); // Corrected path
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error("Fetch Error:", e);
        return [];
    }
}