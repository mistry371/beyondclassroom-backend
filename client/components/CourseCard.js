'use client'

import { motion } from 'framer-motion'
import { Clock, Users, Star, ShoppingCart } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'
import { addToCart } from '@/store/slices/cartSlice'

export default function CourseCard({ course }) {
  const dispatch = useDispatch()
  const router = useRouter()

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    try {
      await api.post('/cart', { courseId: course._id })
      dispatch(addToCart(course))
    } catch (error) {
      console.error('Add to cart failed:', error)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)' }}
      className="bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer"
      onClick={() => router.push(`/courses/${course._id}`)}
    >
      <div className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <span className="text-white text-4xl font-bold">{course.title.charAt(0)}</span>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary bg-indigo-50 px-3 py-1 rounded-full">
            {course.difficulty}
          </span>
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="ml-1 text-sm">{course.rating || 4.5}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{course.enrolledCount || 0}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  )
}
