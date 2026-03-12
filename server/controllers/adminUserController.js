const { db } = require('../database/db')
const bcrypt = require('bcryptjs')
const { logActivity } = require('./adminController')

// Get all users with pagination and filters
exports.getAllUsers = async (req, res) => {
  try {
    await db.read()
    const { page = 1, limit = 20, search, role, status } = req.query
    
    let users = db.data.users || []
    
    // Apply filters
    if (search) {
      users = users.filter(u => 
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    if (role) {
      users = users.filter(u => u.role === role)
    }
    
    if (status) {
      users = users.filter(u => u.status === status)
    }
    
    // Pagination
    const startIndex = (page - 1) * limit
    const paginatedUsers = users.slice(startIndex, startIndex + parseInt(limit))
    
    // Remove passwords
    const safeUsers = paginatedUsers.map(u => {
      const { password, ...userWithoutPassword } = u
      return userWithoutPassword
    })
    
    res.json({
      success: true,
      users: safeUsers,
      total: users.length,
      page: parseInt(page),
      totalPages: Math.ceil(users.length / limit)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get single user
exports.getUser = async (req, res) => {
  try {
    await db.read()
    const user = db.data.users?.find(u => u._id === req.params.id)
    
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
    await db.read()
    
    const { name, email, password, role = 'user', status = 'active' } = req.body
    
    // Check if user exists
    const existingUser = db.data.users?.find(u => u.email === email)
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
    
    db.data.users = db.data.users || []
    db.data.users.push(newUser)
    await db.write()
    
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
    await db.read()
    
    const userIndex = db.data.users?.findIndex(u => u._id === req.params.id)
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    const { name, email, role, status, profilePhoto } = req.body
    
    const updatedUser = {
      ...db.data.users[userIndex],
      name: name || db.data.users[userIndex].name,
      email: email || db.data.users[userIndex].email,
      role: role || db.data.users[userIndex].role,
      status: status || db.data.users[userIndex].status,
      profilePhoto: profilePhoto !== undefined ? profilePhoto : db.data.users[userIndex].profilePhoto,
      updatedAt: new Date()
    }
    
    db.data.users[userIndex] = updatedUser
    await db.write()
    
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
    await db.read()
    
    const user = db.data.users?.find(u => u._id === req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    db.data.users = db.data.users.filter(u => u._id !== req.params.id)
    await db.write()
    
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
    await db.read()
    
    const { newPassword } = req.body
    const userIndex = db.data.users?.findIndex(u => u._id === req.params.id)
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    db.data.users[userIndex].password = hashedPassword
    db.data.users[userIndex].updatedAt = new Date()
    
    await db.write()
    
    // Log activity
    await logActivity(
      req.user._id,
      req.user.name,
      'reset_password',
      'users',
      `Reset password for user: ${db.data.users[userIndex].name}`,
      { userId: db.data.users[userIndex]._id }
    )
    
    res.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Suspend/Activate user
exports.toggleUserStatus = async (req, res) => {
  try {
    await db.read()
    
    const userIndex = db.data.users?.findIndex(u => u._id === req.params.id)
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    const currentStatus = db.data.users[userIndex].status || 'active'
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    
    db.data.users[userIndex].status = newStatus
    db.data.users[userIndex].updatedAt = new Date()
    
    await db.write()
    
    // Log activity
    await logActivity(
      req.user._id,
      req.user.name,
      'toggle_status',
      'users',
      `${newStatus === 'active' ? 'Activated' : 'Suspended'} user: ${db.data.users[userIndex].name}`,
      { userId: db.data.users[userIndex]._id, newStatus }
    )
    
    // Send notification to user
    const notificationService = require('../services/notificationService')
    const actionMessage = newStatus === 'active' 
      ? 'Your account has been activated. You can now access the platform.'
      : 'Your account has been suspended. Please contact support for more information.'
    
    await notificationService.sendAdminActionNotification(
      db.data.users[userIndex]._id,
      db.data.users[userIndex].name,
      db.data.users[userIndex].email,
      newStatus,
      actionMessage
    )
    
    const { password, ...userWithoutPassword } = db.data.users[userIndex]
    res.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
