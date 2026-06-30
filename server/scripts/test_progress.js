require('dotenv').config();
const { db, models, connectDB } = require('../database/db');

async function test() {
  await connectDB();
  const req = {
    params: { courseId: 'course-class-6-demo', lessonId: '1782565270762wqzsxvilh' },
    user: { _id: '1782848251101927e9f41i' } // Sahil's ID
  };
  
  const courseId = req.params.courseId;
  const lessonId = req.params.lessonId;
  const userId = req.user._id;
  
  let progress = await models.progress.findOne({ userId, courseId }).lean();
  console.log('Initial Progress:', progress);
  
  if (!progress) {
    progress = { 
      _id: `progress-${Date.now()}`,
      userId, 
      courseId, 
      completionPercentage: 0,
      lessonsCompleted: [],
      quizzesCompleted: [],
      quizScores: [],
      enrolledAt: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
    await models.progress.create(progress)
  }
  
  const lessonsCompleted = [...new Set([...(progress.lessonsCompleted || []), lessonId])]
  
  const modules = await models.modules.find({ courseId }).lean()
  const moduleIds = modules.map(m => m._id)
  const courseLessons = await models.lessons.find({ moduleId: { $in: moduleIds } }).lean()
  
  const totalLessons = courseLessons.length || 1
  console.log('Total Lessons:', totalLessons);
  const completionPercentage = Math.round((lessonsCompleted.length / totalLessons) * 100)
  console.log('Calc Completion Percentage:', completionPercentage);
  
  const updated = await models.progress.findOneAndUpdate(
    { userId, courseId },
    { 
      $set: { 
        lessonsCompleted,
        completionPercentage,
        lastAccessedAt: new Date().toISOString()
      }
    },
    { new: true }
  ).lean()
  
  console.log('Final Progress:', updated);
  process.exit(0);
}

test();
