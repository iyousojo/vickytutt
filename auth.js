// --- LOGIN LOGIC ---
const signInForm = document.getElementById('signInForm');
if (signInForm) {
    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const response = await fetch('https://ecommerceapi-f6ep.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Save Token and User Object (with firstName and default_size)
                localStorage.setItem('vicky_token', data.token);
                localStorage.setItem('vicky_user', JSON.stringify(data.user));
                
                // REDIRECT TO HOME PAGE
                window.location.href = 'index.html';
            } else {
                alert(data.message || "Invalid Credentials");
            }
        } catch (err) {
            console.error("Login Error:", err);
            alert("Connection error. Please try again.");
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