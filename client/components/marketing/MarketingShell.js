'use client'

import Footer from './Footer'
import StickyCTA from './StickyCTA'
import SocialProofToast from './SocialProofToast'
import MobileBottomNav from './MobileBottomNav'

export default function MarketingShell({ children }) {
  return (
    <>
      {children}
      <Footer />
      <StickyCTA />
      <SocialProofToast />
      <MobileBottomNav />
    </>
  )
}
