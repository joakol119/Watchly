'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import Avatar, { AVATARS } from '../../components/Avatar';
import { useToast } from '../../components/Toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameForm, setNameForm] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    Promise.all([api.getProfile(), api.getWatchlist()])
      .then(([p, w]) => { setProfile(p); setNameForm(p.name); setWatchlist(w); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!nameForm.trim() || nameForm === profile.name) return;
    setNameLoading(true);
    try {
      const updated = await api.updateName(nameForm);
      setProfile(prev => ({ ...prev, name: updated.name }));
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name: updated.name }));
      addToast('Nombre actualizado correctamente');
    } catch (err) { addToast(err.message, 'error'); }
    finally { setNameLoading(false); }
  };

  const handleAvatarSelect = async (avatarKey) => {
    if (avatarKey === profile.avatar_key) return;
    try {
      const updated = await api.updateAvatar(avatarKey);
      setProfile(prev => ({ ...prev, avatar_key: updated.avatar_key }));
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, avatar_key: updated.avatar_key }));
      addToast('Avatar actualizado');
    } catch (err) { addToast(err.message, 'error'); }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    if (passForm.newPass !== passForm.confirm) { setPassError('Las contraseñas no coinciden'); return; }
    if (passForm.newPass.length < 6) { setPassError('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    setPassLoading(true);
    try {
      await api.updatePassword(passForm.current, passForm.newPass);
      setPassForm({ current: '', newPass: '', confirm: '' });
      addToast('Contraseña actualizada correctamente');
    } catch (err) { setPassError(err.message); }
    finally { setPassLoading(false); }
  };

  const stats = {
    total: watchlist.length,
    watched: watchlist.filter(w => w.status === 'watched').length,
    watching: watchlist.filter(w => w.status === 'watching').length,
    want: watchlist.filter(w => w.status === 'want_to_watch').length,
  };

  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 };
  const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28 };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(229,9,20,0.2)', borderTop: '3px solid #e50914', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#080810', fontFamily: "'Inter', system-ui, sans-serif", color: '#f1f5f9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Bebas+Neue&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        input:focus { border-color: rgba(229,9,20,0.5) !important; box-shadow: 0 0 0 3px rgba(229,9,20,0.1) !important; }
        .save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(229,9,20,0.35) !important; }
        .avatar-option:hover { transform: scale(1.1) !important; }
      `}</style>

      <Navbar user={profile} />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '88px 32px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40, animation: 'fadeUp 0.4s ease forwards' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#e50914', marginBottom: 16 }}>Cuenta</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Avatar avatarKey={profile?.avatar_key} size={72} />
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, fontWeight: 400, letterSpacing: 1, color: '#fff', lineHeight: 1 }}>{profile?.name}</h1>
              <p style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24, animation: 'fadeUp 0.4s ease 0.05s both' }}>
          {[
            { label: 'Total', value: stats.total, color: '#f1f5f9' },
            { label: 'Visto', value: stats.watched, color: '#22c55e' },
            { label: 'Viendo', value: stats.watching, color: '#f59e0b' },
            { label: 'Quiero ver', value: stats.want, color: '#6366f1' },
          ].map(s => (
            <div key={s.label} style={{ ...cardStyle, textAlign: 'center', padding: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Avatar picker */}
        <div style={{ ...cardStyle, marginBottom: 20, animation: 'fadeUp 0.4s ease 0.08s both' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 18 }}>Elegí tu personaje</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {AVATARS.map(a => (
              <div key={a.key} onClick={() => handleAvatarSelect(a.key)} className="avatar-option"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ borderRadius: '50%', padding: 3, border: `3px solid ${profile?.avatar_key === a.key ? 'rgba(229,9,20,0.7)' : 'transparent'}`, transition: 'all 0.2s', boxShadow: profile?.avatar_key === a.key ? '0 0 16px rgba(229,9,20,0.3)' : 'none' }}>
                  <Avatar avatarKey={a.key} size={56} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: profile?.avatar_key === a.key ? '#f87171' : '#475569' }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Cambiar nombre */}
          <div style={{ ...cardStyle, animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Editar nombre</h2>
            <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input value={nameForm} onChange={e => setNameForm(e.target.value)} style={inputStyle} placeholder="Tu nombre" required />
              </div>
              <button type="submit" className="save-btn" disabled={nameLoading || nameForm === profile?.name}
                style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #e50914, #b81c1c)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: nameLoading || nameForm === profile?.name ? 'not-allowed' : 'pointer', opacity: nameLoading || nameForm === profile?.name ? 0.5 : 1, fontFamily: 'inherit', transition: 'all 0.2s' }}>
                {nameLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>

          {/* Cambiar contraseña */}
          <div style={{ ...cardStyle, animation: 'fadeUp 0.4s ease 0.15s both' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Cambiar contraseña</h2>
            <form onSubmit={handlePassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Contraseña actual</label>
                <input type="password" value={passForm.current} onChange={e => setPassForm({ ...passForm, current: e.target.value })} style={inputStyle} placeholder="••••••••" required />
              </div>
              <div>
                <label style={labelStyle}>Nueva contraseña</label>
                <input type="password" value={passForm.newPass} onChange={e => setPassForm({ ...passForm, newPass: e.target.value })} style={inputStyle} placeholder="••••••••" required />
              </div>
              <div>
                <label style={labelStyle}>Confirmar nueva contraseña</label>
                <input type="password" value={passForm.confirm} onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
                  style={{ ...inputStyle, borderColor: passForm.confirm && passForm.confirm !== passForm.newPass ? 'rgba(239,68,68,0.5)' : passForm.confirm && passForm.confirm === passForm.newPass ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.1)' }}
                  placeholder="••••••••" required />
              </div>
              {passError && <p style={{ fontSize: 12, color: '#f87171' }}>{passError}</p>}
              <button type="submit" className="save-btn" disabled={passLoading}
                style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #e50914, #b81c1c)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: passLoading ? 'not-allowed' : 'pointer', opacity: passLoading ? 0.7 : 1, fontFamily: 'inherit', transition: 'all 0.2s' }}>
                {passLoading ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
