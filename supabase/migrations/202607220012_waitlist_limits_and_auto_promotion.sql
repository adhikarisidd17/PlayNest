-- Waitlist requests must be capable of fitting the event, and automatic events
-- promote fitting waitlisted requests atomically when accepted capacity opens.
create or replace function public.request_event_place(
  p_event_id uuid,p_child_ids uuid[],p_adult_count integer default 1,p_message text default null
) returns public.event_request_status
language plpgsql security definer set search_path=''
as $$
declare
  v_event public.events%rowtype;v_request_id uuid;v_existing_status public.event_request_status;
  v_status public.event_request_status;v_child_count integer;v_valid_children integer;v_accepted integer;
begin
  if auth.uid() is null or not public.is_active_parent() then raise exception 'Complete onboarding before requesting a place';end if;
  v_child_count:=coalesce(array_length(p_child_ids,1),0);
  if v_child_count<1 or v_child_count>20 then raise exception 'Choose between 1 and 20 child profiles';end if;
  if p_adult_count<1 or p_adult_count>20 then raise exception 'Choose between 1 and 20 adults';end if;
  if length(coalesce(p_message,''))>500 then raise exception 'Message is too long';end if;
  select * into v_event from public.events where id=p_event_id for update;
  if not found or v_event.status<>'published' or v_event.registration_status<>'open' or v_event.ends_at<=now() or v_event.is_example then raise exception 'This event is not accepting requests';end if;
  if v_event.organizer_id=auth.uid() then raise exception 'You cannot request your own event';end if;
  if v_child_count>v_event.max_children then raise exception 'A request cannot include more than the event capacity of % children',v_event.max_children;end if;
  select count(*) into v_valid_children from public.children c where c.id=any(p_child_ids) and c.parent_id=auth.uid() and c.age_band=any(v_event.age_bands);
  if v_valid_children<>v_child_count then raise exception 'Choose only your own child profiles in a suitable age band';end if;
  select id,status into v_request_id,v_existing_status from public.event_requests where event_id=p_event_id and requester_id=auth.uid() for update;
  if v_request_id is not null and v_existing_status<>'cancelled' then raise exception 'You already have a request for this event';end if;
  select coalesce(sum(child_count),0) into v_accepted from public.event_requests where event_id=p_event_id and status='accepted';
  if v_accepted+v_child_count>v_event.max_children then v_status:='waitlisted';elsif v_event.approval_mode='automatic' then v_status:='accepted';else v_status:='pending';end if;
  if v_request_id is null then
    insert into public.event_requests(event_id,requester_id,status,child_count,adult_count,message) values(p_event_id,auth.uid(),v_status,v_child_count,p_adult_count,nullif(trim(p_message),'')) returning id into v_request_id;
  else
    update public.event_requests set status=v_status,child_count=v_child_count,adult_count=p_adult_count,message=nullif(trim(p_message),''),organizer_note=null,place_offer_expires_at=null,created_at=now(),updated_at=now() where id=v_request_id;
    delete from public.event_request_children where event_request_id=v_request_id;
  end if;
  insert into public.event_request_children(event_request_id,child_id) select v_request_id,unnest(p_child_ids);
  insert into public.notifications(user_id,type,title,body,action_url) values
  (auth.uid(),'request_'||v_status::text,case v_status when 'accepted' then 'Place confirmed' when 'waitlisted' then 'Added to waitlist' else 'Place requested' end,case v_status when 'accepted' then 'Your place at '||v_event.title||' is confirmed.' when 'waitlisted' then v_event.title||' is full, so you were added to the waitlist.' else 'Your request for '||v_event.title||' was sent.' end,'/activities'),
  (v_event.organizer_id,'new_event_request','New place request','A parent requested a place at '||v_event.title||'.','/events/'||v_event.id::text);
  return v_status;
end
$$;
revoke all on function public.request_event_place(uuid,uuid[],integer,text) from public;
grant execute on function public.request_event_place(uuid,uuid[],integer,text) to authenticated;

create or replace function public.cancel_event_place(p_event_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare
  v_request public.event_requests%rowtype;v_event public.events%rowtype;
  v_waitlisted public.event_requests%rowtype;v_used integer;
begin
  select * into v_request from public.event_requests where event_id=p_event_id and requester_id=auth.uid() for update;
  if not found then raise exception 'Request not found';end if;
  if v_request.status not in('pending','accepted','waitlisted','place_offered') then raise exception 'This request can no longer be cancelled';end if;
  select * into v_event from public.events where id=p_event_id for update;
  update public.event_requests set status='cancelled',place_offer_expires_at=null,updated_at=now() where id=v_request.id;
  insert into public.notifications(user_id,type,title,body,action_url) values(v_event.organizer_id,'participant_cancelled','A parent cancelled','A parent cancelled their place or request for '||v_event.title||'.','/events/'||v_event.id::text);
  if v_request.status='accepted' and v_event.approval_mode='automatic' and v_event.status='published' and v_event.registration_status='open' and v_event.ends_at>now() then
    select coalesce(sum(child_count),0) into v_used from public.event_requests where event_id=p_event_id and status='accepted';
    for v_waitlisted in select * from public.event_requests where event_id=p_event_id and status='waitlisted' order by created_at,id for update
    loop
      if v_used+v_waitlisted.child_count<=v_event.max_children then
        update public.event_requests set status='accepted',updated_at=now() where id=v_waitlisted.id;
        v_used:=v_used+v_waitlisted.child_count;
        insert into public.notifications(user_id,type,title,body,action_url) values(v_waitlisted.requester_id,'request_accepted','Place confirmed','A place opened at '||v_event.title||' and your waitlist request was automatically accepted.','/events/'||v_event.id::text);
      end if;
    end loop;
  end if;
  return true;
end
$$;
revoke all on function public.cancel_event_place(uuid) from public;
grant execute on function public.cancel_event_place(uuid) to authenticated;
