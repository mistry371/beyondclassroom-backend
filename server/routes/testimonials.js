const express = require('express');
const router = express.Router();
const { models } = require('../database/db');

// Public testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await models.testimonials.find({ active: true }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
