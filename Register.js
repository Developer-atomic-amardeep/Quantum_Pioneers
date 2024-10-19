document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const loginLink = document.getElementById('login-link');
    const registrationModal = new bootstrap.Modal(document.getElementById('registrationModal'));
    const modalMessage = document.getElementById('modalMessage');
    const goToLoginBtn = document.getElementById('goToLoginBtn');
    const loadingOverlay = document.getElementById('loading-overlay');

    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (name && email && password && confirmPassword) {
                if (password === confirmPassword) {
                    showLoading();
                    fetch('http://127.0.0.1:8000/api/register/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: name,  // Changed from 'name' to 'username'
                            email: email,
                            password: password
                        })
                    })
                    .then(response => {
                        console.log('Response status:', response.status);
                        console.log('Response headers:', response.headers);
                        return response.json().catch(error => {
                            console.error('Error parsing JSON:', error);
                            throw new Error('Invalid JSON response');
                        });
                    })
                    .then(data => {
                        console.log('Response data:', data);
                        console.log('Message type:', typeof data.message);
                        console.log('Message content:', data.message);
                        
                        if (data.message && (
                            data.message.trim() === "User created successfully" ||
                            data.message.trim() === "User  created successfully"
                        )) {
                            modalMessage.innerHTML = `
                                <p class="text-success">Registration successful!</p>
                                <p>You can now log in with your newly created credentials.</p>
                            `;
                            goToLoginBtn.style.display = 'block';
                            registerForm.reset();
                        } else {
                            modalMessage.innerHTML = `
                                <p class="text-warning">Registration successful, but with an unexpected response.</p>
                                <p>Please try logging in with your new credentials.</p>
                            `;
                            goToLoginBtn.style.display = 'block';
                        }
                        registrationModal.show();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        modalMessage.innerHTML = `
                            <p class="text-danger">Registration failed.</p>
                            <p>Error: ${error.message}</p>
                        `;
                        goToLoginBtn.style.display = 'none';
                        registrationModal.show();
                    })
                    .finally(() => {
                        hideLoading();
                    });
                } else {
                    modalMessage.innerHTML = '<p class="text-danger">Passwords do not match.</p>';
                    goToLoginBtn.style.display = 'none';
                    registrationModal.show();
                }
            } else {
                modalMessage.innerHTML = '<p class="text-danger">Please fill in all fields.</p>';
                goToLoginBtn.style.display = 'none';
                registrationModal.show();
            }
        });
    }

    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            // The link will now navigate naturally to index.html
        });
    }
});