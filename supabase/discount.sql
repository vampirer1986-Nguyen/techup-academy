-- TechUp Academy: giảm giá theo khóa học (chạy sau schema.sql + admin.sql, chạy lại được nhiều lần)
-- Chỉ THÊM cột/ràng buộc, không xóa hay đổi dữ liệu hiện có. `price` vẫn là giá gốc (original_price).
-- Quyền ghi giảm giá dùng lại policy admin của bảng courses (public.is_admin()) nên user thường không sửa được.

alter table public.courses add column if not exists discount_enabled boolean not null default false;
alter table public.courses add column if not exists discount_type text;
alter table public.courses add column if not exists discount_value numeric;

-- Kiểm tra ở database (không chỉ ở frontend)
alter table public.courses drop constraint if exists courses_discount_chk;
alter table public.courses add constraint courses_discount_chk check (
  (discount_type is null or discount_type in ('percentage','fixed'))
  and (discount_value is null or discount_value >= 0)
  and (discount_type is distinct from 'percentage' or discount_value is null or discount_value <= 100)
  and (
    not discount_enabled
    or (
      discount_type is not null and discount_value is not null and discount_value > 0
      and case discount_type
            when 'percentage' then round(price * (100 - discount_value) / 100) > 0
            else price - discount_value > 0
          end
    )
  )
);

-- Giá sau giảm luôn được DB tính từ cấu hình, không thể lệch (làm tròn đến 1 VNĐ)
alter table public.courses add column if not exists final_price numeric generated always as (
  case
    when not discount_enabled or discount_type is null or discount_value is null then price
    when discount_type = 'percentage' then round(price * (100 - discount_value) / 100)
    else round(price - discount_value)
  end
) stored;
