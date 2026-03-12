const { db } = require('../database/db')
const ActivityLog = require('../models/ActivityLog')

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    await db.read()
    
    const stats = {
      totalUsers: db.data.users?.length || 0,
      totalCourses: db.data.courses?.length || 0,
      totalModules: db.data.modules?.length || 0,
      totalLessons: db.data.lessons?.length || 0,
      totalOrders: db.data.orders?.length || 0,
      totalRevenue: db.data.orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0,
      activeSubscriptions: db.data.subscriptions?.filter(s => s.status === 'active').length || 0,
      recentUsers: db.data.users?.slice(-5).reverse() || [],
      recentOrders: db.data.orders?.slice(-5).reverse() || [],
      userGrowth: calculateUserGrowth(db.data.users || []),
      courseEnrollments: calculateCourseEnrollments(db.data.orders || []),
    }
    
    res.json({ success: true, stats })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Analytics Data
exports.getAnalytics = async (req, res) => {
  try {
    await db.read()
    const { period = '30d' } = req.query
    
    const analytics = {
      userRegistrations: getUserRegistrationsByPeriod(db.data.users || [], period),
      courseEnrollments: getCourseEnrollmentsByPeriod(db.data.orders || [], period),
      revenue: getRevenueByPeriod(db.data.orders || [], period),
      topCourses: getTopCourses(db.data.orders || [], db.data.courses || []),
      userActivity: getUserActivity(db.data.activityLogs || []),
    }
    
    res.json({ success: true, analytics })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Activity Logs
exports.getActivityLogs = async (req, res) => {
  try {
    await db.read()
    const { page = 1, limit = 50, module, userId } = req.query
    
    let logs = db.data.activityLogs || []
    
    if (module) logs = logs.filter(log => log.module === module)
    if (userId) logs = logs.filter(log => log.userId === userId)
    
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
    const startIndex = (page - 1) * limit
    const paginatedLogs = logs.slice(startIndex, startIndex + parseInt(limit))
    
    res.json({
      success: true,
      logs: paginatedLogs,
      total: logs.length,
      page: parseInt(page),
      totalPages: Math.ceil(logs.length / limit)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Log Activity
exports.logActivity = async (userId, userName, action, module, description, metadata = {}) => {
  try {
    await db.read()
    
    const log = new ActivityLog({
      userId,
      userName,
      action,
      module,
      description,
      metadata
    })
    
    db.data.activityLogs = db.data.activityLogs || []
    db.data.activityLogs.push(log)
    
    await db.write()
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
