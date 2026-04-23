'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating';
import { useToast } from '../../components/Toast';

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const STATUS_OPTIONS = [
  { value: 'want_to_watch', label: 'Quiero ver', color: '#6366f1', bg: 'rgba(99,102,241,.18)',  border: 'rgba(99,102,241,.35)' },
  { value: 'watching',      label: 'Viendo',     color: '#f59e0b', bg: 'rgba(245,158,11,.18)',  border: 'rgba(245,158,11,.35)' },
  { value: 'watched',       label: 'Visto',      color: '#22c55e', bg: 'rgba(34,197,94,.18)',   border: 'rgba(34,197,94,.35)'  },
];

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const GripIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="5" r="1.4"/><circle cx="15" cy="5" r="1.4"/>
    <circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/>
    <circle cx="9" cy="19" r="1.4"/><circle cx="15" cy="19" r="1.4"/>
  </svg>
);

const ListIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

export default function WatchlistPage() {
  const [watchlist,   setWatchlist]   = useState([]);
  const [user,        setUser]        = useState(null);
  const [filter,      setFilter]      = useState('all');
  const [loading,     setLoading]     = useState(true);
  const [hoveredId,   setHoveredId]   = useState(null);
  const [dragId,      setDragId]      = useState(null);
  const [dragOverId,  setDragOverId]  = useState(null);
  const router       = useRouter();
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
    } catch { addToast('No se pudo actualizar el estado', 'error'); }
  };

  const handleRating = async (e, item, rating) => {
    e.stopPropagation();
    try {
      const updated = await api.rateWatchlist(item.id, rating);
      setWatchlist(prev => prev.map(w => w.id === item.id ? updated : w));
      if (rating) addToast(`Calificaste "${item.title}" con ${rating}/10`);
    } catch { addToast('No se pudo guardar la calificación', 'error'); }
  };

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    const item = watchlist.find(w => w.id === id);
    try {
      await api.removeFromWatchlist(id);
      setWatchlist(prev => prev.filter(w => w.id !== id));
      addToast(`"${item?.title}" eliminado de tu lista`, 'error');
    } catch { addToast('No se pudo eliminar', 'error'); }
  };

  const handleDragStart = (e, id) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver  = (e, id) => { e.preventDefault(); if (id !== dragId) setDragOverId(id); };
  const handleDrop      = async (e, targetId) => {
    e.preventDefault();
    if (dragId === targetId) return;
    const newList    = [...watchlist];
    const dragIndex  = newList.findIndex(w => w.id === dragId);
    const targetIdx  = newList.findIndex(w => w.id === targetId);
    const [dragged]  = newList.splice(dragIndex, 1);
    newList.splice(targetIdx, 0, dragged);
    const withPositions = newList.map((item, i) => ({ ...item, position: i }));
    setWatchlist(withPositions);
    setDragId(null); setDragOverId(null);
    try { await api.reorderWatchlist(withPositions.map(({ id, position }) => ({ id, position }))); }
    catch (err) { console.error(err); }
  };
  const handleDragEnd = () => { setDragId(null); setDragOverId(null); };

  const counts = {
    all:           watchlist.length,
    want_to_watch: watchlist.filter(w => w.status === 'want_to_watch').length,
    watching:      watchlist.filter(w => w.status === 'watching').length,
    watched:       watchlist.filter(w => w.status === 'watched').length,
  };

  const filtered = filter === 'all' ? watchlist : watchlist.filter(w => w.status === filter);

  const FILTERS = [
    { value: 'all',           label: 'Todo' },
    { value: 'want_to_watch', label: 'Quiero ver' },
    { value: 'watching',      label: 'Viendo' },
    { value: 'watched',       label: 'Visto' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#f1f5f9' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        .card-overlay { opacity:0; transition:opacity .25s; }
        .wl-card:hover .card-overlay  { opacity:1; }
        .wl-card:hover { box-shadow:0 20px 48px rgba(0,0,0,.55) !important; }
        .drag-hint { opacity:0; transition:opacity .2s; }
        .wl-card:hover .drag-hint { opacity:1; }
        .filter-btn:hover { background:rgba(255,255,255,.07) !important; color:#94a3b8 !important; }
        .status-opt:hover { background:rgba(255,255,255,.08) !important; }
        @media (max-width: 640px) {
          .wl-page-pad { padding: 80px 16px 60px !important; }
          .wl-header   { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      <Navbar user={user} />

      <div className="wl-page-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 32px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: '#e50914', marginBottom: 8 }}>Tu colección</p>
          <div className="wl-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, fontWeight: 400, letterSpacing: '.02em', color: '#fff', lineHeight: 1 }}>Mi lista</h1>
            <div style={{ display: 'flex', gap: 28 }}>
              {STATUS_OPTIONS.map(s => (
                <div key={s.value} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: s.color, lineHeight: 1 }}>{counts[s.value]}</div>
                  <div style={{ fontSize: 11, color: '#334155', marginTop: 3, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.value} className="filter-btn" onClick={() => setFilter(f.value)}
              style={{ padding: '8px 18px', borderRadius: 9, border: '1px solid', borderColor: filter === f.value ? 'rgba(229,9,20,.4)' : 'rgba(255,255,255,.08)', background: filter === f.value ? 'rgba(229,9,20,.12)' : 'rgba(255,255,255,.03)', color: filter === f.value ? '#f87171' : '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all .18s', display: 'flex', alignItems: 'center', gap: 8 }}>
              {f.label}
              <span style={{ background: 'rgba(255,255,255,.07)', borderRadius: 999, padding: '1px 7px', fontSize: 11, color: filter === f.value ? '#f87171' : '#475569' }}>{counts[f.value]}</span>
            </button>
          ))}
        </div>

        {filtered.length > 1 && (
          <p style={{ fontSize: 12, color: '#334155', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
            <GripIcon /> Arrastrá las cards para reordenar tu lista
          </p>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 18 }}>
            {[...Array(8)].map((_, i) => <div key={i} style={{ borderRadius: 14, paddingBottom: '150%', background: '#141420', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * .07}s` }} />)}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign: 'center', padding: '100px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><ListIcon /></div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontWeight: 400, letterSpacing: '.02em', marginBottom: 10, color: '#fff' }}>
              {filter === 'all' ? 'Tu lista está vacía' : `Nada en "${FILTERS.find(f => f.value === filter)?.label}"`}
            </h3>
            <p style={{ color: '#475569', fontSize: 15, fontWeight: 500, marginBottom: 28 }}>
              {filter === 'all' ? 'Explorá tendencias y agregá lo que querés ver' : 'Cambiá el filtro para ver otros títulos'}
            </p>
            <button onClick={() => filter === 'all' ? router.push('/home') : setFilter('all')}
              style={{ padding: '12px 28px', borderRadius: 9, border: 'none', background: '#e50914', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, transition: 'background .18s' }}>
              {filter === 'all' ? 'Explorar tendencias' : 'Ver todo'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 18 }}>
            {filtered.map((item, i) => {
              const statusInfo = STATUS_OPTIONS.find(s => s.value === item.status);
              const isDragging = dragId === item.id;
              const isDragOver = dragOverId === item.id;
              return (
                <div key={item.id} className="wl-card"
                  draggable
                  onDragStart={e => handleDragStart(e, item.id)}
                  onDragOver={e => handleDragOver(e, item.id)}
                  onDrop={e => handleDrop(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => !dragId && router.push(`/${item.media_type}/${item.tmdb_id}`)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ borderRadius: 14, overflow: 'hidden', background: '#141420', border: `1px solid ${isDragOver ? 'rgba(229,9,20,.5)' : 'rgba(255,255,255,.06)'}`, cursor: 'grab', transition: 'all .2s', position: 'relative', animation: 'fadeUp .4s ease forwards', animationDelay: `${i * .04}s`, opacity: isDragging ? .35 : 0, transform: isDragOver ? 'scale(1.03)' : 'scale(1)' }}>

                  {/* Drag hint */}
                  <div className="drag-hint" style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(0,0,0,.65)', borderRadius: 4, padding: '3px 8px', fontSize: 10, color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 5, backdropFilter: 'blur(4px)' }}>
                    <GripIcon /> arrastrar
                  </div>

                  {/* Poster */}
                  <div style={{ position: 'relative', paddingBottom: '150%', background: '#1e1e2e' }}>
                    {item.poster_path
                      ? <img src={`${IMG_BASE}${item.poster_path}`} alt={item.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'rgba(255,255,255,.1)' }}>—</div>
                    }
                    <div style={{ position: 'absolute', top: 8, left: 8, background: item.media_type === 'movie' ? 'rgba(229,9,20,.9)' : 'rgba(99,102,241,.9)', borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '.04em' }}>
                      {item.media_type === 'movie' ? 'PELÍCULA' : 'SERIE'}
                    </div>
                    <div style={{ position: 'absolute', top: 8, right: 8, background: statusInfo?.bg, border: `1px solid ${statusInfo?.border}`, color: statusInfo?.color, borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700, transition: 'opacity .2s', opacity: hoveredId === item.id ? 0 : 1 }}>
                      {statusInfo?.label}
                    </div>

                    {/* Hover overlay */}
                    <div className="card-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,16,.98) 52%, rgba(8,8,16,.45) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 12 }} onClick={e => e.stopPropagation()}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</p>
                      <button onClick={() => router.push(`/${item.media_type}/${item.tmdb_id}`)}
                        style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.07)', color: '#f1f5f9', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', marginBottom: 8, textAlign: 'center', transition: 'background .15s' }}>
                        Ver detalles →
                      </button>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                        {STATUS_OPTIONS.map(s => (
                          <button key={s.value} className="status-opt" onClick={e => handleStatus(e, item, s.value)}
                            style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid', borderColor: item.status === s.value ? s.border : 'rgba(255,255,255,.07)', background: item.status === s.value ? s.bg : 'rgba(255,255,255,.03)', color: item.status === s.value ? s.color : '#64748b', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', textAlign: 'left', transition: 'all .15s' }}>
                            {s.label}
                          </button>
                        ))}
                      </div>

                      {item.status === 'watched' && (
                        <div style={{ marginBottom: 8 }}>
                          <p style={{ fontSize: 10, color: '#475569', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Tu calificación</p>
                          <StarRating value={item.user_rating} onChange={(rating) => handleRating({ stopPropagation: () => {} }, item, rating)} size={14} />
                        </div>
                      )}

                      <button onClick={e => handleRemove(e, item.id)}
                        style={{ padding: '6px', borderRadius: 7, border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.08)', color: '#f87171', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background .15s' }}>
                        <TrashIcon /> Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{item.title}</p>
                    {item.user_rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <StarIcon />
                        <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>{item.user_rating}/10</span>
                      </div>
                    )}
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
