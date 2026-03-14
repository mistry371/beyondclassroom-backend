const { db } = require('../database/db');

// Get all announcements
exports.getAnnouncements = async (req, res) => {
  try {
    await db.read();
    
    if (!db.data.announcements) {
      db.data.announcements = [
        {
          _id: Date.now().toString() + '1',
          title: 'Platform Maintenance',
          message: 'Scheduled maintenance on Sunday 2 AM - 4 AM',
          priority: 'high',
          expiryDate: new Date(Date.now() + 604800000).toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          _id: Date.now().toString() + '2',
          title: 'New Features Released',
          message: 'Check out our new interactive learning tools!',
          priority: 'medium',
          expiryDate: null,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      await db.write();
    }

    res.json({ announcements: db.data.announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority, expiryDate } = req.body;
    await db.read();
    
    if (!db.data.announcements) {
      db.data.announcements = [];
    }

    const newAnnouncement = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      message,
      priority: priority || 'normal',
      expiryDate: expiryDate || null,
      createdAt: new Date().toISOString()
    };

    db.data.announcements.unshift(newAnnouncement);
    await db.write();

    res.status(201).json({ announcement: newAnnouncement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    await db.read();
    
    const index = db.data.announcements?.findIndex(a => a._id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    db.data.announcements.splice(index, 1);
    await db.write();

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
