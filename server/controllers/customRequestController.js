const { db } = require('../database/db')
const CustomRequest = require('../models/CustomRequest')
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
    await db.read()
    const user = req.user
    const request = new CustomRequest({
      ...req.body,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      assignedToUserId: user._id,
      assignedToUserName: user.name,
    })
    db.data.customRequests = db.data.customRequests || []
    db.data.customRequests.push(request)
    await db.write()

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
    await db.read()
    const requests = (db.data.customRequests || [])
      .filter(r => r.userId === req.user._id)
      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json({ success: true, requests })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Admin: get all requests
exports.getAllRequests = async (req, res) => {
  try {
    await db.read()
    const requests = (db.data.customRequests || [])
      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json({ success: true, requests })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Admin: update request status + quote price
exports.updateRequest = async (req, res) => {
  try {
    await db.read()
    const idx = (db.data.customRequests || []).findIndex(r => r._id === req.params.id)
    if (idx === -1) return res.status(404).json({ success: false, message: 'Request not found' })

    const prev = db.data.customRequests[idx]
    const assignedToUserId = req.body.assignedToUserId || prev.assignedToUserId || prev.userId
    const assignedUser = db.data.users.find(u => u._id === assignedToUserId)
    db.data.customRequests[idx] = {
      ...prev,
      ...req.body,
      assignedToUserId,
      assignedToUserName: assignedUser?.name || prev.assignedToUserName || prev.userName,
      updatedAt: new Date()
    }
    await db.write()

    const updated = db.data.customRequests[idx]

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
    await db.read()
    const idx = (db.data.customRequests || []).findIndex(r => r._id === req.params.id && r.userId === req.user._id)
    if (idx === -1) return res.status(404).json({ success: false, message: 'Request not found' })

    const current = db.data.customRequests[idx]
    const action = req.body.action
    const message = (req.body.message || '').trim()
    const next = { ...current, updatedAt: new Date() }

    if (action === 'request_modification') {
      next.status = 'reviewing'
      next.studentMessages = [
        ...(current.studentMessages || []),
        { message, createdAt: new Date(), type: 'modification' }
      ]
    } else if (action === 'accept') {
      next.status = 'accepted'
      next.studentMessages = [
        ...(current.studentMessages || []),
        { message: message || 'Student accepted the package.', createdAt: new Date(), type: 'acceptance' }
      ]
    } else if (action === 'purchase') {
      const amount = Number(current.finalPrice || current.quotedPrice || current.budget || 0)
      next.status = 'completed'
      next.paymentStatus = 'paid'
      next.paymentId = 'CUSTOM-' + Date.now()
      next.paidAt = new Date()
      next.studentMessages = [
        ...(current.studentMessages || []),
        { message: `Custom package purchased for Rs.${amount}.`, createdAt: new Date(), type: 'purchase' }
      ]

      db.data.orders = db.data.orders || []
      db.data.orders.push({
        _id: 'custom-order-' + Date.now(),
        user: req.user._id,
        userId: req.user._id,
        courses: [],
        customRequestId: current._id,
        totalAmount: amount,
        status: 'completed',
        paymentId: next.paymentId,
        createdAt: new Date(),
      })

      db.data.notifications = db.data.notifications || []
      db.data.notifications.push({
        _id: 'custom-ready-' + Date.now(),
        user: req.user._id,
        title: 'Your Personalized Course Package is Ready',
        message: 'Your custom package has been unlocked. Check your custom requests dashboard for assigned materials.',
        type: 'custom_course',
        isRead: false,
        createdAt: new Date(),
      })
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' })
    }

    db.data.customRequests[idx] = next
    await db.write()
    res.json({ success: true, request: next })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Admin: delete request
exports.deleteRequest = async (req, res) => {
  try {
    await db.read()
    db.data.customRequests = (db.data.customRequests || []).filter(r => r._id !== req.params.id)
    await db.write()
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
