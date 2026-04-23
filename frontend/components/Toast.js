'use client';
import { useState, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const TOAST_STYLES = {
  success: { bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.28)',  color: '#86efac',  Icon: CheckIcon },
  error:   { bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.28)',  color: '#fca5a5',  Icon: XIcon },
  info:    { bg: 'rgba(99,102,241,.12)', border: 'rgba(99,102,241,.28)', color: '#c7d2fe',  Icon: InfoIcon },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(toast => {
          const s = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          return (
            <div
              key={toast.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 16px', borderRadius: 11,
                background: s.bg, border: `1px solid ${s.border}`, color: s.color,
                fontSize: 13, fontWeight: 600,
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,.4)',
                animation: 'toastIn .25s ease forwards',
                minWidth: 220, maxWidth: 340,
              }}
            >
              <s.Icon />
              <span style={{ flex: 1 }}>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
