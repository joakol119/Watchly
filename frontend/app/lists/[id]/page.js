'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import Navbar from '../../../components/Navbar';
import { useToast } from '../../../components/Toast';

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const FilmIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="7" x2="22" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/>
  </svg>
);

const FilmIconLg = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="7" x2="22" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/>
  </svg>
);

const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function ListDetailPage() {
  const [list,       setList]       = useState(null);
  const [user,       setUser]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const router = useRouter();
  const { id } = useParams();
  const { addToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    api.getList(id).then(setList).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleRemove = async (item) => {
    setRemovingId(item.id);
    try {
      await api.removeFromList(id, item.id);
      setList(prev => ({ ...prev, items: prev.items.filter(i => i.id !== item.id) }));
      addToast(`"${item.title}" quitado de la lista`, 'error');
    } catch { addToast('No se pudo quitar de la lista', 'error'); }
    finally { setRemovingId(null); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 38, height: 38, border: '2px solid rgba(229,9,20,.2)', borderTop: '2px solid #e50914', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
    </div>
  );
  if (!list) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#f1f5f9' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .item-card:hover  { box-shadow:0 14px 36px rgba(0,0,0,.5) !important; transform:translateY(-4px) !important; }
        .remove-btn       { opacity:0; transition:opacity .2s; }
        .item-card:hover .remove-btn { opacity:1; }
        .back-btn:hover   { background:rgba(255,255,255,.09) !important; }
        .search-btn:hover { background:#c8070f !important; }
      `}</style>

      <Navbar user={user} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 32px 80px' }}>

        {/* Back */}
        <button className="back-btn" onClick={() => router.push('/lists')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', marginBottom: 36, transition: 'background .18s' }}>
          ← Mis listas
        </button>

        {/* Header */}
        <div style={{ marginBottom: 40, animation: 'fadeUp .4s ease forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 6 }}>
            <span style={{ fontSize: 44 }}>{list.emoji}</span>
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 400, letterSpacing: '.02em', color: '#fff', lineHeight: 1, margin: 0 }}>
                {list.name}
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569', fontWeight: 500 }}>
                {list.items.length === 0 ? 'Sin títulos' : `${list.items.length} título${list.items.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Empty */}
        {list.items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><FilmIconLg /></div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontWeight: 400, marginBottom: 10, color: '#f1f5f9' }}>Lista vacía</h2>
            <p style={{ color: '#475569', fontSize: 15, fontWeight: 500, marginBottom: 28 }}>
              Agregá títulos a esta lista desde la página de detalle de cualquier película o serie.
            </p>
            <button className="search-btn" onClick={() => router.push('/search')}
              style={{ padding: '12px 28px', borderRadius: 9, border: 'none', background: '#e50914', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'background .18s' }}>
              Ir a buscar →
            </button>
          </div>
        )}

        {/* Items grid */}
        {list.items.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: 18 }}>
            {list.items.map((item, i) => (
              <div key={item.id} className="item-card"
                style={{ borderRadius: 12, overflow: 'visible', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', transition: 'all .2s', position: 'relative', animation: 'fadeUp .4s ease forwards', animationDelay: `${i * .03}s`, opacity: 0 }}>
                <div style={{ borderRadius: '12px 12px 0 0', overflow: 'hidden', cursor: 'pointer' }} onClick={() => router.push(`/${item.media_type}/${item.tmdb_id}`)}>
                  <div style={{ position: 'relative', paddingBottom: '150%', background: '#1a1a2e' }}>
                    {item.poster_path
                      ? <img src={`${IMG_BASE}${item.poster_path}`} alt={item.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FilmIcon /></div>
                    }
                    <div style={{ position: 'absolute', top: 8, left: 8, background: item.media_type === 'movie' ? 'rgba(229,9,20,.9)' : 'rgba(99,102,241,.9)', borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                      {item.media_type === 'movie' ? 'PELÍCULA' : 'SERIE'}
                    </div>
                  </div>
                  <div style={{ padding: '11px 12px 8px' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.title}</p>
                  </div>
                </div>
                <div style={{ padding: '0 12px 12px' }}>
                  <button className="remove-btn" onClick={() => handleRemove(item)} disabled={removingId === item.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '6px', borderRadius: 7, border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.1)', color: '#f87171', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>
                    <XIcon />
                    {removingId === item.id ? '...' : 'Quitar de la lista'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
