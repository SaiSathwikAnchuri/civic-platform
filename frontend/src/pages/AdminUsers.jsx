import { useState, useEffect } from 'react';
import { getAllUsers, toggleUser } from '../api/adminAPI';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllUsers();
        setUsers(data.data);
      } catch { /* handled */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleUser(id);
      setUsers(us => us.map(u => u._id === id ? { ...u, isActive: data.data.isActive } : u));
      toast.success(data.message);
    } catch { toast.error('Action failed'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div className="page-header fade-in">
          <div>
            <h2>User Management</h2>
            <p>{users.length} registered citizens</p>
          </div>
        </div>

        <div className="card fade-in" style={{ marginBottom: '1.5rem' }}>
          <input
            className="form-input"
            placeholder="🔍 Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? <Loader /> : (
          <div className="table-wrapper fade-in">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                        <div className="avatar">{u.name?.charAt(0).toUpperCase()}</div>
                        <strong style={{ color:'var(--text-primary)', fontSize:'0.875rem' }}>{u.name}</strong>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{format(new Date(u.createdAt), 'dd MMM yyyy')}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-resolved' : 'badge-rejected'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggle(u._id)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>No users found matching "{search}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
