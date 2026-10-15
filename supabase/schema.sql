-- TechUp Academy: schema + RLS + RPC
-- Chạy được nhiều lần (idempotent). Không xóa dữ liệu hiện có.

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  category text not null,
  level text not null check (level in ('Beginner','Intermediate','Advanced')),
  description text not null,
  full_description text,
  price numeric not null default 0 check (price >= 0),
  duration text not null,
  image_url text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  student_name text not null check (char_length(trim(student_name)) between 2 and 100),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  phone text check (phone is null or phone ~ '^[0-9+\s().-]{8,20}$'),
  status text not null default 'registered' check (status in ('registered','cancelled')),
  token_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists registrations_course_idx on public.registrations(course_id);
create unique index if not exists registrations_active_unique
  on public.registrations(course_id, lower(email)) where status = 'registered';

-- RLS
alter table public.courses enable row level security;
alter table public.registrations enable row level security;

drop policy if exists "courses_public_read" on public.courses;
create policy "courses_public_read" on public.courses for select to anon, authenticated using (true);

-- registrations: KHÔNG có policy nào => anon/authenticated không đọc/ghi trực tiếp được
revoke all on public.registrations from anon, authenticated;
revoke all on public.courses from anon, authenticated;
grant select on public.courses to anon, authenticated;

-- RPC
create or replace function public.register_course(p_course_id uuid, p_name text, p_email text, p_phone text default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_token text; v_id uuid;
begin
  if not exists (select 1 from courses where id = p_course_id) then
    raise exception 'COURSE_NOT_FOUND';
  end if;
  v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into registrations(course_id, student_name, email, phone, token_hash)
  values (p_course_id, trim(p_name), trim(p_email), nullif(trim(coalesce(p_phone,'')),''),
          encode(sha256(convert_to(v_token,'UTF8')),'hex'))
  returning id into v_id;
  return json_build_object('id', v_id, 'token', v_token);
exception when unique_violation then
  raise exception 'ALREADY_REGISTERED';
end $$;

create or replace function public.get_registration(p_id uuid, p_token text)
returns json language sql security definer set search_path = public as $$
  select json_build_object('id', r.id, 'course_id', r.course_id, 'course_title', c.title,
         'student_name', r.student_name, 'email', r.email, 'phone', r.phone,
         'status', r.status, 'created_at', r.created_at, 'updated_at', r.updated_at)
  from registrations r join courses c on c.id = r.course_id
  where r.id = p_id and r.token_hash = encode(sha256(convert_to(p_token,'UTF8')),'hex');
$$;

create or replace function public.update_registration(p_id uuid, p_token text, p_name text, p_email text, p_phone text default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_row registrations;
begin
  update registrations
     set student_name = trim(p_name), email = trim(p_email),
         phone = nullif(trim(coalesce(p_phone,'')),''), updated_at = now()
   where id = p_id and status = 'registered'
     and token_hash = encode(sha256(convert_to(p_token,'UTF8')),'hex')
  returning * into v_row;
  if not found then raise exception 'NOT_ALLOWED'; end if;
  return public.get_registration(p_id, p_token);
exception when unique_violation then
  raise exception 'ALREADY_REGISTERED';
end $$;

create or replace function public.cancel_registration(p_id uuid, p_token text)
returns json language plpgsql security definer set search_path = public as $$
begin
  update registrations set status = 'cancelled', updated_at = now()
   where id = p_id and status = 'registered'
     and token_hash = encode(sha256(convert_to(p_token,'UTF8')),'hex');
  if not found then raise exception 'NOT_ALLOWED'; end if;
  return public.get_registration(p_id, p_token);
end $$;

revoke all on function public.register_course(uuid,text,text,text) from public;
revoke all on function public.get_registration(uuid,text) from public;
revoke all on function public.update_registration(uuid,text,text,text,text) from public;
revoke all on function public.cancel_registration(uuid,text) from public;
grant execute on function public.register_course(uuid,text,text,text) to anon, authenticated;
grant execute on function public.get_registration(uuid,text) to anon, authenticated;
grant execute on function public.update_registration(uuid,text,text,text,text) to anon, authenticated;
grant execute on function public.cancel_registration(uuid,text) to anon, authenticated;
