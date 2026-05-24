const { db } = require('../database/db')
const CustomCourseRequest = require('../models/CustomCourseRequest')
const { sendEmail } = require('../services/emailService')
const {
  adminCustomRequestEmailTemplate,
  studentCustomRequestQuotedTemplate,
  studentCustomRequestStatusTemplate
} = require('../services/emailTemplates')

// Student: create request
exports.createRequest = async (req, res) => {
  try {
    await db.read()
    const userId = req.user._id
    const user = db.data.users.find(u => u._id === userId)
    const req2 = new CustomCourseRequest({
      ...req.body,
      userId,
      userName: user.name,
      userEmail: user.email,
    })
    db.data.customCourseRequests = db.data.customCourseRequests || []
    db.data.customCourseRequests.push(req2)
    await db.write()

    // Notify admin
    try {
      await sendEmail({
        to: process.env.EMAIL_USER || 'beyondclassroom247@gmail.com',
        subject: 'New Custom Course Request from ' + user.name,
        html: adminCustomRequestEmailTemplate(
          user.name,
          user.email,
          req.body.title || 'Custom Course',
          req.body.deliverable,
          (req.body.selectedTopics || []).map(t => t.moduleTitle).join(', '),
          req.body.budget
        )
      })
    } catch(_) {}

    res.status(201).json({ success: true, request: req2 })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

// Student: get my requests
exports.getMyRequests = async (req, res) => {
  try {
    await db.read()
    const requests = (db.data.customCourseRequests || []).filter(r => r.userId === req.user._id)
      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json({ success: true, requests })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

// Admin: get all requests
exports.getAllRequests = async (req, res) => {
  try {
    await db.read()
    const requests = (db.data.customCourseRequests || [])
      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json({ success: true, requests })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

// Admin: update request status + quote price
exports.updateRequest = async (req, res) => {
  try {
    await db.read()
    const idx = (db.data.customCourseRequests || []).findIndex(r => r._id === req.params.id)
    if (idx === -1) return res.status(404).json({ success: false, message: 'Request not found' })
    const old = db.data.customCourseRequests[idx]
    db.data.customCourseRequests[idx] = { ...old, ...req.body, updatedAt: new Date() }
    await db.write()

    // Email student when status changes
    try {
      const user = db.data.users.find(u => u._id === old.userId)
      if (user && req.body.status && req.body.status !== old.status) {
        const statusMessages = {
          reviewing: 'Your request is being reviewed by our team.',
          quoted:    'Your request has been quoted at ₹' + (req.body.quotedPrice || '') + '. Please login to accept and pay.',
          accepted:  'Your custom course request has been accepted!',
          rejected:  'Unfortunately your request could not be fulfilled. Reason: ' + (req.body.adminNote || ''),
          completed: 'Your custom course is ready! Login to access it.',
        }
        const statusMsg = statusMessages[req.body.status] || 'Your request status has been updated.'

        if (req.body.status === 'quoted' && req.body.quotedPrice) {
          await sendEmail({
            to: user.email,
            subject: 'Your Custom Course Request Has Been Quoted - Beyond Classroom',
            html: studentCustomRequestQuotedTemplate(user.name, old.title || 'Custom Course', req.body.quotedPrice, req.body.adminNote)
          })
        } else {
          await sendEmail({
            to: user.email,
            subject: 'Custom Course Request Update - Beyond Classroom',
            html: studentCustomRequestStatusTemplate(user.name, old.title || 'Custom Course', req.body.status, statusMsg)
          })
        }
      }
    } catch(_) {}

    res.json({ success: true, request: db.data.customCourseRequests[idx] })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

// Admin: delete request
exports.deleteRequest = async (req, res) => {
  try {
    await db.read()
    db.data.customCourseRequests = (db.data.customCourseRequests || []).filter(r => r._id !== req.params.id)
    await db.write()
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}
