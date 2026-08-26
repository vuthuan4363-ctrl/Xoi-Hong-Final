XÔI VIỆT ĐƯƠNG ĐẠI — STATIC WEBSITE

YÊU CẦU DUY NHẤT: Node.js đã cài trên máy (đã có sẵn theo xác nhận của bạn).
KHÔNG cần: PHP, XAMPP, Composer, Python, npm install.

CÁCH CHẠY (1 LỆNH DUY NHẤT)
1. Mở PowerShell hoặc CMD tại đúng thư mục này (thư mục chứa index.html).
2. Chạy:

   npx http-server . -p 8000 -a 0.0.0.0 -c-1

3. Truy cập:
   - Trên laptop:        http://localhost:8000
   - Trên điện thoại (cùng Wi-Fi với laptop):
     http://<IPv4-CUA-LAPTOP>:8000
     (Xem IPv4 bằng lệnh: ipconfig — tìm dòng "IPv4 Address" của Wi-Fi đang dùng)

CÁCH 2 — Double-click
Bạn cũng có thể double-click START_SERVER.bat — file này chạy đúng lệnh
npx http-server ở trên và tự mở trình duyệt tới http://localhost:8000.
File KHÔNG còn phụ thuộc Python nữa.

LƯU Ý VỀ IP
IP điện thoại truy cập phụ thuộc vào IPv4 hiện tại của laptop trên mạng Wi-Fi,
có thể thay đổi mỗi khi đổi mạng. Luôn kiểm tra lại bằng "ipconfig" nếu
điện thoại không kết nối được.

CẤU TRÚC THƯ MỤC
index.html
assets/css/app.css
assets/js/app.js
images/
START_SERVER.bat
README.txt

Thư mục bạn mở ra (giải nén) phải chứa trực tiếp index.html — không có
thêm một lớp thư mục con nào nữa.

TÍNH NĂNG ĐÃ CÓ
- Thiết kế Neo-Indochine × Contemporary Editorial, bảng màu Deep Banana Leaf /
  Charcoal Bamboo / Rice Cream / Sticky Rice Gold
- Responsive desktop / tablet / mobile, menu hamburger trên mobile
- Điều hướng active theo section khi cuộn trang
- Tìm kiếm món (overlay, realtime, ESC để đóng)
- Lọc thực đơn theo danh mục (mặn / ngọt / thanh nhẹ / đồ uống / combo)
- Modal xem nhanh sản phẩm (ảnh lớn, mô tả, chọn số lượng, ghi chú, thêm vào giỏ)
- Giỏ hàng: thêm / tăng giảm / xóa, lưu bằng localStorage (reload vẫn còn)
- Mẻ Xôi Live: đồng hồ thời gian thực + tiến trình mẻ đang giữ chỗ
- Ưu đãi hôm nay: combo giảm giá, thêm thẳng vào giỏ
- Checkout 1 bước (thông tin nhận hàng) + modal xác nhận đơn hàng với mã đơn,
  tổng tiền, thời gian giao dự kiến; lịch sử đơn hàng lưu trong localStorage
- Toast thông báo khi thêm món
- Hiệu ứng reveal khi cuộn (IntersectionObserver, nhẹ, không lag)
- Ảnh lazy-load (trừ ảnh hero)

Nếu gặp lỗi ERR_CONNECTION_REFUSED / TIMED_OUT:
1. Kiểm tra cửa sổ terminal chạy server có còn mở không.
2. Kiểm tra bạn đang ở đúng thư mục chứa index.html (không phải thư mục cha).
3. Kiểm tra điện thoại và laptop cùng một mạng Wi-Fi.
4. Chạy lại "ipconfig" để lấy đúng địa chỉ IPv4 hiện tại.
