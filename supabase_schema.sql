-- SkillSwap relational PostgreSQL schema for Supabase.
-- Run this once in Supabase SQL Editor before starting the app.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  image text,
  handle text not null unique,
  area text not null default '',
  community text not null default '',
  bio text not null default '',
  skills_offered text[] not null default '{}',
  skills_wanted text[] not null default '{}',
  verified boolean not null default false,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  completed_swaps integer not null default 0,
  response_rate integer not null default 0,
  member_since timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  owner_id uuid not null references users(id) on delete cascade,
  offers text not null,
  wants text not null,
  mode text not null default 'online' check (mode in ('online','in-person','both')),
  location text not null default 'Online',
  level text not null default 'Beginner' check (level in ('Beginner','Intermediate','Advanced')),
  tags text[] not null default '{}',
  description text not null,
  terms text not null default '',
  availability text not null default '',
  status text not null default 'active' check (status in ('active','draft','completed','expired','paused')),
  views integer not null default 0,
  saves integer not null default 0,
  requests integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists swap_requests (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  from_id uuid not null references users(id) on delete cascade,
  to_id uuid not null references users(id) on delete cascade,
  message text not null,
  proposed text not null default '',
  status text not null default 'sent' check (status in ('incoming','sent','accepted','rejected','negotiating')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null,
  offer_id uuid references offers(id) on delete set null,
  from_id uuid not null references users(id) on delete cascade,
  to_id uuid not null references users(id) on delete cascade,
  text text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  to_id uuid not null references users(id) on delete cascade,
  from_id uuid not null references users(id) on delete cascade,
  offer_id uuid not null references offers(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  skill text not null default '',
  created_at timestamptz not null default now(),
  unique(from_id, to_id, offer_id)
);

create table if not exists saved_offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  offer_id uuid not null references offers(id) on delete cascade,
  saved_at timestamptz not null default now(),
  unique(user_id, offer_id)
);

create index if not exists offers_owner_idx on offers(owner_id);
create index if not exists offers_status_idx on offers(status);
create index if not exists offers_category_idx on offers(category);
create index if not exists requests_from_idx on swap_requests(from_id);
create index if not exists requests_to_idx on swap_requests(to_id);
create index if not exists messages_conversation_idx on messages(conversation_id, created_at);
create index if not exists notifications_user_idx on notifications(user_id, created_at desc);
create index if not exists saved_user_idx on saved_offers(user_id, saved_at desc);
create index if not exists reviews_to_idx on reviews(to_id, created_at desc);
