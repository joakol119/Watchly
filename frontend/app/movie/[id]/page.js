'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import Navbar from '../../../components/Navbar';

const IMG_BASE = 'https://image.tmdb.org/t/p/';

export default function MoviePage() {
  const [movie, setMovie] = useState(null);
  const [watchlistItem, setWatchlistItem] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));

    Promise.all([api.getMovie(id), api.getWatchlist()])
      .then(([m, wl]) => {
        setMovie(m);
        setWatchlistItem(wl.find(w => w.tmdb_id === m.id && w.media_type === 'movie') || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    try {
      const added = await api.addToWatchlist({ tmdb_id: movie.id, media_type: 'movie', title: movie.title, poster_path: movie.poster_path });
      setWatchlistItem(added);
    } catch (err) { console.error(err); }
  };

  const handleStatus = async (status) => {
    try {
      const updated = await api.updateWatchlist(watchlistItem.id, status);
      setWatchlistItem(updated);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Cargando...</div>;
  if (!movie) return null;

  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const cast = movie.credits?.cast?.slice(0, 8) || [];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar user={user} />

      {/* Backdrop */}
      {movie.backdrop_path && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.15 }}>
          <img src={`${IMG_BASE}w1280${movie.backdrop_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, #0a0a0f 100%)' }} />
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '90px 24px 60px' }}>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', marginBottom: 32, fontSize: 14, fontFamily: 'inherit' }}>← Volver</button>

        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <img src={`${IMG_BASE}w400${movie.poster_path}`} alt={movie.title} style={{ width: 260, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', flexShrink: 0 }} />

          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ background: 'rgba(229,9,20,0.2)', color: '#f87171', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>PELÍCULA</span>
              {movie.vote_average > 0 && <span style={{ color: '#fbbf24', fontWeight: 700 }}>⭐ {movie.vote_average.toFixed(1)}</span>}
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, marginBottom: 8 }}>{movie.title}</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
              {movie.release_date?.slice(0, 4)} · {movie.runtime ? `${movie.runtime} min` : ''} · {movie.genres?.map(g => g.name).join(', ')}
            </p>
            <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>{movie.overview}</p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {!watchlistItem ? (
                <button onClick={handleAdd} style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #e50914, #b81c1c)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
                  + Agregar a mi lista
                </button>
              ) : (
                ['want_to_watch', 'watching', 'watched'].map(s => (
                  <button key={s} onClick={() => handleStatus(s)} style={{ padding: '11px 16px', borderRadius: 10, border: 'none', background: watchlistItem.status === s ? 'rgba(229,9,20,0.25)' : 'rgba(255,255,255,0.06)', color: watchlistItem.status === s ? '#f87171' : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                    {s === 'want_to_watch' ? 'Quiero ver' : s === 'watching' ? 'Viendo' : '✓ Visto'}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {trailer && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Trailer</h2>
            <div style={{ borderRadius: 12, overflow: 'hidden', maxWidth: 700 }}>
              <iframe width="100%" height="394" src={`https://www.youtube.com/embed/${trailer.key}`} frameBorder="0" allowFullScreen style={{ display: 'block' }} />
            </div>
          </div>
        )}

        {cast.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Reparto</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
              {cast.map(person => (
                <div key={person.id} style={{ textAlign: 'center' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 8px', background: '#1e1e2e' }}>
                    {person.profile_path
                      ? <img src={`${IMG_BASE}w200${person.profile_path}`} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
                    }
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{person.name}</p>
                  <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{person.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
