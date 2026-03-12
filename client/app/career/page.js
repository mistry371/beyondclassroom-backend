'use client'

import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { Briefcase, MapPin, Clock, DollarSign, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function CareerPage() {
  const [selectedDept, setSelectedDept] = useState('all')

  const jobs = [
    {
      id: 1,
      title: 'Senior Mathematics Instructor',
      department: 'Education',
      location: 'Remote',
      type: 'Full-time',
      salary: '$80,000 - $120,000',
      description: 'Lead course development and teach advanced mathematics courses',
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      department: 'Engineering',
      location: 'Hybrid',
      type: 'Full-time',
      salary: '$90,000 - $140,000',
      description: 'Build and maintain our learning platform using MERN stack',
    },
    {
      id: 3,
      title: 'Content Writer - Mathematics',
      department: 'Content',
      location: 'Remote',
      type: 'Full-time',
      salary: '$60,000 - $85,000',
      description: 'Create engaging mathematical content and tutorials',
    },
    {
      id: 4,
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      salary: '$70,000 - $100,000',
      description: 'Design intuitive interfaces for our learning tools',
    },
    {
      id: 5,
      title: 'Data Scientist',
      department: 'Engineering',
      location: 'Hybrid',
      type: 'Full-time',
      salary: '$100,000 - $150,000',
      description: 'Analyze learning patterns and optimize student outcomes',
    },
    {
      id: 6,
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      salary: '$75,000 - $110,000',
      description: 'Lead marketing campaigns and growth strategies',
    },
  ]

  const departments = ['all', 'Education', 'Engineering', 'Content', 'Design', 'Marketing']

  const filteredJobs = selectedDept === 'all' 
    ? jobs 
    : jobs.filter(job => job.department === selectedDept)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Navbar />

      {/* Hero */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6">Join Our Team</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Help us revolutionize mathematics education worldwide
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Work With Us?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Remote First', desc: 'Work from anywhere in the world' },
              { title: 'Competitive Pay', desc: 'Industry-leading compensation' },
              { title: 'Growth', desc: 'Continuous learning opportunities' },
              { title: 'Impact', desc: 'Change lives through education' },
              { title: 'Benefits', desc: 'Health, dental, vision coverage' },
              { title: 'Culture', desc: 'Collaborative and inclusive' },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Open Positions</h2>

          {/* Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedDept === dept
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dept === 'all' ? 'All Departments' : dept}
              </button>
            ))}
          </div>

          {/* Jobs */}
          <div className="space-y-6">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-4">{job.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>
                  </div>

                  <button className="mt-4 md:mt-0 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    Apply Now <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
