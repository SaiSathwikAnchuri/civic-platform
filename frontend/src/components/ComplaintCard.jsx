import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { getAssetUrl } from '../utils/assetUrl';

const STATUS_CLASS = {
  Pending:    'badge-pending',
  'In Progress': 'badge-progress',
  Resolved:   'badge-resolved',
  Rejected:   'badge-rejected',
};

const PRIORITY_CLASS = {
  Low:      'badge-low',
  Medium:   'badge-medium',
  High:     'badge-high',
  Critical: 'badge-critical',
};

const CATEGORY_ICONS = {
  Pothole:           '🕳️',
  'Garbage Overflow': '🗑️',
  'Drainage Blockage':'🚿',
  'Street Light':    '💡',
  'Water Supply':    '💧',
  'Road Damage':     '🛣️',
  'Illegal Dumping': '⚠️',
  'Noise Pollution': '🔊',
  Encroachment:      '🚧',
  Other:             '📋',
};

export default function ComplaintCard({ complaint, isAdmin = false }) {
  const detailPath = isAdmin
    ? `/admin/complaint/${complaint._id}`
    : `/complaint/${complaint._id}`;

  return (
    <div className="complaint-card card card-glow fade-in">
      {/* Header row */}
      <div className="cc-header">
        <span className="cc-icon">{CATEGORY_ICONS[complaint.category] || '📋'}</span>
        <div className="cc-meta">
          <h4 className="cc-title">{complaint.title}</h4>
          <p className="cc-category">{complaint.category}</p>
        </div>
        <div className="cc-badges">
          <span className={`badge ${STATUS_CLASS[complaint.status]}`}>{complaint.status}</span>
          <span className={`badge ${PRIORITY_CLASS[complaint.priority]}`}>{complaint.priority}</span>
        </div>
      </div>

      {/* Description */}
      <p className="cc-desc">{complaint.description?.substring(0, 120)}{complaint.description?.length > 120 ? '…' : ''}</p>

      {/* Image preview */}
      {complaint.images?.length > 0 && (
        <div className="cc-images">
          {complaint.images.slice(0, 3).map((img, i) => (
            <img key={i} src={getAssetUrl(img.url)} alt="complaint" className="img-thumb" />
          ))}
          {complaint.images.length > 3 && (
            <div className="img-more">+{complaint.images.length - 3}</div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="cc-footer">
        <div className="cc-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{complaint.location?.address?.substring(0, 40)}</span>
        </div>
        <div className="cc-right">
          {isAdmin && complaint.citizen && (
            <span className="cc-citizen">{complaint.citizen.name}</span>
          )}
          <span className="cc-time">
            {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
          </span>
          <Link to={detailPath} className="btn btn-secondary btn-sm">View →</Link>
        </div>
      </div>

      {complaint.isDuplicate && (
        <div className="cc-duplicate-tag">🔗 Linked to existing report · {complaint.upvotes?.length || 0} upvotes</div>
      )}
    </div>
  );
}
