'use client'

import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import { motion } from 'framer-motion'
import { team } from '@/data/marketingContent'
import { GraduationCap, Award, BookOpen } from 'lucide-react'

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-soft-gradient pb-20 md:pb-0">
      <Navbar />

      <section className="py-20 bg-navy-gradient">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">World-Class Educators</h1>
            <p className="text-white/80 text-xl max-w-2xl mx-auto">
              PhDs, IIT alumni, and passionate teachers dedicated to your success.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Faculty" title="Meet Our Expert Team" subtitle="Verified educators with decades of combined experience." />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="glass-card premium-card overflow-hidden group"
              >
                <div className="h-32 bg-brand-gradient relative">
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-2xl bg-white shadow-premium flex items-center justify-center text-3xl font-black text-primary border-4 border-white">
                    {member.initials}
                  </div>
                </div>
                <div className="pt-16 pb-8 px-6 text-center">
                  <h3 className="text-xl font-bold text-ink">{member.name}</h3>
                  <p className="text-primary font-semibold text-sm mt-1">{member.role}</p>
                  <p className="text-muted text-sm mt-2 flex items-center justify-center gap-1">
                    <GraduationCap className="h-4 w-4" /> {member.degree}
                  </p>
                  <p className="text-muted text-xs mt-1 flex items-center justify-center gap-1">
                    <Award className="h-3.5 w-3.5 text-secondary" /> {member.experience}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {member.expertise.map((tag) => (
                      <span key={tag} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: BookOpen, stat: '100+', label: 'Courses Designed' },
            { icon: GraduationCap, stat: '50K+', label: 'Students Taught' },
            { icon: Award, stat: '95%', label: 'Success Rate' },
          ].map((item) => (
            <div key={item.label} className="p-8 glass-card rounded-2xl">
              <item.icon className="h-10 w-10 text-primary mx-auto mb-4" />
              <div className="text-4xl font-black text-ink">{item.stat}</div>
              <div className="text-muted font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <MarketingShell />
    </div>
  )
}
