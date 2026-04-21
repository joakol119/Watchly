'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const STATUS_OPTIONS = [
  { value: 'want_to_watch', label: 'Quiero ver', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  { value: 'watching', label: 'Viendo', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { value: 'watched', label: '✓ Visto', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
];

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    api.getWatchlist().then(setWatchlist).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleStatus = async (e, item, status) => {
    e.stopPropagation();
    try {
      const updated = await api.updateWatchlist(item.id, status);
      setWatchlist(prev => prev.map(w => w.id === item.id ? updated : w));
    } catch (err) { console.error(err); }
  };

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    try {
      await api.removeFromWatchlist(id);
      setWatchlist(prev => prev.filter(w => w.id !== id));
    } catch (err) { console.error(err); }
  };

  const filtered = filter === 'all' ? watchlist : watchlist.filter(w => w.status === filter);
  const counts = {
    all: watchlist.length,
    want_to_watch: watchlist.filter(w => w.status === 'want_to_watch').length,
    watching: watchlist.filter(w => w.status === 'watching').length,
    watched: watchlist.filter(w => w.status === 'watched').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar user={user} />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 24px 60px' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Mi lista</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>{watchlist.length} títulos guardados</p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'Todo' },
            { value: 'want_to_watch', label: 'Quiero ver' },
            { value: 'watching', label: 'Viendo' },
            { value: 'watched', label: 'Visto' },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} style={{
              padding: '8px 18px', borderRadius: 10, border: 'none',
              background: filter === f.value ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.05)',
              color: filter === f.value ? '#f87171' : '#94a3b8',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {f.label}
              <span style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 999, padding: '1px 7px', fontSize: 11 }}>
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 12, paddingBottom: '180%', background: '#141420', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>
              {filter === 'all' ? 'Tu lista está vacía' : `No tenés nada en "${filter === 'want_to_watch' ? 'Quiero ver' : filter === 'watching' ? 'Viendo' : 'Visto'}"`}
            </h3>
            <p style={{ color: '#64748b', fontSize: 15, marginBottom: 24 }}>
              {filter === 'all' ? 'Explorá tendencias y agregá lo que querés ver' : 'Cambiá el filtro para ver otros títulos'}
            </p>
            <button onClick={() => filter === 'all' ? router.push('/home') : setFilter('all')} style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #e50914, #b81c1c)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
              {filter === 'all' ? 'Explorar tendencias' : 'Ver todo'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
            {filtered.map(item => {
              const statusInfo = STATUS_OPTIONS.find(s => s.value === item.status);
              return (
                <div key={item.id} onClick={() => router.push(`/${item.media_type}/${item.tmdb_id}`)}
                  style={{ borderRadius: 12, overflow: 'hidden', background: '#141420', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

                  {/* Poster */}
                  <div style={{ position: 'relative', paddingBottom: '150%', background: '#1e1e2e' }}>
                    {item.poster_path
                      ? <img src={`${IMG_BASE}${item.poster_path}`} alt={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎬</div>
                    }
                    {/* Badge de tipo */}
                    <div style={{ position: 'absolute', top: 8, left: 8, background: item.media_type === 'movie' ? 'rgba(229,9,20,0.9)' : 'rgba(99,102,241,0.9)', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                      {item.media_type === 'movie' ? 'PELÍCULA' : 'SERIE'}
                    </div>
                    {/* Badge de estado */}
                    <div style={{ position: 'absolute', top: 8, right: 8, background: statusInfo?.bg, border: `1px solid ${statusInfo?.color}`, color: statusInfo?.color, borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>
                      {statusInfo?.label}
                    </div>
                    {/* Botón eliminar */}
                    <button onClick={e => handleRemove(e, item.id)} style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#f87171', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '10px 10px 4px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.title}</p>
                    {/* Botones de estado */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 8 }} onClick={e => e.stopPropagation()}>
                      {STATUS_OPTIONS.map(s => (
                        <button key={s.value} onClick={e => handleStatus(e, item, s.value)} style={{
                          padding: '5px 8px', borderRadius: 7, border: 'none',
                          background: item.status === s.value ? s.bg : 'rgba(255,255,255,0.04)',
                          color: item.status === s.value ? s.color : '#475569',
                          cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                          textAlign: 'left', transition: 'all 0.15s',
                        }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
