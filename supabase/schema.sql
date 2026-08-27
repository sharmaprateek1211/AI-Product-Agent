create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  website_url text not null,
  description text default '',
  target_customer text default '',
  analysis jsonb,
  blueprint jsonb,
  created_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy "Users can view own projects" on public.projects
for select using (auth.uid() = user_id);

create policy "Users can insert own projects" on public.projects
for insert with check (auth.uid() = user_id);

create policy "Users can update own projects" on public.projects
for update using (auth.uid() = user_id);

create policy "Users can delete own projects" on public.projects
for delete using (auth.uid() = user_id);