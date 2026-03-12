'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Bell, ShoppingCart, User, LogOut, Menu, X } from 'lucide-react'
import { logout } from '@/store/slices/authSlice'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { user } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)
  const { unreadCount } = useSelector((state) => state.notifications)
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    router.push('/auth/login')
  }

  return (
    <nav className="bg-dark-100 border-b border-primary/20 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-dark font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-primary">MathLearn</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-primary transition-colors">
              Courses
            </Link>
            <Link href="/tools" className="text-gray-300 hover:text-primary transition-colors">
              Tools
            </Link>
            <Link href="/blogs" className="text-gray-300 hover:text-primary transition-colors">
              Blogs
            </Link>
            <Link href="/career" className="text-gray-300 hover:text-primary transition-colors">
              Career
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-primary transition-colors">
              Contact
            </Link>
            {user && (
              <>
                <Link href="/profile" className="text-gray-300 hover:text-primary transition-colors">
                  My Learning
                </Link>

            <Link href="/notifications" className="relative">
              <Bell className="h-6 w-6 text-gray-300 hover:text-primary transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-300 hover:text-primary transition-colors" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-dark text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            <div className="flex items-center space-x-3">
              <Link href="/profile">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-dark font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
              </>
            )}
            
            {!user && (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login" className="text-gray-300 hover:text-primary transition-colors font-semibold">
                  Sign In
                </Link>
                <Link href="/auth/register" className="bg-gradient-to-r from-primary to-secondary text-dark px-4 py-2 rounded-lg hover:opacity-90 transition-all font-semibold">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden text-gray-300"
          >
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
            className="md:hidden bg-dark-100 border-t border-primary/20"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href="/" className="block py-2 text-gray-300 hover:text-primary">Home</Link>
              <Link href="/about" className="block py-2 text-gray-300 hover:text-primary">About</Link>
              <Link href="/dashboard" className="block py-2 text-gray-300 hover:text-primary">Courses</Link>
              <Link href="/tools" className="block py-2 text-gray-300 hover:text-primary">Tools</Link>
              <Link href="/blogs" className="block py-2 text-gray-300 hover:text-primary">Blogs</Link>
              <Link href="/career" className="block py-2 text-gray-300 hover:text-primary">Career</Link>
              <Link href="/contact" className="block py-2 text-gray-300 hover:text-primary">Contact</Link>
              {user ? (
                <>
                  <Link href="/profile" className="block py-2 text-gray-300 hover:text-primary">My Learning</Link>
                  <Link href="/notifications" className="block py-2 text-gray-300 hover:text-primary">Notifications</Link>
                  <Link href="/cart" className="block py-2 text-gray-300 hover:text-primary">Cart</Link>
                  <button onClick={handleLogout} className="block py-2 text-red-500 w-full text-left">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block py-2 text-primary font-semibold">Sign In</Link>
                  <Link href="/auth/register" className="block py-2 bg-gradient-to-r from-primary to-secondary text-dark rounded-lg text-center font-semibold">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
