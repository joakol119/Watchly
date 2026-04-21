import './globals.css';

export const metadata = { title: 'Watchly', description: 'Track movies and TV shows' };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "'Inter', system-ui, sans-serif", background: '#0a0a0f', color: '#f1f5f9' }}>
        {children}
      </body>
    </html>
  );
}
