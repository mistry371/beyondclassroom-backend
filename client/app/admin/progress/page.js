'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, TrendingUp, Search, Download } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function AdminProgress() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [progress, setProgress] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')

  useEffect(() => {
    fetchAll()
  }, [user])

  const fetchAll = async () => {
    try {
      const [progressRes, courseRes] = await Promise.all([
        api.get('/admin/progress'),
        api.get('/admin/courses')
      ])
      setProgress(progressRes.data.progress || [])
      setCourses(courseRes.data.courses || [])
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProgress = progress.filter(p => {
    const matchesSearch =
      (p.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.course?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = courseFilter === 'all' || p.course?._id === courseFilter
    return matchesSearch && matchesCourse
  })

  const exportCSV = () => {
    const rows = filteredProgress.map(p => [
      p.user?.name || 'Unknown',
      p.user?.email || '',
      p.course?.title || 'Unknown',
      `${p.completionPercentage || 0}%`,
      p.lessonsCompleted?.length || 0,
      p.quizzesCompleted?.length || 0,
      p.quizScores?.length > 0
        ? Math.round(p.quizScores.reduce((s, q) => s + (q.score || 0), 0) / p.quizScores.length) + '%'
        : '0%'
    ])
    const csv = ['Student,Email,Course,Completion,Lessons,Quizzes,Avg Score', ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student-progress.csv'
    a.click()
    URL.revokeObjectURL(url)
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
                  Progress Tracking
                </h1>
                <p className="text-gray-400 mt-1">{filteredProgress.length} records</p>
              </div>
            </div>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student or course..."
              className="w-full pl-10 pr-4 py-3 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-4 py-3 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary min-w-[200px]"
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {filteredProgress.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{item.user?.name}</h3>
                  <p className="text-gray-400 text-sm">{item.user?.email}</p>
                  <p className="text-primary text-sm mt-1">{item.course?.title}</p>
                </div>
                <span className="text-2xl font-bold text-primary">{item.completionPercentage || 0}%</span>
              </div>

              <div className="w-full bg-dark-200 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all"
                  style={{ width: `${item.completionPercentage || 0}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Lessons Completed</p>
                  <p className="text-white font-bold">{item.lessonsCompleted?.length || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400">Quizzes Passed</p>
                  <p className="text-white font-bold">{item.quizzesCompleted?.length || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400">Avg. Score</p>
                  <p className="text-white font-bold">
                    {item.quizScores?.length > 0
                      ? Math.round(item.quizScores.reduce((sum, s) => sum + (s.score || 0), 0) / item.quizScores.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProgress.length === 0 && (
          <div className="text-center py-20">
            <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No progress data found</p>
          </div>
        )}
      </div>
    </div>
  )
}
