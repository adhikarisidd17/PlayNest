create or replace function public.notify_event_published()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'published' and not new.is_example and new.organizer_id is not null then
    insert into public.notifications(user_id,type,title,body,action_url)
    values(new.organizer_id,'event_published','Event published',new.title||' is now visible in Discover.','/events/'||new.id::text);
  end if;
  return new;
end
$$;

drop trigger if exists event_published_notification on public.events;
create trigger event_published_notification after insert on public.events for each row execute function public.notify_event_published();

insert into public.notifications(user_id,type,title,body,action_url)
select e.organizer_id,'event_published','Event published',e.title||' is now visible in Discover.','/events/'||e.id::text
from public.events e
where e.status='published' and not e.is_example and e.organizer_id is not null
and not exists(select 1 from public.notifications n where n.user_id=e.organizer_id and n.type='event_published' and n.action_url='/events/'||e.id::text);
