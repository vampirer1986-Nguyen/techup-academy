# Features & User Stories — TechUp Academy

## 1. Chức năng bắt buộc
### F01 — Điều hướng
- Người dùng có thể chuyển giữa Trang chủ, Về chúng tôi và Khóa học.
- Navbar tương thích mobile.
- Logo đưa người dùng về Trang chủ.

### F02 — Hiển thị khóa học
- Hiển thị ít nhất 6 khóa học.
- Mỗi card có tên, danh mục, trình độ, học phí, thời lượng và nút xem chi tiết.
- Có trạng thái loading, không có dữ liệu và lỗi tải dữ liệu.

### F03 — Chi tiết khóa học
- Đọc `id` từ query string.
- Hiển thị nội dung khóa học tương ứng.
- Nếu ID không hợp lệ, hiển thị thông báo và liên kết quay lại danh sách.

### F04 — Đăng ký khóa học (INSERT)
- Trường bắt buộc: họ tên, email và khóa học.
- Kiểm tra email và dữ liệu đầu vào.
- Lưu bản ghi vào Supabase hoặc `localStorage` ở chế độ demo.
- Hiển thị xác nhận khi thành công; không hiển thị thành công nếu lưu thất bại.

### F05 — Cập nhật đăng ký (UPDATE)
- Cho phép cập nhật thông tin đăng ký trong phạm vi người dùng được phép thao tác.
- Kiểm tra dữ liệu trước khi lưu.
- Hiển thị thông báo kết quả.
- Nếu chưa có xác thực người dùng, chỉ mô phỏng cập nhật trên dữ liệu demo của trình duyệt.

### F06 — Hủy đăng ký (UPDATE hoặc DELETE)
- Cho phép hủy đăng ký bằng cách đổi trạng thái thành `cancelled`, hoặc xóa bản ghi demo.
- Hiển thị hộp xác nhận trước khi thực hiện.
- Cập nhật giao diện sau khi lưu thành công.

## 2. Chức năng mở rộng
- Tìm kiếm khóa học theo tên.
- Lọc theo danh mục và trình độ.
- Sắp xếp theo học phí.
- Trang quản trị khóa học: thêm, sửa, xóa (CRUD).
- Xuất danh sách khóa học thành CSV.
- Responsive và thông báo toast.

## 3. Nhúng nội dung
Chọn ít nhất một:
- YouTube iframe cho video giới thiệu hoặc bài học mẫu; hoặc
- Google Maps iframe cho vị trí trung tâm giả lập.

Dùng URL nhúng chính thức. Thêm `title` cho iframe và cho phép tải/lưu trữ phù hợp. Không tự động phát video.

## 4. Yêu cầu chất lượng
- Semantic HTML, label gắn đúng với input.
- Có focus state cho bàn phím và màu sắc tương phản đủ.
- Ảnh có `alt`; nút có nhãn rõ ràng.
- Không dùng `innerHTML` với dữ liệu người dùng chưa được làm sạch; ưu tiên `textContent` và tạo node DOM.
- Xử lý lỗi mạng/database và lỗi biểu mẫu.
- Không đưa API secret vào frontend.
- Không giả lập giao dịch thanh toán thật.

## 5. Kiểm thử thủ công
- [ ] Mở được ba trang bắt buộc.
- [ ] Xem được chi tiết từng khóa học.
- [ ] Đăng ký hợp lệ tạo bản ghi mới.
- [ ] Form từ chối email sai hoặc trường bắt buộc trống.
- [ ] Có thể cập nhật thông tin đăng ký demo.
- [ ] Có thể hủy đăng ký.
- [ ] Trạng thái lỗi khi database không khả dụng được hiển thị dễ hiểu.
- [ ] Video/bản đồ nhúng hiển thị.
- [ ] Giao diện hoạt động trên màn hình điện thoại.
- [ ] Không có secret key trong source code công khai.
