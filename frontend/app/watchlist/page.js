'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { useToast } from '../../components/Toast';

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const STATUS_OPTIONS = [
  { value: 'want_to_watch', label: '🔖 Quiero ver', color: '#6366f1', bg: 'rgba(99,102,241,0.2)', border: 'rgba(99,102,241,0.4)' },
  { value: 'watching',      label: '▶️ Viendo',     color: '#f59e0b', bg: 'rgba(245,158,11,0.2)', border: 'rgba(245,158,11,0.4)' },
  { value: 'watched',       label: '✓ Visto',       color: '#22c55e', bg: 'rgba(34,197,94,0.2)',  border: 'rgba(34,197,94,0.4)' },
];

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const router = useRouter();
  const { addToast } = useToast();

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
      const labels = { want_to_watch: 'Quiero ver', watching: 'Viendo', watched: 'Visto' };
      addToast(`"${item.title}" → ${labels[status]}`);
    } catch (err) { addToast('No se pudo actualizar el estado', 'error'); }
  };

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    const item = watchlist.find(w => w.id === id);
    try {
      await api.removeFromWatchlist(id);
      setWatchlist(prev => prev.filter(w => w.id !== id));
      addToast(`"${item?.title}" eliminado de tu lista`, 'error');
    } catch (err) { addToast('No se pudo eliminar', 'error'); }
  };

  const filtered = filter === 'all' ? watchlist : watchlist.filter(w => w.status === filter);
  const counts = {
    all: watchlist.length,
    want_to_watch: watchlist.filter(w => w.status === 'want_to_watch').length,
    watching: watchlist.filter(w => w.status === 'watching').length,
    watched: watchlist.filter(w => w.status === 'watched').length,
  };

  const filters = [
    { value: 'all', label: 'Todo' },
    { value: 'want_to_watch', label: '🔖 Quiero ver' },
    { value: 'watching', label: '▶️ Viendo' },
    { value: 'watched', label: '✓ Visto' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080810', fontFamily: "'Inter', system-ui, sans-serif", color: '#f1f5f9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Bebas+Neue&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .card-overlay { opacity: 0; transition: opacity 0.25s ease; }
        .watchlist-card:hover .card-overlay { opacity: 1; }
        .watchlist-card:hover { transform: translateY(-6px) !important; box-shadow: 0 20px 50px rgba(0,0,0,0.6) !important; }
        .filter-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .status-option:hover { background: rgba(255,255,255,0.1) !important; }
      `}</style>

      <Navbar user={user} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 32px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#e50914', marginBottom: 8 }}>Tu colección</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, fontWeight: 400, letterSpacing: 1, color: '#fff', lineHeight: 1 }}>
              Mi lista
            </h1>
            <div style={{ display: 'flex', gap: 24 }}>
              {STATUS_OPTIONS.map(s => (
                <div key={s.value} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: s.color, lineHeight: 1 }}>{counts[s.value]}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{s.label.replace(/^[^\s]+\s/, '')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 36, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f.value}
              className="filter-btn"
              onClick={() => setFilter(f.value)}
              style={{
                padding: '9px 20px', borderRadius: 10, border: '1px solid',
                borderColor: filter === f.value ? 'rgba(229,9,20,0.4)' : 'rgba(255,255,255,0.08)',
                background: filter === f.value ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.04)',
                color: filter === f.value ? '#f87171' : '#64748b',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {f.label}
              <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 999, padding: '1px 8px', fontSize: 11, color: filter === f.value ? '#f87171' : '#475569' }}>
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ borderRadius: 14, paddingBottom: '150%', background: '#141420', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.07}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 24px' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>📋</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontWeight: 400, letterSpacing: 1, marginBottom: 10, color: '#fff' }}>
              {filter === 'all' ? 'Tu lista está vacía' : `Nada en "${filters.find(f => f.value === filter)?.label}"`}
            </h3>
            <p style={{ color: '#475569', fontSize: 15, marginBottom: 28 }}>
              {filter === 'all' ? 'Explorá tendencias y agregá lo que querés ver' : 'Cambiá el filtro para ver otros títulos'}
            </p>
            <button
              onClick={() => filter === 'all' ? router.push('/home') : setFilter('all')}
              style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #e50914, #b81c1c)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, boxShadow: '0 4px 16px rgba(229,9,20,0.3)' }}
            >
              {filter === 'all' ? 'Explorar tendencias' : 'Ver todo'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
            {filtered.map((item, i) => {
              const statusInfo = STATUS_OPTIONS.find(s => s.value === item.status);
              const isHovered = hoveredId === item.id;
              return (
                <div
                  key={item.id}
                  className="watchlist-card"
                  onClick={() => router.push(`/${item.media_type}/${item.tmdb_id}`)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    borderRadius: 14, overflow: 'hidden', background: '#141420',
                    border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                    transition: 'all 0.25s', position: 'relative',
                    animation: `fadeUp 0.4s ease forwards`,
                    animationDelay: `${i * 0.04}s`, opacity: 0,
                  }}
                >
                  {/* Poster */}
                  <div style={{ position: 'relative', paddingBottom: '150%', background: '#1e1e2e' }}>
                    {item.poster_path
                      ? <img src={`${IMG_BASE}${item.poster_path}`} alt={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎬</div>
                    }

                    {/* Type badge */}
                    <div style={{ position: 'absolute', top: 8, left: 8, background: item.media_type === 'movie' ? 'rgba(229,9,20,0.9)' : 'rgba(99,102,241,0.9)', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                      {item.media_type === 'movie' ? 'PELÍCULA' : 'SERIE'}
                    </div>

                    {/* Status badge */}
                    <div style={{ position: 'absolute', top: 8, right: 8, background: statusInfo?.bg, border: `1px solid ${statusInfo?.border}`, color: statusInfo?.color, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, transition: 'opacity 0.2s', opacity: isHovered ? 0 : 1 }}>
                      {statusInfo?.label}
                    </div>

                    {/* Hover overlay */}
                    <div className="card-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,16,0.98) 50%, rgba(8,8,16,0.5) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 12 }} onClick={e => e.stopPropagation()}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 10, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {STATUS_OPTIONS.map(s => (
                          <button
                            key={s.value}
                            className="status-option"
                            onClick={e => handleStatus(e, item, s.value)}
                            style={{
                              padding: '6px 10px', borderRadius: 8, border: '1px solid',
                              borderColor: item.status === s.value ? s.border : 'rgba(255,255,255,0.08)',
                              background: item.status === s.value ? s.bg : 'rgba(255,255,255,0.04)',
                              color: item.status === s.value ? s.color : '#64748b',
                              cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                              textAlign: 'left', transition: 'all 0.15s',
                            }}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={e => handleRemove(e, item.id)}
                        style={{ marginTop: 8, padding: '6px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s' }}
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Title below card */}
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{item.title}</p>
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
