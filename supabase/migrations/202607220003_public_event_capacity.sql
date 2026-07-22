create or replace function public.event_capacities()
returns table(event_id uuid, accepted_children integer, remaining_children integer)
language sql stable security definer set search_path=''
as $$
  select e.id,
    coalesce(sum(r.child_count) filter(where r.status='accepted'),0)::integer,
    greatest(e.max_children-coalesce(sum(r.child_count) filter(where r.status='accepted'),0),0)::integer
  from public.events e left join public.event_requests r on r.event_id=e.id
  where e.status in('published','completed')
  group by e.id,e.max_children
$$;
revoke all on function public.event_capacities() from public;
grant execute on function public.event_capacities() to anon,authenticated;
