const { models } = require('../database/db');

exports.getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await models.announcements.find({
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: new Date().toISOString() } }
      ]
    }).sort({ createdAt: -1 }).lean();

    res.json({ success: true, announcements });
  } catch (error) {
    console.error('Get active announcements error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
