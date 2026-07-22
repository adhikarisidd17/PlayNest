-- Reconcile legacy automatic requests sequentially. Requests that do not fit
-- are waitlisted and do not consume capacity, allowing a later smaller request
-- to use an available place.
do $$
declare
  v_event record;
  v_request record;
  v_used integer;
  v_new_status public.event_request_status;
begin
  for v_event in
    select id,max_children from public.events where approval_mode='automatic'
  loop
    v_used:=0;
    for v_request in
      select id,requester_id,child_count,status from public.event_requests
      where event_id=v_event.id and status in('pending','accepted','waitlisted')
      order by created_at,id
    loop
      if v_used+v_request.child_count<=v_event.max_children then
        v_new_status:='accepted';
        v_used:=v_used+v_request.child_count;
      else
        v_new_status:='waitlisted';
      end if;
      if v_request.status<>v_new_status then
        update public.event_requests set status=v_new_status,updated_at=now() where id=v_request.id;
        insert into public.notifications(user_id,type,title,body,action_url)
        values(v_request.requester_id,'request_'||v_new_status::text,'Request status corrected',
          case v_new_status when 'accepted' then 'Your place is now confirmed.' else 'Your request is now on the waitlist.' end,
          '/activities');
      end if;
    end loop;
  end loop;
end
$$;
