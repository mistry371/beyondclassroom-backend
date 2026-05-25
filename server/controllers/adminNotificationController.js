const { db } = require('../database/db');

// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    await db.read();
    
    if (!db.data.adminNotifications) {
      db.data.adminNotifications = [
        {
          _id: Date.now().toString() + '1',
          title: 'Welcome to Beyond Classroom',
          message: 'Thank you for joining our platform. Start learning today!',
          type: 'info',
          targetUsers: 'all',
          deliveredCount: 25,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: Date.now().toString() + '2',
          title: 'New Course Available',
          message: 'Check out our new Advanced Calculus course!',
          type: 'success',
          targetUsers: 'all',
          deliveredCount: 25,
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      await db.write();
    }

    res.json({ notifications: db.data.adminNotifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send notification
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, type, targetUsers } = req.body;
    await db.read();
    
    if (!db.data.adminNotifications) {
      db.data.adminNotifications = [];
    }

    const newNotification = {
      _id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      title,
      message,
      type: type || 'info',
      targetUsers: targetUsers || 'all',
      deliveredCount: db.data.users.length,
      createdAt: new Date().toISOString()
    };

    db.data.adminNotifications.unshift(newNotification);
    await db.write();

    res.status(201).json({ notification: newNotification });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    await db.read();
    
    const index = db.data.adminNotifications?.findIndex(n => n._id === req.params.id);
    
    if (index === -1 || index === undefined) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    db.data.adminNotifications.splice(index, 1);
    await db.write();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
