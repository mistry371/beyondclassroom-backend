'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Linkedin, Mail, Phone, Youtube } from 'lucide-react'

const links = {
  Subjects: [
    { href: '/learn/mathematics', label: 'Mathematics' },
    { href: '/learn/french', label: 'French' },
    { href: '/grades/grade-10', label: 'Class 10 Hub' },
    { href: '/grades/grade-12', label: 'Class 12 Hub' },
  ],
  Platform: [
    { href: '/courses', label: 'Courses' },
    { href: '/packages', label: 'Packages' },
    { href: '/dashboard/custom-requests', label: 'Custom Requests' },
    { href: '/learn/mathematics', label: 'Learning Hub' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/team', label: 'Faculty' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/career', label: 'Careers' },
  ],
  Grow: [
    { href: '/promoter', label: 'Become a Promoter' },
    { href: '/contact', label: 'Partnerships' },
    { href: '/auth/register', label: 'Sign Up' },
    { href: '/auth/login', label: 'Sign In' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-white text-ink">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-6 flex items-center gap-3">
              <Image src="/logo.jpeg" alt="Beyond Classroom" width={48} height={48} className="interactive rounded-xl shadow-sm" />
              <span className="text-xl font-black bg-brand-gradient bg-clip-text text-transparent">Beyond Classroom</span>
            </Link>
            <p className="mb-4 max-w-sm leading-relaxed text-muted">
              Mathematics and French meet personalization. Premium edtech for Grades 6-12, Boards, and competitive excellence.
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
            <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-secondary" /> +91 98765 43210</span>
          </div>
          <p>© {new Date().getFullYear()} Beyond Classroom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
