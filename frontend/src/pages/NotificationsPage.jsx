import { useState, useEffect } from 'react';
import { getNotifications, markRead, deleteNotif } from '../api/notificationAPI';
import { useSocket } from '../context/SocketContext';
import Loader from '../components/Loader';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import './NotificationsPage.css';

const TYPE_ICONS = {
  COMPLAINT_SUBMITTED: '📬',
  STATUS_UPDATED:      '🔄',
  COMPLAINT_ASSIGNED:  '🏢',
  COMPLAINT_RESOLVED:  '✅',
  COMPLAINT_REJECTED:  '❌',
  ADMIN_NOTE:          '📝',
  UPVOTE:              '👍',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const { markAllRead } = useSocket() || {};

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getNotifications();
        setNotifications(data.data);
        setUnread(data.unreadCount);
      } catch { /* handled */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleMarkAll = async () => {
    try {
      await markRead([]);
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
      setUnread(0);
      if (markAllRead) markAllRead();
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark as read'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotif(id);
      setNotifications(n => n.filter(x => x._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const handleMarkOne = async (id) => {
    try {
      await markRead([id]);
      setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
      setUnread(c => Math.max(0, c - 1));
    } catch { /* handled */ }
  };

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div className="notif-header fade-in">
          <div>
            <h2>Notifications</h2>
            <p>{unread} unread • {notifications.length} total</p>
          </div>
          {unread > 0 && (
            <button className="btn btn-secondary" onClick={handleMarkAll}>
              ✓ Mark All Read
            </button>
          )}
        </div>

        {loading ? <Loader /> : notifications.length === 0 ? (
          <div className="empty-state fade-in">
            <div style={{ fontSize: '4rem' }}>🔔</div>
            <h3 style={{ color: 'var(--text-primary)' }}>No notifications</h3>
            <p>You're all caught up! Notifications appear here when your complaints are updated.</p>
          </div>
        ) : (
          <div className="notif-list fade-in">
            {notifications.map(n => (
              <div
                key={n._id}
                className={`notif-item card ${!n.isRead ? 'unread' : ''}`}
                onClick={() => !n.isRead && handleMarkOne(n._id)}
              >
                <div className="notif-icon">{TYPE_ICONS[n.type] || '🔔'}</div>
                <div className="notif-body">
                  <strong className="notif-title">{n.title}</strong>
                  <p className="notif-msg">{n.message}</p>
                  <span className="notif-time">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                </div>
                {!n.isRead && <div className="notif-dot" />}
                <button
                  className="btn-icon btn btn-secondary btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                  title="Delete"
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
