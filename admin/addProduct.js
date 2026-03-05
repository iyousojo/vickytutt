document.getElementById('addProductForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    
    // Grabbing form elements
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;
    const category = document.getElementById('pCategory').value;
    const size = document.getElementById('pSize').value;
    const stock = document.getElementById('pStock').value;
    const isNewArrival = document.getElementById('pNewArrival').checked;
    const imageFile = document.getElementById('imageInput').files[0];

    // --- 1. PRE-FLIGHT VALIDATION ---
    if (!size || size === "") {
        alert("Please select a valid size for the user filter to work.");
        return;
    }

    if (!imageFile) {
        alert("Please upload a product image.");
        return;
    }

    // --- 2. PREPARE UI ---
    btn.innerText = "Uploading to Cloudinary...";
    btn.disabled = true;

    const token = localStorage.getItem('vicky_admin_token');
    if (!token) {
        alert("Session expired. Please login again.");
        window.location.href = 'adminlogin.html';
        return;
    }

    // --- 3. CONSTRUCT DATA ---
    const fd = new FormData();
    fd.append('name', name);
    fd.append('price', price);
    fd.append('category', category);
    fd.append('isNewArrival', isNewArrival);
    fd.append('size', size); // This now sends the standardized dropdown value (XS, S, M, etc.)
    fd.append('stock', stock);
    fd.append('image', imageFile);

    try {
        // Updated API_URL endpoint
        const response = await fetch(`${API_URL}/products`, { 
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fd
        });

        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            const res = await response.json();

            if (response.ok) {
                // Success feedback
                alert(`✨ Success! Item added.\nSize: ${size}\nStock: ${stock}`);
                window.location.href = 'adminproduct.html'; 
            } else {
                alert("Upload failed: " + (res.message || "Unknown error"));
            }
        } else {
            // Handle HTML errors from Render/Express
            const errorText = await response.text();
            console.error("Server Error:", errorText);
            
            if (response.status === 404) {
                alert("Error: The /products endpoint was not found. Please check your API_URL configuration.");
            } else {
                alert(`Server Error (${response.status}): The server returned a page instead of a message.`);
            }
        }

    } catch (err) {
        console.error("Network or Parsing error:", err);
        alert("The server is currently waking up or connection was lost. Please wait a moment and try again.");
    } finally {
        btn.innerText = "Add Product";
        btn.disabled = false;
    }
};

// --- IMAGE PREVIEW LOGIC ---
const imageInput = document.getElementById('imageInput');
if (imageInput) {
    imageInput.onchange = function() {
        const preview = document.getElementById('imagePreview');
        const file = this.files[0];
        
        if (file) {
            // Check file size (optional but recommended for Cloudinary: 5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert("Image is too large. Please select a file under 5MB.");
                this.value = "";
                return;
            }

            // Clean up previous preview URL to save memory
            if (preview.src) URL.revokeObjectURL(preview.src);

            preview.src = URL.createObjectURL(file);
            preview.style.display = 'block';
        }
    };
}