const { db, models } = require('../database/db')

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      totalCourses,
      totalModules,
      totalLessons,
      totalOrders,
      activeSubscriptions,
      recentUsers,
      recentOrders,
      revenueResult,
      last30DaysUsers,
      previous30DaysUsers,
      last30DaysOrders,
      pendingWithdrawals,
      pendingKyc,
      pendingCustomRequests
    ] = await Promise.all([
      models.users.countDocuments(),
      models.courses.countDocuments(),
      models.modules.countDocuments(),
      models.lessons.countDocuments(),
      models.orders.countDocuments(),
      models.subscriptions ? models.subscriptions.countDocuments({ status: 'active' }) : 0,
      models.users.find().sort({ createdAt: -1 }).limit(5).lean(),
      models.orders.find().sort({ createdAt: -1 }).limit(5).lean(),
      models.orders.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      models.users.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      models.users.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      models.orders.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      models.promoterPayouts.countDocuments({ status: 'pending' }),
      models.promoters.countDocuments({ 'kyc.status': 'submitted' }),
      models.customRequests.countDocuments({ status: 'pending' })
    ])

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0
    const userGrowthPercent = previous30DaysUsers === 0 ? (last30DaysUsers > 0 ? 100 : 0) : ((last30DaysUsers - previous30DaysUsers) / previous30DaysUsers) * 100

    const stats = {
      totalUsers,
      totalCourses,
      totalModules,
      totalLessons,
      totalOrders,
      totalRevenue,
      activeSubscriptions,
      recentUsers,
      recentOrders,
      userGrowth: {
        current: last30DaysUsers,
        previous: previous30DaysUsers,
        percentage: Math.round(userGrowthPercent * 10) / 10
      },
      courseEnrollments: last30DaysOrders,
      pendingActions: {
        withdrawals: pendingWithdrawals,
        kyc: pendingKyc,
        customRequests: pendingCustomRequests,
      },
    }

    res.json({ success: true, stats })
  } catch (error) {
    console.error('Dashboard Stats Error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Analytics Data
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query
    const days = parseInt(period) || 30
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)
    
    // Create an array of all dates in the period for zero-filling
    const dateLabels = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dateLabels.push(d.toISOString().split('T')[0])
    }
    
    // Aggregation for daily stats
    const [usersAgg, ordersAgg, activityCount, topCoursesAgg, allCourses] = await Promise.all([
      models.users.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
      ]),
      models.orders.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, enrollments: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } }
      ]),
      models.activityLogs.countDocuments({ timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      models.orders.aggregate([
        { $unwind: "$courses" },
        { $group: { _id: "$courses", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      models.courses.find().lean()
    ])
    
    // Transform arrays to map for fast lookup
    const usersMap = usersAgg.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {})
    const ordersMap = ordersAgg.reduce((acc, curr) => ({ ...acc, [curr._id]: curr }), {})
    
    // Zero-fill the dates
    const userRegistrations = dateLabels.map(date => ({ date, count: usersMap[date] || 0 }))
    const courseEnrollments = dateLabels.map(date => ({ date, count: ordersMap[date]?.enrollments || 0 }))
    const revenue = dateLabels.map(date => ({ date, revenue: ordersMap[date]?.revenue || 0 }))
    
    const topCourses = topCoursesAgg.map(tc => {
      const course = allCourses.find(c => c._id === tc._id)
      return { course: course || { _id: tc._id, title: 'Unknown Course' }, enrollments: tc.count }
    })
    
    const analytics = {
      userRegistrations,
      courseEnrollments,
      revenue,
      topCourses,
      userActivity: activityCount,
    }
    
    res.json({ success: true, analytics })
  } catch (error) {
    console.error('Analytics Error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Activity Logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, module, userId } = req.query
    
    let query = {}
    if (module) query.module = module
    if (userId) query.userId = userId
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const logs = await models.activityLogs.find(query).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit)).lean()
    const total = await models.activityLogs.countDocuments(query)
    
    res.json({
      success: true,
      logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Log Activity
exports.logActivity = async (userId, userName, action, module, description, metadata = {}) => {
  try {
    const log = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      action,
      module,
      description,
      metadata,
      timestamp: new Date()
    }
    
    await models.activityLogs.create(log)
    if (db.data.activityLogs) db.data.activityLogs.push(log)
    
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}
