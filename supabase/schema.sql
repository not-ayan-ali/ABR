-- ABR Supabase Database Schema & RLS Policies
-- Safe to re-run: drops existing policies/triggers before recreating them.

-- 1. Novels Table
create table if not exists novels (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  synopsis text,
  cover_image_url text,
  category text not null,
  age_rating text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Episodes Table
create table if not exists episodes (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references novels(id) on delete cascade,
  title text not null,
  "order" integer not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Readers Table (Local device profiles)
create table if not exists readers (
  device_id text primary key,
  username text not null,
  created_at timestamptz not null default now()
);

-- 4. Favorites Table
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  novel_id uuid not null references novels(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint unique_device_novel_favorite unique (device_id, novel_id)
);

-- 5. Reading Progress Table
create table if not exists reading_progress (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  episode_id uuid not null references episodes(id) on delete cascade,
  progress_percent numeric not null default 0,
  scroll_position numeric not null default 0,
  last_read_at timestamptz not null default now(),
  constraint unique_device_episode_progress unique (device_id, episode_id)
);

-- 6. Ratings Table
create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  novel_id uuid not null references novels(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_device_novel_rating unique (device_id, novel_id)
);

-- 7. Notifications Table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  related_novel_id uuid references novels(id) on delete set null,
  related_episode_id uuid references episodes(id) on delete set null,
  trigger_type text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS) on all tables
alter table novels enable row level security;
alter table episodes enable row level security;
alter table readers enable row level security;
alter table favorites enable row level security;
alter table reading_progress enable row level security;
alter table ratings enable row level security;
alter table notifications enable row level security;

-- Keep updated_at current on every row update
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on novels;
create trigger set_updated_at before update on novels
  for each row execute function update_updated_at_column();
drop trigger if exists set_updated_at on episodes;
create trigger set_updated_at before update on episodes
  for each row execute function update_updated_at_column();
drop trigger if exists set_updated_at on ratings;
create trigger set_updated_at before update on ratings
  for each row execute function update_updated_at_column();

-- RLS Policies (drop first so this script is re-runnable and old
-- policies cannot linger alongside new ones)

-- Novels: Public can read published novels; Authenticated users (admin) can do all
drop policy if exists "Public can view published novels" on novels;
create policy "Public can view published novels" on novels
  for select using (status = 'published' or auth.role() = 'authenticated');

drop policy if exists "Admin can insert novels" on novels;
create policy "Admin can insert novels" on novels
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update novels" on novels;
create policy "Admin can update novels" on novels
  for update using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete novels" on novels;
create policy "Admin can delete novels" on novels
  for delete using (auth.role() = 'authenticated');

-- Episodes: Public can read published episodes of published novels.
-- A published episode must never leak while its parent novel is still a draft.
-- Authenticated users (admin) can read everything.
drop policy if exists "Public can view published episodes" on episodes;
create policy "Public can view published episodes" on episodes
  for select using (
    (status = 'published'
      and exists (
        select 1 from novels
        where novels.id = episodes.novel_id and novels.status = 'published'
      ))
    or auth.role() = 'authenticated'
  );

drop policy if exists "Admin can insert episodes" on episodes;
create policy "Admin can insert episodes" on episodes
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update episodes" on episodes;
create policy "Admin can update episodes" on episodes
  for update using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete episodes" on episodes;
create policy "Admin can delete episodes" on episodes
  for delete using (auth.role() = 'authenticated');

-- Readers / Favorites / Reading Progress / Ratings:
-- Access is scoped to matching custom HTTP header 'x-device-id' (sent by mobile app)
-- or to authenticated admin users (for dashboard analytics).

-- Create rating summary view so public can query average rating without exposing raw device ratings
create or replace view novel_rating_summaries as
select
  novel_id,
  count(*)::integer as rating_count,
  round(avg(rating)::numeric, 1)::float as avg_rating
from ratings
group by novel_id;

-- RLS policies checking x-device-id header or authenticated admin
drop policy if exists "Anyone can manage reader profile" on readers;
drop policy if exists "Anyone can manage their own reader profile" on readers;
drop policy if exists "Device-scoped reader profile" on readers;
create policy "Device-scoped reader profile" on readers
  for all using (
    device_id = coalesce(current_setting('request.headers', true)::json->>'x-device-id', '')
    or auth.role() = 'authenticated'
  )
  with check (
    device_id = coalesce(current_setting('request.headers', true)::json->>'x-device-id', '')
    or auth.role() = 'authenticated'
  );

drop policy if exists "Anyone can manage favorites" on favorites;
drop policy if exists "Anyone can manage their own favorites" on favorites;
drop policy if exists "Device-scoped favorites" on favorites;
create policy "Device-scoped favorites" on favorites
  for all using (
    device_id = coalesce(current_setting('request.headers', true)::json->>'x-device-id', '')
    or auth.role() = 'authenticated'
  )
  with check (
    device_id = coalesce(current_setting('request.headers', true)::json->>'x-device-id', '')
    or auth.role() = 'authenticated'
  );

drop policy if exists "Anyone can manage reading progress" on reading_progress;
drop policy if exists "Anyone can manage their own reading progress" on reading_progress;
drop policy if exists "Device-scoped reading progress" on reading_progress;
create policy "Device-scoped reading progress" on reading_progress
  for all using (
    device_id = coalesce(current_setting('request.headers', true)::json->>'x-device-id', '')
    or auth.role() = 'authenticated'
  )
  with check (
    device_id = coalesce(current_setting('request.headers', true)::json->>'x-device-id', '')
    or auth.role() = 'authenticated'
  );

drop policy if exists "Anyone can manage ratings" on ratings;
drop policy if exists "Anyone can manage their own ratings" on ratings;
drop policy if exists "Device-scoped ratings" on ratings;
create policy "Device-scoped ratings" on ratings
  for all using (
    device_id = coalesce(current_setting('request.headers', true)::json->>'x-device-id', '')
    or auth.role() = 'authenticated'
  )
  with check (
    device_id = coalesce(current_setting('request.headers', true)::json->>'x-device-id', '')
    or auth.role() = 'authenticated'
  );

-- Notifications: Public can view notifications, admin can insert
drop policy if exists "Public can view notifications" on notifications;
create policy "Public can view notifications" on notifications
  for select using (true);

drop policy if exists "Admin can insert notifications" on notifications;
create policy "Admin can insert notifications" on notifications
  for insert with check (auth.role() = 'authenticated');

-- Storage: novel cover images.
-- The bucket is public so covers render for every reader without signing URLs;
-- only the authenticated writer may upload, replace, or delete covers.
insert into storage.buckets (id, name, public)
values ('novel-covers', 'novel-covers', true)
on conflict (id) do nothing;

drop policy if exists "Cover images are publicly readable" on storage.objects;
create policy "Cover images are publicly readable" on storage.objects
  for select using (bucket_id = 'novel-covers');

drop policy if exists "Authenticated users can upload cover images" on storage.objects;
create policy "Authenticated users can upload cover images" on storage.objects
  for insert with check (bucket_id = 'novel-covers' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update cover images" on storage.objects;
create policy "Authenticated users can update cover images" on storage.objects
  for update using (bucket_id = 'novel-covers' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete cover images" on storage.objects;
create policy "Authenticated users can delete cover images" on storage.objects
  for delete using (bucket_id = 'novel-covers' and auth.role() = 'authenticated');
