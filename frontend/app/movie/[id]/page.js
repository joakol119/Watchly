'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import Navbar from '../../../components/Navbar';
import MediaCard from '../../../components/MediaCard';
import { useToast } from '../../../components/Toast';

const IMG_BASE = 'https://image.tmdb.org/t/p/';

const STATUS_OPTIONS = [
  { value: 'want_to_watch', label: '🔖 Quiero ver' },
  { value: 'watching', label: '▶️ Viendo' },
  { value: 'watched', label: '✓ Visto' },
];

export default function MoviePage() {
  const [movie, setMovie] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistItem, setWatchlistItem] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();
  const { addToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));

    Promise.all([api.getMovie(id), api.getWatchlist()])
      .then(([m, wl]) => {
        setMovie(m);
        setWatchlist(wl);
        setWatchlistItem(wl.find(w => w.tmdb_id === m.id && w.media_type === 'movie') || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    try {
      const added = await api.addToWatchlist({ tmdb_id: movie.id, media_type: 'movie', title: movie.title, poster_path: movie.poster_path });
      setWatchlistItem(added);
      setWatchlist(prev => [...prev, added]);
      addToast(`"${movie.title}" agregado a tu lista`);
    } catch (err) { addToast('No se pudo agregar a la lista', 'error'); }
  };

  const handleStatus = async (status) => {
    try {
      const updated = await api.updateWatchlist(watchlistItem.id, status);
      setWatchlistItem(updated);
      const labels = { want_to_watch: 'Quiero ver', watching: 'Viendo', watched: 'Visto' };
      addToast(`Estado actualizado a "${labels[status]}"`);
    } catch (err) { addToast('No se pudo actualizar el estado', 'error'); }
  };

  const handleAddSimilar = async (item, type) => {
    if (watchlistMap[`${type}-${item.id}`]) return;
    try {
      const added = await api.addToWatchlist({ tmdb_id: item.id, media_type: type, title: item.title || item.name, poster_path: item.poster_path });
      setWatchlist(prev => [...prev, added]);
      addToast(`"${item.title || item.name}" agregado a tu lista`);
    } catch (err) { addToast('No se pudo agregar a la lista', 'error'); }
  };

  const watchlistMap = Object.fromEntries(watchlist.map(w => [`${w.media_type}-${w.tmdb_id}`, w]));

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(229,9,20,0.2)', borderTop: '3px solid #e50914', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!movie) return null;

  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const similar = (movie.similar?.results || []).filter(m => m.poster_path).slice(0, 8);
  const score = movie.vote_average?.toFixed(1);
  const scoreColor = score >= 7 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ minHeight: '100vh', background: '#080810', fontFamily: "'Inter', system-ui, sans-serif", color: '#f1f5f9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
        .cast-scroll::-webkit-scrollbar { height: 4px; }
        .cast-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 2px; }
        .cast-scroll::-webkit-scrollbar-thumb { background: rgba(229,9,20,0.5); border-radius: 2px; }
        .status-btn:hover { background: rgba(229,9,20,0.15) !important; color: #f87171 !important; }
        .back-btn:hover { background: rgba(255,255,255,0.1) !important; }
        .add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(229,9,20,0.4) !important; }
      `}</style>

      <Navbar user={user} />

      {/* Hero backdrop */}
      {movie.backdrop_path && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <img
            src={`${IMG_BASE}w1280${movie.backdrop_path}`}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #080810 40%, rgba(8,8,16,0.7) 70%, rgba(8,8,16,0.4) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,8,16,0) 50%, #080810 100%)' }} />
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero section */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 32px 60px' }}>
          <button
            className="back-btn"
            onClick={() => router.back()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', marginBottom: 40, transition: 'all 0.2s' }}
          >
            ← Volver
          </button>

          <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Poster */}
            <div style={{ flexShrink: 0, position: 'relative' }}>
              <img
                src={`${IMG_BASE}w400${movie.poster_path}`}
                alt={movie.title}
                style={{ width: 280, borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.8)', display: 'block' }}
              />
              {score > 0 && (
                <div style={{ position: 'absolute', bottom: -16, right: -16, width: 56, height: 56, borderRadius: '50%', background: '#080810', border: `3px solid ${scoreColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${scoreColor}40` }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 280, paddingTop: 8 }}>
              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)', color: '#f87171', borderRadius: 6, padding: '4px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
                PELÍCULA
              </div>

              {/* Title */}
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(48px, 6vw, 80px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '1px', marginBottom: 16, color: '#ffffff' }}>
                {movie.title}
              </h1>

              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                {movie.release_date && (
                  <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>{movie.release_date.slice(0, 4)}</span>
                )}
                {movie.runtime > 0 && (
                  <>
                    <span style={{ color: '#334155' }}>·</span>
                    <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>{movie.runtime} min</span>
                  </>
                )}
              </div>

              {/* Genres */}
              {movie.genres?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                  {movie.genres.map(g => (
                    <span key={g.id} style={{ padding: '5px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', fontSize: 12, fontWeight: 500, color: '#cbd5e1' }}>
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.75, marginBottom: 32, maxWidth: 560 }}>
                {movie.overview}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {!watchlistItem ? (
                  <button
                    className="add-btn"
                    onClick={handleAdd}
                    style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #e50914, #b81c1c)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(229,9,20,0.3)' }}
                  >
                    + Agregar a mi lista
                  </button>
                ) : (
                  STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      className="status-btn"
                      onClick={() => handleStatus(s.value)}
                      style={{
                        padding: '12px 20px', borderRadius: 12, border: '1px solid',
                        borderColor: watchlistItem.status === s.value ? 'rgba(229,9,20,0.5)' : 'rgba(255,255,255,0.1)',
                        background: watchlistItem.status === s.value ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.04)',
                        color: watchlistItem.status === s.value ? '#f87171' : '#64748b',
                        fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all 0.2s',
                      }}
                    >
                      {s.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div style={{ background: '#080810' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 80px' }}>

            {/* Trailer */}
            {trailer && (
              <section style={{ marginBottom: 64 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#e50914', marginBottom: 20 }}>Trailer</h2>
                <div style={{ borderRadius: 16, overflow: 'hidden', maxWidth: 720, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                  <iframe
                    width="100%"
                    height="405"
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    frameBorder="0"
                    allowFullScreen
                    style={{ display: 'block' }}
                  />
                </div>
              </section>
            )}

            {/* Cast */}
            {cast.length > 0 && (
              <section style={{ marginBottom: 64 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#e50914', marginBottom: 20 }}>Reparto</h2>
                <div className="cast-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12 }}>
                  {cast.map(person => (
                    <div key={person.id} style={{ flexShrink: 0, width: 100, textAlign: 'center' }}>
                      <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 10px', background: '#1e1e2e', border: '2px solid rgba(255,255,255,0.08)' }}>
                        {person.profile_path
                          ? <img src={`${IMG_BASE}w200${person.profile_path}`} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👤</div>
                        }
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', margin: '0 0 3px', lineHeight: 1.3 }}>{person.name}</p>
                      <p style={{ fontSize: 11, color: '#475569', margin: 0, lineHeight: 1.3 }}>{person.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Similar */}
            {similar.length > 0 && (
              <section>
                <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#e50914', marginBottom: 20 }}>Películas similares</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                  {similar.map(item => (
                    <MediaCard key={item.id} item={{ ...item, media_type: 'movie' }} onAdd={handleAddSimilar} watchlistMap={watchlistMap} />
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
