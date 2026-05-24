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
    db.data.customRequests[idx] = { ...prev, ...req.body, updatedAt: new Date() }
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
