-- Bootstrap the initial administrator. The role remains enforced by RLS.
-- Remove the email-specific trigger logic after the first admin has signed in.
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('adhikarisidd17@gmail.com');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, first_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', 'New parent'),
    case
      when lower(new.email) = lower('adhikarisidd17@gmail.com') then 'admin'::public.user_role
      else 'parent'::public.user_role
    end
  )
  on conflict (id) do update
    set role = case
      when lower(new.email) = lower('adhikarisidd17@gmail.com') then 'admin'::public.user_role
      else public.profiles.role
    end;
  return new;
end
$$;
