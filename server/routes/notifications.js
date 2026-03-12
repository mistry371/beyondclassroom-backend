const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  createNotification,
  markAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, getUserNotifications);
router.post('/', protect, admin, createNotification);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
