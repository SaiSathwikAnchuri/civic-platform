import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.25rem',
      textAlign: 'center',
      padding: '2rem',
      background: 'var(--bg-base)',
    }}>
      <div style={{ fontSize: '6rem' }}>🏙️</div>
      <h1 style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>404</h1>
      <h2 style={{ color: 'var(--text-primary)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 320 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">← Back to Home</Link>
    </div>
  );
}
