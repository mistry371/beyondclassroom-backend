const { db, models } = require('../database/db');

// Get all announcements
exports.getAnnouncements = async (req, res) => {
  try {
    let announcements = await models.announcements.find().sort({ createdAt: -1 }).lean()
    
    if (!announcements || announcements.length === 0) {
      const defaultAnnouncements = [
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
      
      await models.announcements.insertMany(defaultAnnouncements)
      if (db.data.announcements) db.data.announcements.push(...defaultAnnouncements)
      
      announcements = defaultAnnouncements
    }

    res.json({ announcements: announcements.map(a => ({
      ...a,
      message: a.message || a.content || ''
    })) });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority, expiryDate } = req.body;

    const newAnnouncement = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      message,
      priority: priority || 'normal',
      expiryDate: expiryDate || null,
      createdAt: new Date().toISOString()
    };

    await models.announcements.create(newAnnouncement)
    if (db.data.announcements) db.data.announcements.unshift(newAnnouncement);

    res.status(201).json({ announcement: newAnnouncement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const result = await models.announcements.deleteOne({ _id: req.params.id })
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (db.data.announcements) {
      const index = db.data.announcements.findIndex(a => a._id === req.params.id);
      if (index !== -1) db.data.announcements.splice(index, 1);
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
