const { db, models } = require('../database/db')
const { sendEmail } = require('../services/emailService')
const {
  adminCustomRequestEmailTemplate,
  studentCustomRequestQuotedTemplate,
  studentCustomRequestStatusTemplate
} = require('../services/emailTemplates')

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11)

// Student: create request
exports.createRequest = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await models.users.findOne({ _id: userId }).lean()
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const req2 = {
      _id: generateId(),
      ...req.body,
      userId,
      userName: user.name,
      userEmail: user.email,
      assignedToUserId: userId,
      assignedToUserName: user.name,
      createdAt: new Date().toISOString()
    }
    
    await models.customCourseRequests.create(req2)
    
    if (db.data.customCourseRequests) {
      db.data.customCourseRequests.push(req2)
    }

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
    const requests = await models.customCourseRequests.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean()
    res.json({ success: true, requests })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

// Admin: get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await models.customCourseRequests.find()
      .sort({ createdAt: -1 })
      .lean()
    res.json({ success: true, requests })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

// Admin: update request status + quote price
exports.updateRequest = async (req, res) => {
  try {
    const old = await models.customCourseRequests.findOne({ _id: req.params.id }).lean()
    if (!old) return res.status(404).json({ success: false, message: 'Request not found' })

    const assignedToUserId = req.body.assignedToUserId || old.assignedToUserId || old.userId
    let assignedUser = null
    if (assignedToUserId) {
      assignedUser = await models.users.findOne({ _id: assignedToUserId }).lean()
    }

    const updated = await models.customCourseRequests.findOneAndUpdate(
      { _id: req.params.id },
      { 
        $set: {
          ...req.body,
          assignedToUserId,
          assignedToUserName: assignedUser?.name || old.assignedToUserName || old.userName,
          updatedAt: new Date().toISOString()
        }
      },
      { new: true }
    ).lean()

    if (db.data.customCourseRequests) {
      const idx = db.data.customCourseRequests.findIndex(r => r._id === req.params.id)
      if (idx !== -1) Object.assign(db.data.customCourseRequests[idx], updated)
    }

    // Email student when status changes
    try {
      const user = await models.users.findOne({ _id: old.userId }).lean()
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

    res.json({ success: true, request: updated })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

// Admin: delete request
exports.deleteRequest = async (req, res) => {
  try {
    await models.customCourseRequests.deleteOne({ _id: req.params.id })
    if (db.data.customCourseRequests) {
      db.data.customCourseRequests = db.data.customCourseRequests.filter(r => r._id !== req.params.id)
    }
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}
