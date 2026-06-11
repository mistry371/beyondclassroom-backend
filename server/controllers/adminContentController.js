const { db, models } = require('../database/db');

// Get content
exports.getContent = async (req, res) => {
  try {
    let siteContent = await models.siteContent.findOne().lean()
    
    if (!siteContent) {
      siteContent = {
        _id: 'default_content',
        heroTitle: 'Master Mathematics with Beyond Classroom',
        heroSubtitle: 'Interactive learning platform for students from Grade 5 to 12',
        aboutText: 'Beyond Classroom is a comprehensive mathematics learning platform designed to help students excel in their studies.',
        contactEmail: 'support@beyondclassroom.com',
        footerText: '© 2024 Beyond Classroom. All rights reserved.'
      };
      await models.siteContent.create(siteContent)
      if (db.data.siteContent) Object.assign(db.data.siteContent, siteContent)
    }

    res.json({ content: siteContent });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update content
exports.updateContent = async (req, res) => {
  try {
    const updated = await models.siteContent.findOneAndUpdate(
      { _id: 'default_content' },
      { $set: req.body },
      { new: true, upsert: true }
    ).lean()

    if (db.data.siteContent) {
      Object.assign(db.data.siteContent, req.body)
    }

    res.json({ content: updated });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
