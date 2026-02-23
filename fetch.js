const IMG_PREFIX = "https://ecommerceapi-f6ep.onrender.com"; // Removed the trailing slash

async function fetchAllProducts() {
    try {
        // Now this results in ...com/api/products correctly
        const response = await fetch(`${IMG_PREFIX}/api/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (e) {
        console.error("Fetch Error:", e);
        return { data: [] };
    }
}

const fixImg = (path) => {
    if (!path) return 'https://via.placeholder.com/400';
    if (path.startsWith('http')) return path;
    
    // Ensure we don't have double slashes when joining
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${IMG_PREFIX}/${cleanPath}`;
};