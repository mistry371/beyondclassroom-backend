'use client'

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter, usePathname } from 'next/navigation'
import { Bell, ShoppingCart, LogOut, Menu, X } from 'lucide-react'
import { logout } from '@/store/slices/authSlice'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/packages', label: 'Our Packages' },
  { href: '/courses', label: 'Course & Content' },
  { href: '/team', label: 'Our Team' },
  { href: '/contact', label: 'Career & Contact Us' },
]

export default function Navbar() {
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)
  const { unreadCount } = useSelector((state) => state.notifications)
  const [showMenu, setShowMenu] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  const dashboardLink = isAdmin ? '/admin' : '/dashboard'
  const dashboardText = isAdmin ? 'Admin Panel' : 'Dashboard'
  const isMarketing = !pathname?.startsWith('/admin') && !pathname?.startsWith('/learn')

  const handleLogout = () => {
    dispatch(logout())
    router.push('/auth/login')
  }

  const navBg = isMarketing && !pathname?.startsWith('/dashboard')
    ? 'bg-white/85 border-primary/10 shadow-sm'
    : 'bg-white/90 border-primary/10 shadow-sm'

  const linkClass = 'text-muted hover:text-primary'

  return (
    <nav className={`${navBg} border-b sticky top-0 z-50 backdrop-blur-xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={user ? dashboardLink : '/'} className="flex items-center space-x-3">
            <Image src="/logo.jpeg" alt="Beyond Classroom" width={42} height={42} className="rounded-xl interactive shadow-sm" />
            <span className="hidden text-lg font-black tracking-tight bg-brand-gradient bg-clip-text text-transparent sm:inline">
              Beyond Classroom
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-1 rounded-full border border-primary/10 bg-white/70 px-2 py-2 shadow-sm">
            {!isAdmin && publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${linkClass} rounded-full px-4 py-2 text-sm font-semibold transition-colors ${pathname === link.href ? 'bg-primary/10 text-primary' : ''}`}
              >
                {link.live && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            {user && (
              <>
                <Link href={dashboardLink} className="font-bold text-primary">{dashboardText}</Link>
                {!isAdmin && (
                  <>
                    <Link href="/profile" className={linkClass}>My Learning</Link>
                    <Link href="/notifications" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link href="/cart" className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {items.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {items.length}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                <Link href="/profile">
                  <div className="w-9 h-9 bg-brand-gradient rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </Link>
                <button onClick={handleLogout} className="text-muted hover:text-red-500 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
            {!user && (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login" className={`${linkClass} font-semibold`}>Sign In</Link>
              </div>
            )}
          </div>

          <button onClick={() => setShowMenu(!showMenu)} className="lg:hidden text-ink p-2 rounded-xl border border-primary/10 bg-white">
            {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-t border-primary/10 max-h-[70vh] overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-1">
              {!isAdmin && publicLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setShowMenu(false)} className="block py-2.5 text-ink hover:text-primary font-medium">
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link href={dashboardLink} onClick={() => setShowMenu(false)} className="block py-2.5 text-primary font-semibold">{dashboardText}</Link>
                  {!isAdmin && (
                    <>
                      <Link href="/profile" onClick={() => setShowMenu(false)} className="block py-2.5 text-ink">My Learning</Link>
                      <Link href="/cart" onClick={() => setShowMenu(false)} className="block py-2.5 text-ink">Cart</Link>
                    </>
                  )}
                  <button onClick={() => { handleLogout(); setShowMenu(false) }} className="block py-2.5 text-red-500 w-full text-left">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setShowMenu(false)} className="block py-2.5 text-primary font-semibold">Sign In</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
