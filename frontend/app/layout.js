import './globals.css';
import { ToastProvider } from '../components/Toast';

export const metadata = { title: 'Watchly', description: 'Track movies and TV shows' };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: '#080810', color: '#f1f5f9' }}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
