-- Letters Table for Letter Writing Tool
-- Run this in Supabase SQL Editor

create table public.letters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  recipient_name text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  send_date date,
  is_sent boolean default false,
  notes text
);

-- Enable RLS
alter table public.letters enable row level security;

-- Policies
create policy "Users can view their own letters"
  on public.letters for select
  using (auth.uid() = user_id);

create policy "Users can insert their own letters"
  on public.letters for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own letters"
  on public.letters for update
  using (auth.uid() = user_id);

create policy "Users can delete their own letters"
  on public.letters for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index letters_user_id_idx on public.letters(user_id);
create index letters_created_at_idx on public.letters(created_at desc);
