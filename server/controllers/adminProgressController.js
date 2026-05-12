const { db } = require('../database/db');

// Get all student progress
exports.getProgress = async (req, res) => {
  try {
    await db.read();
    
    const progressData = (db.data.progress || []).map(p => {
      const uid = p.userId || p.user
      const cid = p.courseId || p.course
      const user = db.data.users?.find(u => u._id === uid)
      const course = db.data.courses?.find(c => c._id === cid)
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
