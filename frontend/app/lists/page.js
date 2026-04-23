'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { useToast } from '../../components/Toast';

const EMOJI_OPTIONS = ['📋', '❤️', '🎬', '🍿', '⭐', '🔥', '😂', '😱', '🎭', '🚀'];

const ListIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);

export default function ListsPage() {
  const [lists,      setLists]      = useState([]);
  const [user,       setUser]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [creating,   setCreating]   = useState(false);
  const [newName,    setNewName]    = useState('');
  const [newEmoji,   setNewEmoji]   = useState('📋');
  const [saving,     setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    api.getLists().then(setLists).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const created = await api.createList({ name: newName.trim(), emoji: newEmoji });
      setLists(prev => [created, ...prev]);
      setNewName(''); setNewEmoji('📋'); setCreating(false);
      addToast(`Lista "${created.name}" creada`);
    } catch { addToast('No se pudo crear la lista', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (list) => {
    setDeletingId(list.id);
    try {
      await api.deleteList(list.id);
      setLists(prev => prev.filter(l => l.id !== list.id));
      addToast(`"${list.name}" eliminada`, 'error');
    } catch { addToast('No se pudo eliminar', 'error'); }
    finally { setDeletingId(null); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#f1f5f9' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        .list-card:hover  { border-color:rgba(229,9,20,.28) !important; background:rgba(255,255,255,.04) !important; }
        .delete-btn       { opacity:0; transition:opacity .2s; }
        .list-card:hover .delete-btn { opacity:1; }
        .emoji-opt:hover  { background:rgba(229,9,20,.18) !important; }
        .new-list-btn:hover { background:#c8070f !important; }
        .create-input:focus { border-color:rgba(229,9,20,.4) !important; outline:none; }
        .cancel-btn:hover { background:rgba(255,255,255,.06) !important; }
      `}</style>

      <Navbar user={user} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '88px 32px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16, animation: 'fadeUp .4s ease forwards' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: '#e50914', marginBottom: 8 }}>Tus colecciones</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, fontWeight: 400, letterSpacing: '.02em', color: '#fff', lineHeight: 1 }}>Mis listas</h1>
          </div>
          <button onClick={() => setCreating(true)} className="new-list-btn"
            style={{ padding: '11px 22px', borderRadius: 9, border: 'none', background: '#e50914', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'background .18s' }}>
            + Nueva lista
          </button>
        </div>

        {/* Create form */}
        {creating && (
          <form onSubmit={handleCreate} style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(229,9,20,.2)', borderRadius: 14, padding: 24, marginBottom: 28, animation: 'fadeUp .3s ease forwards' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#e50914', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16 }}>Nueva lista</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {EMOJI_OPTIONS.map(e => (
                <button key={e} type="button" className="emoji-opt" onClick={() => setNewEmoji(e)}
                  style={{ width: 40, height: 40, borderRadius: 9, border: `2px solid ${newEmoji === e ? 'rgba(229,9,20,.6)' : 'rgba(255,255,255,.1)'}`, background: newEmoji === e ? 'rgba(229,9,20,.14)' : 'rgba(255,255,255,.04)', cursor: 'pointer', fontSize: 18, transition: 'all .15s' }}>
                  {e}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="create-input" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Nombre de la lista..." autoFocus
                style={{ flex: 1, padding: '10px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', color: '#f1f5f9', fontSize: 14, fontFamily: 'inherit', transition: 'border-color .2s' }} />
              <button type="submit" disabled={saving || !newName.trim()}
                style={{ padding: '10px 20px', borderRadius: 9, border: 'none', background: newName.trim() ? '#e50914' : 'rgba(255,255,255,.08)', color: newName.trim() ? '#fff' : '#475569', fontWeight: 700, cursor: newName.trim() ? 'pointer' : 'default', fontSize: 14, fontFamily: 'inherit', transition: 'all .18s' }}>
                {saving ? '...' : 'Crear'}
              </button>
              <button type="button" className="cancel-btn" onClick={() => { setCreating(false); setNewName(''); setNewEmoji('📋'); }}
                style={{ padding: '10px 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,.1)', background: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'background .18s' }}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 76, borderRadius: 12, background: 'rgba(255,255,255,.025)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * .07}s` }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && lists.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><ListIcon /></div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontWeight: 400, marginBottom: 10, color: '#f1f5f9' }}>Todavía no tenés listas</h2>
            <p style={{ color: '#475569', fontSize: 15, fontWeight: 500 }}>Creá colecciones personalizadas para organizar lo que querés ver.</p>
          </div>
        )}

        {/* Lists */}
        {!loading && lists.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lists.map((list, i) => (
              <div key={list.id} className="list-card" onClick={() => router.push(`/lists/${list.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', borderRadius: 12, background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', cursor: 'pointer', transition: 'all .18s', position: 'relative', animation: 'fadeUp .4s ease forwards', animationDelay: `${i * .05}s`, opacity: 0 }}>
                <span style={{ fontSize: 30, flexShrink: 0 }}>{list.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{list.name}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: '#475569', fontWeight: 500 }}>
                    {list.item_count === 0 ? 'Sin títulos' : `${list.item_count} título${list.item_count !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <button className="delete-btn" onClick={e => { e.stopPropagation(); handleDelete(list); }} disabled={deletingId === list.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.1)', color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                  <TrashIcon />
                  {deletingId === list.id ? '...' : 'Eliminar'}
                </button>
                <span style={{ color: '#334155', fontSize: 18, flexShrink: 0 }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
