-- 1. Add file_path to resume_versions
alter table resume_versions add column if not exists file_path text;

-- 2. Create Storage Bucket for Resumes
-- Note: You might need to create the bucket 'resumes' manually in the Supabase Dashboard if this script fails due to permissions.
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- 3. Storage Policies
-- Allow users to upload their own resumes
create policy "Users can upload their own resumes"
on storage.objects for insert
with check ( bucket_id = 'resumes' and auth.uid() = owner );

-- Allow users to view their own resumes
create policy "Users can view their own resumes"
on storage.objects for select
using ( bucket_id = 'resumes' and auth.uid() = owner );

-- Allow users to update their own resumes
create policy "Users can update their own resumes"
on storage.objects for update
with check ( bucket_id = 'resumes' and auth.uid() = owner );

-- Allow users to delete their own resumes
create policy "Users can delete their own resumes"
on storage.objects for delete
using ( bucket_id = 'resumes' and auth.uid() = owner );
