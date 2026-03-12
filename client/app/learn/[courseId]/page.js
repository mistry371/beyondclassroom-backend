'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { BookOpen, CheckCircle, PlayCircle, FileText, Lock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function LearnPage() {
  const params = useParams()
  const [course, setCourse] = useState(null)
  const [activeModule, setActiveModule] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourse()
  }, [params.courseId])

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/${params.courseId}`)
      setCourse(response.data.course)
    } catch (error) {
      console.error('Fetch course failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!course) return null

  const module = course.content?.[activeModule]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-4 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Course Content</h2>
              <div className="space-y-2">
                {course.content?.map((mod, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveModule(index)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeModule === index
                        ? 'bg-primary text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {mod.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{mod.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {module && (
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{module.title}</h1>
                <p className="text-gray-600 mb-6">{module.description}</p>

                {module.videoUrl && (
                  <div className="mb-6 bg-dark rounded-lg aspect-video flex items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-white" />
                  </div>
                )}

                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: module.content }} />
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t">
                  <button
                    onClick={() => setActiveModule(Math.max(0, activeModule - 1))}
                    disabled={activeModule === 0}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setActiveModule(Math.min(course.content.length - 1, activeModule + 1))}
                    disabled={activeModule === course.content.length - 1}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
