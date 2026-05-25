import './globals.css'
import { Providers } from './providers'
import dynamic from 'next/dynamic'

const AITutor = dynamic(() => import('@/components/AITutor'), { ssr: false, loading: () => null })
const ScreenProtection = dynamic(() => import('@/components/ScreenProtection'), { ssr: false, loading: () => null })
const ClientChrome = dynamic(() => import('@/components/ClientChrome'), { ssr: false, loading: () => null })

const SITE_URL = 'https://beyondclassroom.netlify.app'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Beyond Classroom | Premium Mathematics & French Education',
    template: '%s | Beyond Classroom',
  },
  description: 'Mathematics and French meet personalization. Premium edtech for Grades 6–12 — live classes, AI tools, and expert educators.',
  keywords: ['mathematics', 'french', 'education', 'JEE', 'CBSE', 'online learning', 'Beyond Classroom', 'edtech', 'online math classes'],
  authors: [{ name: 'Beyond Classroom' }],
  creator: 'Beyond Classroom',
  openGraph: {
    title: 'Beyond Classroom | Premium Mathematics & French Education',
    description: 'Personalized Mathematics and French learning with live classes, AI tutor, and 40+ tools.',
    url: SITE_URL,
    siteName: 'Beyond Classroom',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beyond Classroom',
    description: 'Premium personalized Mathematics and French education',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: SITE_URL },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.jpeg" />
        <link rel="preload" href="/logo.jpeg" as="image" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://beyondclassroom-backend.onrender.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'Beyond Classroom',
              description: 'Premium personalized Mathematics and French education platform',
              url: SITE_URL,
              sameAs: [SITE_URL],
              offers: { '@type': 'Offer', category: 'Mathematics and French courses' },
            }),
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
          <ClientChrome />
        </Providers>
      </body>
    </html>
  )
}
