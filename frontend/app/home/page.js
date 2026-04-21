'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import MediaCard from '../../components/MediaCard';

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
    const key = `${type}-${item.id}`;
    if (watchlistMap[key]) return;
    try {
      const added = await api.addToWatchlist({
        tmdb_id: item.id, media_type: type,
        title: item.title || item.name,
        poster_path: item.poster_path,
      });
      setWatchlist(prev => [...prev, added]);
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar user={user} />
      <div style={{ paddingTop: 80, maxWidth: 1200, margin: '0 auto', padding: '80px 24px 40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            Hola, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>Esto es lo que está en tendencia esta semana</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{ borderRadius: 12, paddingBottom: '180%', background: '#141420', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#f1f5f9' }}>🔥 Tendencias</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 48 }}>
              {trending.slice(0, 20).map(item => (
                <MediaCard key={item.id} item={item} onAdd={handleAdd} watchlistMap={watchlistMap} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
