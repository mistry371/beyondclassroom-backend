'use client'

import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { Target, Eye, Heart, Users, Award, Zap } from 'lucide-react'

export default function AboutPage() {
  const values = [
    { icon: Target, title: 'Excellence', desc: 'Committed to delivering the highest quality education' },
    { icon: Heart, title: 'Passion', desc: 'We love mathematics and inspiring others to love it too' },
    { icon: Users, title: 'Community', desc: 'Building a supportive learning community' },
    { icon: Zap, title: 'Innovation', desc: 'Using cutting-edge technology for better learning' },
  ]

  const team = [
    { name: 'Dr. Sarah Johnson', role: 'Chief Academic Officer', degree: 'PhD Mathematics, MIT' },
    { name: 'Prof. Michael Chen', role: 'Head of Curriculum', degree: 'PhD Applied Math, Stanford' },
    { name: 'Dr. Emily Rodriguez', role: 'Lead Instructor', degree: 'PhD Pure Mathematics, Oxford' },
    { name: 'Prof. James Wilson', role: 'Research Director', degree: 'PhD Mathematical Analysis, Cambridge' },
  ]

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
            <h1 className="text-5xl font-bold mb-6">About MathLearn Pro</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Empowering students worldwide with world-class mathematics education
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <Target className="h-16 w-16 text-primary mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To make advanced mathematics accessible to everyone through innovative technology, 
                expert instruction, and interactive learning tools. We believe that with the right 
                resources and support, anyone can master mathematics.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <Eye className="h-16 w-16 text-secondary mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To become the world's leading mathematics education platform, inspiring millions 
                of students to discover the beauty and power of mathematics. We envision a future 
                where mathematical literacy is universal.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="bg-gradient-to-br from-primary to-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">World-class mathematicians and educators</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-xl text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-primary font-semibold mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.degree}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-purple-100">Students Worldwide</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100+</div>
              <div className="text-purple-100">Expert Courses</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">20+</div>
              <div className="text-purple-100">Math Tools</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-purple-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
