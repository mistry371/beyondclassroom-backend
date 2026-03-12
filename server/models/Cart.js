const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    addedAt: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', cartSchema);
