'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import Navbar from '../../../components/Navbar';
import MediaCard from '../../../components/MediaCard';

const IMG_BASE = 'https://image.tmdb.org/t/p/';

export default function TvPage() {
  const [show, setShow] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
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

    Promise.all([api.getTv(id), api.getWatchlist()])
      .then(([s, wl]) => {
        setShow(s);
        setWatchlist(wl);
        setWatchlistItem(wl.find(w => w.tmdb_id === s.id && w.media_type === 'tv') || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    try {
      const added = await api.addToWatchlist({ tmdb_id: show.id, media_type: 'tv', title: show.name, poster_path: show.poster_path });
      setWatchlistItem(added);
      setWatchlist(prev => [...prev, added]);
    } catch (err) { console.error(err); }
  };

  const handleStatus = async (status) => {
    try {
      const updated = await api.updateWatchlist(watchlistItem.id, status);
      setWatchlistItem(updated);
    } catch (err) { console.error(err); }
  };

  const handleAddSimilar = async (item, type) => {
    const key = `${type}-${item.id}`;
    if (watchlistMap[key]) return;
    try {
      const added = await api.addToWatchlist({ tmdb_id: item.id, media_type: type, title: item.title || item.name, poster_path: item.poster_path });
      setWatchlist(prev => [...prev, added]);
    } catch (err) { console.error(err); }
  };

  const watchlistMap = Object.fromEntries(watchlist.map(w => [`${w.media_type}-${w.tmdb_id}`, w]));

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Cargando...</div>;
  if (!show) return null;

  const trailer = show.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const cast = show.credits?.cast?.slice(0, 8) || [];
  const similar = (show.similar?.results || []).filter(s => s.poster_path).slice(0, 8);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar user={user} />

      {show.backdrop_path && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.15 }}>
          <img src={`${IMG_BASE}w1280${show.backdrop_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, #0a0a0f 100%)' }} />
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '90px 24px 60px' }}>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', marginBottom: 32, fontSize: 14, fontFamily: 'inherit' }}>← Volver</button>

        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {show.poster_path && (
            <img src={`${IMG_BASE}w400${show.poster_path}`} alt={show.name} style={{ width: 260, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', flexShrink: 0 }} />
          )}

          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>SERIE</span>
              {show.vote_average > 0 && <span style={{ color: '#fbbf24', fontWeight: 700 }}>⭐ {show.vote_average.toFixed(1)}</span>}
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, marginBottom: 8 }}>{show.name}</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
              {show.first_air_date?.slice(0, 4)} · {show.number_of_seasons} temporada{show.number_of_seasons !== 1 ? 's' : ''} · {show.genres?.map(g => g.name).join(', ')}
            </p>
            <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>{show.overview}</p>

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

        {similar.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Series similares</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {similar.map(item => (
                <MediaCard key={item.id} item={{ ...item, media_type: 'tv' }} onAdd={handleAddSimilar} watchlistMap={watchlistMap} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
