const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String,
    default: ''
  },
  degree: {
    type: String,
    default: '',
    trim: true
  },
  experience: {
    type: String,
    default: '',
    trim: true
  },
  expertise: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

// Virtual for initials
teamSchema.virtual('initials').get(function() {
  if (!this.name) return '';
  const parts = this.name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
});

// Ensure virtuals are included in JSON and Object
teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Team', teamSchema);
