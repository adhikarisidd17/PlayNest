import{Calendar,ChevronLeft,Clock,ExternalLink,Flag,Languages,MapPin,Share2,ShieldCheck,Trash2,Users}from'lucide-react';import{format}from'date-fns';import{Link,useNavigate,useParams}from'react-router-dom';import{useEffect,useState}from'react';import{examples}from'../data/demo';import{supabase}from'../lib/supabase';import{downloadIcs,googleCalendarUrl}from'../lib/calendar';import{useAuth}from'../App';import type{PlayEvent}from'../types';
type EventRow=PlayEvent&{venue:PlayEvent['venue']|null;locality:PlayEvent['locality']|null;organizer:{first_name:string;community_vouched_at:string|null}|null};
export function EventDetail(){const{id}=useParams();const navigate=useNavigate();const{session}=useAuth();const[event,setEvent]=useState<PlayEvent|undefined>(()=>examples.find(x=>x.id===id));const[loading,setLoading]=useState(!event);const[deleting,setDeleting]=useState(false);const[error,setError]=useState('');useEffect(()=>{if(!id||event)return;let active=true;async function load(){const[eventResult,capacityResult]=await Promise.all([supabase.from('events').select('*,venue:venues(id,name,address_text,directions_url),locality:localities(id,name,city,country_code,timezone),organizer:profiles!events_organizer_id_fkey(first_name,community_vouched_at)').eq('id',id).single(),supabase.rpc('event_capacities')]);if(!active)return;if(eventResult.error)setError(eventResult.error.message);else{const row=eventResult.data as EventRow;const capacity=(capacityResult.data as {event_id:string;accepted_children:number}[]|null)?.find(c=>c.event_id===id);setEvent({...row,venue:row.venue??undefined,locality:row.locality??undefined,organizer_name:row.organizer?.first_name,community_vouched:Boolean(row.organizer?.community_vouched_at),accepted_children:capacity?.accepted_children??0})}setLoading(false)}void load();return()=>{active=false}},[id,event]);if(loading)return <div className="center">
<div className="spinner"/>Loading event…</div>;if(!event)return <div className="empty">
<h1>Event not found</h1>
<p>{error}</p>
<Link to="/discover">Back to discover</Link>
</div>;const e=event;const isOwner=Boolean(session&&e.organizer_id===session.user.id);const isPast=e.status==='completed'||new Date(e.ends_at).getTime()<Date.now();const remaining=Math.max(0,e.max_children-(e.accepted_children??0));
async function share(){
  const configuredOrigin=(import.meta.env.VITE_PUBLIC_APP_URL as string|undefined)?.replace(/\/$/,'');
  const url=`${configuredOrigin||window.location.origin}/events/${e.id}`;
  const data={title:e.title,text:'See this guardian-attended activity on PlayNest',url};
  if(navigator.share&&(!navigator.canShare||navigator.canShare(data))){
    try{await navigator.share(data);return}catch(reason){if(reason instanceof DOMException&&reason.name==='AbortError')return}
  }
  try{
    if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(url);
    else{const input=document.createElement('textarea');input.value=url;input.style.position='fixed';input.style.opacity='0';document.body.appendChild(input);input.select();const copied=document.execCommand('copy');input.remove();if(!copied)throw new Error('Copy unavailable')}
    window.alert('Event link copied.');
  }catch{window.prompt('Copy this event link:',url)}
}
async function remove(){if(!confirm(`Delete “${e.title}”? This permanently removes the event and its requests.`))return;setDeleting(true);const{error}=await supabase.from('events').delete().eq('id',e.id);if(error){setError(error.message);setDeleting(false);return}navigate('/discover',{replace:true})}return <article className="detail">
<Link className="back" to="/discover">
<ChevronLeft/> Back to discover</Link>{error&&<p className="notice" role="alert">{error}</p>}<div className="detail-head">
<div>
<span className="eyebrow">{e.is_example?'Completed demonstration':isPast?'Past event':e.category}</span>
<h1>{e.title}</h1>
<p>{e.description}</p>{e.organizer_name&&<p className="organizer-line">Hosted by <b>{e.organizer_name}</b>{e.community_vouched?' · Community vouched':''}</p>}</div>
<button className="button secondary small share-event-button" onClick={share}><Share2/> Share event</button>
</div>
<div className="detail-grid">
<div>
<section className="info-card">
<h2>When & where</h2>
<p>
<Calendar/>
<span>
<b>{format(new Date(e.starts_at),'EEEE d MMMM yyyy')}</b>
<br/>{format(new Date(e.starts_at),'HH:mm')}–{format(new Date(e.ends_at),'HH:mm')} ({e.timezone})</span>
</p>
<p>
<MapPin/>
<span>
<b>{e.venue?.name}</b>
<br/>{e.venue?.address_text}</span>
</p>
<div className="actions">
<a className="button secondary small" href={e.venue?.directions_url??`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue?.name} ${e.venue?.address_text}`)}`} target="_blank" rel="noreferrer">Directions <ExternalLink/>
</a>
<button className="button secondary small" onClick={()=>downloadIcs(e)}>Download .ics</button>
<a className="button secondary small" href={googleCalendarUrl(e)} target="_blank" rel="noreferrer">Google Calendar</a>
</div>
</section>
<section className="info-card">
<h2>About this activity</h2>
<div className="fact-grid">
<p>
<Users/>
<span>
<small>Capacity</small>{isPast?`${e.accepted_children??0} attended`:`${remaining} of ${e.max_children} places remaining`}</span>
</p>
<p>
<Users/>
<span>
<small>Suitable ages</small>{e.age_bands.join(', ')}</span>
</p>
<p>
<ShieldCheck/>
<span>
<small>Supervision</small>Guardian required</span>
</p>
<p>
<Languages/>
<span>
<small>Languages</small>{e.languages.join(', ')}</span>
</p>
<p>
<Clock/>
<span>
<small>Setting</small>{e.environment}</span>
</p>
</div>
</section>
<div className="event-controls">
<button className="text-button danger">
<Flag/> Report this event</button>{isOwner&&!e.is_example&&<button className="text-button danger" onClick={remove} disabled={deleting}>
<Trash2/> {deleting?'Deleting…':'Delete my event'}</button>}</div>
</div>
<aside className="join-card">
<ShieldCheck/>
<h2>{isOwner?'You created this event':e.is_example?'Completed demonstration':isPast?'This event has ended':'Request a place'}</h2>
<p>{isOwner?'You can manage or delete this event as its organizer.':e.is_example?'This demonstration is clearly labelled and cannot be joined.':isPast?'Past events remain visible as history but no longer accept requests.':'Sign in and choose the child profiles you want to share privately with the organizer.'}</p>{!isOwner&&<button className="button" disabled={e.is_example||isPast||remaining===0}>{e.is_example||isPast?'Joining unavailable':remaining===0?'Event full':'Request a place'}</button>}<small>Guardians must attend and remain responsible for their children.</small>
</aside>
</div>
</article>}
