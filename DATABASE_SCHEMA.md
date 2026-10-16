# Database Schema — TechUp Academy

## 1. Chiến lược dữ liệu
Dùng **Supabase (PostgreSQL)** làm database chính để lưu dữ liệu thật. CSV là nguồn dữ liệu mẫu để nhập khóa học ban đầu hoặc dùng làm fallback cho bản demo.

Nếu không cấu hình Supabase:
- Đọc danh sách khóa học từ `data/courses.csv` (hoặc một bản JSON được tạo từ CSV).
- Lưu các thay đổi demo trong `localStorage`.
- Hiển thị thông báo “Chế độ demo — dữ liệu chỉ lưu trên trình duyệt này”.
- Không tuyên bố rằng thay đổi trong `localStorage` đã cập nhật file CSV hoặc database trực tuyến.

## 2. Bảng `courses`
| Cột | Kiểu | Quy tắc | Mô tả |
|---|---|---|---|
| `id` | uuid | Primary key | Mã khóa học |
| `title` | text | Not null | Tên khóa học |
| `slug` | text | Unique | Đường dẫn thân thiện |
| `category` | text | Not null | Danh mục |
| `level` | text | Not null | Beginner/Intermediate/Advanced |
| `description` | text | Not null | Mô tả ngắn |
| `full_description` | text | Có thể null | Nội dung chi tiết |
| `price` | numeric | >= 0 | Học phí minh họa |
| `duration` | text | Not null | Thời lượng |
| `image_url` | text | Có thể null | URL ảnh |
| `is_featured` | boolean | Default false | Khóa học nổi bật |
| `created_at` | timestamptz | Default now() | Ngày tạo |

## 3. Bảng `registrations`
| Cột | Kiểu | Quy tắc | Mô tả |
|---|---|---|---|
| `id` | uuid | Primary key | Mã đăng ký |
| `course_id` | uuid | Foreign key → courses.id | Khóa học |
| `student_name` | text | Not null | Họ tên |
| `email` | text | Not null | Email |
| `phone` | text | Có thể null | Số điện thoại |
| `status` | text | Default `registered` | registered/cancelled |
| `created_at` | timestamptz | Default now() | Ngày đăng ký |
| `updated_at` | timestamptz | Default now() | Ngày cập nhật |

Chỉ thu thập thông tin cần thiết cho đồ án. Không thu thập mật khẩu hoặc dữ liệu nhạy cảm.

## 4. Các thao tác dữ liệu cần có
- **Insert:** tạo bản ghi đăng ký khóa học.
- **Update:** cập nhật thông tin đăng ký hoặc đổi trạng thái đăng ký.
- **Delete:** có thể xóa bản ghi khóa học trong trang quản trị nếu đã thiết lập quyền admin phù hợp. Với đăng ký của người học, ưu tiên chuyển `status` thành `cancelled` để giữ lịch sử demo.
- **Read:** tải danh sách khóa học, chi tiết khóa học và các đăng ký được phép xem.

## 5. Bảo mật Supabase
- Chỉ đưa Project URL và publishable/anon key vào `js/config.js`.
- Tuyệt đối không đưa `service_role` key hoặc secret key vào frontend, GitHub hay file `.md`.
- Bật Row Level Security (RLS) cho các bảng.
- Không mở quyền đọc/ghi toàn bộ bảng đăng ký cho người dùng ẩn danh trong bản deploy công khai.
- Nếu chưa xây dựng xác thực, chỉ cho phép tạo đăng ký qua chính sách giới hạn phù hợp; không cho người dùng tùy ý xem/sửa/xóa đăng ký của người khác.
- Các thao tác quản trị khóa học cần xác thực và chính sách RLS riêng. Không dựa vào việc ẩn trang/nút bằng frontend.
- Nếu không thể cấu hình bảo mật đúng, chỉ triển khai CRUD ở chế độ demo `localStorage`, không mở quyền database công khai.

## 6. CSV mẫu
Tạo `data/courses.csv` với các cột:
`id,title,slug,category,level,description,full_description,price,duration,image_url,is_featured`

Tạo ít nhất 6 dòng dữ liệu minh họa. Dùng ID ổn định, giá dạng số không có dấu phân cách hàng nghìn, và escape dấu phẩy/ngoặc kép theo chuẩn CSV.

Có thể tạo `data/registrations-sample.csv` để minh họa cấu trúc, nhưng không đưa thông tin cá nhân thật vào file này.

## 7. Cấu hình
Tạo `js/config.example.js` hoặc `js/config.js` với placeholder:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Không ghi giá trị bí mật. Nếu dùng file cấu hình thực tế có key, chỉ publishable/anon key được phép đưa vào frontend; mọi secret phải nằm ngoài frontend.

## Giảm giá khóa học
Chạy `supabase/discount.sql` (sau schema.sql và admin.sql). Thêm cột `discount_enabled`, `discount_type` (percentage|fixed), `discount_value` và cột sinh tự động `final_price`; `price` vẫn là giá gốc. Ràng buộc `courses_discount_chk` kiểm tra tại database; quyền ghi dùng policy admin sẵn có.
