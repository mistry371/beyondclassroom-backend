const { db, models } = require('../database/db');

// Get all media
exports.getMedia = async (req, res) => {
  try {
    const mediaList = await models.media.find().sort({ createdAt: -1 }).lean()
    res.json({ media: mediaList || [] });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload media
exports.uploadMedia = async (req, res) => {
  try {
    const { name, type, size, dataUrl } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ message: 'No file data provided' });
    }

    const newMedia = {
      _id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      name: name || 'uploaded-file',
      url: dataUrl,
      type: type || 'image/jpeg',
      size: size || 0,
      uploadedBy: req.user._id,
      createdAt: new Date().toISOString()
    };

    await models.media.create(newMedia)
    if (db.data.media) db.data.media.push(newMedia);

    res.status(201).json({ media: newMedia, files: [newMedia] });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete media
exports.deleteMedia = async (req, res) => {
  try {
    const result = await models.media.deleteOne({ _id: req.params.id })
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Media not found' });
    }

    if (db.data.media) {
      const mediaIndex = db.data.media.findIndex(m => m._id === req.params.id);
      if (mediaIndex !== -1) db.data.media.splice(mediaIndex, 1);
    }

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
