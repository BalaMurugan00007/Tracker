-- 1. Create Custom Status Type
create type application_status as enum ('Draft', 'Applied', 'Interview', 'Rejected', 'Offer', 'Ghosted');

-- 2. Create Profiles Table (Extends auth.users)
-- This table holds public user information like name and avatar.
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Resume Versions Table
create table resume_versions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Applications Table
create table applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  company_name text not null,
  job_role text not null,
  location text not null,
  job_source text not null,
  date_applied date not null,
  resume_version_id uuid references resume_versions,
  status application_status default 'Draft'::application_status,
  follow_up_date date,
  follow_up_count int default 0,
  is_neglected boolean default false,
  
  -- Interview & Feedback
  hr_name text,
  interview_questions text,
  feedback text,
  personal_mistakes text,
  improvement_notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable Security (RLS)
alter table profiles enable row level security;
alter table resume_versions enable row level security;
alter table applications enable row level security;

-- 6. Create Security Policies for Profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- 7. Create Security Policies for Resume Versions
create policy "Users can view their own resume versions" on resume_versions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own resume versions" on resume_versions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own resume versions" on resume_versions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own resume versions" on resume_versions
  for delete using (auth.uid() = user_id);

-- 8. Create Security Policies for Applications
create policy "Users can view their own applications" on applications
  for select using (auth.uid() = user_id);

create policy "Users can insert their own applications" on applications
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own applications" on applications
  for update using (auth.uid() = user_id);

create policy "Users can delete their own applications" on applications
  for delete using (auth.uid() = user_id);

-- 9. Trigger to automatically create profile on signup
-- This ensures that when a user signs up via Supabase Auth, a row is created in 'profiles'
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
