'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import MediaCard from '../../components/MediaCard';
import { Suspense } from 'react';

function SearchContent() {
  const [results, setResults] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    api.getWatchlist().then(setWatchlist).catch(console.error);

    const q = searchParams.get('q');
    if (q) { setQuery(q); doSearch(q); }
  }, [searchParams]);

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const data = await api.search(q);
      setResults((data.results || []).filter(r => r.media_type !== 'person'));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const watchlistMap = Object.fromEntries(watchlist.map(w => [`${w.media_type}-${w.tmdb_id}`, w]));

  const handleAdd = async (item, type) => {
    const key = `${type}-${item.id}`;
    if (watchlistMap[key]) return;
    try {
      const added = await api.addToWatchlist({ tmdb_id: item.id, media_type: type, title: item.title || item.name, poster_path: item.poster_path });
      setWatchlist(prev => [...prev, added]);
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar user={user} />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 24px 40px' }}>
        <form onSubmit={handleSearch} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 10, maxWidth: 600 }}>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar películas, series..."
              style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: 15, outline: 'none' }} />
            <button type="submit" style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #e50914, #b81c1c)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 15, fontFamily: 'inherit' }}>Buscar</button>
          </div>
        </form>

        {loading ? (
          <p style={{ color: '#64748b' }}>Buscando...</p>
        ) : results.length === 0 && query ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ color: '#64748b', fontSize: 16 }}>No se encontraron resultados para {query}</p>
          </div>
        ) : (
          <>
            {results.length > 0 && <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>{results.length} resultados para {query}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {results.map(item => <MediaCard key={item.id} item={item} onAdd={handleAdd} watchlistMap={watchlistMap} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>;
}
