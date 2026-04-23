'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const FilmIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <rect x="2" y="2" width="20" height="20" rx="2"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/>
  </svg>
);

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const STATUS_OPTIONS = [
  { value: 'want_to_watch', label: 'Quiero ver', color: '#6366f1' },
  { value: 'watching',      label: 'Viendo',     color: '#f59e0b' },
  { value: 'watched',       label: 'Visto',       color: '#22c55e' },
];

export default function MediaCard({ item, onAdd, onRemove, watchlistMap }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const type  = item.media_type || (item.title ? 'movie' : 'tv');
  const title = item.title || item.name;
  const year  = (item.release_date || item.first_air_date || '').slice(0, 4);
  const inList = watchlistMap?.[`${type}-${item.id}`];

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (inList && onRemove) onRemove(inList);
    else setShowMenu(prev => !prev);
  };

  const handleStatusSelect = (e, status) => {
    e.stopPropagation();
    setShowMenu(false);
    onAdd(item, type, status);
  };

  const btnLabel = () => {
    if (!inList)              return '+ Agregar';
    if (hovered && onRemove) return '✕ Quitar';
    return '✓ En lista';
  };

  const btnColors = () => {
    if (!inList)              return { background: 'rgba(229,9,20,.12)', color: '#f87171' };
    if (hovered && onRemove) return { background: 'rgba(239,68,68,.18)', color: '#fca5a5' };
    return { background: 'rgba(99,102,241,.18)', color: '#a5b4fc' };
  };

  return (
    <div
      onClick={() => router.push(`/${type}/${item.id}`)}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,.5)'; setHovered(true); }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; setHovered(false); setShowMenu(false); }}
      style={{ cursor: 'pointer', borderRadius: 12, overflow: 'visible', background: '#141420', border: '1px solid rgba(255,255,255,.06)', transition: 'transform .2s, box-shadow .2s', position: 'relative' }}
    >
      <div style={{ borderRadius: 12, overflow: 'hidden' }}>
        {/* Poster */}
        <div style={{ position: 'relative', paddingBottom: '150%', background: '#1e1e2e' }}>
          {item.poster_path
            ? <img src={`${IMG_BASE}${item.poster_path}`} alt={title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}><FilmIcon /></div>
          }
          {/* Type badge */}
          <div style={{ position: 'absolute', top: 8, left: 8, background: type === 'movie' ? 'rgba(229,9,20,.9)' : 'rgba(99,102,241,.9)', borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700, letterSpacing: '.04em', color: '#fff' }}>
            {type === 'movie' ? 'PELÍCULA' : 'SERIE'}
          </div>
          {/* Rating badge */}
          {item.vote_average > 0 && (
            <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.75)', borderRadius: 5, padding: '2px 7px', fontSize: 11, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)' }}>
              <StarIcon />
              {item.vote_average.toFixed(1)}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '11px 12px 12px', position: 'relative' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{title}</p>
          <p style={{ margin: '3px 0 9px', fontSize: 12, color: '#475569' }}>{year}</p>

          {onAdd && (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={handleAddClick}
                style={{ width: '100%', padding: '7px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', transition: 'background .18s, color .18s', ...btnColors() }}
              >
                {btnLabel()}
              </button>

              {showMenu && (
                <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 5, background: '#1a1a2e', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, overflow: 'hidden', zIndex: 200, boxShadow: '0 12px 32px rgba(0,0,0,.7)' }}>
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={e => handleStatusSelect(e, s.value)}
                      onMouseEnter={e => { e.currentTarget.style.background = `${s.color}18`; e.currentTarget.style.color = s.color; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; }}
                      style={{ width: '100%', padding: '9px 14px', border: 'none', background: 'none', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background .15s, color .15s' }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
