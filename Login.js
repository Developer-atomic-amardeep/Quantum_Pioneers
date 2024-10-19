document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerLink = document.getElementById('register-link');
    const popup = document.getElementById('popup');
    const popupTitle = document.getElementById('popup-title');
    const popupMessage = document.getElementById('popup-message');
    const popupContinue = document.getElementById('popup-continue');
    const loadingOverlay = document.getElementById('loading-overlay');

    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    function showPopup(title, message, isSuccess) {
        popupTitle.textContent = title;
        popupMessage.textContent = message;
        popup.style.display = 'flex';
        
        if (isSuccess) {
            popupContinue.onclick = function() {
                window.location.href = 'second page.html';
            };
        } else {
            popupContinue.onclick = function() {
                popup.style.display = 'none';
            };
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (email && password) {
                showLoading();
                fetch('http://127.0.0.1:8000/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Login failed');
                })
                .then(data => {
                    console.log('Login successful:', data);
                    localStorage.setItem('authToken', data.token);
                    showPopup('Success', 'Login successful!', true);
                })
                .catch(error => {
                    console.error('Error:', error);
                    showPopup('Error', 'Login failed. Please try again.', false);
                })
                .finally(() => {
                    hideLoading();
                });
            } else {
                showPopup('Error', 'Please fill in all fields.', false);
            }
        });
    }

    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            // The link will now navigate naturally to register.html
        });
    }

    // Check login status immediately
    checkLoginStatus();
});

// Function to check login status
function checkLoginStatus() {
    const authToken = localStorage.getItem('authToken');
    const currentPage = window.location.pathname.split('/').pop();

    if (!authToken) {
        // If there's no auth token and the user is not on the login or register page, redirect to login
        if (currentPage !== 'Login.html' && currentPage !== 'Register.html' && currentPage !== 'First page.html') {
            window.location.href = 'Login.html';
        }
    } else {
        // If there is an auth token and the user is on the login, register, or first page, redirect to second page
        if (currentPage === 'Login.html' || currentPage === 'Register.html' || currentPage === 'First page.html') {
            window.location.href = 'Second page.html';
        }
    }
}

// Export the function so it can be used in other scripts
window.checkLoginStatus = checkLoginStatus;