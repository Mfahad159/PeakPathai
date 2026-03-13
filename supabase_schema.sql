-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  degree_level text,
  field_of_study text,
  country text,
  funding_preference text,
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

-- Opportunities table
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text,
  provider text,
  deadline text,
  funding_type text,
  location text,
  field text,
  description text,
  source_url text,
  raw_data jsonb,
  saved boolean default false,
  seen boolean default false,
  created_at timestamptz default now()
);

-- Search quota tracking
create table search_quota (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  week_start date,
  searches_used int default 0,
  unique(user_id, week_start)
);

-- Auto-create profile row on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
