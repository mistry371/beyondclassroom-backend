'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, FileText, Save } from 'lucide-react'
import api from '@/utils/api'
import { showSuccess, showError } from '@/components/ui/Toast'

export default function AdminContent() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [content, setContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    aboutText: '',
    contactEmail: '',
    footerText: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [user])

  const fetchContent = async () => {
    try {
      const res = await api.get('/admin/content')
      setContent(res.data.content || content)
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await api.put('/admin/content', content)
      showSuccess('Content updated successfully')
    } catch (error) {
      showError('Update failed')
    }
  }

  if (loading) {
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
                  Content Management
                </h1>
                <p className="text-gray-400 mt-1">Manage website content</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Hero Title</label>
            <input
              type="text"
              value={content.heroTitle}
              onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
              className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Hero Subtitle</label>
            <input
              type="text"
              value={content.heroSubtitle}
              onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
              className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">About Text</label>
            <textarea
              value={content.aboutText}
              onChange={(e) => setContent({ ...content, aboutText: e.target.value })}
              className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
              rows="6"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Contact Email</label>
            <input
              type="email"
              value={content.contactEmail}
              onChange={(e) => setContent({ ...content, contactEmail: e.target.value })}
              className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Footer Text</label>
            <input
              type="text"
              value={content.footerText}
              onChange={(e) => setContent({ ...content, footerText: e.target.value })}
              className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
