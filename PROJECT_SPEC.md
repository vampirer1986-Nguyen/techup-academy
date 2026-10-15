# Project Specification — TechUp Academy

## 1. Tổng quan
Tên thương hiệu: **TechUp Academy**  
Lĩnh vực: Đào tạo kỹ năng công nghệ trực tuyến.  
Đối tượng: Người mới học lập trình, sinh viên và người muốn nâng cao kỹ năng số.  
Ngôn ngữ giao diện: Tiếng Việt.  
Phong cách: Hiện đại, thân thiện, dễ đọc, ưu tiên trải nghiệm trên điện thoại.

## 2. Mục tiêu người dùng
- Tìm khóa học phù hợp.
- Xem mô tả, học phí, thời lượng và nội dung khóa học.
- Đăng ký khóa học bằng biểu mẫu.
- Kiểm tra và cập nhật thông tin đăng ký.
- Hủy đăng ký khi cần.

## 3. Cấu trúc trang

### Trang chủ — `index.html`
- Navbar: logo chữ TechUp Academy; liên kết Trang chủ, Khóa học, Về chúng tôi.
- Hero: tiêu đề nổi bật, mô tả ngắn, nút “Khám phá khóa học”.
- Danh sách khóa học nổi bật dạng card.
- Khối lợi ích: học theo dự án, nội dung thực hành, lịch học linh hoạt.
- Video giới thiệu nhúng từ YouTube hoặc bản đồ Google Maps.
- Footer: liên hệ, liên kết nhanh, bản quyền.

### Về chúng tôi — `about.html`
- Giới thiệu thương hiệu giả lập.
- Sứ mệnh, phương pháp đào tạo, giá trị cốt lõi.
- Đội ngũ giảng viên mẫu (không dùng thông tin cá nhân thật nếu chưa được phép).
- Thông tin liên hệ và video/bản đồ nhúng nếu chưa có trên trang chủ.

### Chi tiết khóa học — `course-detail.html?id=COURSE_ID`
- Đọc tham số `id` từ URL.
- Hiển thị tên khóa học, ảnh, mô tả, học phí, thời lượng, trình độ.
- Hiển thị mục tiêu học tập và danh sách nội dung.
- Nút “Đăng ký khóa học” mở biểu mẫu hoặc đưa tới phần đăng ký.
- Xử lý trường hợp thiếu hoặc không tìm thấy `id`.

### Trang danh sách khóa học (khuyến nghị) — `courses.html`
- Hiển thị tất cả khóa học.
- Tìm kiếm theo tên.
- Lọc theo danh mục hoặc trình độ.
- Sắp xếp theo học phí.

### Trang quản lý (khuyến nghị) — `admin.html`
- Danh sách khóa học.
- Biểu mẫu thêm và sửa khóa học.
- Nút xóa có hộp xác nhận.
- Chỉ hiển thị thao tác quản trị khi đã cấu hình quyền truy cập phù hợp. Không xem việc ẩn nút bằng JavaScript là biện pháp bảo mật.

## 4. Luồng đăng ký
1. Người dùng mở chi tiết khóa học.
2. Chọn “Đăng ký khóa học”.
3. Nhập họ tên, email và số điện thoại tùy chọn.
4. JavaScript kiểm tra trường bắt buộc và định dạng email.
5. Lưu đăng ký vào Supabase nếu đã cấu hình; nếu không, dùng `localStorage` ở chế độ demo.
6. Hiển thị thông báo rõ ràng và mã đăng ký.

## 5. Yêu cầu giao diện
- Responsive cho mobile, tablet và desktop.
- Dùng Bootstrap 5 CDN kết hợp CSS riêng.
- Tông màu đề xuất: xanh dương `#2563EB`, xanh đậm `#172554`, nền `#F8FAFC`, chữ `#1F2937`.
- Card có khoảng trắng hợp lý, nút bấm dễ nhận biết, độ tương phản tốt.
- Dùng ảnh minh họa phù hợp; có `alt` cho ảnh.
- Không sử dụng hiệu ứng gây rối hoặc tự động phát âm thanh/video.

## 6. Yêu cầu nội dung
- Dùng tiếng Việt tự nhiên, nhất quán.
- Tạo tối thiểu 6 khóa học mẫu: HTML/CSS, JavaScript, Frontend với Bootstrap, Python cơ bản, UI/UX căn bản, Nhập môn AI.
- Mọi học phí, lịch học và thông tin giảng viên là dữ liệu minh họa.
- Không dùng logo hoặc tuyên bố khiến người dùng hiểu nhầm TechUp Academy là tổ chức có thật.

## 7. Tiêu chí nghiệm thu
- Không có liên kết điều hướng bị hỏng.
- Trang chi tiết đọc đúng `id`.
- Form kiểm tra dữ liệu và có thông báo lỗi/thành công.
- Các thao tác dữ liệu có trạng thái loading, empty và error cơ bản.
- Không để lộ secret key.
- Console không có lỗi JavaScript nghiêm trọng.
