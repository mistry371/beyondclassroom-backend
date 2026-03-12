const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  price: { type: Number, required: true, default: 0 },
  instructor: { type: String, required: true },
  duration: { type: String, required: true },
  topics: [{ type: String }],
  content: [{
    title: String,
    description: String,
    videoUrl: String,
    duration: String
  }],
  thumbnail: { type: String, default: '' },
  expiryDate: { type: Date },
  isFeatured: { type: Boolean, default: false },
  enrolledCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
