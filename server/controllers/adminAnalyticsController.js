const { db, models } = require('../database/db');

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const [users, orders, courses, allProgress] = await Promise.all([
      models.users.find().select('createdAt role name').lean(),
      models.orders.find().lean(),
      models.courses.find().lean(),
      models.progress.find().lean()
    ])

    const dayKey = (d) => (d ? new Date(d).toISOString().split('T')[0] : null)

    // Single-pass bucketing: build date -> count maps once (O(N)), then read
    // per day (O(days)), instead of re-scanning every collection per day.
    const usersByDay = new Map()
    for (const u of users) {
      const k = dayKey(u.createdAt)
      if (k) usersByDay.set(k, (usersByDay.get(k) || 0) + 1)
    }
    const revenueByDay = new Map()
    const enrollmentsByCourse = new Map()
    for (const o of orders) {
      if (o.status !== 'completed') continue
      const k = dayKey(o.createdAt)
      if (k) revenueByDay.set(k, (revenueByDay.get(k) || 0) + (o.totalAmount || 0))
      // Count each purchased course once per completed order (base id).
      const seen = new Set()
      for (const cid of (o.courses || [])) {
        const base = String(cid).includes('_') ? String(cid).split('_')[0] : String(cid)
        if (!seen.has(base)) { seen.add(base); enrollmentsByCourse.set(base, (enrollmentsByCourse.get(base) || 0) + 1) }
      }
    }

    const userGrowth = [];
    const revenue = [];
    for (let i = parseInt(days); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      userGrowth.push({ date: dateStr, users: usersByDay.get(dateStr) || 0 });
      revenue.push({ date: dateStr, revenue: revenueByDay.get(dateStr) || 0 });
    }

    // Course popularity (real enrollment counts) — from the prebuilt map
    const coursePopularity = courses
      .map(c => ({
        name: c.title,
        enrollments: enrollmentsByCourse.get(String(c._id)) || 0
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // Top students — compute scores for all, THEN rank by performance.
    const topStudents = users
      .filter(u => u.role === 'user' || u.role === 'student')
      .map(u => {
        const userProgress = allProgress.filter(p => p.user === u._id.toString() || p.userId === u._id.toString())
        const completedCourses = userProgress.filter(p => p.completionPercentage >= 100).length
        const allScores = userProgress.flatMap(p => (p.quizScores || []).map(s => s.score || 0))
        const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0
        return { _id: u._id, name: u.name, coursesCompleted: completedCourses, avgScore }
      })
      .sort((a, b) => (b.coursesCompleted - a.coursesCompleted) || (b.avgScore - a.avgScore))
      .slice(0, 5);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0
    const avgCompletionRate = allProgress.length > 0
      ? Math.round(allProgress.reduce((sum, p) => sum + (p.completionPercentage || 0), 0) / allProgress.length)
      : 0

    // Real period-over-period growth: recent half of the window vs the previous half.
    const halfGrowth = (series, key) => {
      const n = series.length
      if (n < 2) return 0
      const mid = Math.floor(n / 2)
      const prev = series.slice(0, mid).reduce((s, x) => s + (x[key] || 0), 0)
      const recent = series.slice(mid).reduce((s, x) => s + (x[key] || 0), 0)
      if (prev === 0) return recent > 0 ? 100 : 0
      return Math.round(((recent - prev) / prev) * 1000) / 10
    }

    const analytics = {
      totalUsers: users.length,
      activeCourses: courses.filter(c => (c.status || 'published') === 'published').length,
      totalRevenue,
      avgCompletionRate,
      userGrowthPercent: halfGrowth(userGrowth, 'users'),
      revenueGrowthPercent: halfGrowth(revenue, 'revenue'),
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
    const { days = 30 } = req.query;

    const [users, orders] = await Promise.all([
      models.users.find().select('createdAt').lean(),
      models.orders.find().lean()
    ])

    const daysInt = parseInt(days);
    const rows = [];
    for (let i = daysInt; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const newUsers = users.filter(u => {
        const created = u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : null;
        return created === dateStr;
      }).length || 0;

      const revenueAmt = orders.filter(o => {
        const created = o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : null;
        return created === dateStr && o.status === 'completed';
      }).reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;

      rows.push(`${dateStr},${newUsers},${revenueAmt}`);
    }

    const csvData = 'Date,New Users,Revenue\\n' + rows.join('\\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${days}days.csv`);
    res.send(csvData);
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
