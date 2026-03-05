// --- LOGIN LOGIC ---
// --- LOGIN LOGIC ---
const signInForm = document.getElementById('signInForm');
if (signInForm) {
    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 1. Target the button and original text
        const loginBtn = e.target.querySelector('.brand-btn-pill');
        const originalBtnText = loginBtn.innerText;
        
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            // 2. SHOW LOADING STATE
            loginBtn.innerText = "Logging in...";
            loginBtn.disabled = true; // Disable to prevent double-clicking
            loginBtn.style.opacity = "0.7";
            loginBtn.style.cursor = "not-allowed";

            const response = await fetch('https://ecommerceapi-f6ep.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                localStorage.setItem('vicky_token', data.token);
                localStorage.setItem('vicky_user', JSON.stringify(data.user));
                
                loginBtn.innerText = "Redirecting...";
                window.location.href = 'index.html';
            } else {
                // Error from Server
                alert(data.message || "Invalid Credentials");
                
                // 3. RESET BUTTON ON ERROR
                loginBtn.innerText = originalBtnText;
                loginBtn.disabled = false;
                loginBtn.style.opacity = "1";
                loginBtn.style.cursor = "pointer";
            }
        } catch (err) {
            console.error("Login Error:", err);
            alert("Connection error. Please try again.");
            
            // 3. RESET BUTTON ON CONNECTION ERROR
            loginBtn.innerText = originalBtnText;
            loginBtn.disabled = false;
            loginBtn.style.opacity = "1";
            loginBtn.style.cursor = "pointer";
        }
    });
}

// --- SIGNUP LOGIC ---
const signUpForm = document.getElementById('signUpForm');
if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData);

        try {
            const response = await fetch('https://ecommerceapi-f6ep.onrender.com/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                // Show the success modal you have in your HTML
                document.getElementById('successModal').classList.remove('hidden');
            } else {
                const error = await response.json();
                alert(error.message || "Registration failed");
            }
        } catch (err) {
            console.error("Signup Error:", err);
        }
    });
}