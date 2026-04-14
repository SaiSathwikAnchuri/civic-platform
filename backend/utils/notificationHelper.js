const Notification = require('../models/Notification');
const { getIO } = require('../socket/socketManager');

/**
 * Create a notification and emit it via Socket.io
 */
const createNotification = async ({ recipient, type, title, message, complaint }) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      complaint,
    });

    // Emit real-time notification
    const io = getIO();
    io.to(recipient.toString()).emit('notification', {
      _id: notification._id,
      type,
      title,
      message,
      complaint,
      isRead: false,
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

module.exports = { createNotification };
