import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import './Navbar.css';

const NAV_LINKS_CITIZEN = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/submit', label: 'Report Issue' },
  { to: '/notifications', label: 'Notifications' },
];

const NAV_LINKS_ADMIN = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/complaints', label: 'Complaints' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/users', label: 'Users' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useSocket() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const links = isAdmin ? NAV_LINKS_ADMIN : NAV_LINKS_CITIZEN;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user && ['/', '/login', '/register'].includes(location.pathname)) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🏙️</span>
            <span>CivicFix</span>
          </Link>
          <div className="navbar-actions">
            <Link to="/login"    className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        </div>
      </nav>
    );
  }

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand">
          <span className="brand-icon">🏙️</span>
          <span>CivicFix</span>
          {isAdmin && <span className="admin-tag">ADMIN</span>}
        </Link>

        {/* Desktop Links */}
        <ul className="navbar-links hide-mobile">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}
              >
                {l.label}
                {l.label === 'Notifications' && unreadCount > 0 && (
                  <span className="nav-badge">{unreadCount}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* User Dropdown */}
        <div className="navbar-actions">
          <div className="user-menu" ref={dropRef}>
            <button className="avatar-btn" onClick={() => setDropOpen((o) => !o)} id="user-menu-btn">
              <div className="avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hide-mobile user-name">{user.name?.split(' ')[0]}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>

            {dropOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <hr className="dropdown-divider" />
                <Link to="/profile" className="dropdown-item" onClick={() => setDropOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile
                </Link>
                <button className="dropdown-item danger" onClick={() => { setDropOpen(false); logout(); navigate('/'); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            <span className={menuOpen ? 'bar open' : 'bar'} />
            <span className={menuOpen ? 'bar open' : 'bar'} />
            <span className={menuOpen ? 'bar open' : 'bar'} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="mobile-link" onClick={() => setMenuOpen(false)}>
              {l.label}
              {l.label === 'Notifications' && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
