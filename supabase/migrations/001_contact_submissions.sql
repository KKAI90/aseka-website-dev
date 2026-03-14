-- Supabase migration: tạo bảng contact_submissions
-- Chạy trong Supabase Dashboard → SQL Editor

create table if not exists contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('business', 'individual')),
  name        text not null,
  company     text,
  email       text not null,
  phone       text,
  service     text,
  message     text,
  status      text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at  timestamptz not null default now()
);

-- Index để query nhanh theo status và ngày
create index idx_contact_status on contact_submissions(status);
create index idx_contact_created on contact_submissions(created_at desc);

-- RLS: chỉ service_role có thể đọc/ghi (không cho anon key đọc)
alter table contact_submissions enable row level security;

create policy "service_role_all" on contact_submissions
  for all
  using (auth.role() = 'service_role');

-- Comment
comment on table contact_submissions is 'Form liên hệ từ landing page Aseka';
