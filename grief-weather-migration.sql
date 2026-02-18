-- Grief Weather Table
-- Run this in Supabase SQL Editor

create table public.grief_weather (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  weather text not null check (weather in ('storm', 'rain', 'cloudy', 'partly_sunny', 'sunny')),
  note text,
  created_at date default current_date not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, created_at)
);

-- Enable RLS
alter table public.grief_weather enable row level security;

-- Policies
create policy "Users can view their own weather"
  on public.grief_weather for select
  using (auth.uid() = user_id);

create policy "Users can insert their own weather"
  on public.grief_weather for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own weather"
  on public.grief_weather for update
  using (auth.uid() = user_id);

create policy "Users can delete their own weather"
  on public.grief_weather for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index grief_weather_user_id_idx on public.grief_weather(user_id);
create index grief_weather_created_at_idx on public.grief_weather(created_at desc);
