'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';

function formatTime(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const days  = Math.floor(hours / 24);
  if (days >= 1) return `${days}d ${hours % 24}h`;
  return `${hours}h ${minutes % 60}m`;
}

const ChartIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
  </svg>
);

const FilmBadgeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);

const TvIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="2"/>
    <polyline points="17 2 12 7 7 2"/>
  </svg>
);

function DonutChart({ watched, watching, wantToWatch }) {
  const total = watched + watching + wantToWatch;
  if (!total) return null;
  const segments = [
    { value: watched,     color: '#22c55e', label: 'Visto' },
    { value: watching,    color: '#f59e0b', label: 'Viendo' },
    { value: wantToWatch, color: '#6366f1', label: 'Quiero ver' },
  ];
  let cumulative = 0;
  const radius = 70, cx = 90, cy = 90;
  const circumference = 2 * Math.PI * radius;
  const paths = segments.map(seg => {
    const pct    = seg.value / total;
    const offset = circumference * (1 - cumulative);
    cumulative  += pct;
    return { ...seg, pct, offset, dash: circumference * pct };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
      <svg width="180" height="180" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="24"/>
        {paths.map((seg, i) => (
          <circle key={i} cx={cx} cy={cy} r={radius} fill="none"
            stroke={seg.color} strokeWidth="24"
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={seg.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'all .6s ease' }}
          />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#f1f5f9" fontSize="28" fontWeight="800" fontFamily="'Bebas Neue', sans-serif">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#475569" fontSize="11" fontFamily="inherit">títulos</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {segments.map(seg => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{seg.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginLeft: 'auto', paddingLeft: 16 }}>{seg.value}</span>
            <span style={{ fontSize: 11, color: '#475569' }}>({Math.round(seg.value / total * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenreBar({ name, count, max }) {
  const pct = (count / max) * 100;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{name}</span>
        <span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 700 }}>{count}</span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #e50914, #f87171)', width: `${pct}%`, transition: 'width .9s ease' }} />
      </div>
    </div>
  );
}

const CARD = { background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 28 };
const SECTION_TITLE = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: '#475569', marginBottom: 22 };

export default function StatsPage() {
  const [stats,   setStats]   = useState(null);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    api.getStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 38, height: 38, border: '2px solid rgba(229,9,20,.2)', borderTop: '2px solid #e50914', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <p style={{ color: '#475569', fontSize: 14, fontWeight: 500 }}>Analizando tu watchlist...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#f1f5f9' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 640px) {
          .stats-pad        { padding: 80px 16px 60px !important; }
          .stats-main-grid  { grid-template-columns: 1fr !important; }
          .genre-two-col    { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Navbar user={user} />

      <div className="stats-pad" style={{ maxWidth: 900, margin: '0 auto', padding: '88px 32px 80px' }}>
        <div style={{ marginBottom: 40, animation: 'fadeUp .4s ease forwards' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: '#e50914', marginBottom: 8 }}>Tu actividad</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, fontWeight: 400, letterSpacing: '.02em', color: '#fff', lineHeight: 1 }}>Estadísticas</h1>
        </div>

        {stats?.empty ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><ChartIcon /></div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontWeight: 400, letterSpacing: '.02em', color: '#fff', marginBottom: 8 }}>Sin datos todavía</h3>
            <p style={{ color: '#475569', fontSize: 15, fontWeight: 500, marginBottom: 24 }}>Agregá títulos a tu lista para ver tus estadísticas</p>
            <button onClick={() => router.push('/home')}
              style={{ padding: '12px 28px', borderRadius: 9, border: 'none', background: '#e50914', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, transition: 'background .18s' }}>
              Explorar tendencias
            </button>
          </div>
        ) : (
          <>
            {/* Hero stat */}
            <div style={{ ...CARD, marginBottom: 18, textAlign: 'center', padding: '40px 28px', animation: 'fadeUp .4s ease .05s both', background: 'rgba(229,9,20,.05)', border: '1px solid rgba(229,9,20,.12)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: '#e50914', marginBottom: 10 }}>Tiempo total visto</p>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(48px, 8vw, 80px)', color: '#fff', letterSpacing: '.02em', lineHeight: 1 }}>
                {formatTime(stats.totalMinutesWatched)}
              </div>
              <p style={{ fontSize: 13, color: '#334155', marginTop: 10, fontWeight: 500 }}>basado en {stats.watched} títulos marcados como vistos</p>
            </div>

            <div className="stats-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
              {/* Donut */}
              <div style={{ ...CARD, animation: 'fadeUp .4s ease .1s both' }}>
                <p style={SECTION_TITLE}>Estado de tu lista</p>
                <DonutChart watched={stats.watched} watching={stats.watching} wantToWatch={stats.wantToWatch} />
              </div>

              {/* Movie vs TV */}
              <div style={{ ...CARD, animation: 'fadeUp .4s ease .15s both' }}>
                <p style={SECTION_TITLE}>Tipo de contenido</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {[
                    { label: 'Películas', value: stats.movies,  color: '#e50914', Icon: FilmBadgeIcon, total: stats.total },
                    { label: 'Series',    value: stats.tvShows, color: '#6366f1', Icon: TvIcon,        total: stats.total },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: item.color }}><item.Icon /></span>
                          {item.label}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: item.color }}>{item.value}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 999, background: item.color, width: `${(item.value / item.total) * 100}%`, transition: 'width .9s ease' }} />
                      </div>
                      <p style={{ fontSize: 12, color: '#334155', marginTop: 5, fontWeight: 500 }}>{Math.round((item.value / item.total) * 100)}% de tu lista</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top genres */}
            {stats.topGenres?.length > 0 && (
              <div style={{ ...CARD, animation: 'fadeUp .4s ease .2s both' }}>
                <p style={SECTION_TITLE}>Tus géneros favoritos</p>
                <div className="genre-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                  {stats.topGenres.map(g => (
                    <GenreBar key={g.name} name={g.name} count={g.count} max={stats.topGenres[0].count} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
