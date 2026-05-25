'use client'

import { Component } from 'react'
import Link from 'next/link'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('UI Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-white/70 mb-6">Please refresh the page or return home.</p>
            <Link href="/" className="px-6 py-3 bg-brand-gradient text-white rounded-xl font-semibold">
              Go Home
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
