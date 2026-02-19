document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');
    const errorMsg = document.getElementById('errorMsg');
    const loginBtn = document.getElementById('loginBtn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Safety Check
            if (typeof loginUser !== 'function') {
                showError("System Error: Login utility not loaded.");
                console.error("loginUser function is missing. Check script order in HTML.");
                return;
            }

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            loginBtn.innerText = "Authenticating...";
            loginBtn.disabled = true;
            errorMsg.style.display = "none";

            try {
                const response = await loginUser(email, password);

                if (response.success) {
                    if (response.user.role === 'admin') {
                        localStorage.setItem('vicky_admin_token', response.token);
                        localStorage.setItem('vicky_admin_data', JSON.stringify(response.user));
                        window.location.replace('admin.html'); 
                    } else {
                        showError("Access Denied: Admin only.");
                    }
                } else {
                    showError(response.error || "Invalid Credentials");
                }
            } catch (err) {
                showError("Server Error.");
                console.error(err);
            } finally {
                loginBtn.innerText = "Login";
                loginBtn.disabled = false;
            }
        });
    }

    function showError(msg) {
        if (errorMsg) {
            errorMsg.innerText = msg;
            errorMsg.style.display = "block";
        } else {
            alert(msg);
        }
    }
});