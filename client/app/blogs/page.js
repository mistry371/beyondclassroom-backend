'use client'

import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowRight, Search } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const blogs = [
    {
      id: 1,
      title: 'Understanding Calculus: A Beginner\'s Guide',
      excerpt: 'Learn the fundamentals of calculus and how it applies to real-world problems...',
      author: 'Dr. Sarah Johnson',
      date: '2024-03-15',
      category: 'Calculus',
      image: '/blog1.jpg',
    },
    {
      id: 2,
      title: 'Linear Algebra in Machine Learning',
      excerpt: 'Discover how linear algebra powers modern AI and machine learning algorithms...',
      author: 'Prof. Michael Chen',
      date: '2024-03-12',
      category: 'Linear Algebra',
      image: '/blog2.jpg',
    },
    {
      id: 3,
      title: 'The Beauty of Abstract Algebra',
      excerpt: 'Explore the elegant world of groups, rings, and fields in abstract algebra...',
      author: 'Dr. Emily Rodriguez',
      date: '2024-03-10',
      category: 'Abstract Algebra',
      image: '/blog3.jpg',
    },
    {
      id: 4,
      title: 'Real Analysis: Building Mathematical Rigor',
      excerpt: 'Master the foundations of mathematical proof and rigorous thinking...',
      author: 'Prof. James Wilson',
      date: '2024-03-08',
      category: 'Analysis',
      image: '/blog4.jpg',
    },
    {
      id: 5,
      title: 'Differential Equations in Engineering',
      excerpt: 'How differential equations model real-world engineering problems...',
      author: 'Dr. Sarah Johnson',
      date: '2024-03-05',
      category: 'Differential Equations',
      image: '/blog5.jpg',
    },
    {
      id: 6,
      title: 'Number Theory and Cryptography',
      excerpt: 'The fascinating connection between pure mathematics and cybersecurity...',
      author: 'Prof. Michael Chen',
      date: '2024-03-01',
      category: 'Number Theory',
      image: '/blog6.jpg',
    },
  ]

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6">Mathematics Blog</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Insights, tutorials, and stories from the world of mathematics
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-white"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog, index) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer"
              >
                <div className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-white text-6xl font-bold">{blog.category.charAt(0)}</span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(blog.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{blog.author}</span>
                    </div>
                  </div>

                  <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-3">
                    {blog.category}
                  </span>

                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {blog.title}
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>

                  <Link
                    href={`/blogs/${blog.id}`}
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                  >
                    Read More <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-8">Get the latest articles delivered to your inbox</p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
              <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
