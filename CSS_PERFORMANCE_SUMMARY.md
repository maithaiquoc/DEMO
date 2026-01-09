# Tóm Tắt: CSS Ảnh Hưởng Đến Hiệu Suất

## 📊 Các Vấn Đề Phát Hiện Trong Code

### 1. 🔴 Box-Shadow + Transition (Nghiêm Trọng)

**Vị trí**: `css/style.css` dòng 86-90

```css
/* Vấn đề: Transition cả transform và box-shadow */
.product-card {
  transition: transform 0.2s cubic-bezier(.4,0,.2,1), 
              box-shadow 0.2s cubic-bezier(.4,0,.2,1);
}
.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.13);
}
```

**Vấn đề**: 
- Box-shadow gây repaint mỗi frame trong animation
- Transform được GPU tối ưu, nhưng box-shadow thì không
- Kết hợp cả hai làm tăng chi phí render đáng kể

**Giải pháp**:
- Chỉ transition transform, loại bỏ box-shadow khỏi transition
- Hoặc sử dụng `will-change: transform` và tách riêng animation

---

### 2. 🟡 Nhiều Box-Shadow Trên Cùng Trang

**Vị trí**: Tìm thấy box-shadow ở 6+ vị trí trong `style.css`

**Vấn đề**:
- Mỗi box-shadow tốn CPU để render
- Nhiều phần tử có box-shadow = nhiều lần render

**Giải pháp**:
- Giảm số lượng box-shadow không cần thiết
- Sử dụng border thay thế cho một số trường hợp đơn giản

---

### 3. 🟡 External CSS Resource Blocking

**Vị trí**: `login.html` dòng 8

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"/>
```

**Vấn đề**:
- Font Awesome CSS từ CDN có thể block render
- Phụ thuộc vào network speed
- Tải cả icon set dù có thể chỉ dùng một vài icon

**Giải pháp**:
- Sử dụng `preload` hoặc load async
- Hoặc chỉ import các icon cần dùng
- Hoặc self-host các icon cần thiết

---

### 4. 🟢 Media Queries Nhiều Breakpoints

**Vị trí**: `style.css` có 5 media queries khác nhau

**Vấn đề**:
- Mỗi media query trigger lại layout calculation
- CSS file lớn hơn do nhiều queries

**Giải pháp**:
- Gộp các media queries có cùng breakpoint
- Sử dụng mobile-first approach

---

### 5. 🟢 CSS Variables trong Animation Context

**Vị trí**: Variables được sử dụng trong các phần tử có transition

**Vấn đề**:
- CSS variables được resolve tại runtime
- Trong animation, mỗi frame phải resolve lại

**Giải pháp**:
- Giữ variables cho static values (màu sắc)
- Hardcode values trong animation/transition

---

## 🎯 Khuyến Nghị Ưu Tiên

### Ngay Lập Tức (Quick Wins):

1. **Tách box-shadow khỏi transition** trong `.product-card`
   ```css
   /* Thay vì transition cả hai */
   .product-card {
     transition: transform 0.2s;
     /* box-shadow sẽ thay đổi tức thì, không transition */
   }
   ```

2. **Thêm preconnect** cho CDN resources
   ```html
   <link rel="preconnect" href="https://cdnjs.cloudflare.com">
   ```

### Trung Hạn:

3. Giảm số lượng box-shadow không cần thiết
4. Gộp media queries
5. Xem xét self-host Font Awesome icons cần thiết

### Dài Hạn:

6. Sử dụng CSS containment
7. Implement lazy loading cho CSS không critical
8. Monitor performance với Lighthouse

---

## 📈 Metrics Đo Lường

Sử dụng các công cụ sau để đo hiệu suất:

- **Chrome DevTools Performance**: FPS khi hover vào product-card
- **Lighthouse**: Overall performance score
- **CSS Triggers**: Kiểm tra properties gây reflow/repaint

---

## 🔍 Các Thuộc Tính CSS Ảnh Hưởng Hiệu Suất

### ⚠️ **Nặng (Gây Layout + Paint):**
- `width`, `height`, `top`, `left`, `margin`, `padding`
- `border-width`, `font-size`, `line-height`

### 🟡 **Trung Bình (Chỉ Paint):**
- `color`, `background-color`, `box-shadow`, `border-color`
- `outline`, `border-radius`

### ✅ **Nhẹ (Chỉ Composite - GPU):**
- `transform`, `opacity`
- `filter` (một số cases)

---

*Xem file `CSS_PERFORMANCE_ANALYSIS.md` để biết chi tiết đầy đủ*

