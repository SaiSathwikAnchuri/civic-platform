import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalytics } from '../api/adminAPI';
import Loader from '../components/Loader';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: res } = await getAnalytics();
        setData(res.data);
      } catch { /* handled */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <Loader fullScreen />;

  const s = data?.summary || {};
  const resRate = s.totalComplaints > 0 ? Math.round((s.resolvedCount / s.totalComplaints) * 100) : 0;

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div className="page-header fade-in">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Real-time overview of all civic complaints</p>
          </div>
          <div className="admin-header-actions">
            <Link to="/admin/complaints" className="btn btn-primary">View All Complaints</Link>
            <Link to="/admin/analytics" className="btn btn-secondary">Analytics →</Link>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid-4 fade-in" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total Complaints', value: s.totalComplaints || 0, icon: '📋', cls: 'stat-icon-primary' },
            { label: 'Pending',          value: s.pendingCount    || 0, icon: '⏳', cls: 'stat-icon-warning' },
            { label: 'In Progress',      value: s.inProgressCount || 0, icon: '🔄', cls: 'stat-icon-cyan' },
            { label: 'Resolved',         value: s.resolvedCount   || 0, icon: '✅', cls: 'stat-icon-success' },
          ].map(st => (
            <div key={st.label} className="stat-card">
              <div className={`stat-icon ${st.cls}`}>{st.icon}</div>
              <div>
                <div className="stat-value">{st.value}</div>
                <div className="stat-label">{st.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Second row stats */}
        <div className="grid-3 fade-in" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon stat-icon-danger">❌</div>
            <div><div className="stat-value">{s.rejectedCount || 0}</div><div className="stat-label">Rejected</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">👥</div>
            <div><div className="stat-value">{s.totalUsers || 0}</div><div className="stat-label">Registered Citizens</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-success">📈</div>
            <div><div className="stat-value">{resRate}%</div><div className="stat-label">Resolution Rate</div></div>
          </div>
        </div>

        <div className="admin-lower-grid fade-in">
          {/* Recent Complaints */}
          <div className="card">
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>🕐 Recent Complaints</h4>
            {data?.recentComplaints?.length > 0 ? (
              <div className="recent-list">
                {data.recentComplaints.map(c => (
                  <Link to={`/admin/complaint/${c._id}`} key={c._id} className="recent-item">
                    <div>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{c.title}</strong>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{c.category} · {c.citizen?.name}</p>
                    </div>
                    <span className={`badge badge-${c.status === 'In Progress' ? 'progress' : c.status.toLowerCase()}`}>
                      {c.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : <p className="text-muted text-center" style={{ padding: '1rem' }}>No recent complaints</p>}
            <Link to="/admin/complaints" className="btn btn-secondary btn-full" style={{ marginTop: '1rem' }}>
              View All →
            </Link>
          </div>

          {/* Top Categories */}
          <div className="card">
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>📊 Top Categories</h4>
            {data?.byCategory?.slice(0, 7).map(cat => {
              const pct = s.totalComplaints ? Math.round((cat.count / s.totalComplaints) * 100) : 0;
              return (
                <div key={cat._id} className="category-bar">
                  <div className="cat-label">
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{cat._id}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{cat.count}</span>
                  </div>
                  <div className="cat-progress-bg">
                    <div className="cat-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <Link to="/admin/analytics" className="btn btn-secondary btn-full" style={{ marginTop: '1rem' }}>
              Full Analytics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
