-- Keep participant notifications private and give organizers a separate,
-- correctly worded notification when automatic waitlist promotion occurs.
create or replace function public.cancel_event_place(p_event_id uuid)
returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare
  v_request public.event_requests%rowtype;
  v_event public.events%rowtype;
  v_waitlisted public.event_requests%rowtype;
  v_used integer;
begin
  select * into v_request
  from public.event_requests
  where event_id=p_event_id and requester_id=auth.uid()
  for update;

  if not found then raise exception 'Request not found'; end if;
  if v_request.status not in('pending','accepted','waitlisted','place_offered') then
    raise exception 'This request can no longer be cancelled';
  end if;

  select * into v_event from public.events where id=p_event_id for update;
  update public.event_requests
  set status='cancelled', place_offer_expires_at=null, updated_at=now()
  where id=v_request.id;

  insert into public.notifications(user_id,type,title,body,action_url)
  values(v_event.organizer_id,'participant_cancelled','A parent cancelled',
    'A parent cancelled their place or request for '||v_event.title||'.',
    '/events/'||v_event.id::text);

  if v_request.status='accepted'
    and v_event.approval_mode='automatic'
    and v_event.status='published'
    and v_event.registration_status='open'
    and v_event.ends_at>now() then
    select coalesce(sum(child_count),0) into v_used
    from public.event_requests
    where event_id=p_event_id and status='accepted';

    for v_waitlisted in
      select * from public.event_requests
      where event_id=p_event_id and status='waitlisted'
      order by created_at,id
      for update
    loop
      if v_used+v_waitlisted.child_count<=v_event.max_children then
        update public.event_requests set status='accepted',updated_at=now()
        where id=v_waitlisted.id;
        v_used:=v_used+v_waitlisted.child_count;

        insert into public.notifications(user_id,type,title,body,action_url)
        values
          (v_waitlisted.requester_id,'request_accepted','Place confirmed',
            'Your place at '||v_event.title||' is now confirmed.',
            '/events/'||v_event.id::text),
          (v_event.organizer_id,'waitlist_auto_accepted','Waitlist place filled',
            'A waitlisted family was automatically accepted for '||v_event.title||'.',
            '/events/'||v_event.id::text);
      end if;
    end loop;
  end if;
  return true;
end
$$;

revoke all on function public.cancel_event_place(uuid) from public;
grant execute on function public.cancel_event_place(uuid) to authenticated;
