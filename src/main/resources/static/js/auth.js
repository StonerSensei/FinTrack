document.addEventListener('DOMContentLoaded', function() {
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        setupPasswordStrengthMeter();
        setupPasswordConfirmation();
    }

    // Check for remember me functionality
    checkRememberMe();
});

function handleLogin(e) {
    e.preventDefault();

    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;
    const rememberMe = form.querySelector('#rememberMe').checked;

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            // Store token
            localStorage.setItem('authToken', data.token);

            // Remember username if checked
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            // Redirect to home.html
            window.location.href = 'home.html';
        })
        .catch(error => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;

            // Show error message
            const errorMessage = error.message.includes('Invalid credentials') ?
                'Invalid username or password' : 'Login failed. Please try again.';

            showError(form, errorMessage);
        });
}

function handleRegister(e) {
    e.preventDefault();

    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;
    const confirmPassword = form.querySelector('#confirmPassword').value;

    // Validate password match
    if (password !== confirmPassword) {
        showError(form, 'Passwords do not match');
        return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    submitBtn.disabled = true;

    fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            // Store token
            localStorage.setItem('authToken', data.token);

            // Show success message and redirect
            showSuccess(form, 'Registration successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        })
        .catch(error => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;

            // Show error message
            const errorMessage = error.message.includes('Username already exists') ?
                'Username already exists' : 'Registration failed. Please try again.';

            showError(form, errorMessage);
        });
}

function setupPasswordStrengthMeter() {
    const passwordInput = document.getElementById('regPassword');
    if (!passwordInput) return;

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strengthMeter = document.querySelector('.strength-meter');
        const strengthText = document.querySelector('.strength-text');
        const sections = document.querySelectorAll('.strength-section');

        // Reset
        sections.forEach(section => {
            section.style.backgroundColor = '#e0e0e0';
        });
        strengthText.textContent = 'Password strength';
        strengthText.style.color = 'var(--gray-color)';

        if (password.length === 0) return;

        // Calculate strength
        let strength = 0;

        // Length
        if (password.length > 7) strength += 1;

        // Contains numbers
        if (/\d/.test(password)) strength += 1;

        // Contains special chars
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

        // Update UI
        if (strength > 0) {
            for (let i = 0; i < strength; i++) {
                let color;
                if (strength === 1) color = '#ff4d4d'; // Weak
                else if (strength === 2) color = '#ffa500'; // Medium
                else color = '#4bb543'; // Strong

                sections[i].style.backgroundColor = color;
            }

            strengthText.textContent =
                strength === 1 ? 'Weak' :
                    strength === 2 ? 'Medium' : 'Strong';
            strengthText.style.color =
                strength === 1 ? '#ff4d4d' :
                    strength === 2 ? '#ffa500' : '#4bb543';
        }
    });
}

function setupPasswordConfirmation() {
    const passwordInput = document.getElementById('regPassword');
    const confirmInput = document.getElementById('confirmPassword');

    if (!passwordInput || !confirmInput) return;

    confirmInput.addEventListener('input', function() {
        if (passwordInput.value !== this.value && this.value.length > 0) {
            this.style.borderColor = 'var(--error-color)';
        } else {
            this.style.borderColor = '#e0e0e0';
        }
    });
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function showError(form, message) {
    // Remove any existing error messages
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create and display new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.display = 'block';

    // Insert after the form
    form.appendChild(errorElement);

    // Add shake animation to form
    form.classList.add('shake');
    setTimeout(() => {
        form.classList.remove('shake');
    }, 500);
}

function showSuccess(form, message) {
    // Remove any existing success messages
    const existingSuccess = form.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }

    // Create and display new success message
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    successElement.style.display = 'block';

    // Insert after the form
    form.appendChild(successElement);
}

function checkRememberMe() {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername && document.getElementById('username')) {
        document.getElementById('username').value = rememberedUsername;
        document.getElementById('rememberMe').checked = true;
    }
}

// Add shake animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }
    .shake {
        animation: shake 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);