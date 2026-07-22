-- Correct automatic approval, expose the resulting status to the caller, and
-- make deletion notify affected parents before request rows are cascaded.
drop function if exists public.request_event_place(uuid,uuid[],integer,text);
create function public.request_event_place(
  p_event_id uuid,
  p_child_ids uuid[],
  p_adult_count integer default 1,
  p_message text default null
) returns public.event_request_status
language plpgsql security definer set search_path=''
as $$
declare
  v_event public.events%rowtype;
  v_request_id uuid;
  v_status public.event_request_status;
  v_child_count integer;
  v_valid_children integer;
  v_accepted integer;
begin
  if auth.uid() is null or not public.is_active_parent() then
    raise exception 'Complete onboarding before requesting a place';
  end if;
  v_child_count:=coalesce(array_length(p_child_ids,1),0);
  if v_child_count<1 or v_child_count>20 then raise exception 'Choose between 1 and 20 child profiles'; end if;
  if p_adult_count<1 or p_adult_count>20 then raise exception 'Choose between 1 and 20 adults'; end if;
  if length(coalesce(p_message,''))>500 then raise exception 'Message is too long'; end if;

  -- Serializes all requests for this event, preventing two automatic requests
  -- from taking the final place concurrently.
  select * into v_event from public.events where id=p_event_id for update;
  if not found or v_event.status<>'published' or v_event.registration_status<>'open'
    or v_event.ends_at<=now() or v_event.is_example then
    raise exception 'This event is not accepting requests';
  end if;
  if v_event.organizer_id=auth.uid() then raise exception 'You cannot request your own event'; end if;

  select count(*) into v_valid_children from public.children c
  where c.id=any(p_child_ids) and c.parent_id=auth.uid() and c.age_band=any(v_event.age_bands);
  if v_valid_children<>v_child_count then
    raise exception 'Choose only your own child profiles in a suitable age band';
  end if;

  select coalesce(sum(child_count),0) into v_accepted
  from public.event_requests where event_id=p_event_id and status='accepted';
  if v_accepted+v_child_count>v_event.max_children then
    v_status:='waitlisted';
  elsif v_event.approval_mode='automatic' then
    v_status:='accepted';
  else
    v_status:='pending';
  end if;

  insert into public.event_requests(event_id,requester_id,status,child_count,adult_count,message)
  values(p_event_id,auth.uid(),v_status,v_child_count,p_adult_count,nullif(trim(p_message),''))
  returning id into v_request_id;
  insert into public.event_request_children(event_request_id,child_id)
  select v_request_id,unnest(p_child_ids);

  insert into public.notifications(user_id,type,title,body,action_url) values
  (auth.uid(),'request_'||v_status::text,
    case v_status when 'accepted' then 'Place confirmed' when 'waitlisted' then 'Added to waitlist' else 'Place requested' end,
    case v_status when 'accepted' then 'Your place at '||v_event.title||' is confirmed.' when 'waitlisted' then v_event.title||' is full, so you were added to the waitlist.' else 'Your request for '||v_event.title||' was sent.' end,
    '/activities'),
  (v_event.organizer_id,'new_event_request','New place request','A parent requested a place at '||v_event.title||'.','/events/'||v_event.id::text);
  return v_status;
end
$$;
revoke all on function public.request_event_place(uuid,uuid[],integer,text) from public;
grant execute on function public.request_event_place(uuid,uuid[],integer,text) to authenticated;

create or replace function public.delete_owned_event(p_event_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_event public.events%rowtype;
begin
  select * into v_event from public.events where id=p_event_id for update;
  if not found then raise exception 'Event not found'; end if;
  if v_event.organizer_id<>auth.uid() and not public.is_admin() then raise exception 'Not authorized'; end if;
  insert into public.notifications(user_id,type,title,body,action_url)
  select distinct r.requester_id,'event_cancelled','Event cancelled',v_event.title||' was cancelled by the organizer.','/activities'
  from public.event_requests r
  where r.event_id=p_event_id and r.status in('pending','accepted','waitlisted','place_offered');
  delete from public.events where id=p_event_id;
  return true;
end
$$;
revoke all on function public.delete_owned_event(uuid) from public;
grant execute on function public.delete_owned_event(uuid) to authenticated;

do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='event_requests') then
    alter publication supabase_realtime add table public.event_requests;
  end if;
end $$;

-- Repair requests created by the previous inverted automatic-approval logic.
-- FIFO order is deterministic; each request has exactly one resulting status.
with ranked as (
  select r.id,e.max_children,
    sum(r.child_count) over(partition by r.event_id order by r.created_at,r.id) as running_children
  from public.event_requests r
  join public.events e on e.id=r.event_id
  where e.approval_mode='automatic' and r.status in('pending','accepted','waitlisted')
)
update public.event_requests r
set status=case when ranked.running_children<=ranked.max_children then 'accepted'::public.event_request_status else 'waitlisted'::public.event_request_status end,
    updated_at=now()
from ranked where ranked.id=r.id;
