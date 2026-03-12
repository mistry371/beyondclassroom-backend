const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  duration: {
    type: String,
    required: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  unlockCondition: {
    type: {
      type: String,
      enum: ['none', 'previous_module', 'quiz_score', 'time_based'],
      default: 'none'
    },
    value: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
moduleSchema.index({ courseId: 1, order: 1 });
moduleSchema.index({ courseId: 1, isLocked: 1 });

// Virtual for lessons
moduleSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'moduleId'
});

// Virtual for quiz
moduleSchema.virtual('quiz', {
  ref: 'Quiz',
  localField: '_id',
  foreignField: 'moduleId',
  justOne: true
});

// Update timestamp before saving
moduleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find by course
moduleSchema.statics.findByCourse = function(courseId) {
  return this.find({ courseId }).sort({ order: 1 });
};

// Static method to find unlocked modules
moduleSchema.statics.findUnlocked = function(courseId) {
  return this.find({ courseId, isLocked: false }).sort({ order: 1 });
};

// Method to check if module is accessible
moduleSchema.methods.isAccessible = async function(userId) {
  if (!this.isLocked) return true;
  
  if (this.unlockCondition.type === 'none') return true;
  
  if (this.unlockCondition.type === 'previous_module') {
    // Check if previous module is completed
    const Progress = mongoose.model('Progress');
    const progress = await Progress.findOne({
      userId,
      courseId: this.courseId,
      modulesCompleted: this.unlockCondition.value
    });
    return !!progress;
  }
  
  if (this.unlockCondition.type === 'quiz_score') {
    // Check if required quiz score is achieved
    const Progress = mongoose.model('Progress');
    const progress = await Progress.findOne({
      userId,
      courseId: this.courseId
    });
    
    if (!progress) return false;
    
    const quizAttempt = progress.quizzesAttempted.find(
      q => q.quizId.toString() === this.unlockCondition.value.quizId
    );
    
    return quizAttempt && quizAttempt.percentage >= this.unlockCondition.value.minScore;
  }
  
  return false;
};

module.exports = mongoose.model('Module', moduleSchema);
