import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import PremiumButton from '@/components/marketing/PremiumButton'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const num = params.grade?.replace('grade-', '') || params.grade
  return buildMetadata({
    title: `Class ${num} Mathematics & French Online | Beyond Classroom`,
    description: `Grade ${num} Mathematics and French courses with live classes, AI tools, and personalized learning paths.`,
    path: `/grades/${params.grade}`,
    keywords: [`class ${num}`, `grade ${num} math`, `grade ${num} french`],
  })
}

export async function generateStaticParams() {
  return [6, 7, 8, 9, 10, 11, 12].map((g) => ({ grade: `grade-${g}` }))
}

export default function GradeLandingPage({ params }) {
  const gradeNum = params.grade?.replace('grade-', '') || params.grade

  return (
    <div className="min-h-screen bg-soft-gradient pb-20 md:pb-0">
      <Navbar />
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black text-ink mb-4">Class {gradeNum} Learning Hub</h1>
          <p className="text-muted text-lg mb-8">
            Mathematics and French programs designed for Class {gradeNum} — aligned with school boards and built for measurable progress.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <PremiumButton href="/courses">Explore Courses</PremiumButton>
            <PremiumButton href="/auth/register" variant="outline">Get Personalized Practice</PremiumButton>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 gap-6 text-left">
            <Link href="/learn/mathematics" className="glass-card p-6 premium-card gpu-accelerated">
              <h2 className="font-bold text-primary text-xl mb-2">Mathematics</h2>
              <p className="text-muted text-sm">Concepts, problem solving, and exam readiness for Class {gradeNum}.</p>
            </Link>
            <Link href="/learn/french" className="glass-card p-6 premium-card gpu-accelerated">
              <h2 className="font-bold text-brandPink text-xl mb-2">French</h2>
              <p className="text-muted text-sm">Grammar, reading, and speaking skills for Class {gradeNum}.</p>
            </Link>
          </div>
        </div>
      </section>
      <MarketingShell />
    </div>
  )
}
