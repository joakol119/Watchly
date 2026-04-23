'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import Avatar, { AVATARS } from '../../components/Avatar';
import { useToast } from '../../components/Toast';

const CARD = { background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 28 };
const INPUT = { width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color .2s, box-shadow .2s' };
const LABEL = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.06em' };

export default function ProfilePage() {
  const [profile,     setProfile]     = useState(null);
  const [watchlist,   setWatchlist]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [nameForm,    setNameForm]    = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [passForm,    setPassForm]    = useState({ current: '', newPass: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passError,   setPassError]   = useState('');
  const router       = useRouter();
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
    total:   watchlist.length,
    watched: watchlist.filter(w => w.status === 'watched').length,
    watching:watchlist.filter(w => w.status === 'watching').length,
    want:    watchlist.filter(w => w.status === 'want_to_watch').length,
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 38, height: 38, border: '2px solid rgba(229,9,20,.2)', borderTop: '2px solid #e50914', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#f1f5f9' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .profile-input:focus  { border-color:rgba(229,9,20,.4) !important; box-shadow:0 0 0 3px rgba(229,9,20,.08) !important; }
        .save-btn:hover:not(:disabled) { background:#c8070f !important; transform:translateY(-1px); box-shadow:0 6px 20px rgba(229,9,20,.35) !important; }
        .avatar-opt:hover { transform:scale(1.1) !important; }
        @media (max-width: 640px) {
          .profile-pad   { padding: 80px 16px 60px !important; }
          .stats-row     { grid-template-columns: repeat(2, 1fr) !important; }
          .forms-row     { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Navbar user={profile} />

      <div className="profile-pad" style={{ maxWidth: 820, margin: '0 auto', padding: '88px 32px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36, animation: 'fadeUp .4s ease forwards' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: '#e50914', marginBottom: 16 }}>Cuenta</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Avatar avatarKey={profile?.avatar_key} size={70} />
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, fontWeight: 400, letterSpacing: '.02em', color: '#fff', lineHeight: 1 }}>{profile?.name}</h1>
              <p style={{ fontSize: 14, color: '#475569', marginTop: 5, fontWeight: 500 }}>{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20, animation: 'fadeUp .4s ease .05s both' }}>
          {[
            { label: 'Total',      value: stats.total,   color: '#f1f5f9' },
            { label: 'Visto',      value: stats.watched, color: '#22c55e' },
            { label: 'Viendo',     value: stats.watching,color: '#f59e0b' },
            { label: 'Quiero ver', value: stats.want,    color: '#6366f1' },
          ].map(s => (
            <div key={s.label} style={{ ...CARD, textAlign: 'center', padding: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 5, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Avatar picker */}
        <div style={{ ...CARD, marginBottom: 18, animation: 'fadeUp .4s ease .08s both' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 18, letterSpacing: '-.01em' }}>Elegí tu personaje</h2>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {AVATARS.map(a => (
              <div key={a.key} onClick={() => handleAvatarSelect(a.key)} className="avatar-opt"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'transform .2s' }}>
                <div style={{ borderRadius: '50%', padding: 3, border: `3px solid ${profile?.avatar_key === a.key ? 'rgba(229,9,20,.7)' : 'transparent'}`, transition: 'border-color .2s', boxShadow: profile?.avatar_key === a.key ? '0 0 16px rgba(229,9,20,.28)' : 'none' }}>
                  <Avatar avatarKey={a.key} size={54} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: profile?.avatar_key === a.key ? '#f87171' : '#475569' }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="forms-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* Nombre */}
          <div style={{ ...CARD, animation: 'fadeUp .4s ease .1s both' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 20, letterSpacing: '-.01em' }}>Editar nombre</h2>
            <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={LABEL}>Nombre</label>
                <input className="profile-input" value={nameForm} onChange={e => setNameForm(e.target.value)} style={INPUT} placeholder="Tu nombre" required />
              </div>
              <button type="submit" className="save-btn" disabled={nameLoading || nameForm === profile?.name}
                style={{ padding: '11px', borderRadius: 9, border: 'none', background: '#e50914', color: '#fff', fontWeight: 700, fontSize: 14, cursor: nameLoading || nameForm === profile?.name ? 'not-allowed' : 'pointer', opacity: nameLoading || nameForm === profile?.name ? .45 : 1, fontFamily: 'inherit', transition: 'all .18s' }}>
                {nameLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>

          {/* Contraseña */}
          <div style={{ ...CARD, animation: 'fadeUp .4s ease .12s both' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 20, letterSpacing: '-.01em' }}>Cambiar contraseña</h2>
            <form onSubmit={handlePassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={LABEL}>Contraseña actual</label>
                <input className="profile-input" type="password" value={passForm.current} onChange={e => setPassForm({ ...passForm, current: e.target.value })} style={INPUT} placeholder="••••••••" required />
              </div>
              <div>
                <label style={LABEL}>Nueva contraseña</label>
                <input className="profile-input" type="password" value={passForm.newPass} onChange={e => setPassForm({ ...passForm, newPass: e.target.value })} style={INPUT} placeholder="••••••••" required />
              </div>
              <div>
                <label style={LABEL}>Confirmar nueva contraseña</label>
                <input className="profile-input" type="password" value={passForm.confirm} onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
                  style={{ ...INPUT, borderColor: passForm.confirm && passForm.confirm !== passForm.newPass ? 'rgba(239,68,68,.5)' : passForm.confirm && passForm.confirm === passForm.newPass ? 'rgba(34,197,94,.5)' : 'rgba(255,255,255,.1)' }}
                  placeholder="••••••••" required />
              </div>
              {passError && <p style={{ fontSize: 12, color: '#f87171', fontWeight: 500 }}>{passError}</p>}
              <button type="submit" className="save-btn" disabled={passLoading}
                style={{ padding: '11px', borderRadius: 9, border: 'none', background: '#e50914', color: '#fff', fontWeight: 700, fontSize: 14, cursor: passLoading ? 'not-allowed' : 'pointer', opacity: passLoading ? .65 : 1, fontFamily: 'inherit', transition: 'all .18s' }}>
                {passLoading ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
