'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const STATUS_OPTIONS = [
  { value: 'want_to_watch', label: '🔖 Quiero ver', color: '#6366f1' },
  { value: 'watching',      label: '▶️ Viendo',     color: '#f59e0b' },
  { value: 'watched',       label: '✓ Visto',       color: '#22c55e' },
];

export default function MediaCard({ item, onAdd, onRemove, watchlistMap }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const type = item.media_type || (item.title ? 'movie' : 'tv');
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const inList = watchlistMap?.[`${type}-${item.id}`];

  // Cerrar menú al hacer click afuera
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (inList && onRemove) {
      onRemove(inList);
    } else {
      setShowMenu(prev => !prev);
    }
  };

  const handleStatusSelect = (e, status) => {
    e.stopPropagation();
    setShowMenu(false);
    onAdd(item, type, status);
  };

  const btnLabel = () => {
    if (!inList) return '+ Agregar';
    if (hovered && onRemove) return '✕ Quitar';
    return '✓ En mi lista';
  };

  const btnStyle = () => {
    if (!inList) return { background: 'rgba(229,9,20,0.15)', color: '#f87171' };
    if (hovered && onRemove) return { background: 'rgba(239,68,68,0.2)', color: '#fca5a5' };
    return { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' };
  };

  return (
    <div
      onClick={() => router.push(`/${type}/${item.id}`)}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)'; setHovered(true); }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; setHovered(false); setShowMenu(false); }}
      style={{ cursor: 'pointer', borderRadius: 12, overflow: 'visible', background: '#141420', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s', position: 'relative' }}
    >
      <div style={{ borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ position: 'relative', paddingBottom: '150%', background: '#1e1e2e' }}>
          {item.poster_path
            ? <img src={`${IMG_BASE}${item.poster_path}`} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎬</div>
          }
          <div style={{ position: 'absolute', top: 8, left: 8, background: type === 'movie' ? 'rgba(229,9,20,0.9)' : 'rgba(99,102,241,0.9)', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
            {type === 'movie' ? 'PELÍCULA' : 'SERIE'}
          </div>
          {item.vote_average > 0 && (
            <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.8)', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>
              ⭐ {item.vote_average.toFixed(1)}
            </div>
          )}
        </div>

        <div style={{ padding: '12px', position: 'relative' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{title}</p>
          <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#64748b' }}>{year}</p>

          {onAdd && (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={handleAddClick}
                style={{ width: '100%', padding: '7px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', transition: 'all 0.2s', ...btnStyle() }}
              >
                {btnLabel()}
              </button>

              {/* Dropdown menu */}
              {showMenu && (
                <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 4, background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden', zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={e => handleStatusSelect(e, s.value)}
                      style={{ width: '100%', padding: '9px 14px', border: 'none', background: 'none', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = s.color; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
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
