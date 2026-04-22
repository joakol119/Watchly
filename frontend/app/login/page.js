'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';

function LoginContent() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'register') setMode('register');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (form.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
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
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1.5px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)', color: '#f1f5f9',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: '#94a3b8', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #080810 0%, #1a0808 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        input:focus { border-color: rgba(229,9,20,0.5) !important; box-shadow: 0 0 0 3px rgba(229,9,20,0.1) !important; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 40 }}>🎬</span>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontWeight: 400, marginTop: 8, letterSpacing: 1 }}>Watchly</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Creá tu cuenta gratis'}
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {mode === 'register' && (
              <div>
                <label style={labelStyle}>Nombre</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  placeholder="Tu nombre"
                  required
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={inputStyle}
                placeholder="••••••••"
                required
              />
            </div>

            {mode === 'register' && (
              <div>
                <label style={labelStyle}>Confirmar contraseña</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  style={{
                    ...inputStyle,
                    borderColor: form.confirmPassword && form.confirmPassword !== form.password
                      ? 'rgba(239,68,68,0.5)'
                      : form.confirmPassword && form.confirmPassword === form.password
                        ? 'rgba(34,197,94,0.5)'
                        : 'rgba(255,255,255,0.1)',
                  }}
                  placeholder="••••••••"
                  required
                />
                {form.confirmPassword && form.confirmPassword !== form.password && (
                  <p style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>Las contraseñas no coinciden</p>
                )}
                {form.confirmPassword && form.confirmPassword === form.password && (
                  <p style={{ fontSize: 12, color: '#86efac', marginTop: 4 }}>✓ Las contraseñas coinciden</p>
                )}
              </div>
            )}

            {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{ padding: '13px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #e50914, #b81c1c)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit', marginTop: 4 }}
            >
              {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
            {mode === 'login' ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
            <button onClick={switchMode} style={{ background: 'none', border: 'none', color: '#e50914', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
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
