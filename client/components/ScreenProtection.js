'use client'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { usePathname } from 'next/navigation'

export default function ScreenProtection() {
  const overlayRef = useRef(null)
  const { user } = useSelector(state => state.auth)
  const pathname = usePathname()

  const isProtectedPage = pathname?.startsWith('/learn/')

  useEffect(() => {
    if (!isProtectedPage) return

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

    const fw = document.createElement('div')
    fw.id = 'sp-forensic'
    fw.style.cssText = 'position:fixed;opacity:0;font-size:1px;color:transparent;pointer-events:none;z-index:-1;'
    fw.setAttribute('aria-hidden', 'true')
    fw.textContent = 'USER:' + (user?._id || 'guest') + '|' + (user?.email || '') + '|' + Date.now()
    document.body.appendChild(fw)

    const overlay = overlayRef.current
    const showOverlay = () => { if (overlay) overlay.style.display = 'flex' }
    const hideOverlay = () => { if (overlay) overlay.style.display = 'none' }
    const flashOverlay = () => {
      showOverlay()
      setTimeout(hideOverlay, 450)
    }

    const blockKeys = (e) => {
      const k = e.key?.toLowerCase() || ''
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      const alt = e.altKey

      const tag = e.target?.tagName?.toLowerCase()
      const isInput = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable
      if (isInput) return

      if (k === 'printscreen' || k === 'print' || k === 'snapshot') {
        e.preventDefault(); e.stopPropagation(); flashOverlay(); return false
      }
      if (alt && (k === 'printscreen' || k === 'print')) {
        e.preventDefault(); e.stopPropagation(); flashOverlay(); return false
      }
      if (e.metaKey && shift && k === 's') {
        e.preventDefault(); e.stopPropagation(); flashOverlay(); return false
      }
      if (ctrl && shift && k === 's') {
        e.preventDefault(); e.stopPropagation(); return false
      }
      if (ctrl && ['a', 's', 'p', 'u', 'j', 'n', 't', 'w', 'r'].includes(k)) {
        e.preventDefault(); e.stopPropagation(); return false
      }
      if (['f12', 'f11', 'f10', 'f5'].includes(k)) {
        e.preventDefault(); e.stopPropagation(); return false
      }
      if (ctrl && shift && ['i', 'j', 'c', 'k', 'e', 'm', 'p'].includes(k)) {
        e.preventDefault(); e.stopPropagation(); return false
      }
    }

    const blockCtxMenu = (e) => e.preventDefault()
    const blockDrag = (e) => e.preventDefault()
    const blockClipboard = (e) => e.preventDefault()
    const blockPrint = () => flashOverlay()
    const blockSelect = (e) => e.preventDefault()

    if (navigator.mediaDevices) {
      try {
        Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
          value: async () => {
            flashOverlay()
            throw new DOMException('Screen capture disabled.', 'NotAllowedError')
          },
          writable: false, configurable: false
        })
      } catch (_) {}
    }

    let touchTimer = null
    const onTouchStart = () => { touchTimer = setTimeout(flashOverlay, 500) }
    const onTouchEnd = () => { if (touchTimer) clearTimeout(touchTimer) }

    document.addEventListener('keydown', blockKeys, true)
    document.addEventListener('keyup', blockKeys, true)
    document.addEventListener('contextmenu', blockCtxMenu, true)
    document.addEventListener('dragstart', blockDrag, true)
    document.addEventListener('copy', blockClipboard, true)
    document.addEventListener('cut', blockClipboard, true)
    document.addEventListener('paste', blockClipboard, true)
    document.addEventListener('selectstart', blockSelect, true)
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
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('beforeprint', blockPrint)
      window.removeEventListener('afterprint', blockPrint)
      document.getElementById('sp-css')?.remove()
      document.getElementById('sp-watermark')?.remove()
      document.getElementById('sp-forensic')?.remove()
      document.body.style.filter = ''
      hideOverlay()
    }
  }, [isProtectedPage, user])

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
