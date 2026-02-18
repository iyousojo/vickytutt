document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');
    const errorMsg = document.getElementById('errorMsg');
    const loginBtn = document.getElementById('loginBtn');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // --- 1. Password Visibility Toggle ---
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '👁' : '🙈';
        });
    }

    // --- 2. Admin Login Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Reset UI
            loginBtn.innerText = "Authenticating...";
            loginBtn.disabled = true;
            errorMsg.style.display = "none";

            try {
                // loginUser is defined in fetch.js
                const response = await loginUser(email, password);

                if (response.success) {
                    // CRITICAL: Check if the user is an admin
                    if (response.user.role === 'admin') {
                        localStorage.setItem('vicky_admin_token', response.token);
                        localStorage.setItem('vicky_admin_data', JSON.stringify(response.user));
                        
                        window.location.replace('admin.html'); 
                    } else {
                        showError("Access Denied: Customers cannot enter here.");
                    }
                } else {
                    showError(response.error || "Invalid Credentials");
                }
            } catch (err) {
                showError("Server Error. Please try again later.");
                console.error(err);
            } finally {
                loginBtn.innerText = "Login";
                loginBtn.disabled = false;
            }
        });
    }

    function showError(msg) {
        errorMsg.innerText = msg;
        errorMsg.style.display = "block";
    }
});