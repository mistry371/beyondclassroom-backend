const { db } = require('../database/db');

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 9);

// Get all badges
exports.getBadges = async (req, res) => {
  try {
    await db.read();

    if (!db.data.badges) {
      db.data.badges = [
        { _id: generateId(), name: 'First Course Complete', description: 'Complete your first course', criteria: 'Complete 1 course', icon: '🎓' },
        { _id: generateId(), name: 'Quiz Master', description: 'Score 100% in any quiz', criteria: 'Score 100% in a quiz', icon: '🏆' },
        { _id: generateId(), name: 'Learning Streak', description: 'Learn for 7 days straight', criteria: '7 day streak', icon: '🔥' }
      ];
      await db.write();
    }

    res.json({ badges: db.data.badges });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create badge
exports.createBadge = async (req, res) => {
  try {
    const { name, description, criteria, icon } = req.body;
    await db.read();

    if (!db.data.badges) db.data.badges = [];

    const newBadge = { _id: generateId(), name, description, criteria, icon: icon || '🏅', createdAt: new Date().toISOString() };
    db.data.badges.push(newBadge);
    await db.write();

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
    await db.read();

    const index = db.data.badges?.findIndex(b => b._id === req.params.id);
    if (index === -1 || index === undefined) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    db.data.badges[index] = { ...db.data.badges[index], name, description, criteria, icon, updatedAt: new Date().toISOString() };
    await db.write();

    res.json({ badge: db.data.badges[index] });
  } catch (error) {
    console.error('Update badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete badge
exports.deleteBadge = async (req, res) => {
  try {
    await db.read();

    const badgeIndex = db.data.badges?.findIndex(b => b._id === req.params.id);
    if (badgeIndex === -1 || badgeIndex === undefined) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    db.data.badges.splice(badgeIndex, 1);
    await db.write();

    res.json({ message: 'Badge deleted successfully' });
  } catch (error) {
    console.error('Delete badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
