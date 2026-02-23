const IMG_PREFIX = "https://ecommerceapi-f6ep.onrender.com/";

async function fetchAllProducts() {
    try {
        const response = await fetch(`${IMG_PREFIX}/api/products`);
        return await response.json();
    } catch (e) {
        console.error("Fetch Error:", e);
        return { data: [] };
    }
}

const fixImg = (path) => {
    if (!path) return 'https://via.placeholder.com/400';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${IMG_PREFIX}/${cleanPath}`;
};