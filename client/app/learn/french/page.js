import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import PremiumButton from '@/components/marketing/PremiumButton'
import TrustSection from '@/components/marketing/TrustSection'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Online French Classes Grades 6–12 | Beyond Classroom',
  description: 'Learn French with live classes, speaking practice, and personalized pathways. CBSE & school board aligned French programs.',
  path: '/learn/french',
  keywords: ['french classes', 'learn french online', 'CBSE french', 'school french'],
})

export default function FrenchLandingPage() {
  return (
    <div className="min-h-screen bg-soft-gradient pb-20 md:pb-0">
      <Navbar />
      <section className="py-20 bg-navy-gradient text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-brandPink font-semibold mb-4">French · Grades 6–12</p>
          <h1 className="text-4xl md:text-6xl font-black mb-6">Master French With Confidence & Fluency</h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Grammar, comprehension, speaking, and exam prep — taught by expert educators with live support and progress tracking parents trust.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <PremiumButton href="/auth/register">Start Learning Today</PremiumButton>
            <PremiumButton href="/courses?category=French" variant="outline">Browse French Courses</PremiumButton>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader badge="Programs" title="French For Every Grade" subtitle="Build vocabulary, grammar, and exam confidence step by step." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[6, 7, 8, 9, 10, 11, 12].map((g) => (
              <Link key={g} href={`/grades/grade-${g}?subject=French`} className="glass-card premium-card p-6 text-center hover:scale-[1.02] transition-transform gpu-accelerated">
                <p className="text-3xl font-black text-brandPink">Class {g}</p>
                <p className="text-muted text-sm mt-2">French language program</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <TrustSection />
      <MarketingShell />
    </div>
  )
}
