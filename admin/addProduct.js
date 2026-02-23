document.getElementById('addProductForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    
    btn.innerText = "Uploading to Cloudinary...";
    btn.disabled = true;

    const token = localStorage.getItem('vicky_admin_token');
    if (!token) {
        alert("Session expired. Please login again.");
        window.location.href = 'adminlogin.html';
        return;
    }

    const fd = new FormData();
    fd.append('name', document.getElementById('pName').value);
    fd.append('price', document.getElementById('pPrice').value);
    fd.append('category', document.getElementById('pCategory').value);
    fd.append('isNewArrival', document.getElementById('pNewArrival').checked);
    fd.append('size', document.getElementById('pSize').value);
    fd.append('stock', document.getElementById('pStock').value);
    
    const imageFile = document.getElementById('imageInput').files[0];
    if (imageFile) {
        fd.append('image', imageFile);
    }

    try {
       // In addProduct.js, change this line:
const response = await fetch(`${API_URL}/products`, { // REMOVE '/admin'
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: fd
});

        // 1. First, check the Content-Type header to see if it's actually JSON
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            const res = await response.json();

            if (response.ok) {
                alert("✨ Product Added Successfully!");
                window.location.href = 'adminproduct.html'; 
            } else {
                // This handles errors sent by your API (e.g., 401, 403, 400)
                alert("Upload failed: " + (res.message || "Unknown error"));
            }
        } else {
            // 2. If it's NOT JSON, it's likely an HTML error page from Render or Express
            const errorText = await response.text();
            console.error("Server returned HTML instead of JSON:", errorText);
            
            if (response.status === 404) {
                alert("Error: The endpoint /api/admin/products was not found. Please check your route path.");
            } else {
                alert(`Server Error (${response.status}): The server sent back an HTML page instead of a message.`);
            }
        }

    } catch (err) {
        console.error("Network or Parsing error:", err);
        alert("Connection lost or check the console for details.");
    } finally {
        btn.innerText = "Add Product";
        btn.disabled = false;
    }
};

// Image Preview
document.getElementById('imageInput').onchange = function() {
    const preview = document.getElementById('imagePreview');
    const file = this.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
};