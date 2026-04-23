'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Avatar from './Avatar';

const FilmIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <rect x="2" y="2" width="20" height="20" rx="2"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const LogOutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="100%" height="100%">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="100%" height="100%">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const NAV_LINKS = [
  { href: '/home',            label: 'Inicio' },
  { href: '/search',          label: 'Buscar' },
  { href: '/watchlist',       label: 'Mi lista' },
  { href: '/recommendations', label: 'Para vos' },
  { href: '/stats',           label: 'Estadísticas' },
];

export default function Navbar({ user }) {
  const router    = useRouter();
  const pathname  = usePathname();
  const [query,    setQuery]    = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) { router.push(`/search?q=${encodeURIComponent(query.trim())}`); setMenuOpen(false); }
  };

  const navigate = (href) => { router.push(href); setMenuOpen(false); };

  const isSearchPage = pathname === '/search';

  return (
    <>
      <style>{`
        .nav-link { transition: color .18s, background .18s; }
        .nav-link:hover { color: #e2e8f0 !important; background: rgba(255,255,255,0.05) !important; }
        .nav-search-input:focus { border-color: rgba(229,9,20,.4) !important; background: rgba(255,255,255,.07) !important; }
        .nav-logout:hover { color: #e2e8f0 !important; border-color: rgba(255,255,255,.16) !important; }
        .nav-hamburger { display: none; }
        .nav-desktop-links { display: flex; }
        .nav-desktop-search { display: block; }
        .nav-desktop-logout { display: flex; }
        @media (max-width: 768px) {
          .nav-hamburger { display: flex; }
          .nav-desktop-links { display: none; }
          .nav-desktop-search { display: none; }
          .nav-desktop-logout { display: none; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8,8,16,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 20px', height: 64,
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
      }}>

        {/* Izquierda: Logo + links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div onClick={() => navigate('/home')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: 24, height: 24, color: '#e50914' }}><FilmIcon /></div>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '.05em', color: '#fff' }}>Watchly</span>
          </div>
          <div className="nav-desktop-links" style={{ gap: 2 }}>
            {NAV_LINKS.map(link => {
              const active = pathname === link.href;
              return (
                <button key={link.href} className="nav-link" onClick={() => router.push(link.href)}
                  style={{ background: active ? 'rgba(229,9,20,.1)' : 'none', border: 'none', color: active ? '#f87171' : '#64748b', borderRadius: 8, padding: '7px 11px', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: 'inherit' }}>
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Centro exacto: Search */}
        {!isSearchPage ? (
          <form className="nav-desktop-search" onSubmit={handleSearch} style={{ width: 280 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#475569', pointerEvents: 'none' }}><SearchIcon /></div>
              <input className="nav-search-input" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Buscar películas y series..."
                style={{ width: '100%', padding: '8px 14px 8px 34px', borderRadius: 9, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.05)', color: '#f1f5f9', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color .2s, background .2s' }} />
            </div>
          </form>
        ) : (
          <div />
        )}

        {/* Derecha: Avatar + Logout (desktop) / Avatar + Hamburger (mobile) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
          <div className="nav-desktop-logout" style={{ alignItems: 'center', gap: 10 }}>
            {user && (
              <Avatar avatarKey={user.avatar_key} size={34} onClick={() => router.push('/profile')}
                style={{ border: pathname === '/profile' ? '2px solid rgba(229,9,20,.6)' : '2px solid transparent', transition: 'border-color .2s', cursor: 'pointer', borderRadius: '50%' }} />
            )}
            <button className="nav-logout" onClick={handleLogout}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,.08)', color: '#64748b', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'color .18s, border-color .18s', display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 14, height: 14 }}><LogOutIcon /></div>
              Salir
            </button>
          </div>

          <div className="nav-hamburger" style={{ alignItems: 'center', gap: 10 }}>
            {user && (
              <Avatar avatarKey={user.avatar_key} size={32} onClick={() => navigate('/profile')}
                style={{ border: pathname === '/profile' ? '2px solid rgba(229,9,20,.6)' : '2px solid transparent', transition: 'border-color .2s', cursor: 'pointer', borderRadius: '50%' }} />
            )}
            <button onClick={() => setMenuOpen(p => !p)}
              style={{ width: 36, height: 36, background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 64, left: 0, right: 0, bottom: 0, background: 'rgba(8,8,16,.97)', zIndex: 99, overflowY: 'auto', padding: '24px 20px 40px' }}>
          {/* Mobile search */}
          {!isSearchPage && (
            <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#475569', pointerEvents: 'none' }}><SearchIcon /></div>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar películas y series..."
                  style={{ width: '100%', padding: '12px 14px 12px 36px', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.06)', color: '#f1f5f9', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
            </form>
          )}

          {/* Mobile nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_LINKS.map(link => {
              const active = pathname === link.href;
              return (
                <button key={link.href} onClick={() => navigate(link.href)}
                  style={{ background: active ? 'rgba(229,9,20,.1)' : 'none', border: 'none', color: active ? '#f87171' : '#94a3b8', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', fontSize: 16, fontWeight: active ? 700 : 500, fontFamily: 'inherit', textAlign: 'left', transition: 'background .15s' }}>
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Mobile logout */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.07)' }}>
            <button onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: '1px solid rgba(255,255,255,.1)', color: '#64748b', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', fontSize: 15, fontFamily: 'inherit' }}>
              <div style={{ width: 16, height: 16 }}><LogOutIcon /></div>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
}
