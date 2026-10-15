-- TechUp Academy: phân quyền quản trị khóa học (chạy sau schema.sql, chạy lại được nhiều lần)
-- Quyền admin do RLS quyết định, KHÔNG dựa vào việc ẩn nút ở frontend.

create table if not exists public.admin_emails (
  email text primary key check (email = lower(email))
);
alter table public.admin_emails enable row level security;
revoke all on public.admin_emails from anon, authenticated;   -- không policy => không ai đọc/ghi qua API

insert into public.admin_emails (email) values ('vampirer1986@gmail.com') on conflict do nothing;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from admin_emails
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- courses: đọc công khai (đã có), ghi chỉ dành cho admin
grant insert, update, delete on public.courses to authenticated;

drop policy if exists "courses_admin_insert" on public.courses;
drop policy if exists "courses_admin_update" on public.courses;
drop policy if exists "courses_admin_delete" on public.courses;
create policy "courses_admin_insert" on public.courses for insert to authenticated with check (public.is_admin());
create policy "courses_admin_update" on public.courses for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "courses_admin_delete" on public.courses for delete to authenticated using (public.is_admin());
