'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function MagneticButton({ href, children, className = '', variant = 'primary' }) {
  const base =
    variant === 'primary'
      ? 'magnetic-btn bg-brand-gradient text-white shadow-premium'
      : 'magnetic-btn glass-card text-primary border border-primary/20'

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="inline-block">
      <Link href={href} className={`${base} inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-sm md:text-base ${className}`}>
        {children}
      </Link>
    </motion.div>
  )
}
