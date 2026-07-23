import {Search} from 'lucide-react';
import {addDays, addWeeks, endOfDay, endOfWeek, isToday, startOfWeek} from 'date-fns';
import {useEffect, useMemo, useState} from 'react';
import {EventCard} from '../components/EventCard';
import {MultiSelectFilter} from '../components/MultiSelectFilter';
import {localities} from '../data/demo';
import {supabase} from '../lib/supabase';
import type {AgeBand, PlayEvent} from '../types';

type EventRow = PlayEvent & {
  venue: PlayEvent['venue'] | null;
  locality: PlayEvent['locality'] | null;
  organizer: {first_name: string; verification_status: string; community_vouched_at: string | null} | null;
};
type Capacity = {event_id: string; accepted_children: number};
type DateFilter = 'today' | 'weekend' | 'next-week';
type EnvironmentFilter = 'indoor' | 'outdoor';
const ageBands: AgeBand[] = ['0–2', '3–5', '6–8', '9–12', '13+'];

export function Discover() {
  const [q, setQ] = useState('');
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<AgeBand[]>([]);
  const [selectedDates, setSelectedDates] = useState<DateFilter[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<EnvironmentFilter[]>([]);
  const [events, setEvents] = useState<PlayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const [eventResult, capacityResult] = await Promise.all([
        supabase.from('events').select('*,venue:venues(id,name,address_text,directions_url),locality:localities(id,name,city,country_code,timezone),organizer:profiles!events_organizer_id_fkey(first_name,verification_status,community_vouched_at)').eq('is_example', false).in('status', ['published', 'completed']).order('starts_at', {ascending: true}),
        supabase.rpc('event_capacities'),
      ]);
      if (!active) return;
      if (eventResult.error) setError(eventResult.error.message);
      else {
        const capacities = new Map(((capacityResult.data ?? []) as Capacity[]).map(capacity => [capacity.event_id, capacity.accepted_children]));
        setEvents(((eventResult.data ?? []) as EventRow[]).map(event => ({
          ...event,
          venue: event.venue ?? undefined,
          locality: event.locality ?? undefined,
          organizer_name: event.organizer?.first_name,
          organizer_verified: event.organizer?.verification_status === 'email_verified',
          community_vouched: Boolean(event.organizer?.community_vouched_at),
          accepted_children: capacities.get(event.id) ?? 0,
        })));
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    const thisWeek = startOfWeek(now, {weekStartsOn: 1});
    const weekendStart = addDays(thisWeek, 5);
    const weekendEnd = endOfDay(addDays(thisWeek, 6));
    const nextWeekStart = startOfWeek(addWeeks(now, 1), {weekStartsOn: 1});
    const nextWeekEnd = endOfWeek(addWeeks(now, 1), {weekStartsOn: 1});
    return events.filter(event => {
      const starts = new Date(event.starts_at);
      const dateMatches = selectedDates.length === 0 || selectedDates.some(value =>
        value === 'today' && isToday(starts)
        || value === 'weekend' && starts >= weekendStart && starts <= weekendEnd
        || value === 'next-week' && starts >= nextWeekStart && starts <= nextWeekEnd);
      const localityMatches = selectedLocalities.length === 0 || selectedLocalities.includes(event.locality_id);
      const ageMatches = selectedAges.length === 0 || selectedAges.some(value => event.age_bands.includes(value));
      const environmentMatches = selectedEnvironments.length === 0
        || selectedEnvironments.includes(event.environment as EnvironmentFilter)
        || event.environment === 'both';
      return localityMatches && ageMatches && environmentMatches && dateMatches
        && event.title.toLowerCase().includes(q.trim().toLowerCase());
    });
  }, [events, q, selectedLocalities, selectedAges, selectedDates, selectedEnvironments]);

  const now = Date.now();
  const upcoming = filtered.filter(event => event.status === 'published' && new Date(event.ends_at).getTime() >= now);
  const past = filtered.filter(event => event.status === 'completed' || new Date(event.ends_at).getTime() < now);
  const hasFilters = Boolean(q.trim() || selectedLocalities.length || selectedAges.length || selectedDates.length || selectedEnvironments.length);
  function clearFilters() {
    setQ('');
    setSelectedLocalities([]);
    setSelectedAges([]);
    setSelectedDates([]);
    setSelectedEnvironments([]);
  }

  return <>
    <div className="page-title"><span className="eyebrow">Discover</span><h1>What’s happening nearby?</h1><p>Browse real activities published by local organizers.</p></div>
    <div className="filters discover-filters">
      <label className="search"><Search/><span className="sr-only">Search events</span><input value={q} onChange={event => setQ(event.target.value)} placeholder="Search activities"/></label>
      <MultiSelectFilter label="Localities" allLabel="All localities" options={localities.map(item => ({value: item.id, label: item.name}))} values={selectedLocalities} onChange={setSelectedLocalities}/>
      <MultiSelectFilter label="Age groups" allLabel="All ages" options={ageBands.map(value => ({value, label: `${value} years`}))} values={selectedAges} onChange={setSelectedAges}/>
      <MultiSelectFilter label="Dates" allLabel="Any date" options={[{value: 'today', label: 'Today'}, {value: 'weekend', label: 'This weekend'}, {value: 'next-week', label: 'Next week'}]} values={selectedDates} onChange={setSelectedDates}/>
      <MultiSelectFilter label="Environment" allLabel="Indoor & outdoor" options={[{value: 'indoor', label: 'Indoor'}, {value: 'outdoor', label: 'Outdoor'}]} values={selectedEnvironments} onChange={setSelectedEnvironments}/>
    </div>
    {error && <p className="notice" role="alert">Could not load events: {error}</p>}
    {loading ? <div className="center"><div className="spinner"/>Loading events…</div> : filtered.length === 0 && hasFilters
      ? <div className="empty"><h2>No matching events</h2><p>No events match your current search and filters. Try broadening them.</p><button className="button secondary small" onClick={clearFilters}>Clear filters</button></div>
      : <>{upcoming.length ? <><div className="section-head"><h2>Upcoming events</h2><span>{upcoming.length} available</span></div><div className="card-grid">{upcoming.map(event => <EventCard event={event} key={event.id}/>)}</div></>
        : <section className="empty-callout"><h2>Playdates are starting in this area.</h2><p>There are no upcoming events yet. Host the first event or invite another parent.</p><div className="actions"><a className="button small" href="/create">Host the first event</a></div></section>}
      {past.length > 0 && <><div className="section-head past-heading"><h2>Past events</h2><span>Completed activities</span></div><div className="card-grid">{past.map(event => <EventCard event={event} key={event.id}/>)}</div></>}</>}
  </>;
}
