# TechUp Academy — Website đăng ký khóa học trực tuyến

## Mục tiêu dự án
Xây dựng website cho thương hiệu giáo dục giả lập **TechUp Academy**, cung cấp các khóa học về lập trình, thiết kế web và trí tuệ nhân tạo. Website phục vụ đồ án học tập, có giao diện responsive và chức năng quản lý đăng ký khóa học.

## Công nghệ
- HTML5
- CSS3
- JavaScript thuần (ES6+)
- Bootstrap 5 qua CDN
- Supabase Database để lưu dữ liệu trực tuyến (không tự xây dựng backend riêng)
- CSV để cung cấp dữ liệu mẫu và hỗ trợ nhập/xuất dữ liệu khi cần
- YouTube embed hoặc Google Maps embed
- GitHub Public repository
- Deploy lên Cloudflare Pages hoặc nền tảng static hosting tương đương

## Các trang bắt buộc
1. `index.html` — Trang chủ
2. `about.html` — Về chúng tôi
3. `course-detail.html?id=...` — Chi tiết khóa học

Có thể bổ sung `courses.html`, `register.html` hoặc khu vực quản lý nếu cần, nhưng không được bỏ qua ba trang bắt buộc.

## Chức năng chính
- Hiển thị và tìm kiếm danh sách khóa học.
- Xem chi tiết khóa học.
- Đăng ký khóa học.
- Xem, cập nhật và hủy đăng ký của người dùng trong bản demo.
- Khu vực quản lý khóa học có thể thêm, sửa, xóa khóa học nếu triển khai đầy đủ quyền quản trị.
- Hiển thị thông báo thành công/lỗi rõ ràng và kiểm tra dữ liệu nhập.

## Quy tắc quan trọng
- Không lưu mật khẩu hoặc dữ liệu nhạy cảm trong CSV hay mã nguồn.
- Không đưa `service_role` key của Supabase vào frontend. Chỉ dùng publishable/anon key và cấu hình Row Level Security (RLS).
- Nếu chưa cấu hình Supabase, website vẫn cần chạy ở chế độ demo với dữ liệu mẫu CSV/JavaScript và `localStorage`; giao diện phải ghi rõ đây là chế độ demo.
- Vì website static không có backend riêng, việc ghi dữ liệu thật cần dùng Supabase hoặc một dịch vụ database tương đương.
- Dùng dữ liệu, hình ảnh và thương hiệu giả lập; không tuyên bố đây là dịch vụ đào tạo thật.

## Hướng dẫn chạy
Mở thư mục dự án bằng VS Code hoặc Antigravity. Nên chạy qua Live Server hoặc local static server để tránh hạn chế khi tải tài nguyên. Nếu dùng Supabase, làm theo `DATABASE_SCHEMA.md` và điền cấu hình trong `js/config.js`.

## Tiêu chí hoàn thành
- Ba trang bắt buộc hoạt động và có liên kết điều hướng.
- Có dữ liệu khóa học được tải từ database hoặc dữ liệu demo.
- Có ít nhất hai thao tác ghi dữ liệu hoạt động; ưu tiên Insert đăng ký và Update/Hủy đăng ký. Nếu có trang quản trị, bổ sung Insert/Update/Delete khóa học.
- Có video YouTube hoặc Google Maps embed.
- Có đủ các file Markdown đặc tả.
- Source code được push lên GitHub Public và website được deploy.

## Triển khai thực tế (đã cấu hình)
- Database: Supabase, schema trong `supabase/schema.sql` (bảng `courses`, `registrations`, RLS bật).
- `courses`: ai cũng đọc được. `registrations`: **đóng hoàn toàn** với truy cập trực tiếp; đăng ký/xem/sửa/hủy đi qua các hàm RPC (`register_course`, `get_registration`, `update_registration`, `cancel_registration`) và yêu cầu mã bí mật được lưu trong `localStorage` của người đăng ký (DB chỉ lưu bản băm SHA-256).
- Trang: `index.html`, `about.html`, `course-detail.html?id=...`, `courses.html`, `my-registrations.html`.
- Chưa có trang quản trị CRUD khóa học vì chưa có xác thực; thêm/sửa/xóa khóa học thực hiện qua Supabase Dashboard.
- Chạy local: `npx serve .` hoặc Live Server. Không cần bước build.
- Link GitHub: _(điền sau khi push)_ · Website: _(điền sau khi deploy)_
