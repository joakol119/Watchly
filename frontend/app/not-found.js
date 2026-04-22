'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#080810', fontFamily: "'Inter', system-ui, sans-serif", color: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(229,9,20,0.4) !important; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1) !important; }
      `}</style>

      {/* Fondo */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,9,20,0.07) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />

      {/* Emoji flotante */}
      <div style={{ fontSize: 80, marginBottom: 24, animation: 'float 3s ease-in-out infinite' }}>🎬</div>

      {/* 404 */}
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(100px, 20vw, 180px)', lineHeight: 0.85, letterSpacing: 4, background: 'linear-gradient(135deg, rgba(229,9,20,0.8), rgba(229,9,20,0.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 16, animation: 'fadeUp 0.5s ease 0.1s both' }}>
        404
      </div>

      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 400, letterSpacing: 1, marginBottom: 12, color: '#fff', animation: 'fadeUp 0.5s ease 0.2s both' }}>
        Página no encontrada
      </h1>

      <p style={{ fontSize: 15, color: '#475569', maxWidth: 380, lineHeight: 1.7, marginBottom: 40, animation: 'fadeUp 0.5s ease 0.3s both' }}>
        La página que buscás no existe o fue eliminada. Volvé al inicio para seguir explorando.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeUp 0.5s ease 0.4s both' }}>
        <button
          className="btn-primary"
          onClick={() => router.push('/home')}
          style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #e50914, #b81c1c)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(229,9,20,0.3)' }}
        >
          Ir al inicio →
        </button>
        <button
          className="btn-secondary"
          onClick={() => router.back()}
          style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s' }}
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}
