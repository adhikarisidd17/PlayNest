create table if not exists public.user_settings(
  user_id uuid primary key references public.profiles(id) on delete cascade,
  in_app_notifications boolean not null default true,
  email_event_updates boolean not null default false,
  email_join_requests boolean not null default false,
  locality_event_alerts boolean not null default true,
  share_contact_after_acceptance boolean not null default false,
  profile_discoverability text not null default 'organizers_only' check(profile_discoverability in('organizers_only','participants')),
  updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;
create policy "users read own settings" on public.user_settings for select using(user_id=auth.uid());
create policy "users insert own settings" on public.user_settings for insert with check(user_id=auth.uid());
create policy "users update own settings" on public.user_settings for update using(user_id=auth.uid()) with check(user_id=auth.uid());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avatars','avatars',true,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "avatars public read" on storage.objects for select using(bucket_id='avatars');
create policy "users upload own avatar" on storage.objects for insert with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "users update own avatar" on storage.objects for update using(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "users delete own avatar" on storage.objects for delete using(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
