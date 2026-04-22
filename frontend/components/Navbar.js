'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Avatar from './Avatar';

export default function Navbar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const navLinks = [
    { href: '/home', label: 'Inicio' },
    { href: '/search', label: 'Buscar' },
    { href: '/watchlist', label: 'Mi lista' },
    { href: '/stats', label: 'Estadísticas' },
  ];

  const isSearchPage = pathname === '/search';

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/home')}>
          <span style={{ fontSize: 20 }}>🎬</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1 }}>Watchly</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {navLinks.map(link => (
            <button key={link.href} onClick={() => router.push(link.href)}
              style={{ background: pathname === link.href ? 'rgba(229,9,20,0.15)' : 'none', border: 'none', color: pathname === link.href ? '#f87171' : '#94a3b8', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 14, fontWeight: 500, fontFamily: 'inherit' }}>
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {!isSearchPage && (
        <form onSubmit={handleSearch} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 360 }}>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="🔍 Buscar películas y series..."
            style={{ width: '100%', padding: '8px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </form>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user && (
          <Avatar
            avatarKey={user.avatar_key}
            size={36}
            onClick={() => router.push('/profile')}
            style={{ border: pathname === '/profile' ? '2px solid rgba(229,9,20,0.6)' : '2px solid transparent', transition: 'all 0.2s', cursor: 'pointer' }}
          />
        )}
        <button onClick={handleLogout} style={{ background: 'none', border: '1.5px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Salir</button>
      </div>
    </nav>
  );
}
