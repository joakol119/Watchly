'use client';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import MediaCard from '../../components/MediaCard';
import { useToast } from '../../components/Toast';

const GENRES = [
  { label: 'Comedia',        type: 'movie', genre_id: 35 },
  { label: 'Romance',        type: 'movie', genre_id: 10749 },
  { label: 'Terror',         type: 'movie', genre_id: 27 },
  { label: 'Acción',         type: 'movie', genre_id: 28 },
  { label: 'Thriller',       type: 'movie', genre_id: 53 },
  { label: 'Ciencia ficción',type: 'movie', genre_id: 878 },
  { label: 'Drama',          type: 'tv',    genre_id: 18 },
  { label: 'Crimen',         type: 'tv',    genre_id: 80 },
  { label: 'Fantasía',       type: 'movie', genre_id: 14 },
  { label: 'Animación',      type: 'tv',    genre_id: 16 },
];

const RATING_OPTIONS = [
  { value: 0, label: 'Cualquiera' },
  { value: 6, label: '6+' },
  { value: 7, label: '7+' },
  { value: 8, label: '8+' },
];

const PAGE_SIZE = 18;

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const DiceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="4"/>
    <circle cx="8"  cy="8"  r="1.2" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="8"  r="1.2" fill="currentColor" stroke="none"/>
    <circle cx="8"  cy="16" r="1.2" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>
  </svg>
);

function SearchContent() {
  const [results,       setResults]       = useState([]);
  const [watchlist,     setWatchlist]     = useState([]);
  const [user,          setUser]          = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [randomLoading, setRandomLoading] = useState(null);
  const [query,         setQuery]         = useState('');
  const [searched,      setSearched]      = useState(false);
  const [activeGenre,   setActiveGenre]   = useState(null);
  const [minRating,     setMinRating]     = useState(0);
  const [visibleCount,  setVisibleCount]  = useState(PAGE_SIZE);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const loaderRef    = useRef(null);
  const router       = useRouter();
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
      setTimeout(() => { setVisibleCount(prev => Math.min(prev + PAGE_SIZE, results.length)); setLoadingMore(false); }, 400);
    }
  }, [loadingMore, visibleCount, results.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [results]);

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true); setSearched(true); setActiveGenre(null);
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
    setActiveGenre(genre.label); setSearched(true); setLoading(true); setQuery('');
    try {
      const pages = await Promise.all([1,2,3,4,5].map(p =>
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

  const handleAdd = async (item, type, status = 'want_to_watch') => {
    if (watchlistMap[`${type}-${item.id}`]) return;
    try {
      const added = await api.addToWatchlist({ tmdb_id: item.id, media_type: type, title: item.title || item.name, poster_path: item.poster_path, status });
      setWatchlist(prev => [...prev, added]);
      addToast(`"${item.title || item.name}" agregado a tu lista`);
    } catch { addToast('No se pudo agregar', 'error'); }
  };

  const visible    = results.slice(0, visibleCount);
  const hasMore    = visibleCount < results.length;
  const isEmpty    = !loading && searched && results.length === 0;
  const hasResults = !loading && results.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#f1f5f9' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .search-input:focus   { border-color:rgba(229,9,20,.4) !important; background:rgba(255,255,255,.07) !important; }
        .genre-chip:hover     { border-color:rgba(229,9,20,.4) !important; background:rgba(229,9,20,.1) !important; color:#f87171 !important; }
        .random-btn:hover     { transform:translateY(-2px); }
        .rating-chip:hover    { border-color:rgba(251,191,36,.4) !important; background:rgba(251,191,36,.1) !important; color:#fbbf24 !important; }
        @media (max-width: 640px) {
          .search-page-pad { padding: 80px 16px 60px !important; }
        }
      `}</style>

      <Navbar user={user} />

      <div className="search-page-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 32px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: hasResults ? 48 : 0, paddingTop: hasResults ? 0 : 56 }}>

          {!hasResults && !searched && (
            <div style={{ textAlign: 'center', marginBottom: 36, animation: 'fadeUp .5s ease forwards' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: '#e50914', marginBottom: 12 }}>Explorar</p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 400, letterSpacing: '.02em', color: '#fff', marginBottom: 8 }}>¿Qué querés ver hoy?</h1>
              <p style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>Buscá por título, elegí un género o dejate sorprender</p>
            </div>
          )}

          {hasResults && (
            <div style={{ width: '100%', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: '#e50914', marginBottom: 5 }}>
                {activeGenre ? activeGenre : 'Resultados'}
              </p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, fontWeight: 400, letterSpacing: '.02em', color: '#fff' }}>
                {activeGenre ? `${results.length} títulos` : `${results.length} resultados para "${query}"`}
              </h1>
            </div>
          )}

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 640, display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#475569', pointerEvents: 'none' }}>
                <SearchIcon />
              </div>
              <input className="search-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por título..."
                style={{ width: '100%', padding: '14px 18px 14px 42px', borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', color: '#f1f5f9', fontSize: 15, outline: 'none', fontFamily: 'inherit', transition: 'border-color .2s, background .2s', boxSizing: 'border-box' }} autoFocus />
            </div>
            <button type="submit"
              style={{ padding: '14px 26px', borderRadius: 12, border: 'none', background: '#e50914', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 15, fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'background .18s' }}>
              Buscar
            </button>
          </form>

          {/* Genre chips */}
          <div style={{ marginTop: 18, display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 680 }}>
            {GENRES.map(g => (
              <button key={g.label} className="genre-chip" onClick={() => handleGenre(g)}
                style={{ padding: '6px 15px', borderRadius: 999, border: `1px solid ${activeGenre === g.label ? 'rgba(229,9,20,.5)' : 'rgba(255,255,255,.09)'}`, background: activeGenre === g.label ? 'rgba(229,9,20,.12)' : 'rgba(255,255,255,.03)', color: activeGenre === g.label ? '#f87171' : '#64748b', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .18s' }}>
                {g.label}
              </button>
            ))}
          </div>

          {/* Surprise me */}
          <div style={{ marginTop: 28, width: '100%', maxWidth: 640 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: '#334155' }}>Sorprendeme</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>Puntuación mínima:</span>
              {RATING_OPTIONS.map(r => (
                <button key={r.value} className="rating-chip" onClick={() => setMinRating(r.value)}
                  style={{ padding: '5px 14px', borderRadius: 999, border: `1px solid ${minRating === r.value ? 'rgba(251,191,36,.5)' : 'rgba(255,255,255,.08)'}`, background: minRating === r.value ? 'rgba(251,191,36,.12)' : 'rgba(255,255,255,.04)', color: minRating === r.value ? '#fbbf24' : '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .18s' }}>
                  {r.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="random-btn" onClick={() => handleRandom('movie')} disabled={!!randomLoading}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(229,9,20,.3)', background: 'rgba(229,9,20,.07)', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                {randomLoading === 'movie'
                  ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(248,113,113,.3)', borderTop: '2px solid #f87171', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Buscando...</>
                  : <><DiceIcon /> Película al azar</>}
              </button>
              <button className="random-btn" onClick={() => handleRandom('tv')} disabled={!!randomLoading}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(99,102,241,.3)', background: 'rgba(99,102,241,.07)', color: '#a5b4fc', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                {randomLoading === 'tv'
                  ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(165,180,252,.3)', borderTop: '2px solid #a5b4fc', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Buscando...</>
                  : <><DiceIcon /> Serie al azar</>}
              </button>
            </div>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 18 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ borderRadius: 12, paddingBottom: '150%', background: '#141420', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * .05}s` }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto 20px', opacity: .3 }}>
              <SearchIcon />
            </div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontWeight: 400, letterSpacing: '.02em', marginBottom: 8, color: '#fff' }}>Sin resultados</h3>
            <p style={{ color: '#475569', fontSize: 15, fontWeight: 500 }}>No encontramos nada para "{query}"</p>
          </div>
        )}

        {/* Results grid */}
        {hasResults && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 18 }}>
              {visible.map((item, i) => (
                <div key={`${item.id}-${i}`} style={{ animation: 'fadeUp .4s ease forwards', animationDelay: `${(i % PAGE_SIZE) * .02}s`, opacity: 0 }}>
                  <MediaCard item={item} onAdd={handleAdd} watchlistMap={watchlistMap} />
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
              {!hasMore && visible.length > 0 && (
                <p style={{ fontSize: 13, color: '#1e293b' }}>— {results.length} títulos en total —</p>
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
