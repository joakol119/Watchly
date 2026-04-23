'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import Navbar from '../../../components/Navbar';
import MediaCard from '../../../components/MediaCard';

const IMG_BASE = 'https://image.tmdb.org/t/p/';

const STATUS_OPTIONS = [
  { value: 'want_to_watch', label: 'Quiero ver' },
  { value: 'watching',      label: 'Viendo' },
  { value: 'watched',       label: 'Visto' },
];

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const ListsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const SECTION_LABEL = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: '#6366f1', marginBottom: 18, display: 'block' };

export default function TvPage() {
  const [show,             setShow]             = useState(null);
  const [watchlist,        setWatchlist]        = useState([]);
  const [watchlistItem,    setWatchlistItem]    = useState(null);
  const [user,             setUser]             = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [lists,            setLists]            = useState([]);
  const [listItems,        setListItems]        = useState([]);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [review,           setReview]           = useState('');
  const [savedReview,      setSavedReview]      = useState('');
  const [savingReview,     setSavingReview]     = useState(false);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    Promise.all([api.getTv(id), api.getWatchlist(), api.getLists()])
      .then(([s, wl, ls]) => {
        setShow(s); setWatchlist(wl);
        const wlItem = wl.find(w => w.tmdb_id === s.id && w.media_type === 'tv') || null;
        setWatchlistItem(wlItem);
        if (wlItem?.review) { setReview(wlItem.review); setSavedReview(wlItem.review); }
        setLists(ls);
        Promise.all(ls.map(l => api.getList(l.id))).then(details => {
          const ids = new Set();
          details.forEach(d => d.items?.forEach(i => { if (i.tmdb_id === s.id && i.media_type === 'tv') ids.add(d.id); }));
          setListItems([...ids]);
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveReview = async () => {
    if (!watchlistItem) return;
    setSavingReview(true);
    try { await api.reviewWatchlist(watchlistItem.id, review); setSavedReview(review); }
    catch (err) { console.error(err); }
    finally { setSavingReview(false); }
  };

  const handleListToggle = async (list) => {
    const inList = listItems.includes(list.id);
    if (inList) {
      const detail = await api.getList(list.id);
      const item = detail.items.find(i => i.tmdb_id === show.id && i.media_type === 'tv');
      if (item) { await api.removeFromList(list.id, item.id); setListItems(prev => prev.filter(lid => lid !== list.id)); }
    } else {
      await api.addToList(list.id, { tmdb_id: show.id, media_type: 'tv', title: show.name, poster_path: show.poster_path });
      setListItems(prev => [...prev, list.id]);
    }
  };

  const handleAdd = async () => {
    try {
      const added = await api.addToWatchlist({ tmdb_id: show.id, media_type: 'tv', title: show.name, poster_path: show.poster_path });
      setWatchlistItem(added); setWatchlist(prev => [...prev, added]);
    } catch (err) { console.error(err); }
  };

  const handleStatus = async (status) => {
    try { const updated = await api.updateWatchlist(watchlistItem.id, status); setWatchlistItem(updated); }
    catch (err) { console.error(err); }
  };

  const handleAddSimilar = async (item, type) => {
    if (watchlistMap[`${type}-${item.id}`]) return;
    try {
      const added = await api.addToWatchlist({ tmdb_id: item.id, media_type: type, title: item.title || item.name, poster_path: item.poster_path });
      setWatchlist(prev => [...prev, added]);
    } catch (err) { console.error(err); }
  };

  const watchlistMap = Object.fromEntries(watchlist.map(w => [`${w.media_type}-${w.tmdb_id}`, w]));

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 38, height: 38, border: '2px solid rgba(99,102,241,.2)', borderTop: '2px solid #6366f1', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
    </div>
  );
  if (!show) return null;

  const trailer    = show.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const cast       = show.credits?.cast?.slice(0, 10) || [];
  const similar    = (show.similar?.results || []).filter(s => s.poster_path).slice(0, 8);
  const score      = show.vote_average?.toFixed(1);
  const scoreColor = score >= 7 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#f1f5f9' }}>
      <style>{`
        .cast-scroll::-webkit-scrollbar { height: 4px; }
        .cast-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,.04); border-radius: 2px; }
        .cast-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,.4); border-radius: 2px; }
        .status-btn:hover { background:rgba(99,102,241,.14) !important; color:#a5b4fc !important; }
        .back-btn:hover   { background:rgba(255,255,255,.09) !important; }
        .add-btn:hover    { transform:translateY(-2px); box-shadow:0 10px 28px rgba(99,102,241,.42) !important; }
        .list-row:hover   { background:rgba(255,255,255,.06) !important; }
        .review-ta:focus  { border-color:rgba(99,102,241,.4) !important; }
        @media (max-width: 640px) {
          .hero-pad    { padding: 80px 16px 40px !important; }
          .content-pad { padding: 0 16px 60px !important; }
          .hero-flex   { flex-direction: column !important; align-items: center !important; }
          .hero-poster { width: 200px !important; }
        }
      `}</style>

      <Navbar user={user} />

      {/* Fixed backdrop */}
      {show.backdrop_path && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <img src={`${IMG_BASE}w1280${show.backdrop_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #080810 38%, rgba(8,8,16,.72) 68%, rgba(8,8,16,.3) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,8,16,0) 48%, #080810 100%)' }} />
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <div className="hero-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 36px 56px' }}>
          <button className="back-btn" onClick={() => router.back()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', marginBottom: 40, transition: 'background .18s' }}>
            ← Volver
          </button>

          <div className="hero-flex" style={{ display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Poster */}
            <div style={{ flexShrink: 0, position: 'relative' }}>
              {show.poster_path && (
                <img className="hero-poster" src={`${IMG_BASE}w400${show.poster_path}`} alt={show.name}
                  style={{ width: 260, borderRadius: 14, boxShadow: '0 32px 80px rgba(0,0,0,.85)', display: 'block' }} />
              )}
              {score > 0 && (
                <div style={{ position: 'absolute', bottom: -14, right: -14, width: 52, height: 52, borderRadius: '50%', background: '#080810', border: `3px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${scoreColor}35` }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor }}>{score}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 280, paddingTop: 6 }}>
              <div style={{ display: 'inline-flex', background: 'rgba(99,102,241,.14)', border: '1px solid rgba(99,102,241,.3)', color: '#a5b4fc', borderRadius: 5, padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', marginBottom: 14 }}>
                SERIE
              </div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(44px, 6vw, 78px)', fontWeight: 400, lineHeight: .92, letterSpacing: '.02em', marginBottom: 14, color: '#fff' }}>
                {show.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
                {show.first_air_date && <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{show.first_air_date.slice(0, 4)}</span>}
                {show.number_of_seasons > 0 && (
                  <><span style={{ color: '#1e293b' }}>·</span><span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{show.number_of_seasons} temporada{show.number_of_seasons !== 1 ? 's' : ''}</span></>
                )}
              </div>
              {show.genres?.length > 0 && (
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 22 }}>
                  {show.genres.map(g => (
                    <span key={g.id} style={{ padding: '4px 13px', borderRadius: 999, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)', fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>{g.name}</span>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.8, marginBottom: 30, maxWidth: 540 }}>{show.overview}</p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {!watchlistItem ? (
                  <button className="add-btn" onClick={handleAdd}
                    style={{ padding: '11px 26px', borderRadius: 9, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'all .2s' }}>
                    + Agregar a mi lista
                  </button>
                ) : (
                  STATUS_OPTIONS.map(s => (
                    <button key={s.value} className="status-btn" onClick={() => handleStatus(s.value)}
                      style={{ padding: '11px 18px', borderRadius: 9, border: '1px solid', borderColor: watchlistItem.status === s.value ? 'rgba(99,102,241,.5)' : 'rgba(255,255,255,.1)', background: watchlistItem.status === s.value ? 'rgba(99,102,241,.18)' : 'rgba(255,255,255,.04)', color: watchlistItem.status === s.value ? '#a5b4fc' : '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all .2s' }}>
                      {s.label}
                    </button>
                  ))
                )}

                {/* Lists dropdown */}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowListDropdown(p => !p)}
                    style={{ padding: '11px 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all .18s', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ListsIcon />
                    Listas{listItems.length > 0 ? ` (${listItems.length})` : ''}
                  </button>
                  {showListDropdown && (
                    <div style={{ position: 'absolute', top: '110%', left: 0, minWidth: 210, background: '#1a1a2e', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, overflow: 'hidden', zIndex: 50, boxShadow: '0 12px 40px rgba(0,0,0,.7)' }}>
                      {lists.length === 0 ? (
                        <div style={{ padding: '12px 16px' }}>
                          <button onClick={() => { setShowListDropdown(false); router.push('/lists'); }}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                            + Crear tu primera lista
                          </button>
                        </div>
                      ) : (
                        <>
                          {lists.map(list => (
                            <button key={list.id} className="list-row" onClick={() => handleListToggle(list)}
                              style={{ width: '100%', padding: '10px 16px', border: 'none', background: listItems.includes(list.id) ? 'rgba(99,102,241,.1)' : 'none', color: listItems.includes(list.id) ? '#a5b4fc' : '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, transition: 'background .15s' }}>
                              <span>{list.emoji}</span>
                              <span style={{ flex: 1 }}>{list.name}</span>
                              {listItems.includes(list.id) && <span style={{ fontSize: 11 }}>✓</span>}
                            </button>
                          ))}
                          <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '8px 16px' }}>
                            <button onClick={() => { setShowListDropdown(false); router.push('/lists'); }}
                              style={{ background: 'none', border: 'none', color: '#475569', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                              + Crear nueva lista
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div style={{ background: '#080810' }}>
          <div className="content-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 36px 80px' }}>

            {/* Review */}
            {watchlistItem && (
              <section style={{ marginBottom: 60 }}>
                <span style={SECTION_LABEL}>Tu reseña</span>
                <textarea className="review-ta" value={review} onChange={e => setReview(e.target.value)}
                  placeholder="¿Qué te pareció? Escribí tu reseña..." rows={4}
                  style={{ width: '100%', maxWidth: 640, padding: '13px 15px', borderRadius: 11, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)', color: '#f1f5f9', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.65, boxSizing: 'border-box', transition: 'border-color .2s' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                  <button onClick={handleSaveReview} disabled={savingReview || review === savedReview}
                    style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: review !== savedReview ? '#6366f1' : 'rgba(255,255,255,.06)', color: review !== savedReview ? '#fff' : '#475569', fontWeight: 700, cursor: review !== savedReview ? 'pointer' : 'default', fontSize: 13, fontFamily: 'inherit', transition: 'all .2s' }}>
                    {savingReview ? 'Guardando...' : review === savedReview && savedReview ? '✓ Guardada' : 'Guardar reseña'}
                  </button>
                  {savedReview && review !== savedReview && (
                    <button onClick={() => setReview(savedReview)} style={{ background: 'none', border: 'none', color: '#475569', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Descartar cambios
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Trailer */}
            {trailer && (
              <section style={{ marginBottom: 60 }}>
                <span style={SECTION_LABEL}>Trailer</span>
                <div style={{ borderRadius: 14, overflow: 'hidden', maxWidth: 720, boxShadow: '0 20px 60px rgba(0,0,0,.6)' }}>
                  <iframe width="100%" height="405" src={`https://www.youtube.com/embed/${trailer.key}`} frameBorder="0" allowFullScreen style={{ display: 'block' }} />
                </div>
              </section>
            )}

            {/* Cast */}
            {cast.length > 0 && (
              <section style={{ marginBottom: 60 }}>
                <span style={SECTION_LABEL}>Reparto</span>
                <div className="cast-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 10 }}>
                  {cast.map(person => (
                    <div key={person.id} style={{ flexShrink: 0, width: 96, textAlign: 'center' }}>
                      <div style={{ width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 9px', background: '#1a1a2e', border: '2px solid rgba(255,255,255,.07)' }}>
                        {person.profile_path
                          ? <img src={`${IMG_BASE}w200${person.profile_path}`} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}><PersonIcon /></div>
                        }
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', margin: '0 0 2px', lineHeight: 1.3 }}>{person.name}</p>
                      <p style={{ fontSize: 10, color: '#475569', margin: 0, lineHeight: 1.3 }}>{person.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Providers */}
            {(() => {
              const cp = show.providers?.results?.UY || show.providers?.results?.AR || show.providers?.results?.US;
              const flatrate = cp?.flatrate || [], rent = cp?.rent || [];
              if (!flatrate.length && !rent.length) return null;
              return (
                <section style={{ marginBottom: 60 }}>
                  <span style={SECTION_LABEL}>Dónde ver</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {flatrate.length > 0 && (
                      <div>
                        <p style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Streaming</p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {flatrate.map(p => (
                            <div key={p.provider_id} title={p.provider_name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                              <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover' }} />
                              <span style={{ fontSize: 10, color: '#475569', maxWidth: 54, textAlign: 'center', lineHeight: 1.2 }}>{p.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {rent.length > 0 && (
                      <div>
                        <p style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Alquilar</p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {rent.map(p => (
                            <div key={p.provider_id} title={p.provider_name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                              <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover' }} />
                              <span style={{ fontSize: 10, color: '#475569', maxWidth: 54, textAlign: 'center', lineHeight: 1.2 }}>{p.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#1e293b', marginTop: 10 }}>Datos provistos por JustWatch</p>
                </section>
              );
            })()}

            {/* Similar */}
            {similar.length > 0 && (
              <section>
                <span style={SECTION_LABEL}>Series similares</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(158px, 1fr))', gap: 16 }}>
                  {similar.map(item => <MediaCard key={item.id} item={{ ...item, media_type: 'tv' }} onAdd={handleAddSimilar} watchlistMap={watchlistMap} />)}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
