document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const loginLink = document.getElementById('login-link');
    const loadingOverlay = document.getElementById('loading-overlay');
    const registrationModal = new bootstrap.Modal(document.getElementById('registrationModal'));
    const modalMessage = document.getElementById('modalMessage');
    const goToLoginBtn = document.getElementById('goToLoginBtn');

    // Create notification container
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);

    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.innerHTML = message;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => notification.remove();

        notification.appendChild(content);
        notification.appendChild(closeBtn);
        notificationContainer.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    function handleRegistrationResponse(responseData) {
        console.log('Response Data:', responseData);

        if (responseData.status === 'success') {
            // Show success message in modal
            modalMessage.innerHTML = 'User registered successfully! Please login to continue.';
            goToLoginBtn.style.display = 'block';
            registrationModal.show();
            return;
        }

        if (responseData.status === 'error') {
            const errors = responseData.errors;
            const errorMessages = [];
            
            if (errors.username) {
                errorMessages.push(errors.username[0]);
            }
            
            if (errors.email) {
                errorMessages.push(errors.email[0]);
            }
            
            if (errorMessages.length > 0) {
                // Show error message in modal
                modalMessage.innerHTML = errorMessages.join('<br>');
                goToLoginBtn.style.display = 'none';
                registrationModal.show();
            } else {
                // Show general error message in modal
                modalMessage.innerHTML = responseData.message || 'Registration failed';
                goToLoginBtn.style.display = 'none';
                registrationModal.show();
            }
        }
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

                    const userData = {
                        username: name,
                        email: email,
                        password: password
                    };

                    console.log('Sending registration data:', userData);

                    fetch('http://127.0.0.1:8000/api/register/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(userData)
                    })
                    .then(response => response.json())
                    .then(data => {
                        handleRegistrationResponse(data);
                    })
                    .catch(error => {
                        console.error('Registration Error:', error);
                        // Show error in modal
                        modalMessage.innerHTML = 'An error occurred during registration. Please try again.';
                        goToLoginBtn.style.display = 'none';
                        registrationModal.show();
                    })
                    .finally(() => {
                        hideLoading();
                    });
                } else {
                    // Show password mismatch in modal
                    modalMessage.innerHTML = 'Passwords do not match.';
                    goToLoginBtn.style.display = 'none';
                    registrationModal.show();
                }
            } else {
                // Show missing fields in modal
                modalMessage.innerHTML = 'Please fill in all fields.';
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

    // Add event listener for Go to Login button
    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', function() {
            window.location.href = 'Login.html';
        });
    }
});