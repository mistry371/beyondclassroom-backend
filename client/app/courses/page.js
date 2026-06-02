'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BookOpen, Clock, Filter, Search, SlidersHorizontal, Star, Users, Lock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import { cachedGet } from '@/utils/api'
import { motion } from 'framer-motion'
import Link from 'next/link'
import CourseCardSkeleton from '@/components/ui/CourseCardSkeleton'
import { CLASS_GRADES } from '@/lib/constants'
import { useSelector } from 'react-redux'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [gradeFilter, setGradeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    cachedGet('/courses', 120000)
      .then((response) => setCourses(response.data.courses || []))
      .catch((error) => console.error('Fetch courses failed:', error))
      .finally(() => setLoading(false))
  }, [])

  const filteredCourses = useMemo(() => courses.filter((course) => {
    const matchesGrade = gradeFilter === 'all' || (course.grade && course.grade === gradeFilter) || (course.title && course.title.toLowerCase().includes(gradeFilter.toLowerCase()))
    const title = course.title || ''
    const description = course.description || ''
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesGrade && matchesSearch
  }), [courses, gradeFilter, searchQuery])

  return (
    <div className="min-h-screen bg-academic pb-20 md:pb-0">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden premium-section">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm">
              <BookOpen className="h-4 w-4" /> Course & Content
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-navy sm:text-6xl">
              Structured Mathematics content for Class 1 to Class 8.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
              Browse curriculum-aligned Mathematics courses organized by class. Preview content freely — login required only for purchases, downloads, and progress tracking.
            </p>
          </motion.div>

          {/* Class Grade Filter Tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              onClick={() => setGradeFilter('all')}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all border ${gradeFilter === 'all' ? 'bg-brand-gradient text-white border-transparent shadow-sm' : 'bg-white text-ink border-primary/10 hover:border-primary/30'}`}
            >
              All Classes
            </button>
            {CLASS_GRADES.map((grade) => (
              <button
                key={grade}
                onClick={() => setGradeFilter(grade)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all border ${gradeFilter === grade ? 'bg-brand-gradient text-white border-transparent shadow-sm' : 'bg-white text-ink border-primary/10 hover:border-primary/30'}`}
              >
                {grade}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mt-6 rounded-3xl border border-primary/10 bg-white p-4 shadow-premium max-w-2xl">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search courses, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-primary/10 bg-academic py-4 pl-12 pr-4 text-ink outline-none transition focus:border-primary"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Course Hierarchy Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted font-medium">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">Class</span>
          <ArrowRight className="h-4 w-4" />
          <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full">Package</span>
          <ArrowRight className="h-4 w-4" />
          <span className="px-3 py-1 bg-accent/10 text-accent rounded-full">Module</span>
          <ArrowRight className="h-4 w-4" />
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">Topic</span>
          <ArrowRight className="h-4 w-4" />
          <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full">Subtopic</span>
          <span className="ml-4 text-xs text-muted flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" /> Login required for purchases, downloads & progress
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-black text-navy">Course Library</p>
              <p className="text-sm text-muted">Showing {loading ? '...' : filteredCourses.length} courses</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-4 py-2 text-sm font-semibold text-muted shadow-sm">
            <Filter className="h-4 w-4 text-secondary" /> Live filters applied instantly
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-3xl border border-primary/10 bg-white py-20 text-center shadow-premium">
            <BookOpen className="mx-auto mb-4 h-14 w-14 text-primary/50" />
            <p className="text-xl font-bold text-ink">No courses found</p>
            <p className="mt-2 text-muted">Try a different class or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, index) => (
              <motion.article
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-premium transition hover:-translate-y-1"
              >
                <div className="h-2 bg-brand-gradient" />
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{course.category || 'Mathematics'}</span>
                    {course.grade && (
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">{course.grade}</span>
                    )}
                  </div>

                  <h3 className="line-clamp-2 text-xl font-black text-navy transition group-hover:text-primary">{course.title}</h3>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-muted">{course.description}</p>

                  <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-academic p-3 text-center">
                    <span className="text-xs font-semibold text-muted"><Users className="mx-auto mb-1 h-4 w-4 text-primary" />{course.enrolledCount || 0}</span>
                    <span className="text-xs font-semibold text-muted"><Clock className="mx-auto mb-1 h-4 w-4 text-secondary" />{course.duration || 'Self-paced'}</span>
                    <span className="text-xs font-semibold text-muted"><Star className="mx-auto mb-1 h-4 w-4 fill-accent text-accent" />{course.rating || 4.8}</span>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-primary/10 pt-5">
                    <div>
                      {course.isFree || course.isDemo ? (
                        <p className="text-2xl font-black text-secondary">FREE</p>
                      ) : (
                        <>
                          <p className="text-xs font-bold uppercase tracking-wide text-muted">Starts at</p>
                          <p className="text-2xl font-black text-primary">₹{course.price || 1}</p>
                        </>
                      )}
                    </div>
                    <Link href={`/courses/${course._id}`} className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95">
                      Preview <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      <MarketingShell />
    </div>
  )
}
