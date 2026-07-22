-- A clearly labelled, completed example owned by the bootstrap admin. It is
-- non-joinable and cannot be mistaken for a real upcoming activity.
do $$
declare
  admin_user_id uuid;
begin
  update public.profiles p
  set role = 'admin'
  from auth.users u
  where p.id = u.id
    and lower(u.email) = lower('adhikarisidd17@gmail.com');

  select u.id into admin_user_id
  from auth.users u
  join public.profiles p on p.id = u.id
  where lower(u.email) = lower('adhikarisidd17@gmail.com')
    and p.role = 'admin';

  if admin_user_id is null then
    raise exception 'The bootstrap admin account is missing or does not have the admin role';
  end if;

  insert into public.venues(
    id, locality_id, name, address_text, venue_type, is_public,
    approval_status, directions_url, created_by
  ) values (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Kungsträdgården', 'Kungsträdgården, Stockholm', 'park', true,
    'approved',
    'https://www.google.com/maps/search/?api=1&query=Kungstr%C3%A4dg%C3%A5rden%2C%20Stockholm',
    admin_user_id
  ) on conflict (id) do update set created_by = excluded.created_by;

  insert into public.events(
    id, organizer_id, locality_id, venue_id, title, description, category,
    starts_at, ends_at, timezone, age_bands, max_children, max_adults,
    siblings_allowed, guardian_required, environment, languages,
    accessibility_notes, bring_notes, approval_mode, registration_status,
    status, is_example, completed_at
  ) values (
    '30000000-0000-0000-0000-000000000001',
    admin_user_id,
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Admin test event — completed example',
    'A clearly labelled completed example created to verify the PlayNest administrator account and event data model.',
    'Park meetup',
    '2026-07-19 10:00:00+02', '2026-07-19 11:30:00+02',
    'Europe/Stockholm', array['3–5','6–8']::public.age_band[], 8, 8,
    true, true, 'outdoor', array['Svenska','English'],
    'Public park with step-free paths.', 'Bring water and weather-appropriate clothing.',
    'manual', 'closed', 'completed', true, '2026-07-19 11:30:00+02'
  ) on conflict (id) do update set organizer_id = excluded.organizer_id;
end
$$;
