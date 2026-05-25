import './globals.css'
import { Providers } from './providers'
import Script from 'next/script'
import dynamic from 'next/dynamic'

const AITutor = dynamic(() => import('@/components/AITutor'), { ssr: false })
const ScreenProtection = dynamic(() => import('@/components/ScreenProtection'), { ssr: false })

export const metadata = {
  title: 'Beyond Classroom | Premium Mathematics & French Education',
  description: 'Mathematics and French meet personalization. Premium edtech for Grades 6–12 — live classes, AI tools, and expert educators.',
  keywords: ['mathematics', 'french', 'education', 'JEE', 'CBSE', 'online learning', 'Beyond Classroom', 'edtech'],
  openGraph: {
    title: 'Beyond Classroom | Premium Mathematics & French Education',
    description: 'Personalized Mathematics and French learning with live classes, AI tutor, and 40+ tools.',
    url: 'https://beyondclassroom.netlify.app',
    siteName: 'Beyond Classroom',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beyond Classroom',
    description: 'Premium personalized Mathematics and French education',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.jpeg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Script
          id="mathjax-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.MathJax = {
                tex: {
                  inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                  displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                },
                svg: { fontCache: 'global' }
              };
            `,
          }}
        />
        <Script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" strategy="beforeInteractive" />
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'Beyond Classroom',
              description: 'Premium personalized Mathematics and French education platform',
              url: 'https://beyondclassroom.netlify.app',
            }),
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
          <AITutor />
          <ScreenProtection />
        </Providers>
      </body>
    </html>
  )
}
