const express = require('express');
const { getNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
