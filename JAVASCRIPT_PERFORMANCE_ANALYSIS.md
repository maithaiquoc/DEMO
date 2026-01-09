# Phân Tích Hiệu Suất JavaScript - Các Vấn Đề Ảnh Hưởng Đến Tải Trang

## 📋 Tổng Quan

Tài liệu này phân tích các dòng lệnh JavaScript có thể ảnh hưởng đến hiệu suất tải trang của website.

---

## 🔴 VẤN ĐỀ NGHIÊM TRỌNG

### 1. **Blocking Scripts ở Footer** (`login.html:130`)

**Dòng code:**
```html
<script src="js/main.min.js"></script>
```

**Vấn đề:**
- Script được load ở cuối `<body>` (đúng cách), nhưng vẫn block rendering
- File minified nhưng vẫn cần parse và execute ngay lập tức
- Không có `async` hoặc `defer` attribute

**Giải pháp:**
```html
<script src="js/main.min.js" defer></script>
```
- Sử dụng `defer` để tải song song nhưng chỉ execute sau khi DOM ready
- Hoặc di chuyển vào `<head>` với `defer` attribute

---

### 2. **Bootstrap JS Bundle Blocking** (`coffee-shop.html:199`)

**Dòng code:**
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
```

**Vấn đề:**
- File lớn (~60-70KB minified) được load đồng bộ
- Block rendering và parsing HTML
- Nằm ở cuối body nhưng vẫn block việc hoàn tất page load
- Chỉ cần cho menu toggle nhưng phải tải toàn bộ library

**Giải pháp:**
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" defer></script>
```
- Thêm `defer` để không block rendering
- Hoặc chỉ load component cần thiết (chỉ collapse.js)

---

### 3. **Font Awesome Blocking trong `<head>`** (`login.html:8`)

**Dòng code:**
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"/>
```

**Vấn đề:**
- CSS blocking trong `<head>` làm chậm First Paint
- File CSS lớn (~100KB+) từ CDN external
- Không có `preload` hoặc `preconnect`

**Giải pháp:**
```html
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" media="print" onload="this.media='all'">
```
- Hoặc chỉ load icons cần thiết thay vì toàn bộ library

---

## ⚠️ VẤN ĐỀ TRUNG BÌNH

### 4. **DOMContentLoaded Handler - Code Chạy Không Cần Thiết** (`main.js:179-182`)

**Dòng code:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    initLoginPage();
    initNewsletterForm();
});
```

**Vấn đề:**
- Code chạy trên mọi trang, kể cả khi không có form login
- `initLoginPage()` được gọi ngay cả khi không có elements cần thiết
- Tốn thời gian execute không cần thiết

**Giải pháp:**
- Kiểm tra xem page có cần init hay không trước khi gọi:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('custom-login-form')) {
        initLoginPage();
    }
    if (document.querySelector('.newsletter-form')) {
        initNewsletterForm();
    }
});
```

---

### 5. **Multiple DOM Queries Không Được Cache** (`main.js:4-7, 31-32, 47-48, ...`)

**Vấn đề:**
- Nhiều lần gọi `getElementById()` cho cùng một element
- Mỗi lần gọi phải traverse DOM tree
- Trong validation functions, elements được query nhiều lần

**Ví dụ trong `main.js:31-32`:**
```javascript
const email = document.getElementById('input-email');
const emailError = document.getElementById('error-email');
```
- Trong hàm submit handler, mỗi lần submit đều query lại

**Giải pháp:**
- Cache DOM elements khi init:
```javascript
function initLoginPage() {
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');
    // Cache tất cả elements cần thiết
    const emailInput = document.getElementById('input-email');
    const emailError = document.getElementById('error-email');
    // ... reuse trong validation
}
```

---

### 6. **Validation Logic Phức Tạp Chạy Trên Main Thread** (`main.js:49-63, 117-131`)

**Dòng code ví dụ:**
```javascript
if (!/[A-Z]/.test(value)) {
    pwMsg = 'Mật khẩu cần ít nhất 1 ký tự in hoa.';
} else if (!/[a-z]/.test(value)) {
    pwMsg = 'Mật khẩu cần ít nhất 1 ký tự in thường.';
} else if (!/[0-9]/.test(value)) {
    pwMsg = 'Mật khẩu cần ít nhất 1 số.';
} else if (!/[^a-zA-Z0-9]/.test(value)) {
    pwMsg = 'Mật khẩu cần ít nhất 1 ký tự đặc biệt.';
}
```

**Vấn đề:**
- 4 regex patterns được test tuần tự, mỗi lần test phải compile pattern
- Validation chạy mỗi lần submit form (blocking)
- Không có debouncing cho real-time validation

**Giải pháp:**
- Pre-compile regex patterns:
```javascript
const PASSWORD_PATTERNS = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    digit: /[0-9]/,
    special: /[^a-zA-Z0-9]/
};
```
- Combine thành một regex nếu có thể
- Thêm debouncing cho input events

---

### 7. **Regex Pattern Lặp Lại** (`main.js:37, 105`)

**Dòng code:**
```javascript
/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.value)
```

**Vấn đề:**
- Email regex được định nghĩa inline nhiều lần
- Mỗi lần test phải compile lại pattern
- Code duplication

**Giải pháp:**
- Định nghĩa một lần và reuse:
```javascript
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
// Hoặc sử dụng HTML5 validation: type="email"
```

---

### 8. **Inline Event Handlers với onclick** (`main.js:10-15, 17-22`)

**Logic trong code:**
```javascript
loginTab.onclick = function() {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = "block";
    registerForm.style.display = "none";
};
```

**Vấn đề:**
- Sử dụng `onclick` property thay vì `addEventListener`
- Khó để remove event listeners sau này
- Không support multiple handlers

**Giải pháp:**
- Sử dụng `addEventListener`:
```javascript
loginTab.addEventListener('click', function() {
    // ...
});
```

---

### 9. **Alert() Blocking UI** (`main.js:172`)

**Dòng code:**
```javascript
alert('Cảm ơn bạn đã đăng ký!');
```

**Vấn đề:**
- `alert()` là blocking call, freeze toàn bộ UI thread
- Không user-friendly và không modern

**Giải pháp:**
- Sử dụng non-blocking notification:
```javascript
// Sử dụng toast notification hoặc custom modal
showToast('Cảm ơn bạn đã đăng ký!');
```

---

## 💡 VẤN ĐỀ NHỎ - CẢI THIỆN THÊM

### 10. **Không Có Error Handling**

**Vấn đề:**
- Code không có try-catch blocks
- Nếu có lỗi JavaScript, toàn bộ script có thể fail silently

### 11. **Không Có Code Splitting**

**Vấn đề:**
- Tất cả JavaScript được bundle vào một file
- Load code không cần thiết trên mỗi trang

**Giải pháp:**
- Split code theo page:
  - `login.js` - chỉ cho login page
  - `common.js` - code dùng chung

---

## 📊 Tóm Tắt Tác Động Hiệu Suất

| Vấn đề | Mức độ | Tác động | Ưu tiên sửa |
|--------|--------|----------|-------------|
| Blocking scripts | 🔴 Cao | Block rendering, tăng FCP | 1 |
| Bootstrap bundle | 🔴 Cao | Block parsing, tăng TTI | 1 |
| Font Awesome CSS | 🔴 Cao | Block first paint | 1 |
| DOM queries lặp | ⚠️ Trung | Tăng execution time | 2 |
| Regex compilation | ⚠️ Trung | Tăng validation time | 2 |
| Code chạy không cần | ⚠️ Trung | Tăng JS execution | 2 |
| Alert blocking | ⚠️ Trung | Block UI thread | 3 |
| Event handlers | 💡 Thấp | Code quality | 3 |

---

## 🚀 Khuyến Nghị Tổng Thể

1. **Thêm `defer` hoặc `async`** cho tất cả external scripts
2. **Preconnect** đến CDNs trước khi load resources
3. **Code splitting** theo pages
4. **Cache DOM queries** và pre-compile regex patterns
5. **Lazy load** non-critical JavaScript
6. **Minify và compress** JavaScript files
7. **Sử dụng modern APIs** như Intersection Observer cho lazy loading
8. **Monitor performance** với Chrome DevTools Performance tab

---

## 📝 Metrics Cần Theo Dõi

- **FCP (First Contentful Paint)**: Thời gian đến khi có nội dung đầu tiên
- **TTI (Time to Interactive)**: Thời gian đến khi page interactive
- **TBT (Total Blocking Time)**: Tổng thời gian JavaScript block main thread
- **JS Execution Time**: Thời gian execute JavaScript

---

*Tài liệu được tạo tự động từ phân tích codebase - Cập nhật: 2025*

