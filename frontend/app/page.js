'use client';
import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const FilmIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <rect x="2" y="2" width="20" height="20" rx="2"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/>
  </svg>
);

const TrendingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const FEATURES = [
  { Icon: TrendingIcon, title: 'Tendencias en tiempo real', desc: 'Las películas y series más populares de la semana, actualizadas constantemente desde TMDB.', accent: '#e50914' },
  { Icon: SearchIcon,  title: 'Búsqueda instantánea',     desc: 'Encontrá cualquier título al instante con acceso a más de 1 millón de entradas en la base de datos.', accent: '#6366f1' },
  { Icon: ListIcon,   title: 'Tu lista personal',          desc: 'Guardá lo que querés ver, marcá lo que ya viste y organizá todo en un solo lugar.', accent: '#22c55e' },
  { Icon: InfoIcon,   title: 'Detalle completo',           desc: 'Sinopsis, reparto, calificaciones, trailers y títulos similares para cada contenido.', accent: '#f59e0b' },
];

const STATS = [
  { value: '1M+',  label: 'Títulos disponibles' },
  { value: '100%', label: 'Gratuito' },
  { value: '3',    label: 'Estados de seguimiento' },
];

const CTA_CHECKS = ['Sin tarjeta de crédito', 'Completamente gratuito', 'Sin límite de títulos'];

export default function Landing() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/home');
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#080810', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#f1f5f9', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Bebas+Neue&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        @keyframes fadeUp  { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0%,100% { opacity: .45; } 50% { opacity: .7; } }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }

        .anim-1 { opacity: 0; animation: fadeUp .5s ease .05s forwards; }
        .anim-2 { opacity: 0; animation: fadeUp .5s ease .15s forwards; }
        .anim-3 { opacity: 0; animation: fadeUp .5s ease .25s forwards; }
        .anim-4 { opacity: 0; animation: fadeUp .5s ease .35s forwards; }
        .anim-5 { opacity: 0; animation: fadeUp .5s ease .45s forwards; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 26px; border-radius: 9px; border: none;
          background: #e50914; color: #fff; font-weight: 700; font-size: 15px;
          cursor: pointer; transition: background .18s, box-shadow .18s, transform .18s;
          font-family: inherit; letter-spacing: -.01em;
        }
        .btn-primary:hover  { background: #c8070f; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(229,9,20,.38); }
        .btn-primary:active { transform: translateY(0); box-shadow: none; }
        .btn-primary:focus-visible { outline: 2px solid #e50914; outline-offset: 3px; }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 24px; border-radius: 9px;
          border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04);
          color: #94a3b8; font-weight: 600; font-size: 15px;
          cursor: pointer; transition: background .18s, border-color .18s, color .18s;
          font-family: inherit;
        }
        .btn-ghost:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.18); color: #f1f5f9; }
        .btn-ghost:focus-visible { outline: 2px solid rgba(255,255,255,.35); outline-offset: 3px; }

        .btn-nav-login {
          background: none; border: 1px solid rgba(255,255,255,.1); color: #94a3b8;
          border-radius: 8px; padding: 8px 16px; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: color .18s, border-color .18s, background .18s; font-family: inherit;
        }
        .btn-nav-login:hover { color: #f1f5f9; border-color: rgba(255,255,255,.2); background: rgba(255,255,255,.05); }

        .btn-nav-cta {
          background: #e50914; border: none; color: #fff;
          border-radius: 8px; padding: 8px 18px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: background .18s; font-family: inherit;
        }
        .btn-nav-cta:hover { background: #c8070f; }

        .feature-card {
          background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px; padding: 28px 28px 32px; position: relative; overflow: hidden;
          transition: border-color .25s, transform .25s, box-shadow .25s;
          cursor: default;
        }
        .feature-card::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 55%);
          opacity: 0; transition: opacity .25s;
        }
        .feature-card:hover { border-color: rgba(255,255,255,.1); transform: translateY(-4px); box-shadow: 0 24px 48px rgba(0,0,0,.35); }
        .feature-card:hover::after { opacity: 1; }

        .icon-wrap {
          width: 42px; height: 42px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
        }

        .stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,.08); flex-shrink: 0; }

        .check-row { display: flex; align-items: center; gap: 10px; }
        .check-box {
          width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.25); color: #4ade80;
        }

        @media (max-width: 640px) {
          .hero-btns { flex-direction: column !important; }
          .hero-btns button { justify-content: center; width: 100%; }
          .stats-row { gap: 20px !important; }
          .stat-divider { display: none; }
          .features-grid { grid-template-columns: 1fr !important; }
          .cta-box { padding: 40px 24px !important; }
          .footer-row { flex-direction: column; align-items: flex-start !important; gap: 10px !important; }
        }
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,8,16,.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,.06)' : '1px solid transparent',
        transition: 'background .3s, backdrop-filter .3s, border-color .3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 26, height: 26, color: '#e50914', flexShrink: 0 }}><FilmIcon /></div>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '.06em', color: '#fff' }}>Watchly</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn-nav-login" onClick={() => router.push('/login?mode=login')}>Iniciar sesión</button>
          <button className="btn-nav-cta"   onClick={() => router.push('/login?mode=register')}>Crear cuenta</button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '128px 24px 96px', position: 'relative' }}>

        {/* Background glows */}
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,9,20,.07) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-55%)', pointerEvents: 'none', animation: 'pulseGlow 5s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.05) 0%, transparent 70%)', top: '20%', left: '8%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,9,20,.04) 0%, transparent 70%)', bottom: '12%', right: '8%', pointerEvents: 'none' }} />

        {/* Subtle dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

        <div className="anim-1">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(229,9,20,.08)', border: '1px solid rgba(229,9,20,.2)', color: '#f87171', borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 600, letterSpacing: '.02em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', display: 'inline-block' }} />
            Powered by TMDB · Más de 1M títulos
          </span>
        </div>

        <h1 className="anim-2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(58px, 10vw, 118px)', fontWeight: 400, lineHeight: .9, letterSpacing: '.02em', margin: '28px 0', maxWidth: 960 }}>
          <span style={{ display: 'block', color: '#fff' }}>Tu universo de</span>
          <span style={{ display: 'block', background: 'linear-gradient(120deg, #fff 20%, rgba(229,9,20,.9) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            películas y series
          </span>
        </h1>

        <p className="anim-3" style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: '#64748b', maxWidth: 460, lineHeight: 1.85, marginBottom: 44 }}>
          Buscá, guardá y organizá todo lo que querés ver. Descubrí tendencias y llevá el registro de tu historial.
        </p>

        <div className="anim-4 hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => router.push('/login?mode=register')}>
            Empezar gratis <ArrowRightIcon />
          </button>
          <button className="btn-ghost" onClick={() => router.push('/login?mode=login')}>
            Ya tengo cuenta
          </button>
        </div>

        <div className="anim-5 stats-row" style={{ display: 'flex', alignItems: 'center', gap: 36, marginTop: 80, flexWrap: 'wrap', justifyContent: 'center' }}>
          {STATS.map((s, i) => (
            <Fragment key={s.label}>
              {i > 0 && <div className="stat-divider" />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '.04em', color: '#fff', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            </Fragment>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: '0 auto', height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,.07), transparent)' }} />

      {/* ── Features ───────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 32px 120px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.15em', color: '#e50914', marginBottom: 14 }}>Características</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px, 5vw, 62px)', fontWeight: 400, letterSpacing: '.02em', color: '#fff', lineHeight: 1 }}>Todo lo que necesitás</h2>
        </div>

        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {FEATURES.map(({ Icon, title, desc, accent }) => (
            <div key={title} className="feature-card">
              <div className="icon-wrap" style={{ background: `${accent}14`, border: `1px solid ${accent}28`, color: accent }}>
                <div style={{ width: 20, height: 20 }}><Icon /></div>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 10, letterSpacing: '-.01em' }}>{title}</h3>
              <p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.8 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 120px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(229,9,20,.08) 0%, rgba(99,102,241,.06) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(229,9,20,.15)', borderRadius: 20, pointerEvents: 'none' }} />

          <div className="cta-box" style={{ position: 'relative', padding: '56px 48px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 400, letterSpacing: '.02em', marginBottom: 16, color: '#fff', lineHeight: 1 }}>
              ¿Listo para empezar?
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.8, maxWidth: 380, margin: '0 auto 36px' }}>
              Creá tu cuenta gratis y empezá a organizar todo lo que querés ver.
            </p>

            <button className="btn-primary" style={{ fontSize: 15, padding: '14px 36px', marginBottom: 28 }} onClick={() => router.push('/login?mode=register')}>
              Crear cuenta gratis <ArrowRightIcon />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              {CTA_CHECKS.map(item => (
                <div key={item} className="check-row">
                  <div className="check-box"><CheckIcon /></div>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '24px 40px' }}>
        <div className="footer-row" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, color: '#e50914', flexShrink: 0 }}><FilmIcon /></div>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '.06em', color: '#fff' }}>Watchly</span>
          </div>
          <p style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>Hecho por Joaquín</p>
          <p style={{ fontSize: 13, color: '#334155' }}>Next.js · Node.js · TMDB API</p>
        </div>
      </footer>
    </div>
  );
}
