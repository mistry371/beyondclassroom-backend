const { db } = require('../database/db');

// Get all badges
exports.getBadges = async (req, res) => {
  try {
    await db.read();
    
    if (!db.data.badges) {
      db.data.badges = [
        {
          _id: Date.now().toString() + '1',
          name: 'First Course Complete',
          description: 'Complete your first course',
          criteria: 'Complete 1 course',
          icon: '🎓'
        },
        {
          _id: Date.now().toString() + '2',
          name: 'Quiz Master',
          description: 'Score 100% in any quiz',
          criteria: 'Score 100% in a quiz',
          icon: '🏆'
        },
        {
          _id: Date.now().toString() + '3',
          name: 'Learning Streak',
          description: 'Learn for 7 days straight',
          criteria: '7 day streak',
          icon: '🔥'
        }
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
    
    if (!db.data.badges) {
      db.data.badges = [];
    }

    const newBadge = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      description,
      criteria,
      icon: icon || '🏅'
    };

    db.data.badges.push(newBadge);
    await db.write();

    res.status(201).json({ badge: newBadge });
  } catch (error) {
    console.error('Create badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete badge
exports.deleteBadge = async (req, res) => {
  try {
    await db.read();
    
    const badgeIndex = db.data.badges?.findIndex(b => b._id === req.params.id);
    
    if (badgeIndex === -1) {
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
