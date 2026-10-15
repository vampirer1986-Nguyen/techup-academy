# GitHub & Deployment — TechUp Academy

## 1. Cấu trúc thư mục gợi ý
```text
techup-academy/
├── index.html
├── about.html
├── courses.html
├── course-detail.html
├── admin.html
├── assets/
│   ├── images/
│   └── icons/
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── courses.js
│   ├── registrations.js
│   ├── config.example.js
│   └── supabase-client.js
├── data/
│   └── courses.csv
├── README.md
├── PROJECT_SPEC.md
├── DATABASE_SCHEMA.md
├── FEATURES.md
└── DEPLOYMENT.md
```

## 2. Đưa code lên GitHub Public
1. Tạo repository mới, ví dụ `techup-academy`.
2. Đặt repository ở chế độ **Public** theo yêu cầu đồ án.
3. Đưa source code và 5 file `.md` lên repository.
4. Không commit secret key, mật khẩu, dữ liệu học viên thật hoặc file cấu hình chứa bí mật.
5. Trong `README.md`, bổ sung mô tả dự án, công nghệ, cách chạy và link website sau khi deploy.
6. Kiểm tra link repository ở chế độ đăng xuất hoặc cửa sổ riêng tư để xác nhận giảng viên có thể truy cập.

## 3. Deploy lên Cloudflare Pages (khuyến nghị)
1. Push code lên GitHub.
2. Đăng nhập Cloudflare Dashboard và mở Pages.
3. Tạo project bằng cách kết nối repository GitHub.
4. Với website HTML/CSS/JS thuần, chọn cấu hình static site phù hợp; không cần build command nếu không dùng công cụ build.
5. Chọn thư mục gốc là thư mục chứa `index.html`.
6. Deploy và mở URL được cấp.
7. Kiểm tra các trang con, ảnh, CSS, JavaScript, query string của trang chi tiết và iframe.

Có thể dùng GitHub Pages hoặc một static host tương đương nếu được giảng viên chấp nhận. Vì đây là website static, không cần deploy backend riêng khi dùng Supabase làm dịch vụ database.

## 4. Cấu hình Supabase
1. Tạo project Supabase.
2. Tạo bảng theo `DATABASE_SCHEMA.md`.
3. Bật RLS và viết chính sách quyền truy cập tối thiểu cần thiết.
4. Thêm Project URL và publishable/anon key vào cấu hình frontend.
5. Chỉ dùng publishable/anon key ở frontend; không sử dụng `service_role` key.
6. Thử tạo, cập nhật và hủy đăng ký trên môi trường deploy.
7. Kiểm tra rằng người dùng không thể đọc hoặc sửa dữ liệu đăng ký của người khác.

Nếu chưa sẵn sàng cấu hình Supabase, dùng chế độ demo `localStorage` và ghi rõ giới hạn trong báo cáo.

## 5. Lưu ý đường dẫn static
- Dùng đường dẫn tương đối cho CSS, JavaScript và ảnh, ví dụ `./css/styles.css`.
- Không dùng đường dẫn tuyệt đối bắt đầu bằng `/` nếu có thể làm hỏng tài nguyên khi deploy dưới đường dẫn con của GitHub Pages.
- Tên file phân biệt chữ hoa/chữ thường trên máy chủ.
- Đảm bảo `index.html` nằm đúng thư mục gốc được deploy.
- Không để trang quản trị CRUD mở quyền ghi database công khai nếu chưa có xác thực và RLS.

## 6. Checklist nộp bài
- [ ] Repository GitHub Public.
- [ ] Link GitHub được ghi trong báo cáo.
- [ ] Website đã deploy và mở được bằng link công khai.
- [ ] Có Home Page, About Us và Course Detail.
- [ ] Có CSV mẫu và/hoặc database Supabase.
- [ ] Demo được ít nhất hai thao tác ghi dữ liệu.
- [ ] Có nhúng YouTube hoặc Google Maps.
- [ ] Có 5 file Markdown.
- [ ] Đã kiểm tra trên mobile và desktop.
- [ ] Không có secret key hoặc dữ liệu cá nhân thật bị public.
