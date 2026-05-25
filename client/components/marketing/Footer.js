'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'

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
    { href: '/tools', label: 'Math Tools' },
    { href: '/live', label: 'Live Classes' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/team', label: 'Our Team' },
    { href: '/contact', label: 'Contact' },
    { href: '/career', label: 'Careers' },
  ],
  Grow: [
    { href: '/promoter', label: 'Become a Promoter' },
    { href: '/blogs', label: 'Blog' },
    { href: '/auth/register', label: 'Sign Up' },
    { href: '/auth/login', label: 'Sign In' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-navy text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image src="/logo.jpeg" alt="Beyond Classroom" width={48} height={48} className="rounded-xl interactive" />
              <span className="text-xl font-bold bg-brand-gradient bg-clip-text text-transparent">Beyond Classroom</span>
            </Link>
            <p className="text-white/70 mb-4 max-w-sm leading-relaxed">
              Mathematics & French meet personalization. Premium edtech for Grades 6–12, Boards, and competitive excellence.
            </p>
            <p className="text-white/50 text-xs mb-6 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary" /> Secure Razorpay payments · Verified educators
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-brand-gradient transition-colors" aria-label="Social">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-bold text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-white/70 hover:text-secondary transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-6 text-sm text-white/60">
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
