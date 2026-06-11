'use client'

import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'

export default function MarketingShell({ children }) {
  return (
    <>
      {children}
      <Footer />
      <MobileBottomNav />
    </>
  )
}
