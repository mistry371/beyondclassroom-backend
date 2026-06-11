const { db, models } = require('../database/db');

// Get all student progress
exports.getProgress = async (req, res) => {
  try {
    const allProgress = await models.progress.find().lean()
    
    const userIds = [...new Set(allProgress.map(p => p.userId || p.user).filter(Boolean))]
    const courseIds = [...new Set(allProgress.map(p => p.courseId || p.course).filter(Boolean))]
    
    const users = await models.users.find({ _id: { $in: userIds } }).select('name email _id').lean()
    const courses = await models.courses.find({ _id: { $in: courseIds } }).select('title _id').lean()
    
    const progressData = allProgress.map(p => {
      const uid = p.userId || p.user
      const cid = p.courseId || p.course
      const user = users.find(u => u._id === uid)
      const course = courses.find(c => c._id === cid)
      const completionPercentage = p.completionPercentage ?? p.overallProgress ?? 0
      const lessonsCompleted = p.lessonsCompleted || p.completedLessons || []
      const quizzesCompleted = p.quizzesCompleted || p.completedModules || []
      return {
        ...p,
        completionPercentage,
        lessonsCompleted,
        quizzesCompleted,
        user: user ? { _id: user._id, name: user.name, email: user.email } : null,
        course: course ? { _id: course._id, title: course.title } : null
      }
    }).filter(p => p.user && p.course)

    res.json({ progress: progressData });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
