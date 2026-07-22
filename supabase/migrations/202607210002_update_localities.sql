-- Keep the beta launch area limited to the three supported cities. Update in
-- collision-safe order because the initial seed used Uppsala for the third ID.
update public.localities set name='Malmö',city='Malmö',country_code='SE',timezone='Europe/Stockholm',status='active' where id='10000000-0000-0000-0000-000000000003';
update public.localities set name='Uppsala',city='Uppsala',country_code='SE',timezone='Europe/Stockholm',status='active' where id='10000000-0000-0000-0000-000000000002';
update public.localities set name='Stockholm',city='Stockholm',country_code='SE',timezone='Europe/Stockholm',status='active' where id='10000000-0000-0000-0000-000000000001';
insert into public.localities(id,name,city,country_code,timezone,status) values
('10000000-0000-0000-0000-000000000001','Stockholm','Stockholm','SE','Europe/Stockholm','active'),
('10000000-0000-0000-0000-000000000002','Uppsala','Uppsala','SE','Europe/Stockholm','active'),
('10000000-0000-0000-0000-000000000003','Malmö','Malmö','SE','Europe/Stockholm','active')
on conflict(id) do nothing;
update public.localities set status='disabled' where id not in('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000003');
