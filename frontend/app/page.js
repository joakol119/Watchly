'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Landing() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const token = localStorage.getItem('token');
    if (token) router.push('/home');
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&family=Syne:wght@700;800&display=swap');
        .fade-in { opacity: 0; transform: translateY(24px); transition: all 0.7s ease; }
        .fade-in.visible { opacity: 1; transform: translateY(0); }
        .fade-in.d1 { transition-delay: 0.1s; }
        .fade-in.d2 { transition-delay: 0.25s; }
        .fade-in.d3 { transition-delay: 0.4s; }
        .fade-in.d4 { transition-delay: 0.55s; }
        .btn-primary { padding: 14px 36px; border-radius: 12px; border: none; background: linear-gradient(135deg, #e50914, #b81c1c); color: #fff; font-weight: 700; font-size: 16px; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(229,9,20,0.4); }
        .btn-secondary { padding: 14px 36px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #f1f5f9; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }
        .feature-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 28px; transition: all 0.3s; }
        .feature-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(229,9,20,0.3); transform: translateY(-4px); }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🎬</span>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Watchly</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary" style={{ padding: '9px 20px', fontSize: 14 }} onClick={() => router.push('/login')}>Iniciar sesión</button>
          <button className="btn-primary" style={{ padding: '9px 20px', fontSize: 14 }} onClick={() => router.push('/login')}>Empezar gratis</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,9,20,0.12) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', pointerEvents: 'none' }} />

        <div className={`fade-in d1 ${visible ? 'visible' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)', color: '#f87171', borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 500, marginBottom: 32 }}>
          🎬 Tu lista de películas y series
        </div>

        <h1 className={`fade-in d2 ${visible ? 'visible' : ''}`} style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 24 }}>
          Todo lo que querés ver,<br />
          <span style={{ background: 'linear-gradient(135deg, #e50914, #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>en un solo lugar.</span>
        </h1>

        <p className={`fade-in d3 ${visible ? 'visible' : ''}`} style={{ fontSize: 18, color: '#94a3b8', maxWidth: 520, lineHeight: 1.7, marginBottom: 40, fontWeight: 300 }}>
          Buscá películas y series, guardá tu lista, marcá lo que ya viste y descubrí qué está en tendencia.
        </p>

        <div className={`fade-in d4 ${visible ? 'visible' : ''}`} style={{ display: 'flex', gap: 14 }}>
          <button className="btn-primary" onClick={() => router.push('/login')}>Crear cuenta gratis →</button>
          <button className="btn-secondary" onClick={() => router.push('/login')}>Ver demo</button>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 100px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#e50914', marginBottom: 16, textAlign: 'center' }}>Características</p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1px', textAlign: 'center', marginBottom: 48 }}>Todo lo que necesitás</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {[
            { icon: '🔥', title: 'Tendencias', desc: 'Descubrí las películas y series más populares de la semana en tiempo real.' },
            { icon: '🔍', title: 'Búsqueda potente', desc: 'Encontrá cualquier película o serie al instante con la base de datos de TMDB.' },
            { icon: '📋', title: 'Tu lista personal', desc: 'Guardá lo que querés ver, marcá lo que ya viste y organizá tu contenido.' },
            { icon: '🎭', title: 'Detalle completo', desc: 'Sinopsis, reparto, calificación, trailers y mucho más de cada título.' },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: '24px 48px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🎬</span>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>Watchly</span>
        </div>
        <p style={{ fontSize: 13, color: '#475569' }}>Hecho por Joaquín</p>
        <p style={{ fontSize: 13, color: '#475569' }}>Next.js · Node.js · TMDB API</p>
      </footer>
    </div>
  );
}
