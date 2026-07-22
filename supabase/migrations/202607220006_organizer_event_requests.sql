create or replace function public.organizer_event_requests(p_event_id uuid)
returns table(id uuid,status public.event_request_status,child_count smallint,adult_count smallint,message text,created_at timestamptz,requester_name text,children jsonb)
language plpgsql security definer set search_path='' as $$
begin
if not exists(select 1 from public.events e where e.id=p_event_id and(e.organizer_id=auth.uid() or public.is_admin())) then raise exception 'Not authorized';end if;
return query select r.id,r.status,r.child_count,r.adult_count,r.message,r.created_at,p.first_name,
coalesce(jsonb_agg(jsonb_build_object('nickname',c.nickname,'age_band',c.age_band,'participation_notes',c.participation_notes)) filter(where c.id is not null),'[]'::jsonb)
from public.event_requests r join public.profiles p on p.id=r.requester_id left join public.event_request_children rc on rc.event_request_id=r.id left join public.children c on c.id=rc.child_id where r.event_id=p_event_id group by r.id,p.first_name order by r.created_at desc;
end$$;
revoke all on function public.organizer_event_requests(uuid) from public;grant execute on function public.organizer_event_requests(uuid) to authenticated;

create or replace function public.route_event_request_notification() returns trigger language plpgsql security definer set search_path='' as $$declare v_event_id uuid;begin if new.type='new_event_request' then select e.id into v_event_id from public.events e where e.organizer_id=new.user_id and new.body='A parent requested a place at '||e.title||'.' order by e.created_at desc limit 1;if v_event_id is not null then new.action_url:='/events/'||v_event_id::text;end if;end if;return new;end$$;
drop trigger if exists route_event_request_notification on public.notifications;create trigger route_event_request_notification before insert on public.notifications for each row execute function public.route_event_request_notification();
update public.notifications n set action_url='/events/'||e.id::text from public.events e where n.type='new_event_request' and n.body='A parent requested a place at '||e.title||'.';
