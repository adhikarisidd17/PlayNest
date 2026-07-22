import {Search} from 'lucide-react';
import {addDays,addWeeks,endOfDay,endOfWeek,isToday,startOfWeek} from 'date-fns';
import {useEffect,useMemo,useState} from 'react';
import {EventCard} from '../components/EventCard';
import {localities} from '../data/demo';
import {supabase} from '../lib/supabase';
import type {AgeBand,PlayEvent} from '../types';

type EventRow=PlayEvent&{venue:PlayEvent['venue']|null;locality:PlayEvent['locality']|null;organizer:{first_name:string;community_vouched_at:string|null}|null};
type Capacity={event_id:string;accepted_children:number};
type DateFilter='all'|'today'|'weekend'|'next-week';
type EnvironmentFilter='all'|'indoor'|'outdoor';
const ageBands:AgeBand[]=['0–2','3–5','6–8','9–12','13+'];

export function Discover(){
  const[q,setQ]=useState('');
  const[locality,setLocality]=useState('all');
  const[age,setAge]=useState<'all'|AgeBand>('all');
  const[date,setDate]=useState<DateFilter>('all');
  const[environment,setEnvironment]=useState<EnvironmentFilter>('all');
  const[events,setEvents]=useState<PlayEvent[]>([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState('');

  useEffect(()=>{let active=true;async function load(){setLoading(true);const[eventResult,capacityResult]=await Promise.all([supabase.from('events').select('*,venue:venues(id,name,address_text,directions_url),locality:localities(id,name,city,country_code,timezone),organizer:profiles!events_organizer_id_fkey(first_name,community_vouched_at)').eq('is_example',false).in('status',['published','completed']).order('starts_at',{ascending:true}),supabase.rpc('event_capacities')]);if(!active)return;if(eventResult.error)setError(eventResult.error.message);else{const capacities=new Map(((capacityResult.data??[])as Capacity[]).map(c=>[c.event_id,c.accepted_children]));setEvents(((eventResult.data??[])as EventRow[]).map(e=>({...e,venue:e.venue??undefined,locality:e.locality??undefined,organizer_name:e.organizer?.first_name,community_vouched:Boolean(e.organizer?.community_vouched_at),accepted_children:capacities.get(e.id)??0})))}setLoading(false)}void load();return()=>{active=false}},[]);

  const filtered=useMemo(()=>{const now=new Date();const thisWeek=startOfWeek(now,{weekStartsOn:1});const weekendStart=addDays(thisWeek,5);const weekendEnd=endOfDay(addDays(thisWeek,6));const nextWeekStart=startOfWeek(addWeeks(now,1),{weekStartsOn:1});const nextWeekEnd=endOfWeek(addWeeks(now,1),{weekStartsOn:1});return events.filter(e=>{const starts=new Date(e.starts_at);const dateMatches=date==='all'||(date==='today'&&isToday(starts))||(date==='weekend'&&starts>=weekendStart&&starts<=weekendEnd)||(date==='next-week'&&starts>=nextWeekStart&&starts<=nextWeekEnd);return(locality==='all'||e.locality_id===locality)&&(age==='all'||e.age_bands.includes(age))&&(environment==='all'||e.environment===environment||e.environment==='both')&&dateMatches&&e.title.toLowerCase().includes(q.trim().toLowerCase())})},[events,q,locality,age,date,environment]);
  const now=Date.now();const upcoming=filtered.filter(e=>e.status==='published'&&new Date(e.ends_at).getTime()>=now);const past=filtered.filter(e=>e.status==='completed'||new Date(e.ends_at).getTime()<now);const hasFilters=Boolean(q.trim()||locality!=='all'||age!=='all'||date!=='all'||environment!=='all');
  function clearFilters(){setQ('');setLocality('all');setAge('all');setDate('all');setEnvironment('all')}

  return <><div className="page-title"><span className="eyebrow">Discover</span><h1>What’s happening nearby?</h1><p>Browse real activities published by local organizers.</p></div><div className="filters discover-filters"><label className="search"><Search/><span className="sr-only">Search events</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search activities"/></label><label><span className="sr-only">Locality</span><select value={locality} onChange={e=>setLocality(e.target.value)}><option value="all">All localities</option>{localities.map(l=><option value={l.id} key={l.id}>{l.name}</option>)}</select></label><label><span className="sr-only">Age group</span><select value={age} onChange={e=>setAge(e.target.value as 'all'|AgeBand)}><option value="all">All ages</option>{ageBands.map(x=><option value={x} key={x}>{x} years</option>)}</select></label><label><span className="sr-only">Date</span><select value={date} onChange={e=>setDate(e.target.value as DateFilter)}><option value="all">Any date</option><option value="today">Today</option><option value="weekend">This weekend</option><option value="next-week">Next week</option></select></label><label><span className="sr-only">Setting</span><select value={environment} onChange={e=>setEnvironment(e.target.value as EnvironmentFilter)}><option value="all">Indoor & outdoor</option><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option></select></label></div>{error&&<p className="notice" role="alert">Could not load events: {error}</p>}{loading?<div className="center"><div className="spinner"/>Loading events…</div>:filtered.length===0&&hasFilters?<div className="empty"><h2>No matching events</h2><p>No events match your current search and filters. Try broadening them.</p><button className="button secondary small" onClick={clearFilters}>Clear filters</button></div>:<>{upcoming.length?<><div className="section-head"><h2>Upcoming events</h2><span>{upcoming.length} available</span></div><div className="card-grid">{upcoming.map(e=><EventCard event={e} key={e.id}/>)}</div></>:<section className="empty-callout"><h2>Playdates are starting in this area.</h2><p>There are no upcoming events yet. Host the first event or invite another parent.</p><div className="actions"><a className="button small" href="/create">Host the first event</a></div></section>}{past.length>0&&<><div className="section-head past-heading"><h2>Past events</h2><span>Completed activities</span></div><div className="card-grid">{past.map(e=><EventCard event={e} key={e.id}/>)}</div></>}</>}</>}
