'use client'

import { useEffect } from 'react'

export default function ScreenProtection() {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e) => e.preventDefault()

    // Disable text selection via keyboard shortcuts
    const handleKeyDown = (e) => {
      // Block Ctrl+A (select all), Ctrl+C (copy), Ctrl+U (view source), Ctrl+S (save), F12 (devtools)
      if (
        (e.ctrlKey && ['a', 'c', 'u', 's', 'p'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault()
        return false
      }
    }

    // Disable drag
    const handleDragStart = (e) => e.preventDefault()

    // Disable print screen (partial — can't fully block but can warn)
    const handlePrint = (e) => e.preventDefault()

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('dragstart', handleDragStart)
    window.addEventListener('beforeprint', handlePrint)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('dragstart', handleDragStart)
      window.removeEventListener('beforeprint', handlePrint)
    }
  }, [])

  return null
}
