const { db } = require('../database/db');

// Get content
exports.getContent = async (req, res) => {
  try {
    await db.read();
    
    if (!db.data.siteContent) {
      db.data.siteContent = {
        heroTitle: 'Master Mathematics with Beyond Classroom',
        heroSubtitle: 'Interactive learning platform for students from Grade 5 to 12',
        aboutText: 'Beyond Classroom is a comprehensive mathematics learning platform designed to help students excel in their studies.',
        contactEmail: 'support@beyondclassroom.com',
        footerText: '© 2024 Beyond Classroom. All rights reserved.'
      };
      await db.write();
    }

    res.json({ content: db.data.siteContent });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update content
exports.updateContent = async (req, res) => {
  try {
    await db.read();
    
    db.data.siteContent = {
      ...db.data.siteContent,
      ...req.body
    };
    
    await db.write();

    res.json({ content: db.data.siteContent });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
