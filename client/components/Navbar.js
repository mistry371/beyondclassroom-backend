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
  { href: '/about', label: 'About' },
  { href: '/team', label: 'Team' },
  { href: '/packages', label: 'Packages' },
  { href: '/courses', label: 'Courses' },
  { href: '/contact', label: 'Contact Us' },
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
    ? 'bg-white/90 border-primary/10 shadow-sm'
    : 'bg-dark-100 border-primary/20'

  const linkClass = isMarketing
    ? 'text-muted hover:text-primary'
    : 'text-gray-300 hover:text-primary'

  return (
    <nav className={`${navBg} border-b sticky top-0 z-50 backdrop-blur-xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={user ? dashboardLink : '/'} className="flex items-center space-x-2">
            <Image src="/logo.jpeg" alt="Beyond Classroom" width={40} height={40} className="rounded-lg interactive" />
            <span className="text-lg font-bold bg-brand-gradient bg-clip-text text-transparent hidden sm:inline">
              Beyond Classroom
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-5">
            {!isAdmin && publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${linkClass} transition-colors text-sm font-medium flex items-center gap-1 ${pathname === link.href ? 'text-primary font-semibold' : ''}`}
              >
                {link.live && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link href={dashboardLink} className={`${linkClass} font-semibold`}>{dashboardText}</Link>
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
              <div className="flex items-center space-x-3 ml-2">
                <Link href="/auth/login" className={`${linkClass} font-semibold`}>Sign In</Link>
                <Link href="/auth/register" className="bg-brand-gradient text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all font-semibold text-sm shadow-premium">
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          <button onClick={() => setShowMenu(!showMenu)} className="lg:hidden text-ink p-2">
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
                  <Link href="/auth/register" onClick={() => setShowMenu(false)} className="block py-3 bg-brand-gradient text-white rounded-xl text-center font-semibold">Sign Up Free</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
