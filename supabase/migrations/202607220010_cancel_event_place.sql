create or replace function public.cancel_event_place(p_event_id uuid)
returns boolean
language plpgsql security definer set search_path=''
as $$
declare
  v_request public.event_requests%rowtype;
  v_event public.events%rowtype;
begin
  select * into v_request from public.event_requests
  where event_id=p_event_id and requester_id=auth.uid() for update;
  if not found then raise exception 'Request not found'; end if;
  if v_request.status not in('pending','accepted','waitlisted','place_offered') then
    raise exception 'This request can no longer be cancelled';
  end if;
  select * into v_event from public.events where id=p_event_id for update;
  update public.event_requests set status='cancelled',place_offer_expires_at=null,updated_at=now()
  where id=v_request.id;
  insert into public.notifications(user_id,type,title,body,action_url)
  values(v_event.organizer_id,'participant_cancelled','A parent cancelled',
    'A parent cancelled their place or request for '||v_event.title||'.','/events/'||v_event.id::text);
  return true;
end
$$;
revoke all on function public.cancel_event_place(uuid) from public;
grant execute on function public.cancel_event_place(uuid) to authenticated;
