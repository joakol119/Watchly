'use client';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import MediaCard from '../../components/MediaCard';
import { useToast } from '../../components/Toast';

const GENRES = [
  { label: '😂 Comedia',          type: 'movie', genre_id: 35 },
  { label: '💕 Romance',          type: 'movie', genre_id: 10749 },
  { label: '😱 Terror',           type: 'movie', genre_id: 27 },
  { label: '🦸 Acción',           type: 'movie', genre_id: 28 },
  { label: '🔍 Thriller',         type: 'movie', genre_id: 53 },
  { label: '🚀 Ciencia ficción',  type: 'movie', genre_id: 878 },
  { label: '🧪 Drama',            type: 'tv',    genre_id: 18 },
  { label: '🕵️ Crimen',          type: 'tv',    genre_id: 80 },
  { label: '🌌 Fantasía',         type: 'movie', genre_id: 14 },
  { label: '📺 Animación',        type: 'tv',    genre_id: 16 },
];

const RATING_OPTIONS = [
  { value: 0, label: 'Cualquiera' },
  { value: 6, label: '6+ ⭐' },
  { value: 7, label: '7+ ⭐' },
  { value: 8, label: '8+ ⭐' },
];

const PAGE_SIZE = 18;

function SearchContent() {
  const [results, setResults] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [randomLoading, setRandomLoading] = useState(null);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [activeGenre, setActiveGenre] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    api.getWatchlist().then(setWatchlist).catch(console.error);
    const q = searchParams.get('q');
    if (q) { setQuery(q); doSearch(q); }
  }, [searchParams]);

  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !loadingMore && visibleCount < results.length) {
      setLoadingMore(true);
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + PAGE_SIZE, results.length));
        setLoadingMore(false);
      }, 400);
    }
  }, [loadingMore, visibleCount, results.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Reset visible count when results change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [results]);

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setActiveGenre(null);
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

  const handleGenre = async (genre) => {
    setActiveGenre(genre.label);
    setSearched(true);
    setLoading(true);
    setQuery('');
    try {
      const pages = await Promise.all([1, 2, 3, 4, 5].map(p =>
        fetch(`https://api.themoviedb.org/3/discover/${genre.type}?with_genres=${genre.genre_id}&sort_by=popularity.desc&page=${p}&language=es-ES&api_key=254a5d35a19b09f1b9e403cf412a6c17`)
          .then(r => r.json())
      ));
      const all = pages.flatMap(p => p.results || []).filter(r => r.poster_path);
      setResults(all.map(r => ({ ...r, media_type: genre.type })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRandom = async (type) => {
    setRandomLoading(type);
    try {
      const result = await api.getRandom(type, null, minRating || null);
      router.push(`/${type}/${result.id}`);
    } catch (err) { console.error(err); }
    finally { setRandomLoading(null); }
  };

  const watchlistMap = Object.fromEntries(watchlist.map(w => [`${w.media_type}-${w.tmdb_id}`, w]));

  const handleAdd = async (item, type) => {
    if (watchlistMap[`${type}-${item.id}`]) return;
    try {
      const added = await api.addToWatchlist({ tmdb_id: item.id, media_type: type, title: item.title || item.name, poster_path: item.poster_path });
      setWatchlist(prev => [...prev, added]);
      addToast(`"${item.title || item.name}" agregado a tu lista`);
    } catch (err) { addToast('No se pudo agregar', 'error'); }
  };

  const visible = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;
  const isEmpty = !loading && searched && results.length === 0;
  const hasResults = !loading && results.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#080810', fontFamily: "'Inter', system-ui, sans-serif", color: '#f1f5f9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Bebas+Neue&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .search-input:focus { border-color: rgba(229,9,20,0.5) !important; box-shadow: 0 0 0 3px rgba(229,9,20,0.1) !important; }
        .genre-btn:hover { border-color: rgba(229,9,20,0.4) !important; background: rgba(229,9,20,0.1) !important; color: #f87171 !important; }
        .random-btn:hover { transform: translateY(-2px); }
        .rating-btn:hover { border-color: rgba(251,191,36,0.4) !important; background: rgba(251,191,36,0.1) !important; color: #fbbf24 !important; }
      `}</style>

      <Navbar user={user} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 32px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: hasResults ? '0 0 48px' : '60px 0 0' }}>
          {!hasResults && !searched && (
            <div style={{ textAlign: 'center', marginBottom: 36, animation: 'fadeUp 0.5s ease forwards' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#e50914', marginBottom: 12 }}>Explorar</p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 400, letterSpacing: 1, color: '#fff', marginBottom: 8 }}>¿Qué querés ver hoy?</h1>
              <p style={{ fontSize: 14, color: '#475569' }}>Buscá por título, elegí un género o dejate sorprender</p>
            </div>
          )}

          {hasResults && (
            <div style={{ width: '100%', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#e50914', marginBottom: 4 }}>
                {activeGenre ? activeGenre : 'Resultados'}
              </p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, fontWeight: 400, letterSpacing: 1, color: '#fff' }}>
                {activeGenre ? `${results.length} títulos` : `${results.length} resultados para "${query}"`}
              </h1>
            </div>
          )}

          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 640, display: 'flex', gap: 10 }}>
            <input className="search-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por título..."
              style={{ flex: 1, padding: '14px 20px', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: 15, outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s' }} autoFocus />
            <button type="submit" style={{ padding: '14px 28px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #e50914, #b81c1c)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 15, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(229,9,20,0.3)', whiteSpace: 'nowrap' }}>Buscar</button>
          </form>

          <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 680 }}>
            {GENRES.map(g => (
              <button key={g.label} className="genre-btn" onClick={() => handleGenre(g)}
                style={{ padding: '7px 16px', borderRadius: 999, border: `1px solid ${activeGenre === g.label ? 'rgba(229,9,20,0.5)' : 'rgba(255,255,255,0.1)'}`, background: activeGenre === g.label ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.04)', color: activeGenre === g.label ? '#f87171' : '#64748b', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                {g.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 28, width: '100%', maxWidth: 640 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#334155' }}>Sorprendeme</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>Puntuación mínima:</span>
              {RATING_OPTIONS.map(r => (
                <button key={r.value} className="rating-btn" onClick={() => setMinRating(r.value)}
                  style={{ padding: '5px 14px', borderRadius: 999, border: `1px solid ${minRating === r.value ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.08)'}`, background: minRating === r.value ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)', color: minRating === r.value ? '#fbbf24' : '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                  {r.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="random-btn" onClick={() => handleRandom('movie')} disabled={!!randomLoading}
                style={{ padding: '10px 22px', borderRadius: 12, border: '1px solid rgba(229,9,20,0.3)', background: 'rgba(229,9,20,0.08)', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                {randomLoading === 'movie' ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(248,113,113,0.3)', borderTop: '2px solid #f87171', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Buscando...</> : '🎲 Película al azar'}
              </button>
              <button className="random-btn" onClick={() => handleRandom('tv')} disabled={!!randomLoading}
                style={{ padding: '10px 22px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                {randomLoading === 'tv' ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(165,180,252,0.3)', borderTop: '2px solid #a5b4fc', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Buscando...</> : '🎲 Serie al azar'}
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 20 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ borderRadius: 12, paddingBottom: '150%', background: '#141420', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        )}

        {isEmpty && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontWeight: 400, letterSpacing: 1, marginBottom: 8, color: '#fff' }}>Sin resultados</h3>
            <p style={{ color: '#475569', fontSize: 15 }}>No encontramos nada para "{query}"</p>
          </div>
        )}

        {hasResults && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 20 }}>
              {visible.map((item, i) => (
                <div key={`${item.id}-${i}`} style={{ animation: 'fadeUp 0.4s ease forwards', animationDelay: `${(i % PAGE_SIZE) * 0.02}s`, opacity: 0 }}>
                  <MediaCard item={item} onAdd={handleAdd} watchlistMap={watchlistMap} />
                </div>
              ))}
            </div>

            <div ref={loaderRef} style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
              {loadingMore && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#475569', fontSize: 14 }}>
                  <div style={{ width: 20, height: 20, border: '2px solid rgba(229,9,20,0.2)', borderTop: '2px solid #e50914', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Cargando más...
                </div>
              )}
              {!hasMore && visible.length > 0 && (
                <p style={{ fontSize: 13, color: '#334155' }}>— {results.length} títulos en total —</p>
              )}
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
