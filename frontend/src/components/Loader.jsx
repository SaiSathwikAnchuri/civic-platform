export default function Loader({ fullScreen = false, text = 'Loading…' }) {
  if (fullScreen) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{text}</p>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
      <div className="spinner" />
    </div>
  );
}
