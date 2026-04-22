'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';

function formatTime(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days}d ${hours % 24}h`;
  return `${hours}h ${minutes % 60}m`;
}

function DonutChart({ watched, watching, wantToWatch }) {
  const total = watched + watching + wantToWatch;
  if (!total) return null;

  const segments = [
    { value: watched,      color: '#22c55e', label: 'Visto' },
    { value: watching,     color: '#f59e0b', label: 'Viendo' },
    { value: wantToWatch,  color: '#6366f1', label: 'Quiero ver' },
  ];

  let cumulative = 0;
  const radius = 70;
  const cx = 90, cy = 90;
  const circumference = 2 * Math.PI * radius;

  const paths = segments.map(seg => {
    const pct = seg.value / total;
    const offset = circumference * (1 - cumulative);
    cumulative += pct;
    return { ...seg, pct, offset, dash: circumference * pct };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
      <svg width="180" height="180" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="24" />
        {paths.map((seg, i) => (
          <circle key={i} cx={cx} cy={cy} r={radius} fill="none"
            stroke={seg.color} strokeWidth="24"
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={seg.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'all 0.5s ease' }}
          />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#f1f5f9" fontSize="28" fontWeight="800" fontFamily="'Bebas Neue', sans-serif">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#475569" fontSize="11" fontFamily="Inter, sans-serif">títulos</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {segments.map(seg => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{seg.label}</span>
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
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{name}</span>
        <span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 700 }}>{count}</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #e50914, #f87171)', width: `${pct}%`, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    api.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 28,
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(229,9,20,0.2)', borderTop: '3px solid #e50914', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#475569', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Analizando tu watchlist...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#080810', fontFamily: "'Inter', system-ui, sans-serif", color: '#f1f5f9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Bebas+Neue&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <Navbar user={user} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '88px 32px 80px' }}>

        <div style={{ marginBottom: 40, animation: 'fadeUp 0.4s ease forwards' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#e50914', marginBottom: 8 }}>Tu actividad</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, fontWeight: 400, letterSpacing: 1, color: '#fff', lineHeight: 1 }}>Estadísticas</h1>
        </div>

        {stats?.empty ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📊</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontWeight: 400, letterSpacing: 1, color: '#fff', marginBottom: 8 }}>Sin datos todavía</h3>
            <p style={{ color: '#475569', fontSize: 15, marginBottom: 24 }}>Agregá títulos a tu lista para ver tus estadísticas</p>
            <button onClick={() => router.push('/home')} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #e50914, #b81c1c)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
              Explorar tendencias
            </button>
          </div>
        ) : (
          <>
            {/* Big stat — tiempo visto */}
            <div style={{ ...cardStyle, marginBottom: 20, textAlign: 'center', padding: '40px 28px', animation: 'fadeUp 0.4s ease 0.05s both', background: 'rgba(229,9,20,0.06)', border: '1px solid rgba(229,9,20,0.15)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: '#e50914', marginBottom: 8 }}>Tiempo total visto</p>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(48px, 8vw, 80px)', color: '#fff', letterSpacing: 1, lineHeight: 1 }}>
                {formatTime(stats.totalMinutesWatched)}
              </div>
              <p style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>basado en {stats.watched} títulos marcados como vistos</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

              {/* Donut chart */}
              <div style={{ ...cardStyle, animation: 'fadeUp 0.4s ease 0.1s both' }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 }}>Estado de tu lista</h2>
                <DonutChart watched={stats.watched} watching={stats.watching} wantToWatch={stats.wantToWatch} />
              </div>

              {/* Movie vs TV */}
              <div style={{ ...cardStyle, animation: 'fadeUp 0.4s ease 0.15s both' }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 }}>Tipo de contenido</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[
                    { label: '🎬 Películas', value: stats.movies, color: '#e50914', total: stats.total },
                    { label: '📺 Series', value: stats.tvShows, color: '#6366f1', total: stats.total },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>{item.label}</span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: item.color }}>{item.value}</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 999, background: item.color, width: `${(item.value / item.total) * 100}%`, transition: 'width 0.8s ease' }} />
                      </div>
                      <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{Math.round((item.value / item.total) * 100)}% de tu lista</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top géneros */}
            {stats.topGenres?.length > 0 && (
              <div style={{ ...cardStyle, animation: 'fadeUp 0.4s ease 0.2s both' }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 }}>Tus géneros favoritos</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
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
