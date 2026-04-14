import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyComplaints } from '../api/complaintAPI';
import ComplaintCard from '../components/ComplaintCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import '../components/ComplaintCard.css';
import './CitizenDashboard.css';

const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
const CATEGORIES = ['All', 'Pothole', 'Garbage Overflow', 'Drainage Blockage', 'Street Light', 'Water Supply', 'Road Damage', 'Illegal Dumping', 'Noise Pollution', 'Encroachment', 'Other'];

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState('All');
  const [category, setCategory] = useState('All');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 6 };
      if (status !== 'All')   params.status   = status;
      if (category !== 'All') params.category = category;
      const { data } = await getMyComplaints(params);
      setComplaints(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setComplaints([]);
    } finally { setLoading(false); }
  }, [page, status, category]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  // Stats from complaint list
  const stats = {
    total:      complaints.length,
    pending:    complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved:   complaints.filter(c => c.status === 'Resolved').length,
  };

  return (
    <div className="page-wrapper">
      <div className="container section">
        {/* Page header */}
        <div className="dash-header fade-in">
          <div>
            <h2>Dashboard</h2>
            <p>Welcome back, <strong style={{ color: 'var(--primary-light)' }}>{user.name}</strong> 👋</p>
          </div>
          <Link to="/submit" className="btn btn-primary" id="new-complaint-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Report Issue
          </Link>
        </div>

        {/* Stats */}
        <div className="grid-4 fade-in" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total Filed',  value: total, icon: '📋', cls: 'stat-icon-primary' },
            { label: 'Pending',      value: complaints.filter(c=>c.status==='Pending').length, icon: '⏳', cls: 'stat-icon-warning' },
            { label: 'In Progress',  value: complaints.filter(c=>c.status==='In Progress').length, icon: '🔄', cls: 'stat-icon-cyan' },
            { label: 'Resolved',     value: complaints.filter(c=>c.status==='Resolved').length, icon: '✅', cls: 'stat-icon-success' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="dash-filters card fade-in">
          <div className="filter-group">
            <label className="form-label">Status</label>
            <div className="filter-pills">
              {STATUSES.map(s => (
                <button
                  key={s}
                  className={`pill-btn ${status === s ? 'active' : ''}`}
                  onClick={() => { setStatus(s); setPage(1); }}
                >{s}</button>
              ))}
            </div>
          </div>
          <div className="form-group" style={{ minWidth: 200 }}>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={e => { setCategory(e.target.value); setPage(1); }}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? <Loader /> : complaints.length === 0 ? (
          <div className="empty-state fade-in">
            <div style={{ fontSize: '4rem' }}>🗂️</div>
            <h3 style={{ color: 'var(--text-primary)' }}>No complaints yet</h3>
            <p>Start by reporting a civic issue in your area.</p>
            <Link to="/submit" className="btn btn-primary">Report Your First Issue</Link>
          </div>
        ) : (
          <div className="complaints-grid fade-in">
            {complaints.map(c => <ComplaintCard key={c._id} complaint={c} />)}
          </div>
        )}

        <Pagination page={page} pages={pages} onPage={setPage} />
      </div>
    </div>
  );
}
