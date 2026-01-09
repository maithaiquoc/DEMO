# Phân Tích Thuộc Tính CSS Ảnh Hưởng Đến Hiệu Suất Tải Trang

## Tổng Quan

Tài liệu này phân tích các thuộc tính CSS trong dự án có thể ảnh hưởng đến hiệu suất tải trang và hiệu suất render của website.

---

## 1. BOX-SHADOW (Ảnh Hưởng Cao)

### Vị Trí Phát Hiện:
- `css/style.css`: Dòng 19, 52, 85, 157, 195, 203
- `css/login.css`: Dòng 19

### Các Ví Dụ Trong Code:
```css
/* style.css */
.navbar {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.product-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.product-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.13);
}
```

### Tại Sao Ảnh Hưởng Hiệu Suất:
1. **Tốn CPU để render**: Box-shadow yêu cầu trình duyệt tính toán và vẽ nhiều lớp shadow phức tạp
2. **Gây repaint**: Mỗi khi thay đổi box-shadow (như trong hover), trình duyệt phải vẽ lại phần tử
3. **Không được tối ưu bởi GPU**: Box-shadow chủ yếu xử lý trên CPU thread chính
4. **Ảnh hưởng đến FPS**: Nhiều box-shadow cùng lúc có thể làm giảm frame rate

### Giải Pháp Tối Ưu:
- Sử dụng `will-change: box-shadow` cho các phần tử có animation box-shadow
- Giảm số lượng box-shadow khi không cần thiết
- Sử dụng `filter: drop-shadow()` cho một số trường hợp (tốt hơn một chút)
- Tránh box-shadow phức tạp trên nhiều phần tử cùng lúc

---

## 2. TRANSFORM + TRANSITION (Ảnh Hưởng Trung Bình-Cao)

### Vị Trí Phát Hiện:
- `css/style.css`: Dòng 40, 84-90, 234
- `css/login.css`: Dòng 92, 228

### Các Ví Dụ Trong Code:
```css
/* style.css */
.nav-links a {
  transition: color 0.2s cubic-bezier(.4,0,.2,1);
}

.product-card {
  transition: transform 0.2s cubic-bezier(.4,0,.2,1), 
              box-shadow 0.2s cubic-bezier(.4,0,.2,1);
}

.product-card:hover {
  transform: translateY(-8px);
}
```

### Tại Sao Ảnh Hưởng Hiệu Suất:
1. **Tích cực**: Transform được tối ưu bởi GPU, tạo compositor layer riêng
2. **Tiêu cực**: Khi kết hợp với box-shadow trong transition, có thể gây cả layout và paint
3. **Cubic-bezier**: Hàm easing phức tạp có thể tốn thêm tài nguyên tính toán
4. **Multiple properties**: Transition nhiều thuộc tính cùng lúc tốn nhiều hơn

### Giải Pháp Tối Ưu:
- ✅ Sử dụng `transform` và `opacity` - đây là các thuộc tính tốt nhất cho animation
- ⚠️ Tránh transition với `box-shadow` - nên tách riêng
- Sử dụng `will-change: transform` cho các phần tử sẽ được animate
- Ưu tiên transform thay vì thay đổi top/left/width/height

---

## 3. BORDER-RADIUS (Ảnh Hưởng Thấp-Trung Bình)

### Vị Trí Phát Hiện:
- `css/style.css`: Dòng 20, 50, 152, 192, 202
- `css/login.css`: Dòng 18, 136

### Các Ví Dụ Trong Code:
```css
.navbar {
  border-radius: 12px;
}

.product-card {
  border-radius: 12px;
}

.product-card img {
  border-radius: 8px 8px 0 0;
}
```

### Tại Sao Ảnh Hưởng Hiệu Suất:
1. **Anti-aliasing**: Border-radius yêu cầu làm mịn các góc, tốn thêm tài nguyên render
2. **Kết hợp với box-shadow**: Khi có cả border-radius và box-shadow, chi phí render tăng
3. **Clip path**: Trình duyệt phải tính toán clipping path cho nội dung
4. **Overflow hidden**: Thường đi kèm với border-radius, gây thêm tính toán

### Giải Pháp Tối Ưu:
- Giảm số lượng phần tử có border-radius khi không cần thiết
- Sử dụng giá trị border-radius đơn giản (không quá lớn)
- Tránh border-radius trên nhiều phần tử lồng nhau

---

## 4. MEDIA QUERIES (Ảnh Hưởng Thấp)

### Vị Trí Phát Hiện:
- `css/style.css`: Dòng 77-82, 101-130, 241-253
- `css/login.css`: Dòng 32-37

### Các Ví Dụ Trong Code:
```css
@media (max-width: 700px) {
  .flex-container {
    flex-direction: column;
    gap: 0;
  }
}

@media (max-width: 1199.98px) {
  .product-card {
    flex: 0 0 25%;
    max-width: 25%;
  }
}
```

### Tại Sao Ảnh Hưởng Hiệu Suất:
1. **Layout recalculation**: Khi viewport thay đổi, trình duyệt phải tính toán lại layout
2. **CSS parsing**: Nhiều media queries làm tăng thời gian parse CSS
3. **Re-render**: Thay đổi layout properties (như flex-direction) gây reflow

### Giải Pháp Tối Ưu:
- Sử dụng `contain: layout style paint` để tối ưu re-render
- Gộp các media queries có cùng breakpoint
- Sử dụng CSS container queries thay vì media queries khi phù hợp
- Tránh thay đổi layout properties trong media queries (ưu tiên sizing)

---

## 5. FLEXBOX LAYOUTS (Ảnh Hưởng Thấp)

### Vị Trí Phát Hiện:
- `css/style.css`: Dòng 13-15, 31-33, 71-75, 145-147
- `css/login.css`: Dòng 26-28, 71-77, 99-102

### Các Ví Dụ Trong Code:
```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 32px;
}
```

### Tại Sao Ảnh Hưởng Hiệu Suất:
1. **Layout calculation**: Flexbox yêu cầu tính toán layout phức tạp hơn block layout
2. **Nested flexbox**: Flexbox lồng nhau có thể tăng thời gian tính toán
3. **Flex-wrap**: Khi có wrap, trình duyệt phải tính toán nhiều hơn
4. **Gap property**: Tương đối mới, có thể chưa được tối ưu tốt ở một số trình duyệt cũ

### Giải Pháp Tối Ưu:
- ✅ Flexbox đã được tối ưu tốt trong trình duyệt hiện đại
- Tránh flexbox lồng nhau quá sâu (3-4 cấp)
- Sử dụng `min-width: 0` cho flex items có thể bị overflow
- Xem xét CSS Grid cho layout 2D phức tạp

---

## 6. CSS VARIABLES (Ảnh Hưởng Thấp)

### Vị Trí Phát Hiện:
- `css/style.css`: Dòng 2-6
- `css/login.css`: Dòng 2-6

### Các Ví Dụ Trong Code:
```css
:root {
  --primary-color: #007bff;
  --secondary-white-color: #ffffff;
  --secondary-grey-color: #f1f3f4;
}

body {
  background-color: var(--primary-color);
  color: var(--secondary-white-color);
}
```

### Tại Sao Ảnh Hưởng Hiệu Suất:
1. **Runtime calculation**: CSS variables được tính toán tại runtime, không phải compile-time
2. **Cascade resolution**: Phải resolve giá trị từ variable chain
3. **Fallback**: Khi sử dụng fallback (`var(--color, #000)`), tốn thêm một bước kiểm tra

### Giải Pháp Tối Ưu:
- CSS variables có overhead rất nhỏ, lợi ích về maintainability lớn hơn
- Tránh sử dụng CSS variables trong animation (tốt nhất nên hardcode giá trị)
- Sử dụng variables cho các giá trị static (màu sắc, spacing)

---

## 7. EXTERNAL RESOURCES (Ảnh Hưởng Cao)

### Vị Trí Phát Hiện:
- `login.html`: Dòng 8

### Các Ví Dụ Trong Code:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"/>
```

### Tại Sao Ảnh Hưởng Hiệu Suất:
1. **Blocking resource**: External CSS từ CDN có thể block render nếu không có async
2. **Network latency**: Phụ thuộc vào tốc độ mạng và CDN
3. **CORS**: Có thể gây thêm overhead
4. **Cache**: Phụ thuộc vào cache của trình duyệt

### Giải Pháp Tối Ưu:
- Sử dụng `preload` cho critical CSS
- Tải external resources với `media="print" onload="this.media='all'"` để non-blocking
- Xem xét self-hosting các thư viện nhỏ thay vì CDN
- Sử dụng `link rel="preconnect"` để giảm DNS lookup time

---

## 8. MULTIPLE TRANSITION PROPERTIES (Ảnh Hưởng Trung Bình)

### Vị Trí Phát Hiện:
- `css/style.css`: Dòng 86-90

### Các Ví Dụ Trong Code:
```css
.product-card {
  transition: transform 0.2s cubic-bezier(.4,0,.2,1), 
              box-shadow 0.2s cubic-bezier(.4,0,.2,1);
}
```

### Tại Sao Ảnh Hưởng Hiệu Suất:
1. **Multiple animations**: Mỗi property transitioned cần được theo dõi và tính toán riêng
2. **Compositor layers**: Các properties khác nhau có thể cần compositor layers khác nhau
3. **Repaint**: Box-shadow transition gây repaint, không như transform

### Giải Pháp Tối Ưu:
- Tách transition cho các properties có thể tách (transform vs box-shadow)
- Sử dụng `will-change` chỉ khi cần thiết
- Ưu tiên transform và opacity (chỉ composite, không repaint)

---

## Tổng Kết và Khuyến Nghị

### Mức Độ Ưu Tiên Tối Ưu:

#### 🔴 **Ưu Tiên Cao:**
1. **Giảm số lượng box-shadow** - Đặc biệt khi kết hợp với transition
2. **Tối ưu external resources** - Sử dụng preload/preconnect
3. **Tách transition properties** - Tránh transition box-shadow với transform

#### 🟡 **Ưu Tiên Trung Bình:**
1. **Sử dụng will-change** - Cho các phần tử có animation
2. **Tối ưu media queries** - Gộp các queries cùng breakpoint
3. **Giảm nested flexbox** - Tối đa 3-4 cấp

#### 🟢 **Ưu Tiên Thấp:**
1. **CSS Variables** - Overhead rất nhỏ, giữ lại cho maintainability
2. **Border-radius** - Chỉ tối ưu khi có quá nhiều
3. **Flexbox** - Đã được tối ưu tốt, chỉ cần tránh quá nhiều cấp lồng nhau

### Code Tối Ưu Mẫu:

```css
/* ❌ Không tối ưu */
.product-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.13);
}

/* ✅ Tối ưu hơn */
.product-card {
  will-change: transform;
  transition: transform 0.2s cubic-bezier(.4,0,.2,1);
}

.product-card:hover {
  transform: translateY(-8px);
  /* Tách box-shadow animation riêng hoặc loại bỏ nếu không cần thiết */
}
```

---

## Công Cụ Đo Lường Hiệu Suất

1. **Chrome DevTools Performance Tab** - Đo FPS và identify bottlenecks
2. **Lighthouse** - Đánh giá tổng thể performance
3. **CSS Triggers** (css-triggers.com) - Kiểm tra properties nào gây layout/paint/composite
4. **Will-change Property** - Chỉ sử dụng khi thực sự cần thiết

---

*Tài liệu được tạo ngày: $(date)*
*Dựa trên phân tích code trong: css/style.css, css/login.css*

