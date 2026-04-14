import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm]     = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      await updateProfile(form);
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div className="page-header fade-in">
          <h2>My Profile</h2>
          <p>Manage your account details</p>
        </div>

        <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Avatar card */}
          <div className="card fade-in" style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
            <div className="avatar avatar-lg">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <strong style={{ color:'var(--text-primary)', fontSize:'1.1rem' }}>{user?.name}</strong>
              <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:'2px' }}>{user?.email}</p>
              <span className={`badge ${user?.role === 'admin' ? 'badge-progress' : 'badge-resolved'}`} style={{ marginTop:'0.5rem' }}>
                {user?.role === 'admin' ? '🛡️ Admin' : '👤 Citizen'}
              </span>
            </div>
          </div>

          {/* Edit form */}
          <div className="card fade-in">
            <h4 style={{ color:'var(--text-primary)', marginBottom:'1.25rem' }}>Edit Profile</h4>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" className="form-input" value={form.name} onChange={onChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={user?.email} disabled style={{ opacity:0.5 }} />
                <span className="form-hint">Email cannot be changed</span>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input name="phone" className="form-input" placeholder="10-digit number" value={form.phone} onChange={onChange} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} id="profile-save-btn">
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
