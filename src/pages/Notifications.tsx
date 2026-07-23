import {Bell, Check, CheckCheck, Trash2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../App';
import {supabase} from '../lib/supabase';

type Notice = {id: string; title: string; body: string; action_url: string | null; read_at: string | null; created_at: string};

export function Notifications() {
  const {session} = useAuth();
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) return;
    let active = true;
    async function load() {
      const {data, error: loadError} = await supabase
        .from('notifications')
        .select('id,title,body,action_url,read_at,created_at')
        .eq('user_id', session!.user.id)
        .order('created_at', {ascending: false});
      if (!active) return;
      if (loadError) setError(loadError.message);
      else setItems(data ?? []);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [session]);

  function notifyShell() {
    window.dispatchEvent(new Event('playnest:notifications-read'));
  }

  async function markRead(id: string) {
    if (!session) return;
    const now = new Date().toISOString();
    const {error: readError} = await supabase.from('notifications').update({read_at: now}).eq('id', id).eq('user_id', session.user.id);
    if (readError) {
      setError(readError.message);
      return;
    }
    setItems(xs => xs.map(x => x.id === id ? {...x, read_at: now} : x));
    notifyShell();
  }

  async function markAllRead() {
    if (!session) return;
    setBusy(true);
    setError('');
    const now = new Date().toISOString();
    const {error: readError} = await supabase.from('notifications').update({read_at: now}).eq('user_id', session.user.id).is('read_at', null);
    setBusy(false);
    if (readError) {
      setError(readError.message);
      return;
    }
    setItems(xs => xs.map(x => ({...x, read_at: x.read_at ?? now})));
    notifyShell();
  }

  async function clearAll() {
    if (!session || !window.confirm('Clear all notifications? This cannot be undone.')) return;
    setBusy(true);
    setError('');
    const ids = items.map(x => x.id);
    const {error: deleteError} = await supabase.from('notifications').delete().eq('user_id', session.user.id).in('id', ids);
    setBusy(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setItems([]);
    notifyShell();
  }

  const hasUnread = items.some(n => !n.read_at);
  return <>
    <div className="page-title notification-title">
      <span className="eyebrow">Notifications</span>
      <div className="notification-heading">
        <h1><Bell className={hasUnread ? 'bell-unread' : ''}/> What’s new</h1>
        {items.length > 0 && <div className="notification-actions">
          {hasUnread && <button className="button secondary small" disabled={busy} onClick={markAllRead}><CheckCheck/> Mark all as read</button>}
          <button className="text-button danger" disabled={busy} onClick={clearAll}><Trash2/> Clear all</button>
        </div>}
      </div>
    </div>
    {error && <p className="notice" role="alert">{error}</p>}
    {loading ? <div className="center"><div className="spinner"/>Loading notifications…</div> : items.length
      ? <div className="notification-list">{items.map(n => <article className={n.read_at ? 'read' : 'unread'} key={n.id}><Bell className={!n.read_at ? 'bell-unread' : ''}/><div><h2>{n.title}</h2><p>{n.body}</p>{n.action_url && <Link to={n.action_url}>View</Link>}</div>{!n.read_at && <button className="icon-button" aria-label={`Mark ${n.title} as read`} onClick={() => markRead(n.id)}><Check/></button>}</article>)}</div>
      : <div className="empty"><Bell/><h2>You’re all caught up</h2><p>Request decisions, event updates and publishing confirmations will appear here.</p></div>}
  </>;
}
