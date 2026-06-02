'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Award, Plus, Download, Eye, Trash2, X } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { showSuccess, showError } from '@/components/ui/Toast'

const loadScript = (src) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => resolve()
    document.body.appendChild(script)
  })
}

export default function AdminCertificates() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const { isAdmin, loading: authLoading } = useAdminAuth()
  const [certificates, setCertificates] = useState([])
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [formData, setFormData] = useState({ userId: '', courseId: '' })
  const [viewCert, setViewCert] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!isAdmin) {
      router.replace('/auth/login?redirect=%2Fadmin%2Fcertificates')
      return
    }
    fetchAll()
  }, [user, isAdmin, authLoading, router])

  const fetchAll = async () => {
    try {
      const [certRes, userRes, courseRes] = await Promise.all([
        api.get('/admin/certificates'),
        api.get('/admin/users'),
        api.get('/admin/courses')
      ])
      setCertificates(certRes.data.certificates || [])
      setUsers(userRes.data.users || [])
      setCourses(courseRes.data.courses || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    try {
      await api.post('/admin/certificates/generate', formData)
      showSuccess('Certificate generated successfully')
      setShowModal(false)
      setFormData({ userId: '', courseId: '' })
      fetchAll()
    } catch (error) {
      showError(error.response?.data?.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (certId) => {
    if (!confirm('Delete this certificate?')) return
    try {
      await api.delete(`/admin/certificates/${certId}`)
      fetchAll()
    } catch (error) {
      showError('Delete failed')
    }
  }

  const handleDownload = async (cert, format = 'html') => {
    const certHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate - ${cert.certificateNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600&display=swap');
import { showSuccess, showError } from '@/components/ui/Toast'
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f8f5f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .cert { width: 800px; background: white; padding: 60px; border: 12px solid #c9a84c; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .cert::before { content: ''; position: absolute; inset: 8px; border: 2px solid #c9a84c; pointer-events: none; }
    .logo { text-align: center; margin-bottom: 20px; }
    .logo-text { font-size: 22px; font-weight: 700; color: #1a1a2e; letter-spacing: 3px; text-transform: uppercase; }
    .divider { width: 100px; height: 3px; background: linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c); margin: 16px auto; }
    .title { font-family: 'Playfair Display', serif; font-size: 42px; color: #1a1a2e; text-align: center; margin: 20px 0 8px; }
    .subtitle { text-align: center; color: #666; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 30px; }
    .certify-text { text-align: center; color: #555; font-size: 16px; margin-bottom: 12px; }
    .student-name { font-family: 'Playfair Display', serif; font-size: 48px; color: #c9a84c; text-align: center; margin: 16px 0; border-bottom: 2px solid #e8d5a3; padding-bottom: 12px; }
    .course-label { text-align: center; color: #555; font-size: 15px; margin: 16px 0 8px; }
    .course-name { font-family: 'Playfair Display', serif; font-size: 26px; color: #1a1a2e; text-align: center; margin-bottom: 30px; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e8d5a3; }
    .sig-block { text-align: center; }
    .sig-line { width: 160px; height: 1px; background: #333; margin-bottom: 6px; }
    .sig-label { font-size: 12px; color: #666; letter-spacing: 1px; }
    .cert-num { font-size: 11px; color: #999; font-family: monospace; }
    .seal { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #c9a84c, #f0d080); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: white; text-align: center; letter-spacing: 1px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="logo">
      <div class="logo-text">Beyond Classroom</div>
      <div style="font-size:12px;color:#999;letter-spacing:2px;margin-top:4px">Excellence in Mathematics Education</div>
    </div>
    <div class="divider"></div>
    <div class="title">Certificate of Completion</div>
    <div class="subtitle">This is to proudly certify that</div>
    <div class="student-name">${cert.user?.name || 'Student'}</div>
    <div class="course-label">has successfully completed the course</div>
    <div class="course-name">"${cert.course?.title || 'Course'}"</div>
    <div class="footer">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Director, Beyond Classroom</div>
        <div class="cert-num">Cert No: ${cert.certificateNumber}</div>
      </div>
      <div class="seal">BC<br>Certified</div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Date of Issue</div>
        <div class="cert-num">${new Date(cert.issuedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>
  </div>
</body>
</html>`

    if (format === 'html') {
      const blob = new Blob([certHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${cert.certificateNumber}.html`
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    try {
      setDownloading(true)
      await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js')
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js')

      const wrapper = document.createElement('div')
      wrapper.style.position = 'fixed'
      wrapper.style.left = '-99999px'
      wrapper.style.top = '0'
      wrapper.style.width = '900px'
      wrapper.style.background = '#ffffff'
      wrapper.innerHTML = certHtml
      document.body.appendChild(wrapper)

      const certEl = wrapper.querySelector('.cert')
      const canvas = await window.html2canvas(certEl, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const imageData = canvas.toDataURL('image/png')

      if (format === 'png') {
        const a = document.createElement('a')
        a.href = imageData
        a.download = `certificate-${cert.certificateNumber}.png`
        a.click()
      } else if (format === 'pdf') {
        const { jsPDF } = window.jspdf
        const pdf = new jsPDF('landscape', 'pt', 'a4')
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, pageHeight)
        pdf.save(`certificate-${cert.certificateNumber}.pdf`)
      }

      document.body.removeChild(wrapper)
    } catch (error) {
      showError('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin')} className="p-2 hover:bg-dark-200 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Certificate Management
                </h1>
                <p className="text-gray-400 mt-1">{certificates.length} certificates issued</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Generate Certificate
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Award className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-1">{cert.user?.name || 'Unknown'}</h3>
              <p className="text-gray-400 text-sm text-center mb-1">{cert.course?.title || 'Unknown Course'}</p>
              <p className="text-primary text-xs text-center font-mono mb-1">{cert.certificateNumber}</p>
              <p className="text-gray-500 text-xs text-center mb-4">
                {new Date(cert.issuedDate).toLocaleDateString('en-IN')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewCert(cert)}
                  className="flex-1 px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all text-sm flex items-center justify-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  onClick={() => handleDownload(cert, 'png')}
                  className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm flex items-center justify-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  PNG
                </button>
                <button
                  onClick={() => handleDownload(cert, 'pdf')}
                  className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm flex items-center justify-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </button>
                <button
                  onClick={() => handleDelete(cert._id)}
                  className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {certificates.length === 0 && (
          <div className="text-center py-20">
            <Award className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No certificates issued yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all"
            >
              Generate First Certificate
            </button>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-100 rounded-2xl border border-white/10 p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Generate Certificate</h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Select Student</label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">-- Select Student --</option>
                    {users.filter(u => u.role === 'user').map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Select Course</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-dark-200 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {generating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Certificate Modal */}
      <AnimatePresence>
        {viewCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setViewCert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl"
            >
              {/* Certificate Design */}
              <div className="relative p-10 bg-gradient-to-br from-amber-50 to-yellow-50" style={{ border: '12px solid #c9a84c' }}>
                <div className="absolute inset-2 border-2 border-amber-400/50 rounded pointer-events-none"></div>
                
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="text-2xl font-black text-gray-900 tracking-widest uppercase">Beyond Classroom</div>
                  <div className="text-xs text-gray-500 tracking-widest mt-1">Excellence in Mathematics Education</div>
                  <div className="w-24 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 mx-auto mt-3"></div>
                </div>

                {/* Title */}
                <div className="text-center mb-6">
                  <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Certificate of Completion</h1>
                  <p className="text-xs text-gray-500 tracking-[4px] uppercase">This is to proudly certify that</p>
                </div>

                {/* Student Name */}
                <div className="text-center mb-6 pb-4 border-b-2 border-amber-300">
                  <p className="text-5xl font-serif text-amber-600">{viewCert.user?.name}</p>
                </div>

                {/* Course */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 text-sm mb-2">has successfully completed the course</p>
                  <p className="text-2xl font-serif font-bold text-gray-900">"{viewCert.course?.title}"</p>
                </div>

                {/* Footer */}
                <div className="flex items-end justify-between pt-4 border-t border-amber-200">
                  <div className="text-center">
                    <div className="w-36 h-px bg-gray-400 mb-1"></div>
                    <p className="text-xs text-gray-500 tracking-wider">Director, Beyond Classroom</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{viewCert.certificateNumber}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="w-36 h-px bg-gray-400 mb-1"></div>
                    <p className="text-xs text-gray-500 tracking-wider">Date of Issue</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(viewCert.issuedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 flex gap-3 justify-end">
                <button onClick={() => setViewCert(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all">Close</button>
                <button
                  onClick={() => handleDownload(viewCert, 'html')}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 font-medium"
                >
                  <Download className="h-4 w-4" />
                  Download HTML
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
