'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BookOpen, Clock, Filter, Search, SlidersHorizontal, Star, Users } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import { cachedGet } from '@/utils/api'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { COURSE_CATEGORIES } from '@/lib/constants'
import CourseCardSkeleton from '@/components/ui/CourseCardSkeleton'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    cachedGet('/courses', 120000)
      .then((response) => setCourses(response.data.courses || []))
      .catch((error) => console.error('Fetch courses failed:', error))
      .finally(() => setLoading(false))
  }, [])

  const filteredCourses = useMemo(() => courses.filter((course) => {
    const matchesFilter = filter === 'all' || course.difficulty === filter
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter
    const title = course.title || ''
    const description = course.description || ''
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesCategory && matchesSearch
  }), [courses, filter, categoryFilter, searchQuery])

  return (
    <div className="min-h-screen bg-academic pb-20 md:pb-0">
      <Navbar />

      <section className="relative overflow-hidden premium-section">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm">
              <BookOpen className="h-4 w-4" /> Courses
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-navy sm:text-6xl">
              Structured courses with premium previews and personalized paths.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
              Explore Mathematics and French courses from foundation to competitive excellence. Search, filter, preview, and start with the path that fits.
            </p>
          </motion.div>

          <div className="mt-9 rounded-3xl border border-primary/10 bg-white p-4 shadow-premium">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search courses, topics, or subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-primary/10 bg-academic py-4 pl-12 pr-4 text-ink outline-none transition focus:border-primary"
                />
              </label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-2xl border border-primary/10 bg-academic px-4 py-4 font-semibold text-ink outline-none focus:border-primary">
                {['all', ...COURSE_CATEGORIES].map((cat) => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'All Subjects' : cat}</option>
                ))}
              </select>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-2xl border border-primary/10 bg-academic px-4 py-4 font-semibold text-ink outline-none focus:border-primary">
                {['all', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <option key={level} value={level}>{level === 'all' ? 'All Levels' : level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
            <p className="mt-2 text-muted">Try a different search or filter.</p>
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
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{course.category}</span>
                    <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">{course.difficulty || 'Beginner'}</span>
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
                      <p className="text-xs font-bold uppercase tracking-wide text-muted">Starts at</p>
                      <p className="text-2xl font-black text-primary">₹{course.price || 1}</p>
                    </div>
                    <Link href={`/courses/${course._id}`} className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95">
                      View <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center text-white shadow-premium sm:p-12">
          <h2 className="text-3xl font-black sm:text-4xl">Need a custom course combination?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/85">Students can request selected modules, topics, subtopics, worksheets, and question-paper customizations from their dashboard.</p>
          <Link href="/dashboard/custom-requests" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-primary shadow-sm">
            Request Customization <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingShell />
    </div>
  )
}
