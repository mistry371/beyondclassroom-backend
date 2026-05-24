'use client'

import { motion } from 'framer-motion'

export default function SectionHeader({ badge, title, subtitle, light = false, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-14 ${center ? 'text-center' : ''}`}
    >
      {badge && (
        <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-brand-gradient text-white mb-4 shadow-glow">
          {badge}
        </span>
      )}
      <h2 className={`text-4xl md:text-5xl font-black tracking-tight mb-4 ${light ? 'text-white' : 'text-ink'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg md:text-xl max-w-3xl ${center ? 'mx-auto' : ''} ${light ? 'text-white/80' : 'text-muted'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
