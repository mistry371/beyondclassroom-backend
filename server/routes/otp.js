const express = require('express')
const router = express.Router()
const { createAndSendOTP, verifyOTP } = require('../services/otpService')

// Send OTP
router.post('/send', async (req, res) => {
  try {
    const { email, purpose } = req.body
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }
    
    const result = await createAndSendOTP(email, purpose || 'registration')
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { email, otp, purpose } = req.body
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' })
    }
    
    const result = await verifyOTP(email, otp, purpose || 'registration')
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
