'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';

const FilmIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <rect x="2" y="2" width="20" height="20" rx="2"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/>
  </svg>
);

function LoginContent() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('mode') === 'register') setMode('register');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register') {
      if (form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden'); return; }
      if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    }
    setLoading(true);
    try {
      const data = mode === 'login'
        ? await api.login({ email: form.email, password: form.password })
        : await api.register({ name: form.name, email: form.email, password: form.password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const pwMatch = form.confirmPassword && form.confirmPassword === form.password;
  const pwMismatch = form.confirmPassword && form.confirmPassword !== form.password;

  const inputBase = { width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color .2s, box-shadow .2s' };
  const labelBase = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.06em' };

  return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .login-input:focus { border-color: rgba(229,9,20,.45) !important; box-shadow: 0 0 0 3px rgba(229,9,20,.09) !important; }
        .login-submit:hover:not(:disabled) { background: #c8070f !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(229,9,20,.35) !important; }
        .login-switch:hover { color: #f87171 !important; }
      `}</style>

      {/* Background glow */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,9,20,.06) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, animation: 'fadeUp .45s ease forwards', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: 16, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <div style={{ width: 32, height: 32, color: '#e50914' }}><FilmIcon /></div>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '.05em', color: '#fff' }}>Watchly</span>
          </div>
          <p style={{ color: '#475569', fontSize: 14, fontWeight: 500 }}>
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Creá tu cuenta gratis'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 18, padding: '32px 28px' }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: 3, marginBottom: 28, gap: 3 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setForm({ name: '', email: '', password: '', confirmPassword: '' }); }}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: mode === m ? 'rgba(229,9,20,.15)' : 'none', color: mode === m ? '#f87171' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .18s' }}>
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div>
                <label style={labelBase}>Nombre</label>
                <input className="login-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputBase} placeholder="Tu nombre" required />
              </div>
            )}

            <div>
              <label style={labelBase}>Email</label>
              <input className="login-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputBase} placeholder="tu@email.com" required />
            </div>

            <div>
              <label style={labelBase}>Contraseña</label>
              <input className="login-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputBase} placeholder="••••••••" required />
            </div>

            {mode === 'register' && (
              <div>
                <label style={labelBase}>Confirmar contraseña</label>
                <input
                  className="login-input"
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  style={{ ...inputBase, borderColor: pwMismatch ? 'rgba(239,68,68,.5)' : pwMatch ? 'rgba(34,197,94,.5)' : 'rgba(255,255,255,.1)' }}
                  placeholder="••••••••"
                  required
                />
                {pwMismatch && <p style={{ fontSize: 12, color: '#f87171', marginTop: 5 }}>Las contraseñas no coinciden</p>}
                {pwMatch    && <p style={{ fontSize: 12, color: '#86efac', marginTop: 5 }}>✓ Las contraseñas coinciden</p>}
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, padding: '10px 14px' }}>
                <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
              style={{ padding: '13px', borderRadius: 9, border: 'none', background: '#e50914', color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .65 : 1, fontFamily: 'inherit', marginTop: 4, transition: 'background .18s, transform .18s, box-shadow .18s' }}
            >
              {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#475569' }}>
            {mode === 'login' ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
            <button className="login-switch" onClick={switchMode} style={{ background: 'none', border: 'none', color: '#e50914', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', transition: 'color .18s' }}>
              {mode === 'login' ? 'Registrate' : 'Iniciá sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>;
}
