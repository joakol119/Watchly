'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

export default function MediaCard({ item, onAdd, onRemove, watchlistMap }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const type = item.media_type || (item.title ? 'movie' : 'tv');
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const inList = watchlistMap?.[`${type}-${item.id}`];

  const handleBtnClick = (e) => {
    e.stopPropagation();
    if (inList && onRemove) {
      onRemove(inList);
    } else {
      onAdd(item, type);
    }
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
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; setHovered(false); }}
      style={{ cursor: 'pointer', borderRadius: 12, overflow: 'hidden', background: '#141420', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s', position: 'relative' }}
    >
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
      <div style={{ padding: '12px' }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{title}</p>
        <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#64748b' }}>{year}</p>
        {onAdd && (
          <button
            onClick={handleBtnClick}
            style={{ width: '100%', padding: '7px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', transition: 'all 0.2s', ...btnStyle() }}
          >
            {btnLabel()}
          </button>
        )}
      </div>
    </div>
  );
}
