create policy "organizer deletes own event"
on public.events
for delete
using (organizer_id = auth.uid() or public.is_admin());
