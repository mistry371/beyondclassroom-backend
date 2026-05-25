import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import PremiumButton from '@/components/marketing/PremiumButton'
import TrustSection from '@/components/marketing/TrustSection'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Online Mathematics Classes Grades 6–12 | Beyond Classroom',
  description: 'Master Mathematics with live classes, AI tutor, 40+ tools, JEE & CBSE prep. Personalized paths from expert educators.',
  path: '/learn/mathematics',
  keywords: ['mathematics classes', 'online math', 'JEE math', 'CBSE mathematics', 'grade 6-12 math'],
})

export default function MathematicsLandingPage() {
  return (
    <div className="min-h-screen bg-soft-gradient pb-20 md:pb-0">
      <Navbar />
      <section className="py-20 bg-navy-gradient text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-secondary font-semibold mb-4">Mathematics · Grades 6–12</p>
          <h1 className="text-4xl md:text-6xl font-black mb-6">Excel in Mathematics With Personalized Learning</h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Live doubt solving, structured courses, AI-powered practice, and board & JEE readiness — built for ambitious students and confident parents.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <PremiumButton href="/auth/register">Start Learning Today</PremiumButton>
            <PremiumButton href="/courses?category=Mathematics" variant="outline">Browse Math Courses</PremiumButton>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader badge="Curriculum" title="Complete Mathematics Pathways" subtitle="From foundations to competitive excellence." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[6, 7, 8, 9, 10, 11, 12].map((g) => (
              <Link key={g} href={`/grades/grade-${g}`} className="glass-card premium-card p-6 text-center hover:scale-[1.02] transition-transform gpu-accelerated">
                <p className="text-3xl font-black text-primary">Class {g}</p>
                <p className="text-muted text-sm mt-2">Structured Mathematics program</p>
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
