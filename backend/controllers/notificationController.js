const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('complaint', 'title status');

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  res.json({ success: true, data: notifications, unreadCount });
});

// @desc    Mark notification(s) as read
// @route   PUT /api/notifications/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const { ids } = req.body; // array of notification IDs, or empty to mark all
  const query = { recipient: req.user._id };
  if (ids && ids.length > 0) query._id = { $in: ids };

  await Notification.updateMany(query, { isRead: true });
  res.json({ success: true, message: 'Notifications marked as read' });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  res.json({ success: true, message: 'Notification deleted' });
});

module.exports = { getNotifications, markAsRead, deleteNotification };
