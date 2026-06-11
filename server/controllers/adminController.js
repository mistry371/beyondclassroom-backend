const { db, models } = require('../database/db')

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalModules,
      totalLessons,
      totalOrders,
      orders,
      activeSubscriptions,
      recentUsers,
      recentOrders,
      allUsers
    ] = await Promise.all([
      models.users.countDocuments(),
      models.courses.countDocuments(),
      models.modules.countDocuments(),
      models.lessons.countDocuments(),
      models.orders.countDocuments(),
      models.orders.find().lean(),
      models.subscriptions ? models.subscriptions.countDocuments({ status: 'active' }) : 0,
      models.users.find().sort({ createdAt: -1 }).limit(5).lean(),
      models.orders.find().sort({ createdAt: -1 }).limit(5).lean(),
      models.users.find().select('createdAt').lean()
    ])

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

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
      userGrowth: calculateUserGrowth(allUsers),
      courseEnrollments: calculateCourseEnrollments(orders),
    }
    
    res.json({ success: true, stats })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Analytics Data
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query
    
    const [users, orders, courses, activityLogs] = await Promise.all([
      models.users.find().select('createdAt').lean(),
      models.orders.find().lean(),
      models.courses.find().lean(),
      models.activityLogs.find().lean()
    ])
    
    const analytics = {
      userRegistrations: getUserRegistrationsByPeriod(users, period),
      courseEnrollments: getCourseEnrollmentsByPeriod(orders, period),
      revenue: getRevenueByPeriod(orders, period),
      topCourses: getTopCourses(orders, courses),
      userActivity: getUserActivity(activityLogs),
    }
    
    res.json({ success: true, analytics })
  } catch (error) {
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

// Helper Functions
function calculateUserGrowth(users) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  
  const last30Days = users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length
  const previous30Days = users.filter(u => {
    const date = new Date(u.createdAt)
    return date >= sixtyDaysAgo && date < thirtyDaysAgo
  }).length
  
  const growth = previous30Days === 0 ? 100 : ((last30Days - previous30Days) / previous30Days) * 100
  
  return {
    current: last30Days,
    previous: previous30Days,
    percentage: Math.round(growth * 10) / 10
  }
}

function calculateCourseEnrollments(orders) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  return orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo).length
}

function getUserRegistrationsByPeriod(users, period) {
  const days = parseInt(period) || 30
  const data = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const count = users.filter(u => {
      const userDate = new Date(u.createdAt)
      return userDate >= date && userDate < nextDate
    }).length
    
    data.push({
      date: date.toISOString().split('T')[0],
      count
    })
  }
  
  return data
}

function getCourseEnrollmentsByPeriod(orders, period) {
  const days = parseInt(period) || 30
  const data = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const count = orders.filter(o => {
      const orderDate = new Date(o.createdAt)
      return orderDate >= date && orderDate < nextDate
    }).length
    
    data.push({
      date: date.toISOString().split('T')[0],
      count
    })
  }
  
  return data
}

function getRevenueByPeriod(orders, period) {
  const days = parseInt(period) || 30
  const data = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const revenue = orders.filter(o => {
      const orderDate = new Date(o.createdAt)
      return orderDate >= date && orderDate < nextDate
    }).reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue
    })
  }
  
  return data
}

function getTopCourses(orders, courses) {
  const courseCount = {}
  
  orders.forEach(order => {
    order.courses?.forEach(courseId => {
      courseCount[courseId] = (courseCount[courseId] || 0) + 1
    })
  })
  
  return Object.entries(courseCount)
    .map(([courseId, count]) => ({
      course: courses.find(c => c._id === courseId),
      enrollments: count
    }))
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 5)
}

function getUserActivity(logs) {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
  return logs.filter(log => new Date(log.timestamp) >= last24Hours).length
}
