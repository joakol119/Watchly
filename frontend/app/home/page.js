'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import MediaCard from '../../components/MediaCard';
import { useToast } from '../../components/Toast';

const IMG_BASE = 'https://image.tmdb.org/t/p/';
const PAGE_SIZE = 12;

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const TrendingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

export default function HomePage() {
  const [trending,     setTrending]     = useState([]);
  const [watchlist,    setWatchlist]    = useState([]);
  const [user,         setUser]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const router    = useRouter();
  const { addToast } = useToast();
  const loaderRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    Promise.all([api.getTrending(), api.getWatchlist()])
      .then(([t, w]) => { setTrending(t.results || []); setWatchlist(w); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = trending.find(item => item.backdrop_path);
  const rest      = trending.filter(item => item !== featured);

  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !loadingMore && visibleCount < rest.length) {
      setLoadingMore(true);
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + PAGE_SIZE, rest.length));
        setLoadingMore(false);
      }, 400);
    }
  }, [loadingMore, visibleCount, rest.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

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

  const visible = rest.slice(0, visibleCount);
  const hasMore = visibleCount < rest.length;

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#f1f5f9' }}>
      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1}   50%{opacity:.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .feat-btn-primary:hover  { transform:translateY(-2px); box-shadow:0 10px 28px rgba(229,9,20,.48) !important; }
        .feat-btn-secondary:hover { background:rgba(255,255,255,.14) !important; }
        @media (max-width: 640px) {
          .feat-hero { height: 420px !important; }
          .feat-hero-pad { padding: 0 18px !important; }
          .feat-hero-text h2 { font-size: 42px !important; }
          .feat-hero-text p { display: none !important; }
          .home-grid-pad { padding: 28px 16px 60px !important; }
        }
      `}</style>

      <Navbar user={user} />

      {loading ? (
        <div style={{ paddingTop: 64 }}>
          <div style={{ height: 520, background: '#141420', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 20 }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{ borderRadius: 12, paddingBottom: '150%', background: '#141420', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * .05}s` }} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Featured hero */}
          {featured && (
            <div className="feat-hero" style={{ position: 'relative', height: 560, marginTop: 64, overflow: 'hidden' }}>
              <img
                src={`${IMG_BASE}w1280${featured.backdrop_path}`}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,8,16,.96) 32%, rgba(8,8,16,.55) 60%, rgba(8,8,16,.15) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #080810 0%, transparent 42%)' }} />

              <div className="feat-hero-pad" style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 36px', height: '100%', display: 'flex', alignItems: 'center' }}>
                <div className="feat-hero-text" style={{ maxWidth: 520, animation: 'fadeUp .6s ease forwards' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <span style={{ background: featured.media_type === 'movie' ? 'rgba(229,9,20,.2)' : 'rgba(99,102,241,.2)', border: `1px solid ${featured.media_type === 'movie' ? 'rgba(229,9,20,.4)' : 'rgba(99,102,241,.4)'}`, color: featured.media_type === 'movie' ? '#f87171' : '#a5b4fc', borderRadius: 5, padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '.08em' }}>
                      {featured.media_type === 'movie' ? 'PELÍCULA' : 'SERIE'}
                    </span>
                    {featured.vote_average > 0 && (
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <StarIcon />{featured.vote_average.toFixed(1)}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>#1 en tendencias</span>
                  </div>

                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 400, lineHeight: .92, letterSpacing: '.02em', marginBottom: 16, color: '#fff' }}>
                    {featured.title || featured.name}
                  </h2>
                  <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.75, marginBottom: 28, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {featured.overview}
                  </p>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="feat-btn-primary" onClick={() => router.push(`/${featured.media_type}/${featured.id}`)}
                      style={{ padding: '11px 26px', borderRadius: 9, border: 'none', background: '#e50914', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'all .2s' }}>
                      Ver detalles →
                    </button>
                    {!watchlistMap[`${featured.media_type}-${featured.id}`] ? (
                      <button className="feat-btn-secondary" onClick={() => handleAdd(featured, featured.media_type)}
                        style={{ padding: '11px 22px', borderRadius: 9, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.07)', color: '#f1f5f9', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'all .2s' }}>
                        + Mi lista
                      </button>
                    ) : (
                      <button style={{ padding: '11px 22px', borderRadius: 9, border: '1px solid rgba(99,102,241,.3)', background: 'rgba(99,102,241,.1)', color: '#a5b4fc', fontWeight: 600, cursor: 'default', fontSize: 14, fontFamily: 'inherit' }}>
                        ✓ En mi lista
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trending grid */}
          <div className="home-grid-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px 60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: '#e50914', marginBottom: 5 }}>Esta semana</p>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, fontWeight: 400, letterSpacing: '.02em', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#e50914' }}><TrendingIcon /></span>
                  En tendencia
                </h2>
              </div>
              <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{visible.length} de {rest.length} títulos</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 18 }}>
              {visible.map((item, i) => (
                <div key={item.id} style={{ animation: 'fadeUp .4s ease forwards', animationDelay: `${(i % PAGE_SIZE) * .03}s`, opacity: 0 }}>
                  <MediaCard item={item} onAdd={handleAdd} onRemove={handleRemove} watchlistMap={watchlistMap} />
                </div>
              ))}
            </div>

            <div ref={loaderRef} style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
              {loadingMore && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#475569', fontSize: 14 }}>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(229,9,20,.2)', borderTop: '2px solid #e50914', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  Cargando más...
                </div>
              )}
              {!hasMore && !loading && visible.length > 0 && (
                <p style={{ fontSize: 13, color: '#1e293b' }}>— Fin de las tendencias —</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
