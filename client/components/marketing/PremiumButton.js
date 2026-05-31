'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function PremiumButton({
  href,
  children,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
}) {
  const base = 'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300'
  const variants = {
    primary: 'bg-brand-gradient text-white shadow-premium hover:shadow-glow hover:scale-[1.02]',
    secondary: 'bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white hover:bg-white/20',
    accent: 'bg-accent-gradient text-white shadow-glow-pink hover:scale-[1.02]',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    white: 'bg-white text-primary shadow-premium hover:scale-[1.02]',
    light: 'bg-white text-primary border border-primary/10 shadow-premium hover:border-secondary/40 hover:text-secondary hover:scale-[1.02]',
  }

  const classes = `${base} ${variants[variant]} ${className}`

  if (href) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link href={href} className={classes}>{children}</Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={classes}
    >
      {children}
    </motion.button>
  )
}
