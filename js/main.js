// JavaScript cho trang login.html
// Tab switching logic
function initLoginPage() {
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form-content');
    const registerForm = document.getElementById('register-form-content');

    if (loginTab && registerTab && loginForm && registerForm) {
        loginTab.onclick = function() {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.style.display = "block";
            registerForm.style.display = "none";
        };
        
        registerTab.onclick = function() {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            loginForm.style.display = "none";
            registerForm.style.display = "block";
        };

        // Custom validation for login form
        const loginFormElement = document.getElementById('custom-login-form');
        if (loginFormElement) {
            loginFormElement.addEventListener('submit', function (e) {
                let valid = true;

                // Email validation
                const email = document.getElementById('input-email');
                const emailError = document.getElementById('error-email');
                if (!email.value.trim()) {
                    emailError.textContent = 'Vui lòng nhập email!';
                    emailError.classList.add('show');
                    valid = false;
                } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.value)) {
                    emailError.textContent = 'Email không đúng định dạng!';
                    emailError.classList.add('show');
                    valid = false;
                } else {
                    emailError.textContent = '';
                    emailError.classList.remove('show');
                }

                // Password validation
                const password = document.getElementById('input-password');
                const passwordError = document.getElementById('error-password');
                const value = password.value;
                let pwMsg = '';
                if (!value) {
                    pwMsg = 'Vui lòng nhập mật khẩu!';
                } else if (value.length < 6 || value.length > 10) {
                    pwMsg = 'Mật khẩu phải từ 6 đến 10 ký tự.';
                } else if (!/[A-Z]/.test(value)) {
                    pwMsg = 'Mật khẩu cần ít nhất 1 ký tự in hoa.';
                } else if (!/[a-z]/.test(value)) {
                    pwMsg = 'Mật khẩu cần ít nhất 1 ký tự in thường.';
                } else if (!/[0-9]/.test(value)) {
                    pwMsg = 'Mật khẩu cần ít nhất 1 số.';
                } else if (!/[^a-zA-Z0-9]/.test(value)) {
                    pwMsg = 'Mật khẩu cần ít nhất 1 ký tự đặc biệt.';
                }

                if (pwMsg) {
                    passwordError.textContent = pwMsg;
                    passwordError.classList.add('show');
                    valid = false;
                } else {
                    passwordError.textContent = '';
                    passwordError.classList.remove('show');
                }

                if (!valid) {
                    e.preventDefault();
                }
            });
        }

        // Custom validation for register form
        const registerFormElement = document.getElementById('custom-register-form');
        if (registerFormElement) {
            registerFormElement.addEventListener('submit', function(e) {
                let valid = true;

                // Name validation
                const name = document.getElementById('reg-name');
                const nameError = document.getElementById('error-reg-name');
                if (!name.value.trim()) {
                    nameError.textContent = 'Vui lòng nhập họ và tên!';
                    nameError.classList.add('show');
                    valid = false;
                } else {
                    nameError.textContent = '';
                    nameError.classList.remove('show');
                }

                // Email validation
                const email = document.getElementById('reg-email');
                const emailError = document.getElementById('error-reg-email');
                if (!email.value.trim()) {
                    emailError.textContent = 'Vui lòng nhập email!';
                    emailError.classList.add('show');
                    valid = false;
                } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.value)) {
                    emailError.textContent = 'Email không đúng định dạng!';
                    emailError.classList.add('show');
                    valid = false;
                } else {
                    emailError.textContent = '';
                    emailError.classList.remove('show');
                }

                // Password validation
                const password = document.getElementById('reg-password');
                const passwordError = document.getElementById('error-reg-password');
                const pwValue = password.value;
                let pwMsg = '';
                if (!pwValue) {
                    pwMsg = 'Vui lòng nhập mật khẩu!';
                } else if (pwValue.length < 6 || pwValue.length > 10) {
                    pwMsg = 'Mật khẩu phải từ 6 đến 10 ký tự.';
                } else if (!/[A-Z]/.test(pwValue)) {
                    pwMsg = 'Mật khẩu cần ít nhất 1 ký tự in hoa.';
                } else if (!/[a-z]/.test(pwValue)) {
                    pwMsg = 'Mật khẩu cần ít nhất 1 ký tự in thường.';
                } else if (!/[0-9]/.test(pwValue)) {
                    pwMsg = 'Mật khẩu cần ít nhất 1 số.';
                } else if (!/[^a-zA-Z0-9]/.test(pwValue)) {
                    pwMsg = 'Mật khẩu cần ít nhất 1 ký tự đặc biệt.';
                }

                if (pwMsg) {
                    passwordError.textContent = pwMsg;
                    passwordError.classList.add('show');
                    valid = false;
                } else {
                    passwordError.textContent = '';
                    passwordError.classList.remove('show');
                }

                // Re-enter password validation
                const repass = document.getElementById('reg-repass');
                const repassError = document.getElementById('error-reg-repass');
                if (!repass.value.trim()) {
                    repassError.textContent = 'Vui lòng nhập lại mật khẩu!';
                    repassError.classList.add('show');
                    valid = false;
                } else if (repass.value !== pwValue) {
                    repassError.textContent = 'Mật khẩu nhập lại không khớp!';
                    repassError.classList.add('show');
                    valid = false;
                } else {
                    repassError.textContent = '';
                    repassError.classList.remove('show');
                }

                if (!valid) {
                    e.preventDefault();
                }
            });
        }
    }
}

// JavaScript cho newsletter form (có thể xuất hiện ở nhiều trang)
function initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Cảm ơn bạn đã đăng ký!');
            return false;
        });
    }
}

// Khởi tạo các chức năng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    initLoginPage();
    initNewsletterForm();
});
