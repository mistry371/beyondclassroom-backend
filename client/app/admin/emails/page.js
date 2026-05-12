'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Mail, Send, Eye, X, CheckCircle, AlertCircle, Users, RefreshCw } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

const TEMPLATES = [
  {
    _id: '1', name: 'Welcome Email', trigger: 'On Registration',
    description: 'Sent automatically when a new user registers',
    subject: 'Welcome to Beyond Classroom! 🎉',
    preview: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#22d3ee,#a855f7);padding:40px;text-align:center">
        <h1 style="color:white;margin:0;font-size:28px">Welcome to Beyond Classroom</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">Excellence in Mathematics Education</p>
      </div>
      <div style="padding:40px;background:#fff">
        <h2 style="color:#1f2937">Welcome, [Student Name]! 🎉</h2>
        <p style="color:#4b5563;line-height:1.6">We're thrilled to have you join our community! Start your mathematics journey today.</p>
        <div style="background:#f0f9ff;border-radius:12px;padding:24px;margin:24px 0">
          <h3 style="color:#1f2937;margin:0 0 16px">🚀 Get Started:</h3>
          <p style="color:#4b5563;margin:8px 0">✅ Explore 40+ comprehensive courses</p>
          <p style="color:#4b5563;margin:8px 0">✅ Try 40 interactive math tools</p>
          <p style="color:#4b5563;margin:8px 0">✅ Track your learning progress</p>
        </div>
        <div style="text-align:center;margin:32px 0">
          <a href="#" style="background:linear-gradient(135deg,#22d3ee,#a855f7);color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600">Go to Dashboard →</a>
        </div>
      </div>
      <div style="background:#1f2937;padding:24px;text-align:center">
        <p style="color:#9ca3af;margin:0;font-size:14px">© 2026 Beyond Classroom. All rights reserved.</p>
      </div>
    </div>`
  },
  {
    _id: '2', name: 'Course Enrollment', trigger: 'On Enrollment',
    description: 'Sent when a user enrolls in a course',
    subject: 'Enrollment Confirmed: [Course Name] 📚',
    preview: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#22d3ee,#a855f7);padding:40px;text-align:center">
        <h1 style="color:white;margin:0;font-size:28px">Enrollment Successful!</h1>
      </div>
      <div style="padding:40px;background:#fff">
        <div style="text-align:center;margin-bottom:24px">
          <div style="display:inline-block;background:#10b981;color:white;width:64px;height:64px;border-radius:50%;line-height:64px;font-size:32px">✓</div>
        </div>
        <h2 style="color:#1f2937;text-align:center">Congratulations, [Student Name]!</h2>
        <p style="color:#4b5563;text-align:center">You've successfully enrolled in:</p>
        <div style="background:#f0f9ff;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
          <h3 style="color:#1f2937;font-size:22px">[Course Name]</h3>
          <p style="color:#a855f7;font-size:18px">₹[Price]</p>
        </div>
        <ul style="color:#4b5563;line-height:2">
          <li>Lifetime access to course content</li>
          <li>Interactive practice exercises</li>
          <li>Certificate of completion</li>
        </ul>
        <div style="text-align:center;margin:32px 0">
          <a href="#" style="background:linear-gradient(135deg,#22d3ee,#a855f7);color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600">Start Learning Now →</a>
        </div>
      </div>
      <div style="background:#1f2937;padding:24px;text-align:center">
        <p style="color:#9ca3af;margin:0;font-size:14px">© 2026 Beyond Classroom. All rights reserved.</p>
      </div>
    </div>`
  },
  {
    _id: '3', name: 'OTP Verification', trigger: 'On Login/Register',
    description: 'Sent when user requests OTP for login or registration',
    subject: 'Your OTP Code - Beyond Classroom 🔐',
    preview: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#22d3ee,#a855f7);padding:40px;text-align:center">
        <h1 style="color:white;margin:0;font-size:28px">Verify Your Identity</h1>
      </div>
      <div style="padding:40px;background:#fff">
        <h2 style="color:#1f2937">Hello [User Name]! 👋</h2>
        <p style="color:#4b5563;line-height:1.6">Your one-time password for verification:</p>
        <div style="background:#f0f9ff;border:3px dashed #22d3ee;border-radius:12px;padding:32px;text-align:center;margin:24px 0">
          <p style="color:#6b7280;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:2px">Your OTP Code</p>
          <h1 style="color:#22d3ee;font-size:52px;margin:0;letter-spacing:12px;font-weight:700">123456</h1>
          <p style="color:#6b7280;margin:8px 0 0;font-size:14px">Valid for 10 minutes</p>
        </div>
        <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:4px">
          <p style="color:#92400e;margin:0;font-size:14px"><strong>⚠️ Never share your OTP with anyone.</strong></p>
        </div>
      </div>
      <div style="background:#1f2937;padding:24px;text-align:center">
        <p style="color:#9ca3af;margin:0;font-size:14px">© 2026 Beyond Classroom. All rights reserved.</p>
      </div>
    </div>`
  },
  {
    _id: '4', name: 'Password Reset', trigger: 'On Password Reset Request',
    description: 'Sent when user requests a password reset',
    subject: 'Reset Your Password 🔑',
    preview: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#22d3ee,#a855f7);padding:40px;text-align:center">
        <h1 style="color:white;margin:0;font-size:28px">Password Reset Request</h1>
      </div>
      <div style="padding:40px;background:#fff">
        <h2 style="color:#1f2937">Hi [User Name],</h2>
        <p style="color:#4b5563;line-height:1.6">We received a request to reset your password. Click the button below:</p>
        <div style="text-align:center;margin:32px 0">
          <a href="#" style="background:linear-gradient(135deg,#22d3ee,#a855f7);color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600">Reset Password →</a>
        </div>
        <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:4px">
          <p style="color:#92400e;margin:0;font-size:14px"><strong>⏰ This link expires in 1 hour.</strong> If you didn't request this, ignore this email.</p>
        </div>
      </div>
      <div style="background:#1f2937;padding:24px;text-align:center">
        <p style="color:#9ca3af;margin:0;font-size:14px">© 2026 Beyond Classroom. All rights reserved.</p>
      </div>
    </div>`
  },
  {
    _id: '5', name: 'Quiz Results', trigger: 'On Quiz Completion',
    description: 'Sent after a student completes a quiz',
    subject: 'Your Quiz Results Are In! 🏆',
    preview: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#22d3ee,#a855f7);padding:40px;text-align:center">
        <h1 style="color:white;margin:0;font-size:28px">Quiz Results</h1>
      </div>
      <div style="padding:40px;background:#fff">
        <h2 style="color:#1f2937">Great effort, [Student Name]! 🎯</h2>
        <div style="background:#f0f9ff;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
          <p style="color:#6b7280;margin:0 0 8px;font-size:14px">Your Score</p>
          <h1 style="color:#22d3ee;font-size:56px;margin:0;font-weight:700">85%</h1>
          <p style="color:#10b981;font-weight:600">Excellent!</p>
        </div>
        <div style="display:flex;gap:16px;margin:24px 0">
          <div style="flex:1;background:#ecfdf5;border-radius:8px;padding:16px;text-align:center">
            <p style="color:#065f46;font-size:24px;font-weight:700;margin:0">17/20</p>
            <p style="color:#6b7280;font-size:12px;margin:4px 0 0">Correct Answers</p>
          </div>
          <div style="flex:1;background:#fef3c7;border-radius:8px;padding:16px;text-align:center">
            <p style="color:#92400e;font-size:24px;font-weight:700;margin:0">3/20</p>
            <p style="color:#6b7280;font-size:12px;margin:4px 0 0">Incorrect</p>
          </div>
        </div>
      </div>
      <div style="background:#1f2937;padding:24px;text-align:center">
        <p style="color:#9ca3af;margin:0;font-size:14px">© 2026 Beyond Classroom. All rights reserved.</p>
      </div>
    </div>`
  },
  {
    _id: '6', name: 'Certificate Issued', trigger: 'On Course Completion',
    description: 'Sent when a certificate is issued to a student',
    subject: 'Your Certificate is Ready! 🎓',
    preview: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#22d3ee,#a855f7);padding:40px;text-align:center">
        <h1 style="color:white;margin:0;font-size:28px">Certificate of Completion</h1>
      </div>
      <div style="padding:40px;background:#fff">
        <div style="border:2px solid #22d3ee;border-radius:12px;padding:32px;text-align:center;margin:24px 0">
          <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:2px">This certifies that</p>
          <h2 style="color:#1f2937;font-size:28px">[Student Name]</h2>
          <p style="color:#6b7280">has successfully completed</p>
          <h3 style="color:#a855f7;font-size:22px">[Course Name]</h3>
          <p style="color:#6b7280;font-size:12px">Certificate No: CERT-2026-001</p>
        </div>
        <div style="text-align:center;margin:32px 0">
          <a href="#" style="background:linear-gradient(135deg,#22d3ee,#a855f7);color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600">Download Certificate →</a>
        </div>
      </div>
      <div style="background:#1f2937;padding:24px;text-align:center">
        <p style="color:#9ca3af;margin:0;font-size:14px">© 2026 Beyond Classroom. All rights reserved.</p>
      </div>
    </div>`
  },
  {
    _id: '7', name: 'Course Expiry Reminder', trigger: '7 Days Before Expiry',
    description: 'Sent 7 days before course access expires',
    subject: 'Your Course Access Expires Soon ⏰',
    preview: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:40px;text-align:center">
        <h1 style="color:white;margin:0;font-size:28px">Course Expiring Soon!</h1>
      </div>
      <div style="padding:40px;background:#fff">
        <h2 style="color:#1f2937">Hi [Student Name],</h2>
        <p style="color:#4b5563;line-height:1.6">Your access to <strong>[Course Name]</strong> will expire in <strong>7 days</strong>.</p>
        <div style="background:#fef3c7;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
          <p style="color:#92400e;font-size:32px;font-weight:700;margin:0">7 Days Left</p>
        </div>
        <div style="text-align:center;margin:32px 0">
          <a href="#" style="background:linear-gradient(135deg,#f59e0b,#ef4444);color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600">Continue Learning →</a>
        </div>
      </div>
      <div style="background:#1f2937;padding:24px;text-align:center">
        <p style="color:#9ca3af;margin:0;font-size:14px">© 2026 Beyond Classroom. All rights reserved.</p>
      </div>
    </div>`
  },
  {
    _id: '8', name: 'New Login Alert', trigger: 'On New Device Login',
    description: 'Security alert when login from new device detected',
    subject: 'New Login Detected on Your Account 🔐',
    preview: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:40px;text-align:center">
        <h1 style="color:white;margin:0;font-size:28px">🔐 New Login Detected</h1>
      </div>
      <div style="padding:40px;background:#fff">
        <h2 style="color:#1f2937">Hi [User Name],</h2>
        <p style="color:#4b5563">A new login was detected on your account.</p>
        <div style="background:#f9fafb;border:2px solid #e5e7eb;border-radius:8px;padding:24px;margin:24px 0">
          <p style="color:#6b7280;margin:8px 0"><strong>Device:</strong> Chrome on Windows</p>
          <p style="color:#6b7280;margin:8px 0"><strong>Location:</strong> India</p>
          <p style="color:#6b7280;margin:8px 0"><strong>Time:</strong> [Login Time]</p>
        </div>
        <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;border-radius:4px">
          <p style="color:#991b1b;margin:0"><strong>⚠️ Wasn't you?</strong> Secure your account immediately.</p>
        </div>
      </div>
      <div style="background:#1f2937;padding:24px;text-align:center">
        <p style="color:#9ca3af;margin:0;font-size:14px">© 2026 Beyond Classroom. All rights reserved.</p>
      </div>
    </div>`
  },
]

export default function AdminEmails() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('templates')
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [sendModal, setSendModal] = useState(null)
  const [sendData, setSendData] = useState({ to: '', subject: '' })
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) { router.push('/'); return }
    fetchEmails()
  }, [user])

  const fetchEmails = async () => {
    try {
      const res = await api.get('/admin/emails/logs')
      setEmails(res.data.emails || [])
    } catch (error) {
      console.error('Failed to fetch emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async (e) => {
    e.preventDefault()
    setSending(true)
    setSendResult(null)
    try {
      await api.post('/admin/emails/send', {
        templateId: sendModal._id,
        to: sendData.to,
        subject: sendData.subject || sendModal.subject
      })
      setSendResult({ success: true, message: 'Email sent successfully!' })
      setTimeout(() => { setSendModal(null); setSendResult(null); setSendData({ to: '', subject: '' }) }, 2000)
      fetchEmails()
    } catch (error) {
      setSendResult({ success: false, message: error.response?.data?.message || 'Failed to send email' })
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark">
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin')} className="p-2 hover:bg-dark-200 rounded-lg transition-all">
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Email Management</h1>
              <p className="text-gray-400 mt-1">{TEMPLATES.length} templates • {emails.length} emails sent</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-3 mb-6">
          {['templates', 'logs'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg font-medium transition-all capitalize ${activeTab === tab ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'bg-dark-100 text-gray-400 hover:bg-dark-200'}`}
            >
              {tab === 'templates' ? `Templates (${TEMPLATES.length})` : `Email Logs (${emails.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((template, index) => (
              <motion.div key={template._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.04 }}
                className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-primary/20 rounded-lg"><Mail className="h-5 w-5 text-primary" /></div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">{template.trigger}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{template.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{template.description}</p>
                <p className="text-gray-500 text-xs mb-4 truncate">Subject: {template.subject}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPreviewTemplate(template)}
                    className="flex-1 px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all text-sm flex items-center justify-center gap-1"
                  >
                    <Eye className="h-4 w-4" /> Preview
                  </button>
                  <button onClick={() => { setSendModal(template); setSendData({ to: '', subject: template.subject }) }}
                    className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm flex items-center justify-center gap-1"
                  >
                    <Send className="h-4 w-4" /> Send
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-3">
            <div className="flex justify-end mb-4">
              <button onClick={fetchEmails} className="flex items-center gap-2 px-4 py-2 bg-dark-100 text-gray-400 rounded-lg hover:bg-dark-200 transition-all text-sm">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
            {emails.length === 0 ? (
              <div className="text-center py-20">
                <Mail className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-xl">No emails sent yet</p>
              </div>
            ) : emails.map((email, index) => (
              <motion.div key={email._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-xl border border-white/10 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${email.status === 'sent' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {email.status === 'sent' ? <CheckCircle className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
                    </div>
                    <div>
                      <p className="text-white font-medium">{email.subject}</p>
                      <p className="text-gray-400 text-sm">To: {email.to}</p>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs">{new Date(email.sentAt).toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div>
                  <h3 className="font-bold text-gray-900">{previewTemplate.name}</h3>
                  <p className="text-sm text-gray-500">Subject: {previewTemplate.subject}</p>
                </div>
                <button onClick={() => setPreviewTemplate(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-all">
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                <iframe srcDoc={previewTemplate.preview} className="w-full min-h-[500px] border-0" title="Email Preview" />
              </div>
              <div className="p-4 border-t bg-gray-50 flex gap-3">
                <button onClick={() => { setPreviewTemplate(null); setSendModal(previewTemplate); setSendData({ to: '', subject: previewTemplate.subject }) }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" /> Send This Template
                </button>
                <button onClick={() => setPreviewTemplate(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Modal */}
      <AnimatePresence>
        {sendModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSendModal(null)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-dark-100 rounded-2xl border border-white/10 p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Send: {sendModal.name}</h2>
                <button onClick={() => setSendModal(null)} className="p-2 hover:bg-dark-200 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
              </div>
              {sendResult ? (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${sendResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {sendResult.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                  {sendResult.message}
                </div>
              ) : (
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Recipient Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input type="email" value={sendData.to} onChange={e => setSendData({ ...sendData, to: e.target.value })} required
                        placeholder="student@example.com"
                        className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Subject</label>
                    <input type="text" value={sendData.subject} onChange={e => setSendData({ ...sendData, subject: e.target.value })} required
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setSendModal(null)} className="flex-1 px-4 py-2 bg-dark-200 text-white rounded-lg hover:bg-gray-600 transition-all">Cancel</button>
                    <button type="submit" disabled={sending}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {sending ? <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>Sending...</> : <><Send className="h-4 w-4" />Send Email</>}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
