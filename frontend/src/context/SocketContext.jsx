import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('join', user._id);
      if (user.role === 'admin') socket.emit('joinAdmin');
    });

    socket.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
      toast(notif.message, {
        icon: '🔔',
        duration: 5000,
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '12px' },
      });
    });

    socket.on('newComplaint', ({ title, category, priority }) => {
      if (user.role === 'admin') {
        toast(`📬 New ${priority} complaint in ${category}: "${title}"`, {
          duration: 6000,
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #6366f1', borderRadius: '12px' },
        });
      }
    });

    return () => { socket.disconnect(); };
  }, [user]);

  const markAllRead = () => setUnreadCount(0);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, setNotifications, unreadCount, setUnreadCount, markAllRead }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
