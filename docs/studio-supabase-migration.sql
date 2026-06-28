-- Run this in the Supabase SQL editor for the project
create table if not exists studio_files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  portal text not null check (portal in ('react', 'spfx')),
  filename text not null,
  content text not null default '',
  updated_at timestamptz default now(),
  unique(user_id, portal, filename)
);

alter table studio_files enable row level security;

create policy "Users can read own files"
  on studio_files for select
  using (auth.uid() = user_id);

create policy "Users can upsert own files"
  on studio_files for insert
  with check (auth.uid() = user_id);

create policy "Users can update own files"
  on studio_files for update
  using (auth.uid() = user_id);

create policy "Users can delete own files"
  on studio_files for delete
  using (auth.uid() = user_id);
