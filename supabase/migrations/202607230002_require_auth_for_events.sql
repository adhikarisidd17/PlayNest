-- Event discovery and event details are members-only. Enforce this at the
-- database boundary as well as in the React router.
drop policy if exists "safe event public read" on public.events;

create policy "authenticated event read"
on public.events
for select
using (
  (
    auth.uid() is not null
    and status in ('published', 'completed')
    and (not is_example or status = 'completed')
  )
  or organizer_id = auth.uid()
  or public.is_admin()
);
