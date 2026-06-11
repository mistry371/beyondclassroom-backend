const { db, models } = require('../database/db')
const bcrypt = require('bcryptjs')
const { logActivity } = require('./adminController')

// Get all users with pagination and filters
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query
    
    let query = {}
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (role) {
      query.role = role
    }
    
    if (status) {
      query.status = status
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const users = await models.users.find(query).skip(skip).limit(parseInt(limit)).lean()
    const total = await models.users.countDocuments(query)
    
    // Remove passwords
    const safeUsers = users.map(u => {
      const { password, ...userWithoutPassword } = u
      return userWithoutPassword
    })
    
    res.json({
      success: true,
      users: safeUsers,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await models.users.findOne({ _id: req.params.id }).lean()
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    const { password, ...userWithoutPassword } = user
    res.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Create user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user', status = 'active' } = req.body
    
    // Check if user exists
    const existingUser = await models.users.findOne({ email }).lean()
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const newUser = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: hashedPassword,
      role,
      status,
      profilePhoto: '',
      isGuest: false,
      purchasedCourses: [],
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await models.users.create(newUser)
    if (db.data.users) db.data.users.push(newUser)
    
    // Log activity
    await logActivity(
      req.user._id,
      req.user.name,
      'create',
      'users',
      `Created user: ${name} (${email})`,
      { userId: newUser._id }
    )
    
    const { password: _, ...userWithoutPassword } = newUser
    res.status(201).json({ success: true, user: userWithoutPassword })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, status, profilePhoto } = req.body
    
    let updates = { updatedAt: new Date() }
    if (name) updates.name = name
    if (email) updates.email = email
    if (role) updates.role = role
    if (status) updates.status = status
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto

    const updatedUser = await models.users.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updates },
      { new: true }
    ).lean()
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    if (db.data.users) {
      const uIdx = db.data.users.findIndex(u => u._id === req.params.id)
      if (uIdx !== -1) Object.assign(db.data.users[uIdx], updates)
    }
    
    // Log activity
    await logActivity(
      req.user._id,
      req.user.name,
      'update',
      'users',
      `Updated user: ${updatedUser.name}`,
      { userId: updatedUser._id }
    )
    
    const { password, ...userWithoutPassword } = updatedUser
    res.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await models.users.findOneAndDelete({ _id: req.params.id }).lean()
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    if (db.data.users) {
      db.data.users = db.data.users.filter(u => u._id !== req.params.id)
    }
    
    // Log activity
    await logActivity(
      req.user._id,
      req.user.name,
      'delete',
      'users',
      `Deleted user: ${user.name} (${user.email})`,
      { userId: user._id }
    )
    
    res.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Reset user password
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    const updatedUser = await models.users.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { password: hashedPassword, updatedAt: new Date() } },
      { new: true }
    ).lean()
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    if (db.data.users) {
      const uIdx = db.data.users.findIndex(u => u._id === req.params.id)
      if (uIdx !== -1) {
        db.data.users[uIdx].password = hashedPassword
        db.data.users[uIdx].updatedAt = new Date()
      }
    }
    
    // Log activity
    await logActivity(
      req.user._id,
      req.user.name,
      'reset_password',
      'users',
      `Reset password for user: ${updatedUser.name}`,
      { userId: updatedUser._id }
    )
    
    res.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Suspend/Activate user
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await models.users.findOne({ _id: req.params.id }).lean()
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    const currentStatus = user.status || 'active'
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    
    await models.users.updateOne(
      { _id: req.params.id },
      { $set: { status: newStatus, updatedAt: new Date() } }
    )
    
    if (db.data.users) {
      const uIdx = db.data.users.findIndex(u => u._id === req.params.id)
      if (uIdx !== -1) {
        db.data.users[uIdx].status = newStatus
        db.data.users[uIdx].updatedAt = new Date()
      }
    }
    
    // Log activity
    await logActivity(
      req.user._id,
      req.user.name,
      'toggle_status',
      'users',
      `${newStatus === 'active' ? 'Activated' : 'Suspended'} user: ${user.name}`,
      { userId: user._id, newStatus }
    )
    
    // Send notification to user
    const notificationService = require('../services/notificationService')
    const actionMessage = newStatus === 'active' 
      ? 'Your account has been activated. You can now access the platform.'
      : 'Your account has been suspended. Please contact support for more information.'
    
    await notificationService.sendAdminActionNotification(
      user._id,
      user.name,
      user.email,
      newStatus,
      actionMessage
    )
    
    user.status = newStatus
    const { password, ...userWithoutPassword } = user
    res.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
