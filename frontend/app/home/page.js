'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import MediaCard from '../../components/MediaCard';

const IMG_BASE = 'https://image.tmdb.org/t/p/';

export default function HomePage() {
  const [trending, setTrending] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const watchlistMap = Object.fromEntries(watchlist.map(w => [`${w.media_type}-${w.tmdb_id}`, w]));

  const handleAdd = async (item, type) => {
    if (watchlistMap[`${type}-${item.id}`]) return;
    try {
      const added = await api.addToWatchlist({
        tmdb_id: item.id, media_type: type,
        title: item.title || item.name,
        poster_path: item.poster_path,
      });
      setWatchlist(prev => [...prev, added]);
    } catch (err) { console.error(err); }
  };

  const featured = trending.find(item => item.backdrop_path);
  const rest = trending.filter(item => item !== featured).slice(0, 18);

  return (
    <div style={{ minHeight: '100vh', background: '#080810', fontFamily: "'Inter', system-ui, sans-serif", color: '#f1f5f9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Bebas+Neue&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        .featured-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(229,9,20,0.5) !important; }
        .featured-btn-secondary:hover { background: rgba(255,255,255,0.15) !important; }
      `}</style>

      <Navbar user={user} />

      {loading ? (
        <div style={{ paddingTop: 80 }}>
          {/* Featured skeleton */}
          <div style={{ height: 520, background: '#141420', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 20 }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{ borderRadius: 12, paddingBottom: '150%', background: '#141420', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.05}s` }} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Featured Hero */}
          {featured && (
            <div style={{ position: 'relative', height: 560, marginTop: 64, overflow: 'hidden' }}>
              <img
                src={`${IMG_BASE}w1280${featured.backdrop_path}`}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,8,16,0.95) 35%, rgba(8,8,16,0.6) 60%, rgba(8,8,16,0.2) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #080810 0%, transparent 40%)' }} />

              <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: '100%', display: 'flex', alignItems: 'center' }}>
                <div style={{ maxWidth: 520, animation: 'fadeUp 0.6s ease forwards' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <span style={{
                      background: featured.media_type === 'movie' ? 'rgba(229,9,20,0.2)' : 'rgba(99,102,241,0.2)',
                      border: `1px solid ${featured.media_type === 'movie' ? 'rgba(229,9,20,0.4)' : 'rgba(99,102,241,0.4)'}`,
                      color: featured.media_type === 'movie' ? '#f87171' : '#a5b4fc',
                      borderRadius: 6, padding: '4px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 1
                    }}>
                      {featured.media_type === 'movie' ? 'PELÍCULA' : 'SERIE'}
                    </span>
                    {featured.vote_average > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>
                        ⭐ {featured.vote_average.toFixed(1)}
                      </span>
                    )}
                    <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                      #{1} en tendencias
                    </span>
                  </div>

                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: 1, marginBottom: 16, color: '#fff' }}>
                    {featured.title || featured.name}
                  </h2>

                  <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 28, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {featured.overview}
                  </p>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      className="featured-btn-primary"
                      onClick={() => router.push(`/${featured.media_type}/${featured.id}`)}
                      style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #e50914, #b81c1c)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(229,9,20,0.3)' }}
                    >
                      Ver detalles →
                    </button>
                    {!watchlistMap[`${featured.media_type}-${featured.id}`] ? (
                      <button
                        className="featured-btn-secondary"
                        onClick={() => handleAdd(featured, featured.media_type)}
                        style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#f1f5f9', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s' }}
                      >
                        + Mi lista
                      </button>
                    ) : (
                      <button
                        className="featured-btn-secondary"
                        style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}
                      >
                        ✓ En mi lista
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid section */}
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px 60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#e50914', marginBottom: 4 }}>Esta semana</p>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, fontWeight: 400, letterSpacing: 1, color: '#f1f5f9' }}>
                  🔥 En tendencia
                </h2>
              </div>
              <span style={{ fontSize: 13, color: '#475569' }}>{rest.length} títulos</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 20 }}>
              {rest.map((item, i) => (
                <div key={item.id} style={{ animation: `fadeUp 0.4s ease forwards`, animationDelay: `${i * 0.03}s`, opacity: 0 }}>
                  <MediaCard item={item} onAdd={handleAdd} watchlistMap={watchlistMap} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
