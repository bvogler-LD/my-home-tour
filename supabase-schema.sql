-- My Home Tour — Supabase Schema
-- Run this in the Supabase SQL editor

create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table layouts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  name text not null,
  description text,
  image_urls text[] not null default '{}',
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table voters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  session_token text not null unique,
  created_at timestamptz not null default now()
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid not null references voters(id) on delete cascade,
  layout_id uuid not null references layouts(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(voter_id, room_id)
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid not null references voters(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete cascade,
  layout_id uuid references layouts(id) on delete set null,
  text text not null,
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index on layouts(room_id);
create index on votes(voter_id);
create index on votes(room_id);
create index on comments(room_id);
create index on comments(voter_id);
