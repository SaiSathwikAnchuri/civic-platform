const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Each user joins their own room (userId) for targeted notifications
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`👤 User ${userId} joined room`);
      }
    });

    // Admin joins a broadcast room
    socket.on('joinAdmin', () => {
      socket.join('admin-room');
      console.log(`🛡️ Admin joined admin-room`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
