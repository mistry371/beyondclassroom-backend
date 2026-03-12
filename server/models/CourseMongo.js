const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Statistics', 
           'Number Theory', 'Linear Algebra', 'Advanced Math', 'Logic', 
           'Combinatorics', 'Set Theory', 'Olympiad', 'JEE Preparation', 
           'Board Exam', 'Other']
  },
  grade: [{
    type: Number,
    min: 5,
    max: 12
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0,
    default: null
  },
  instructor: {
    name: {
      type: String,
      required: true
    },
    bio: {
      type: String,
      default: ''
    },
    photo: {
      type: String,
      default: ''
    }
  },
  duration: {
    type: String,
    required: true
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  totalQuizzes: {
    type: Number,
    default: 0
  },
  topics: [{
    type: String
  }],
  thumbnail: {
    type: String,
    default: ''
  },
  previewVideo: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  enrolledCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [reviewSchema],
  expiryDays: {
    type: Number,
    default: 365 // 1 year default access
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
courseSchema.index({ slug: 1 });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ grade: 1 });
courseSchema.index({ status: 1, isFeatured: -1 });
courseSchema.index({ title: 'text', description: 'text' }); // Full-text search

// Generate slug from title before saving
courseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  this.updatedAt = Date.now();
  next();
});

// Calculate average rating
courseSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    return 0;
  }
  
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
  return this.rating;
};

// Virtual for effective price
courseSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice || this.price;
});

// Virtual for discount percentage
courseSchema.virtual('discountPercentage').get(function() {
  if (!this.discountPrice || this.discountPrice >= this.price) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

// Static method to find published courses
courseSchema.statics.findPublished = function() {
  return this.find({ status: 'published' });
};

// Static method to find featured courses
courseSchema.statics.findFeatured = function() {
  return this.find({ status: 'published', isFeatured: true });
};

// Static method to find by grade
courseSchema.statics.findByGrade = function(grade) {
  return this.find({ status: 'published', grade: grade });
};

// Static method to find by category
courseSchema.statics.findByCategory = function(category) {
  return this.find({ status: 'published', category });
};

module.exports = mongoose.model('Course', courseSchema);
