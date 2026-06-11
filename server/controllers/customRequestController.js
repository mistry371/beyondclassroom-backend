const { db, models } = require('../database/db')
const { sendEmail } = require('../services/emailService')
const {
  adminCustomRequestEmailTemplate,
  studentCustomRequestQuotedTemplate,
  studentCustomRequestStatusTemplate
} = require('../services/emailTemplates')

const ADMIN_EMAIL = 'mistryjenish1003@gmail.com'

// Student: submit a new custom request
exports.createRequest = async (req, res) => {
  try {
    const user = req.user
    
    const request = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...req.body,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      assignedToUserId: user._id,
      assignedToUserName: user.name,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await models.customRequests.create(request)
    
    if (db.data.customRequests) {
      db.data.customRequests.push(request)
    }

    // Notify admin
    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: 'New Custom Course Request from ' + user.name,
        html: adminCustomRequestEmailTemplate(
          user.name,
          user.email,
          request.title,
          request.deliverable,
          request.selectedTopics?.map(t => t.moduleTitle).join(', '),
          request.budget
        )
      })
    } catch(_) {}

    res.status(201).json({ success: true, request })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Student: get my requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await models.customRequests.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean()
    res.json({ success: true, requests })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Admin: get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await models.customRequests.find().sort({ createdAt: -1 }).lean()
    res.json({ success: true, requests })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Admin: update request status + quote price
exports.updateRequest = async (req, res) => {
  try {
    const prev = await models.customRequests.findOne({ _id: req.params.id }).lean()
    if (!prev) return res.status(404).json({ success: false, message: 'Request not found' })

    const assignedToUserId = req.body.assignedToUserId || prev.assignedToUserId || prev.userId
    const assignedUser = await models.users.findOne({ _id: assignedToUserId }).lean()
    
    const updates = {
      ...req.body,
      assignedToUserId,
      assignedToUserName: assignedUser?.name || prev.assignedToUserName || prev.userName,
      updatedAt: new Date()
    }
    
    const updated = await models.customRequests.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updates },
      { new: true }
    ).lean()

    if (db.data.customRequests) {
      const idx = db.data.customRequests.findIndex(r => r._id === req.params.id)
      if (idx !== -1) Object.assign(db.data.customRequests[idx], updates)
    }

    // Notify student when quoted
    if (req.body.status === 'quoted' && req.body.quotedPrice) {
      try {
        await sendEmail({
          to: updated.userEmail,
          subject: 'Your Custom Request Has Been Quoted - Beyond Classroom',
          html: studentCustomRequestQuotedTemplate(updated.userName, updated.title, req.body.quotedPrice, req.body.adminNote)
        })
      } catch(_) {}
    }

    res.json({ success: true, request: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Student: accept, request modification, or purchase a quoted custom package.
exports.studentAction = async (req, res) => {
  try {
    const current = await models.customRequests.findOne({ _id: req.params.id, userId: req.user._id }).lean()
    if (!current) return res.status(404).json({ success: false, message: 'Request not found' })

    const action = req.body.action
    const message = (req.body.message || '').trim()
    let updates = { updatedAt: new Date() }

    if (action === 'request_modification') {
      updates.status = 'reviewing'
      updates.studentMessages = [
        ...(current.studentMessages || []),
        { message, createdAt: new Date(), type: 'modification' }
      ]
    } else if (action === 'accept') {
      updates.status = 'accepted'
      updates.studentMessages = [
        ...(current.studentMessages || []),
        { message: message || 'Student accepted the package.', createdAt: new Date(), type: 'acceptance' }
      ]
    } else if (action === 'purchase') {
      const amount = Number(current.finalPrice || current.quotedPrice || current.budget || 0)
      updates.status = 'completed'
      updates.paymentStatus = 'paid'
      updates.paymentId = 'CUSTOM-' + Date.now()
      updates.paidAt = new Date()
      updates.studentMessages = [
        ...(current.studentMessages || []),
        { message: `Custom package purchased for Rs.${amount}.`, createdAt: new Date(), type: 'purchase' }
      ]

      const order = {
        _id: 'custom-order-' + Date.now(),
        user: req.user._id,
        userId: req.user._id,
        courses: [],
        customRequestId: current._id,
        totalAmount: amount,
        status: 'completed',
        paymentId: updates.paymentId,
        createdAt: new Date(),
      }
      
      await models.orders.create(order)
      if (db.data.orders) db.data.orders.push(order)

      const notification = {
        _id: 'custom-ready-' + Date.now(),
        user: req.user._id,
        title: 'Your Personalized Course Package is Ready',
        message: 'Your custom package has been unlocked. Check your custom requests dashboard for assigned materials.',
        type: 'custom_course',
        isRead: false,
        createdAt: new Date(),
      }
      
      await models.notifications.create(notification)
      if (db.data.notifications) db.data.notifications.push(notification)
      
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' })
    }

    const next = await models.customRequests.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updates },
      { new: true }
    ).lean()
    
    if (db.data.customRequests) {
      const idx = db.data.customRequests.findIndex(r => r._id === req.params.id)
      if (idx !== -1) Object.assign(db.data.customRequests[idx], updates)
    }

    res.json({ success: true, request: next })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Admin: delete request
exports.deleteRequest = async (req, res) => {
  try {
    await models.customRequests.deleteOne({ _id: req.params.id })
    if (db.data.customRequests) {
      db.data.customRequests = db.data.customRequests.filter(r => r._id !== req.params.id)
    }
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
