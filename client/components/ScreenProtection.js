'use client'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { usePathname } from 'next/navigation'

export default function ScreenProtection() {
  const overlayRef = useRef(null)
  const { user } = useSelector(state => state.auth)
  const pathname = usePathname()

  // Only apply protection on student learning pages
  const isProtectedPage = pathname?.startsWith('/learn/')

  useEffect(() => {
    if (!isProtectedPage) return  // no protection outside learn pages
    // ── 1. Global CSS: disable selection, drag, highlight ─────────────────
    const css = document.createElement('style')
    css.id = 'sp-css'
    css.textContent = `
      *{-webkit-user-select:none!important;-moz-user-select:none!important;
        -ms-user-select:none!important;user-select:none!important;
        -webkit-touch-callout:none!important;}
      img,video,canvas{pointer-events:none!important;-webkit-user-drag:none!important;}
      iframe:not([src*="razorpay"]):not([src*="checkout"]){pointer-events:none!important;}
      @media print{body{display:none!important;visibility:hidden!important;}}
    `
    document.head.appendChild(css)

    // ── 2. Watermark overlay (user name + email, semi-transparent) ─────────
    const wm = document.createElement('div')
    wm.id = 'sp-watermark'
    const wmLabel = 'Beyond Classroom'
    const wmText = (wmLabel + '   ').repeat(40)
    wm.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99998', 'pointer-events:none',
      'overflow:hidden', 'opacity:0.07', 'font-size:13px', 'font-weight:700',
      'color:#ffffff', 'word-break:break-all', 'white-space:pre-wrap',
      'transform:rotate(-30deg) scale(1.5)', 'transform-origin:center center',
      'padding:40px', 'line-height:2.5', 'letter-spacing:2px',
      'font-family:monospace', 'user-select:none', 'pointer-events:none'
    ].join(';')
    wm.textContent = wmText
    document.body.appendChild(wm)

    // ── 3. Invisible forensic watermark in DOM ─────────────────────────────
    const fw = document.createElement('div')
    fw.id = 'sp-forensic'
    fw.style.cssText = 'position:fixed;opacity:0;font-size:1px;color:transparent;pointer-events:none;z-index:-1;'
    fw.setAttribute('aria-hidden', 'true')
    fw.textContent = 'USER:' + (user?._id || 'guest') + '|' + (user?.email || '') + '|' + Date.now()
    document.body.appendChild(fw)

    // ── 4. Black overlay (shown on blur/visibility change) ─────────────────
    const overlay = overlayRef.current
    const showOverlay = () => { if (overlay) overlay.style.display = 'flex' }
    const hideOverlay = () => { if (overlay) overlay.style.display = 'none' }
    const flashOverlay = () => { showOverlay(); setTimeout(hideOverlay, 500) }

    // ── 5. Block ALL keyboard shortcuts ───────────────────────────────────
    const blockKeys = (e) => {
      const k = e.key?.toLowerCase() || ''
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      const alt = e.altKey

      // Allow all input inside Razorpay iframe or any input/textarea
      const tag = e.target?.tagName?.toLowerCase()
      const isInput = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable
      if (isInput) return  // don't block typing in any input field

      // PrintScreen (all variants)
      if (k === 'printscreen' || k === 'print' || k === 'snapshot') {
        e.preventDefault(); e.stopPropagation(); flashOverlay(); return false
      }
      // Alt+PrintScreen
      if (alt && (k === 'printscreen' || k === 'print')) {
        e.preventDefault(); e.stopPropagation(); flashOverlay(); return false
      }
      // Win+Shift+S (Snipping Tool)
      if (e.metaKey && shift && k === 's') {
        e.preventDefault(); e.stopPropagation(); flashOverlay(); return false
      }
      // Ctrl+Shift+S
      if (ctrl && shift && k === 's') {
        e.preventDefault(); e.stopPropagation(); return false
      }
      // Ctrl combos (only block non-input shortcuts)
      if (ctrl && ['a','s','p','u','j','n','t','w','r'].includes(k)) {
        e.preventDefault(); e.stopPropagation(); return false
      }
      // F keys
      if (['f12','f11','f10','f5'].includes(k)) {
        e.preventDefault(); e.stopPropagation(); return false
      }
      // DevTools
      if (ctrl && shift && ['i','j','c','k','e','m','p'].includes(k)) {
        e.preventDefault(); e.stopPropagation(); return false
      }
    }

    // ── 6. Block right-click ───────────────────────────────────────────────
    const blockCtxMenu = (e) => e.preventDefault()

    // ── 7. Block drag ──────────────────────────────────────────────────────
    const blockDrag = (e) => e.preventDefault()

    // ── 8. Block copy/cut/paste events ────────────────────────────────────
    const blockClipboard = (e) => e.preventDefault()

    // ── 9. Block print ────────────────────────────────────────────────────
    const blockPrint = () => { flashOverlay() }

    // ── 10. Block Screen Capture API ──────────────────────────────────────
    if (navigator.mediaDevices) {
      try {
        Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
          value: async () => {
            flashOverlay()
            throw new DOMException('Screen capture disabled.', 'NotAllowedError')
          },
          writable: false, configurable: false
        })
      } catch(_) {}
    }

    // ── 11. DevTools detection (size-based, with delay to avoid false positives) ──
    let devtoolsOpen = false
    let devtoolsCheckCount = 0
    const detectDevTools = () => {
      // Skip first 5 checks (3s) to let page fully load and avoid false positives
      devtoolsCheckCount++
      if (devtoolsCheckCount < 5) return
      const threshold = 200
      const widthDiff = window.outerWidth - window.innerWidth
      const heightDiff = window.outerHeight - window.innerHeight
      if ((widthDiff > threshold || heightDiff > threshold) && !devtoolsOpen) {
        devtoolsOpen = true
        document.body.style.filter = 'blur(20px)'
      } else if (widthDiff <= threshold && heightDiff <= threshold && devtoolsOpen) {
        devtoolsOpen = false
        document.body.style.filter = ''
      }
    }
    const devtoolsInterval = setInterval(detectDevTools, 1000)

    // ── 12. Visibility change: black screen when tab hidden ────────────────
    const onVisibility = () => {
      if (document.hidden) showOverlay()
      else hideOverlay()
    }

    // ── 13. Window blur: black screen — only after page has been active 2s ──
    // NOTE: Only activate on visibility change (tab switch), NOT on window blur
    // Window blur fires too aggressively (clicking address bar, any popup, etc.)
    let pageReady = false
    const readyTimer = setTimeout(() => { pageReady = true }, 2000)
    // Removed onBlur/onFocus — too aggressive, blocks normal browsing

    // ── 14. Disable text selection via mouse ──────────────────────────────
    const blockSelect = (e) => e.preventDefault()

    // ── 15. Block touch long-press (mobile screenshot prevention) ─────────
    let touchTimer = null
    const onTouchStart = () => { touchTimer = setTimeout(flashOverlay, 500) }
    const onTouchEnd = () => { if (touchTimer) clearTimeout(touchTimer) }

    // Attach everything
    document.addEventListener('keydown', blockKeys, true)
    document.addEventListener('keyup', blockKeys, true)
    document.addEventListener('contextmenu', blockCtxMenu, true)
    document.addEventListener('dragstart', blockDrag, true)
    document.addEventListener('copy', blockClipboard, true)
    document.addEventListener('cut', blockClipboard, true)
    document.addEventListener('paste', blockClipboard, true)
    document.addEventListener('selectstart', blockSelect, true)
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('beforeprint', blockPrint)
    window.addEventListener('afterprint', blockPrint)

    return () => {
      document.removeEventListener('keydown', blockKeys, true)
      document.removeEventListener('keyup', blockKeys, true)
      document.removeEventListener('contextmenu', blockCtxMenu, true)
      document.removeEventListener('dragstart', blockDrag, true)
      document.removeEventListener('copy', blockClipboard, true)
      document.removeEventListener('cut', blockClipboard, true)
      document.removeEventListener('paste', blockClipboard, true)
      document.removeEventListener('selectstart', blockSelect, true)
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('beforeprint', blockPrint)
      window.removeEventListener('afterprint', blockPrint)
      clearInterval(devtoolsInterval)
      clearTimeout(readyTimer)
      document.getElementById('sp-css')?.remove()
      document.getElementById('sp-watermark')?.remove()
      document.getElementById('sp-forensic')?.remove()
      document.body.style.filter = ''
    }
  }, [user])

  return (
    <div
      ref={overlayRef}
      style={{
        display: 'none', position: 'fixed', inset: 0, zIndex: 999999,
        background: '#000', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
      }}
    >
      {isProtectedPage && (
        <>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <p style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>Content Protected</p>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0, textAlign: 'center', maxWidth: '300px' }}>
            This content is protected. Screenshots and screen recording are not permitted.
          </p>
        </>
      )}
    </div>
  )
}
