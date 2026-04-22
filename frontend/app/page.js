'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Landing() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
    const token = localStorage.getItem('token');
    if (token) router.push('/home');
  }, []);

  const features = [
    { icon: '🔥', title: 'Tendencias', desc: 'Las películas y series más populares de la semana, actualizadas en tiempo real.' },
    { icon: '🔍', title: 'Búsqueda instantánea', desc: 'Encontrá cualquier título al instante con la base de datos de TMDB.' },
    { icon: '📋', title: 'Tu lista personal', desc: 'Guardá lo que querés ver, marcá lo que ya viste y organizá todo.' },
    { icon: '🎭', title: 'Detalle completo', desc: 'Sinopsis, reparto, calificación, trailers y títulos similares.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080810', fontFamily: "'Inter', system-ui, sans-serif", color: '#f1f5f9', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        .btn-primary { padding: 14px 32px; border-radius: 12px; border: none; background: linear-gradient(135deg, #e50914, #b81c1c); color: #fff; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.25s; font-family: inherit; box-shadow: 0 4px 20px rgba(229,9,20,0.35); }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(229,9,20,0.5); }
        .btn-secondary { padding: 14px 32px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); color: #f1f5f9; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.25s; font-family: inherit; }
        .btn-secondary:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25); }
        .btn-nav { background: none; border: 1.5px solid rgba(255,255,255,0.15); color: #cbd5e1; border-radius: 10px; padding: 9px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .btn-nav:hover { background: rgba(255,255,255,0.08); }
        .feature-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 32px; transition: all 0.3s; cursor: default; }
        .feature-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(229,9,20,0.25); transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .anim-1 { animation: fadeUp 0.6s ease 0.1s both; }
        .anim-2 { animation: fadeUp 0.6s ease 0.25s both; }
        .anim-3 { animation: fadeUp 0.6s ease 0.4s both; }
        .anim-4 { animation: fadeUp 0.6s ease 0.55s both; }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🎬</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1, color: '#fff' }}>Watchly</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-nav" onClick={() => router.push('/login')}>Iniciar sesión</button>
          <button className="btn-primary" style={{ padding: '9px 20px', fontSize: 14 }} onClick={() => router.push('/login')}>Empezar gratis</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative' }}>
        {/* Background glow effects */}
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,9,20,0.08) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', top: '30%', left: '20%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,9,20,0.05) 0%, transparent 70%)', bottom: '20%', right: '15%', pointerEvents: 'none' }} />

        {/* Floating movie posters decoration */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.06 }}>
          {['🎬','🎭','🎥','📽️','🍿','🎞️','🏆','⭐'].map((emoji, i) => (
            <div key={i} style={{
              position: 'absolute',
              fontSize: `${24 + (i % 3) * 12}px`,
              left: `${10 + (i * 11) % 80}%`,
              top: `${15 + (i * 17) % 70}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              filter: 'grayscale(1)',
            }}>{emoji}</div>
          ))}
        </div>

        <div className="anim-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.25)', color: '#f87171', borderRadius: 999, padding: '7px 18px', fontSize: 13, fontWeight: 600, marginBottom: 36 }}>
          🎬 Tu lista de películas y series
        </div>

        <h1 className="anim-2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px, 9vw, 110px)', fontWeight: 400, lineHeight: 0.92, letterSpacing: '1px', marginBottom: 28, maxWidth: 900 }}>
          Todo lo que querés ver,{' '}
          <span style={{ background: 'linear-gradient(135deg, #e50914, #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            en un solo lugar.
          </span>
        </h1>

        <p className="anim-3" style={{ fontSize: 17, color: '#64748b', maxWidth: 480, lineHeight: 1.75, marginBottom: 44, fontWeight: 400 }}>
          Buscá películas y series, guardá tu lista, marcá lo que ya viste y descubrí qué está en tendencia.
        </p>

        <div className="anim-4" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => router.push('/login')}>Crear cuenta gratis →</button>
          <button className="btn-secondary" onClick={() => router.push('/login')}>Iniciar sesión</button>
        </div>

        {/* Stats */}
        <div className="anim-4" style={{ display: 'flex', gap: 48, marginTop: 72, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { value: '1M+', label: 'Títulos en TMDB' },
            { value: '3', label: 'Estados de seguimiento' },
            { value: '100%', label: 'Gratis' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 1, color: '#fff', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: 1100, margin: '0 auto', height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 32px 120px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#e50914', marginBottom: 14 }}>Características</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 400, letterSpacing: 1, color: '#fff' }}>Todo lo que necesitás</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {features.map((f, i) => (
            <div key={f.title} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: 36, marginBottom: 18 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 32px 120px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'rgba(229,9,20,0.06)', border: '1px solid rgba(229,9,20,0.15)', borderRadius: 24, padding: '60px 40px' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 400, letterSpacing: 1, marginBottom: 16, color: '#fff' }}>
            ¿Listo para empezar?
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', marginBottom: 32, lineHeight: 1.7 }}>
            Creá tu cuenta gratis y empezá a organizar todo lo que querés ver.
          </p>
          <button className="btn-primary" style={{ fontSize: 16, padding: '15px 40px' }} onClick={() => router.push('/login')}>
            Crear cuenta gratis →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🎬</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: '#fff' }}>Watchly</span>
        </div>
        <p style={{ fontSize: 13, color: '#334155' }}>Hecho por Joaquín</p>
        <p style={{ fontSize: 13, color: '#334155' }}>Next.js · Node.js · TMDB API</p>
      </footer>
    </div>
  );
}
