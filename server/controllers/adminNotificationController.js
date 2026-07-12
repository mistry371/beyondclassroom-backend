const { db, models } = require('../database/db');

// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await models.adminNotifications.find().sort({ createdAt: -1 }).lean()
    res.json({ notifications: notifications || [] });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send notification
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, type, targetUsers } = req.body;

    const userCount = await models.users.countDocuments()

    const newNotification = {
      _id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      title,
      message,
      type: type || 'info',
      targetUsers: targetUsers || 'all',
      deliveredCount: userCount,
      createdAt: new Date().toISOString()
    };

    await models.adminNotifications.create(newNotification)
    if (db.data.adminNotifications) db.data.adminNotifications.unshift(newNotification);

    res.status(201).json({ notification: newNotification });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const result = await models.adminNotifications.deleteOne({ _id: req.params.id })
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (db.data.adminNotifications) {
      const index = db.data.adminNotifications.findIndex(n => n._id === req.params.id);
      if (index !== -1) db.data.adminNotifications.splice(index, 1);
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
