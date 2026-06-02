'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-academic flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <div className="w-24 h-24 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-premium">
          <BookOpen className="h-12 w-12 text-white" />
        </div>

        <h1 className="text-8xl font-black text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold text-navy mb-4">Page Not Found</h2>
        <p className="text-muted text-lg mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-gradient text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-premium"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary/20 text-primary rounded-2xl font-bold hover:bg-primary/5 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            Browse Courses
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
