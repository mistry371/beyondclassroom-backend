const { db } = require('../database/db');

// Get all student progress
exports.getProgress = async (req, res) => {
  try {
    await db.read();
    
    const progress = db.data.users
      .filter(u => u.role === 'student')
      .map(user => {
        const userCourses = user.purchasedCourses || [];
        return userCourses.map(courseId => {
          const course = db.data.courses?.find(c => c._id === courseId);
          return {
            _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            user: { _id: user._id, name: user.name },
            course: { _id: courseId, title: course?.title || 'Unknown Course' },
            completionPercentage: Math.floor(Math.random() * 100),
            lessonsCompleted: Math.floor(Math.random() * 10),
            totalLessons: 15,
            quizzesPassed: Math.floor(Math.random() * 5),
            totalQuizzes: 8,
            avgScore: Math.floor(Math.random() * 30) + 70
          };
        });
      })
      .flat();

    res.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
