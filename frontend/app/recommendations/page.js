'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import MediaCard from '../../components/MediaCard';
import { useToast } from '../../components/Toast';

const SparkleIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const FilmIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="7" x2="22" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/>
  </svg>
);

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [topGenres,        setTopGenres]        = useState([]);
  const [watchlist,        setWatchlist]        = useState([]);
  const [user,             setUser]             = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [empty,            setEmpty]            = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    Promise.all([api.getRecommendations(), api.getWatchlist()])
      .then(([rec, w]) => {
        if (rec.empty) { setEmpty(true); return; }
        setRecommendations(rec.results || []);
        setTopGenres(rec.topGenres || []);
        setWatchlist(w);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const watchlistMap = Object.fromEntries(watchlist.map(w => [`${w.media_type}-${w.tmdb_id}`, w]));

  const handleAdd = async (item, type, status = 'want_to_watch') => {
    if (watchlistMap[`${type}-${item.id}`]) return;
    try {
      const added = await api.addToWatchlist({ tmdb_id: item.id, media_type: type, title: item.title || item.name, poster_path: item.poster_path, status });
      setWatchlist(prev => [...prev, added]);
      addToast(`"${item.title || item.name}" agregado a tu lista`);
    } catch { addToast('No se pudo agregar a la lista', 'error'); }
  };

  const handleRemove = async (watchlistItem) => {
    try {
      await api.removeFromWatchlist(watchlistItem.id);
      setWatchlist(prev => prev.filter(w => w.id !== watchlistItem.id));
      addToast(`"${watchlistItem.title}" quitado de tu lista`, 'error');
    } catch { addToast('No se pudo quitar de la lista', 'error'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#f1f5f9' }}>
      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .search-btn:hover { background:#c8070f !important; }
      `}</style>

      <Navbar user={user} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 32px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40, animation: 'fadeUp .4s ease forwards' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: '#e50914', marginBottom: 8 }}>Personalizado para vos</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 400, letterSpacing: '.02em', marginBottom: 16, color: '#fff' }}>
            Recomendaciones
          </h1>
          {!loading && !empty && topGenres.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Basado en tus géneros favoritos:</span>
              {topGenres.map(g => (
                <span key={g.id} style={{ background: 'rgba(229,9,20,.1)', border: '1px solid rgba(229,9,20,.28)', color: '#f87171', borderRadius: 999, padding: '4px 13px', fontSize: 12, fontWeight: 600 }}>
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: 18 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ borderRadius: 12, paddingBottom: '150%', background: 'rgba(255,255,255,.025)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * .05}s` }} />
            ))}
          </div>
        )}

        {/* Empty watchlist */}
        {!loading && empty && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><FilmIcon /></div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontWeight: 400, marginBottom: 10, color: '#f1f5f9' }}>Tu lista está vacía</h2>
            <p style={{ color: '#475569', fontSize: 15, fontWeight: 500, marginBottom: 28 }}>
              Agregá algunas películas o series a tu watchlist y te recomendamos títulos similares.
            </p>
            <button className="search-btn" onClick={() => router.push('/search')}
              style={{ padding: '12px 28px', borderRadius: 9, border: 'none', background: '#e50914', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'background .18s' }}>
              Ir a buscar →
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !empty && recommendations.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
              <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{recommendations.length} títulos recomendados</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: 18 }}>
              {recommendations.map((item, i) => (
                <div key={`${item.media_type}-${item.id}`} style={{ animation: 'fadeUp .4s ease forwards', animationDelay: `${i * .03}s`, opacity: 0 }}>
                  <MediaCard item={item} onAdd={handleAdd} onRemove={handleRemove} watchlistMap={watchlistMap} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* No matches yet */}
        {!loading && !empty && recommendations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><SparkleIcon /></div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontWeight: 400, marginBottom: 10, color: '#f1f5f9' }}>Sin recomendaciones nuevas</h2>
            <p style={{ color: '#475569', fontSize: 15, fontWeight: 500 }}>
              Ya tenés casi todo lo popular de tus géneros favoritos. Probá explorar algo nuevo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
