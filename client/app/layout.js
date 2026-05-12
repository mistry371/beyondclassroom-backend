import './globals.css'
import { Providers } from './providers'
import Script from 'next/script'
import dynamic from 'next/dynamic'

const AITutor = dynamic(() => import('@/components/AITutor'), { ssr: false })
const ScreenProtection = dynamic(() => import('@/components/ScreenProtection'), { ssr: false })

export const metadata = {
  title: 'MathLearn Pro - Advanced Mathematics Learning Platform',
  description: 'Master advanced mathematics with interactive tools, comprehensive courses, and expert instruction',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
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
                svg: {
                  fontCache: 'global'
                }
              };
            `,
          }}
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"
          strategy="beforeInteractive"
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
