'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Upload, Video, FileText, Trash2, Copy, Search } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function AdminMedia() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
    fetchMedia()
  }, [user])

  const fetchMedia = async () => {
    try {
      const res = await api.get('/admin/media')
      setMedia(res.data.media || [])
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const files = e.target.files
    if (!files.length) return

    const formData = new FormData()
    for (let file of files) {
      formData.append('files', file)
    }

    try {
      await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      fetchMedia()
    } catch (error) {
      alert('Upload failed')
    }
  }

  const handleDelete = async (mediaId) => {
    if (!confirm('Delete this file?')) return
    try {
      await api.delete(`/admin/media/${mediaId}`)
      fetchMedia()
    } catch (error) {
      alert('Delete failed')
    }
  }

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url)
    alert('URL copied to clipboard!')
  }

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || item.type.startsWith(filterType)
    return matchesSearch && matchesType
  })

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
                  Media Library
                </h1>
                <p className="text-gray-400 mt-1">{media.length} files uploaded</p>
              </div>
            </div>
            <label className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer">
              <Upload className="h-4 w-4" />
              Upload Files
              <input type="file" multiple onChange={handleUpload} className="hidden" accept="image/*,video/*,application/pdf" />
            </label>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-3 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Files</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="application">Documents</option>
          </select>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
            >
              <div className="aspect-square bg-dark-200 flex items-center justify-center">
                {item.type.startsWith('image') ? (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                ) : item.type.startsWith('video') ? (
                  <Video className="h-16 w-16 text-gray-600" />
                ) : (
                  <FileText className="h-16 w-16 text-gray-600" />
                )}
              </div>
              <div className="p-4">
                <p className="text-white font-medium text-sm truncate mb-2">{item.name}</p>
                <p className="text-gray-400 text-xs mb-3">{(item.size / 1024).toFixed(2)} KB</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="flex-1 px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all text-xs flex items-center justify-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-xs"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMedia.length === 0 && (
          <div className="text-center py-20">
            <Upload className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No files found</p>
            <p className="text-gray-500 mt-2">Upload your first file to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
