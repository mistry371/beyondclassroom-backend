const { db, models } = require('../database/db')

exports.exportOrders = async (req, res) => {
  try {
    const orders = await models.orders.find().lean()
    const users = await models.users.find().select('name email _id').lean()
    
    const rows = orders.map(order => {
      const user = users.find(u => u._id === order.user || u._id === order.userId)
      return `${order._id},${user?.name || 'Unknown'},${user?.email || ''},${order.totalAmount || 0},${order.status},${new Date(order.createdAt).toLocaleDateString()}`
    })
    
    const csvData = 'OrderID,Name,Email,Amount,Status,Date\\n' + rows.join('\\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv')
    res.send(csvData)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getAllOrders = async (req, res) => {
  try {
    const { status = 'all' } = req.query
    
    let query = {}
    if (status !== 'all') {
      query.status = status
    }
    
    let orders = await models.orders.find(query).lean()
    
    const userIds = [...new Set(orders.map(o => o.user || o.userId).filter(Boolean))]
    const users = await models.users.find({ _id: { $in: userIds } }).select('name email _id').lean()
    
    const allCourseIds = [...new Set(orders.flatMap(o => o.courses || []))]
    const courses = await models.courses.find({ _id: { $in: allCourseIds } }).select('title description _id').lean()
    
    orders = orders.map(order => ({
      ...order,
      user: users.find(u => u._id === (order.user || order.userId)),
      courses: order.courses?.map(cId => courses.find(c => c._id === cId)).filter(Boolean)
    }))
    
    res.json({ success: true, orders })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.refundOrder = async (req, res) => {
  try {
    const order = await models.orders.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: 'refunded', refundedAt: new Date().toISOString() } },
      { new: true }
    ).lean()
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    if (db.data.orders) {
      const idx = db.data.orders.findIndex(o => o._id === req.params.id)
      if (idx !== -1) {
        db.data.orders[idx].status = 'refunded'
        db.data.orders[idx].refundedAt = new Date().toISOString()
      }
    }
    
    res.json({ success: true, message: 'Refund processed successfully', order })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}
