const AUTH_URL = 'https://ecommerceapi-f6ep.onrender.com/api/auth';

window.onload = () => {
    console.log("Auth System Initialized...");

    // --- 1. SIGN UP LOGIC ---
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Sign Up Form Clicked!"); // Debugging check

            const btn = signUpForm.querySelector('button');
            btn.innerText = "Creating Account...";

            const formData = {
                firstName: signUpForm.querySelector('[name="firstName"]').value,
                email: signUpForm.querySelector('[name="email"]').value,
                password: signUpForm.querySelector('[name="password"]').value,
                default_size: signUpForm.querySelector('[name="default_size"]').value
            };

            try {
                const response = await fetch(`${AUTH_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    document.getElementById('successModal').classList.remove('hidden');
                    signUpForm.reset();
                } else {
                    alert("Error: " + (data.error || "Failed to create account"));
                }
            } catch (err) {
                console.error("API Call Failed:", err);
                alert("Server is waking up. Try again in 10 seconds.");
            } finally {
                btn.innerText = "Sign Up";
            }
        });
    }

    // --- 2. LOGIN LOGIC ---
    const loginForm = document.getElementById('signInForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Login Form Clicked!"); // Debugging check

            const btn = loginForm.querySelector('button');
            btn.innerText = "Verifying...";

            const credentials = {
                email: loginForm.querySelector('[name="email"]').value,
                password: loginForm.querySelector('[name="password"]').value
            };

            try {
                const response = await fetch(`${AUTH_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(credentials)
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    localStorage.setItem('vicky_token', data.token);
                    localStorage.setItem('vicky_user', JSON.stringify(data.user));
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || "Invalid Email or Password");
                }
            } catch (err) {
                alert("Connection error.");
            } finally {
                btn.innerText = "Login";
            }
        });
    }
};

// Functions outside of onload so HTML buttons can see them
function closeSuccess() {
    document.getElementById('successModal').classList.add('hidden');
    if (typeof switchAuth === "function") switchAuth('login');
}

function closeComingSoon() {
    document.getElementById('comingSoonModal').classList.add('hidden');
}