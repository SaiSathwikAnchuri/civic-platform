import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllComplaints } from '../api/adminAPI';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import { formatDistanceToNow } from 'date-fns';

const STATUS_CLASS = { Pending:'badge-pending', 'In Progress':'badge-progress', Resolved:'badge-resolved', Rejected:'badge-rejected' };
const PRIORITY_CLASS = { Low:'badge-low', Medium:'badge-medium', High:'badge-high', Critical:'badge-critical' };

const STATUSES   = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];
const CATEGORIES = ['All', 'Pothole', 'Garbage Overflow', 'Drainage Blockage', 'Street Light', 'Water Supply', 'Road Damage', 'Illegal Dumping', 'Noise Pollution', 'Encroachment', 'Other'];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);

  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('All');
  const [priority, setPriority] = useState('All');
  const [category, setCategory] = useState('All');
  const [sort,     setSort]     = useState('-createdAt');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (search)              params.search   = search;
      if (status   !== 'All') params.status   = status;
      if (priority !== 'All') params.priority = priority;
      if (category !== 'All') params.category = category;

      const { data } = await getAllComplaints(params);
      setComplaints(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch { setComplaints([]); }
    finally { setLoading(false); }
  }, [page, search, status, priority, category, sort]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchComplaints(); };

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div className="page-header flex justify-between items-center fade-in" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h2>Complaint Management</h2>
            <p>{total} total complaints</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card fade-in" style={{ marginBottom: '1.5rem' }}>
          <form onSubmit={handleSearch} style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'flex-end' }}>
            <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
              <label className="form-label">Search</label>
              <input className="form-input" placeholder="Search title, address…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="form-group" style={{ minWidth: 140 }}>
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ minWidth: 130 }}>
              <label className="form-label">Priority</label>
              <select className="form-select" value={priority} onChange={e => { setPriority(e.target.value); setPage(1); }}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ minWidth: 150 }}>
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ minWidth: 150 }}>
              <label className="form-label">Sort By</label>
              <select className="form-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="-priority">Priority ↓</option>
                <option value="status">Status A-Z</option>
              </select>
            </div>
          </form>
        </div>

        {/* Table */}
        {loading ? <Loader /> : complaints.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '4rem' }}>🗂️</div>
            <p>No complaints match the filters.</p>
          </div>
        ) : (
          <div className="table-wrapper fade-in">
            <table>
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Citizen</th>
                  <th>Location</th>
                  <th>Filed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id}>
                    <td style={{ maxWidth: 200 }}>
                      <strong style={{ color: 'var(--text-primary)', display:'block', fontSize:'0.85rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.title}</strong>
                      {c.assignedTo?.department && <small style={{ color:'var(--text-muted)' }}>🏢 {c.assignedTo.department}</small>}
                    </td>
                    <td><span style={{ fontSize:'0.8rem' }}>{c.category}</span></td>
                    <td><span className={`badge ${STATUS_CLASS[c.status]}`}>{c.status}</span></td>
                    <td><span className={`badge ${PRIORITY_CLASS[c.priority]}`}>{c.priority}</span></td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <div className="avatar" style={{ width:28, height:28, fontSize:'0.75rem' }}>{c.citizen?.name?.charAt(0)}</div>
                        <span style={{ fontSize:'0.8rem' }}>{c.citizen?.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize:'0.775rem', maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {c.location?.address}
                    </td>
                    <td style={{ fontSize:'0.775rem', whiteSpace:'nowrap' }}>
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </td>
                    <td>
                      <Link to={`/admin/complaint/${c._id}`} className="btn btn-secondary btn-sm">
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} pages={pages} onPage={setPage} />
      </div>
    </div>
  );
}
