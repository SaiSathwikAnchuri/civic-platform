import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import './Sidebar.css';

const NAV_LINKS_CITIZEN = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/submit', label: 'Report Issue', icon: '📝' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
];

const NAV_LINKS_ADMIN = [
  { to: '/admin', label: 'Overview', icon: '📈' },
  { to: '/admin/complaints', label: 'Complaints', icon: '📋' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📊' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useSocket() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = isAdmin ? NAV_LINKS_ADMIN : NAV_LINKS_CITIZEN;

  if (!user && ['/', '/login', '/register'].includes(location.pathname)) {
    return (
      <nav className="public-navbar">
        <Link to="/" className="sidebar-brand">
          <span className="brand-icon">🏙️</span>
          <span>CivicFix</span>
        </Link>
        <div className="public-actions">
          <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
        </div>
      </nav>
    );
  }

  if (!user) return null;

  return (
    <>
      <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        ☰
      </button>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="sidebar-brand" onClick={() => setMobileOpen(false)}>
            <span className="brand-icon">🏙️</span>
            <span>CivicFix</span>
            {isAdmin && <span className="admin-tag">ADMIN</span>}
          </Link>
        </div>

        <div className="sidebar-links">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`sidebar-link ${location.pathname === l.to ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-link-icon">{l.icon}</span>
              {l.label}
              {l.label === 'Notifications' && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </Link>
          ))}
        </div>

        <div className="sidebar-footer">
          <Link to="/profile" className="sidebar-profile" onClick={() => setMobileOpen(false)}>
            <div className="avatar avatar-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-details">
              <strong>{user.name?.split(' ')[0]}</strong>
              <small>{user.role}</small>
            </div>
          </Link>
          
          <button className="sidebar-logout" onClick={() => { setMobileOpen(false); logout(); navigate('/'); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>
      
      {/* Mobile overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
}
