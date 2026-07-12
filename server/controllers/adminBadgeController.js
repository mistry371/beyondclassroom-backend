const { db, models } = require('../database/db');

// Get all badges
exports.getBadges = async (req, res) => {
  try {
    const badges = await models.badges.find().lean()
    res.json({ badges: badges || [] });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create badge
exports.createBadge = async (req, res) => {
  try {
    const { name, description, criteria, icon } = req.body;

    const newBadge = { 
      _id: Date.now().toString() + Math.random().toString(36).slice(2, 9), 
      name, 
      description, 
      criteria, 
      icon: icon || '🏅', 
      createdAt: new Date().toISOString() 
    };
    
    await models.badges.create(newBadge)
    if (db.data.badges) db.data.badges.push(newBadge);

    res.status(201).json({ badge: newBadge });
  } catch (error) {
    console.error('Create badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update badge
exports.updateBadge = async (req, res) => {
  try {
    const { name, description, criteria, icon } = req.body;

    const updated = await models.badges.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { name, description, criteria, icon, updatedAt: new Date().toISOString() } },
      { new: true }
    ).lean()

    if (!updated) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    if (db.data.badges) {
      const index = db.data.badges.findIndex(b => b._id === req.params.id);
      if (index !== -1) {
        Object.assign(db.data.badges[index], { name, description, criteria, icon, updatedAt: new Date().toISOString() });
      }
    }

    res.json({ badge: updated });
  } catch (error) {
    console.error('Update badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete badge
exports.deleteBadge = async (req, res) => {
  try {
    const result = await models.badges.deleteOne({ _id: req.params.id })
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    if (db.data.badges) {
      const badgeIndex = db.data.badges.findIndex(b => b._id === req.params.id);
      if (badgeIndex !== -1) db.data.badges.splice(badgeIndex, 1);
    }

    res.json({ message: 'Badge deleted successfully' });
  } catch (error) {
    console.error('Delete badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
