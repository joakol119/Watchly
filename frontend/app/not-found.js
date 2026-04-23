'use client';
import { useRouter } from 'next/navigation';

const FilmIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(229,9,20,0.3)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <rect x="2" y="2" width="20" height="20" rx="2"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/>
  </svg>
);

export default function NotFound() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.6} }
        .btn-404-primary:hover { background: #c8070f !important; transform:translateY(-1px); box-shadow:0 8px 24px rgba(229,9,20,.38) !important; }
        .btn-404-ghost:hover   { background:rgba(255,255,255,.08) !important; color:#f1f5f9 !important; }
      `}</style>

      {/* Glow */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,9,20,.07) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', animation: 'pulse 4s ease-in-out infinite' }} />

      {/* Large decorative film icon */}
      <div style={{ width: 96, height: 96, marginBottom: 32, opacity: .35, animation: 'fadeUp .5s ease .05s both' }}>
        <FilmIcon />
      </div>

      {/* 404 */}
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(96px, 18vw, 160px)', lineHeight: .85, letterSpacing: '.04em', background: 'linear-gradient(135deg, rgba(229,9,20,.7), rgba(229,9,20,.15))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 20, animation: 'fadeUp .5s ease .1s both' }}>
        404
      </div>

      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 400, letterSpacing: '.02em', marginBottom: 12, color: '#fff', animation: 'fadeUp .5s ease .18s both' }}>
        Página no encontrada
      </h1>

      <p style={{ fontSize: 15, color: '#475569', maxWidth: 360, lineHeight: 1.75, marginBottom: 40, animation: 'fadeUp .5s ease .26s both' }}>
        La página que buscás no existe o fue eliminada. Volvé al inicio para seguir explorando.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeUp .5s ease .34s both' }}>
        <button className="btn-404-primary" onClick={() => router.push('/home')}
          style={{ padding: '12px 28px', borderRadius: 9, border: 'none', background: '#e50914', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'all .18s' }}>
          Ir al inicio
        </button>
        <button className="btn-404-ghost" onClick={() => router.back()}
          style={{ padding: '12px 24px', borderRadius: 9, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'all .18s' }}>
          Volver
        </button>
      </div>
    </div>
  );
}
