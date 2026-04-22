'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import MediaCard from '../../components/MediaCard';

const SUGGESTIONS = ['The Boys', 'Breaking Bad', 'Inception', 'One Piece', 'Interstellar', 'Stranger Things', 'The Batman', 'Dune'];

function SearchContent() {
  const [results, setResults] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
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
    setSearched(true);
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
    if (watchlistMap[`${type}-${item.id}`]) return;
    try {
      const added = await api.addToWatchlist({ tmdb_id: item.id, media_type: type, title: item.title || item.name, poster_path: item.poster_path });
      setWatchlist(prev => [...prev, added]);
    } catch (err) { console.error(err); }
  };

  const isEmpty = !loading && searched && results.length === 0;
  const hasResults = !loading && results.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#080810', fontFamily: "'Inter', system-ui, sans-serif", color: '#f1f5f9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Bebas+Neue&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .search-input:focus { border-color: rgba(229,9,20,0.5) !important; box-shadow: 0 0 0 3px rgba(229,9,20,0.1) !important; }
        .search-input::placeholder { color: #334155; }
        .suggestion-btn:hover { background: rgba(229,9,20,0.15) !important; border-color: rgba(229,9,20,0.3) !important; color: #f87171 !important; }
        .search-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(229,9,20,0.4) !important; }
      `}</style>

      <Navbar user={user} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 32px 80px' }}>

        {/* Search bar — centrado si no hay resultados */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: hasResults ? '0 0 40px' : '80px 0 0',
          transition: 'padding 0.3s ease',
        }}>
          {!hasResults && !searched && (
            <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeUp 0.5s ease forwards' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#e50914', marginBottom: 12 }}>Explorar</p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 400, letterSpacing: 1, color: '#fff', marginBottom: 8 }}>
                ¿Qué querés ver hoy?
              </h1>
              <p style={{ fontSize: 14, color: '#475569' }}>Buscá cualquier película o serie en la base de datos de TMDB</p>
            </div>
          )}

          {hasResults && (
            <div style={{ width: '100%', marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#e50914', marginBottom: 4 }}>Resultados</p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, fontWeight: 400, letterSpacing: 1, color: '#fff' }}>
                {results.length} resultados para "{query}"
              </h1>
            </div>
          )}

          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 640, display: 'flex', gap: 10 }}>
            <input
              className="search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar películas, series..."
              style={{
                flex: 1, padding: '14px 20px', borderRadius: 14,
                border: '1.5px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#f1f5f9', fontSize: 15, outline: 'none',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              autoFocus
            />
            <button
              type="submit"
              className="search-btn"
              style={{
                padding: '14px 28px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #e50914, #b81c1c)',
                color: '#fff', fontWeight: 700, cursor: 'pointer',
                fontSize: 15, fontFamily: 'inherit', transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(229,9,20,0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              Buscar
            </button>
          </form>

          {/* Sugerencias — solo cuando no hay resultados */}
          {!searched && (
            <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 640, animation: 'fadeUp 0.5s ease 0.1s both' }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  className="suggestion-btn"
                  onClick={() => router.push(`/search?q=${encodeURIComponent(s)}`)}
                  style={{
                    padding: '6px 16px', borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#64748b', fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 20 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ borderRadius: 12, paddingBottom: '150%', background: '#141420', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        )}

        {/* Sin resultados */}
        {isEmpty && (
          <div style={{ textAlign: 'center', padding: '60px 24px', animation: 'fadeUp 0.4s ease forwards' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontWeight: 400, letterSpacing: 1, marginBottom: 8, color: '#fff' }}>
              Sin resultados
            </h3>
            <p style={{ color: '#475569', fontSize: 15 }}>No encontramos nada para "{query}"</p>
          </div>
        )}

        {/* Resultados */}
        {hasResults && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 20 }}>
            {results.map((item, i) => (
              <div key={item.id} style={{ animation: 'fadeUp 0.4s ease forwards', animationDelay: `${i * 0.03}s`, opacity: 0 }}>
                <MediaCard item={item} onAdd={handleAdd} watchlistMap={watchlistMap} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>;
}
