const { db } = require('../database/db');

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    await db.read();

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // User growth data
    const userGrowth = [];
    for (let i = parseInt(days); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = Math.floor(Math.random() * 10) + 5;
      userGrowth.push({ date: dateStr, users: count });
    }

    // Revenue data
    const revenue = [];
    for (let i = parseInt(days); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const amount = Math.floor(Math.random() * 5000) + 1000;
      revenue.push({ date: dateStr, revenue: amount });
    }

    // Course popularity
    const coursePopularity = [
      { name: 'Algebra Basics', enrollments: 45 },
      { name: 'Geometry', enrollments: 32 },
      { name: 'Calculus', enrollments: 28 },
      { name: 'Statistics', enrollments: 25 }
    ];

    // Top students
    const topStudents = db.data.users
      .filter(u => u.role === 'student')
      .slice(0, 5)
      .map(u => ({
        _id: u._id,
        name: u.name,
        coursesCompleted: Math.floor(Math.random() * 5) + 1,
        avgScore: Math.floor(Math.random() * 30) + 70
      }));

    const analytics = {
      totalUsers: db.data.users.length,
      activeCourses: db.data.courses?.filter(c => c.isPublished).length || 0,
      totalRevenue: db.data.orders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0,
      avgCompletionRate: 75,
      userGrowthPercent: 15,
      revenueGrowthPercent: 22,
      userGrowth,
      revenue,
      coursePopularity,
      topStudents
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export analytics
exports.exportAnalytics = async (req, res) => {
  try {
    const { format = 'csv', days = 30 } = req.query;
    
    // Generate CSV data
    const csvData = 'Date,Users,Revenue\n2024-01-01,10,5000\n2024-01-02,12,6000';
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
    res.send(csvData);
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
