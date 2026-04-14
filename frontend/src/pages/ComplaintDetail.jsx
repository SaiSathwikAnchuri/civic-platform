import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById, upvoteComplaint } from '../api/complaintAPI';
import { updateStatus, assignDepartment, uploadProof } from '../api/adminAPI';
import { useAuth } from '../context/AuthContext';
import LocationMap from '../components/LocationMap';
import Loader from '../components/Loader';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import './ComplaintDetail.css';

const STATUS_CLASS = { Pending:'badge-pending', 'In Progress':'badge-progress', Resolved:'badge-resolved', Rejected:'badge-rejected' };
const PRIORITY_CLASS = { Low:'badge-low', Medium:'badge-medium', High:'badge-high', Critical:'badge-critical' };
const DEPARTMENTS = ['Roads & Infrastructure', 'Sanitation', 'Water & Drainage', 'Electricity', 'Parks & Recreation', 'Noise Control', 'Land & Property'];

export default function ComplaintDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [upvoted, setUpvoted]     = useState(false);

  // Admin states
  const [newStatus, setNewStatus]       = useState('');
  const [statusNote, setStatusNote]     = useState('');
  const [department, setDepartment]     = useState('');
  const [proofFiles, setProofFiles]     = useState([]);
  const [proofNote, setProofNote]       = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [lightbox, setLightbox]         = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getComplaintById(id);
        setComplaint(data.data);
        setNewStatus(data.data.status);
        if (data.data.assignedTo?.department) setDepartment(data.data.assignedTo.department);
      } catch { toast.error('Complaint not found'); navigate(-1); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (!complaint) return null;

  const handleUpvote = async () => {
    try {
      const { data } = await upvoteComplaint(id);
      setComplaint(c => ({ ...c, upvotes: Array(data.upvotes).fill(null) }));
      setUpvoted(!upvoted);
    } catch { toast.error('Could not upvote'); }
  };

  const handleStatusUpdate = async () => {
    setActionLoading(true);
    try {
      const { data } = await updateStatus(id, { status: newStatus, note: statusNote });
      setComplaint(data.data);
      setStatusNote('');
      toast.success('Status updated!');
    } catch { toast.error('Update failed'); }
    finally { setActionLoading(false); }
  };

  const handleAssign = async () => {
    if (!department) { toast.error('Select a department'); return; }
    setActionLoading(true);
    try {
      const { data } = await assignDepartment(id, { department });
      setComplaint(data.data);
      toast.success(`Assigned to ${department}`);
    } catch { toast.error('Assignment failed'); }
    finally { setActionLoading(false); }
  };

  const handleProofUpload = async (e) => {
    e.preventDefault();
    if (!proofFiles.length) { toast.error('Select files to upload'); return; }
    setActionLoading(true);
    try {
      const fd = new FormData();
      proofFiles.forEach(f => fd.append('proofs', f));
      if (proofNote) fd.append('note', proofNote);
      const { data } = await uploadProof(id, fd);
      setComplaint(c => ({ ...c, resolutionProof: data.data }));
      setProofFiles([]);
      toast.success('Proof uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="page-wrapper">
      <div className="container section">
        {/* Back */}
        <button className="cd-back btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="cd-layout fade-in">
          {/* LEFT: Complaint Info */}
          <div className="cd-main">
            {/* Header */}
            <div className="card cd-header-card">
              <div className="cd-badges">
                <span className={`badge ${STATUS_CLASS[complaint.status]}`}>{complaint.status}</span>
                <span className={`badge ${PRIORITY_CLASS[complaint.priority]}`}>🔥 {complaint.priority}</span>
                {complaint.isDuplicate && <span className="badge badge-progress">🔗 Linked</span>}
              </div>
              <h2 style={{ color: 'var(--text-primary)', marginTop: '0.75rem' }}>{complaint.title}</h2>
              <p className="text-muted">#{complaint._id}</p>
              <div className="cd-meta-row">
                <span>📂 {complaint.category}</span>
                <span>⏰ {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}</span>
                <span>👤 {complaint.citizen?.name}</span>
                {complaint.assignedTo?.department && <span>🏢 {complaint.assignedTo.department}</span>}
              </div>
            </div>

            {/* Description */}
            <div className="card">
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>📝 Description</h4>
              <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>{complaint.description}</p>
            </div>

            {/* Images */}
            {complaint.images?.length > 0 && (
              <div className="card">
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.875rem' }}>📸 Photos ({complaint.images.length})</h4>
                <div className="cd-images">
                  {complaint.images.map((img, i) => (
                    <img key={i} src={img.url} alt={`complaint-${i}`} className="cd-img" onClick={() => setLightbox(img.url)} />
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="card">
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.875rem' }}>📍 Location</h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
                {complaint.location?.address}
                {complaint.location?.city && `, ${complaint.location.city}`}
                {complaint.location?.pincode && ` - ${complaint.location.pincode}`}
              </p>
              <LocationMap lat={complaint.location?.coordinates?.lat} lng={complaint.location?.coordinates?.lng} height="240px" />
            </div>

            {/* Status History */}
            <div className="card">
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>📅 Status Timeline</h4>
              <div className="cd-timeline">
                {complaint.statusHistory?.map((h, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" />
                    <div>
                      <strong className={`badge ${STATUS_CLASS[h.status] || ''}`}>{h.status}</strong>
                      {h.note && <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{h.note}</p>}
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {format(new Date(h.changedAt), 'dd MMM yyyy, hh:mm a')}
                        {h.changedBy && ` · ${h.changedBy.name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution Proof */}
            {complaint.resolutionProof?.length > 0 && (
              <div className="card">
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.875rem' }}>✅ Resolution Proof</h4>
                <div className="cd-images">
                  {complaint.resolutionProof.map((p, i) => (
                    <img key={i} src={p.url} alt={`proof-${i}`} className="cd-img" onClick={() => setLightbox(p.url)} />
                  ))}
                </div>
                {complaint.resolutionNote && <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>{complaint.resolutionNote}</p>}
              </div>
            )}

            {/* Upvote (citizen only) */}
            {!isAdmin && (
              <button className={`btn btn-secondary cd-upvote ${upvoted ? 'upvoted' : ''}`} onClick={handleUpvote}>
                👍 Upvote · {complaint.upvotes?.length || 0}
              </button>
            )}
          </div>

          {/* RIGHT: Admin Panel */}
          {isAdmin && (
            <div className="cd-sidebar">
              {/* Update Status */}
              <div className="card">
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>🔄 Update Status</h4>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    {['Pending', 'In Progress', 'Resolved', 'Rejected'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <textarea className="form-textarea" rows={3} placeholder="Add a note (optional)…" value={statusNote} onChange={e => setStatusNote(e.target.value)} />
                </div>
                <button className="btn btn-primary btn-full" onClick={handleStatusUpdate} disabled={actionLoading}>
                  {actionLoading ? 'Updating…' : 'Update Status'}
                </button>
              </div>

              {/* Assign Department */}
              <div className="card">
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>🏢 Assign Department</h4>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
                    <option value="">Select department…</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary btn-full" onClick={handleAssign} disabled={actionLoading}>
                  Assign
                </button>
              </div>

              {/* Upload Resolution Proof */}
              <div className="card">
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>📎 Upload Resolution Proof</h4>
                <form onSubmit={handleProofUpload}>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <input type="file" accept="image/*" multiple onChange={e => setProofFiles(Array.from(e.target.files))} className="form-input" style={{ padding: '0.45rem' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <input type="text" className="form-input" placeholder="Resolution note…" value={proofNote} onChange={e => setProofNote(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-success btn-full" disabled={actionLoading}>
                    {actionLoading ? 'Uploading…' : 'Upload Proof'}
                  </button>
                </form>
              </div>

              {/* Citizen info */}
              <div className="card">
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.875rem' }}>👤 Citizen Info</h4>
                <div className="cd-citizen-info">
                  <div className="avatar avatar-lg">{complaint.citizen?.name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{complaint.citizen?.name}</strong>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{complaint.citizen?.email}</p>
                    {complaint.citizen?.phone && <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{complaint.citizen?.phone}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="full view" className="lightbox-img" />
          <button className="lightbox-close">✕</button>
        </div>
      )}
    </div>
  );
}
