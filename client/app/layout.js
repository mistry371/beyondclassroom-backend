import './globals.css'
import { Providers } from './providers'
import Script from 'next/script'

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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
