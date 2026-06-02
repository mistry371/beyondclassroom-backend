'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Linkedin, Mail, Youtube } from 'lucide-react'

const links = {
  Subjects: [
    { href: '/courses?grade=1', label: 'Class 1' },
    { href: '/courses?grade=2', label: 'Class 2' },
    { href: '/courses?grade=3', label: 'Class 3' },
    { href: '/courses?grade=4', label: 'Class 4' },
    { href: '/courses?grade=5', label: 'Class 5' },
    { href: '/courses?grade=6', label: 'Class 6' },
    { href: '/courses?grade=7', label: 'Class 7' },
    { href: '/courses?grade=8', label: 'Class 8' },
  ],
  Platform: [
    { href: '/courses', label: 'Course & Content' },
    { href: '/packages', label: 'Our Packages' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/team', label: 'Our Team' },
    { href: '/partners', label: 'Our Partners' },
    { href: '/contact', label: 'Career & Contact Us' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-white text-ink">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-6 flex items-center gap-4">
              <Image
                src="/logo.jpeg"
                alt="Beyond Classroom"
                width={96}
                height={96}
                className="w-20 h-20 sm:w-24 sm:h-24 interactive rounded-2xl shadow-premium object-contain"
              />
              <span className="text-2xl font-black bg-brand-gradient bg-clip-text text-transparent">
                Beyond Classroom
              </span>
            </Link>
            <p className="mb-4 max-w-sm leading-relaxed text-muted">
              Premium Mathematics education for Class 1–8. Structured practice, expert educators, and personalized learning paths.
            </p>
            <p className="mb-6 flex items-center gap-2 text-xs text-muted">
              <span className="inline-block h-2 w-2 rounded-full bg-secondary" /> Secure payments · verified educators
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-academic text-primary transition-colors hover:bg-brand-gradient hover:text-white" aria-label="Social">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="mb-4 font-bold text-navy">{title}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-muted transition-colors hover:text-primary">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col justify-between gap-6 border-t border-primary/10 pt-8 text-sm text-muted md:flex-row">
          <div className="flex flex-wrap gap-6">
            <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-secondary" /> beyondclassroom247@gmail.com</span>
          </div>
          <p>© {new Date().getFullYear()} Beyond Classroom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
