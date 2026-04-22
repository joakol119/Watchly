'use client';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 18px', borderRadius: 12,
              background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.3)' : toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}`,
              color: toast.type === 'success' ? '#86efac' : toast.type === 'error' ? '#fca5a5' : '#c7d2fe',
              fontSize: 14, fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif",
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              animation: 'slideIn 0.3s ease forwards',
              minWidth: 220, maxWidth: 340,
            }}
          >
            <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
