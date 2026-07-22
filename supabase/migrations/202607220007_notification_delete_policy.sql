create policy "own notification delete" on public.notifications for delete using(user_id=auth.uid());
