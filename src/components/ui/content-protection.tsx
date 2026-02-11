'use client'

import { useEffect, useRef } from 'react'

/**
 * ContentProtection wrapper disables:
 * - Right-click context menu
 * - Text selection (via CSS + JS)
 * - Copy/Cut keyboard shortcuts (Ctrl+C, Ctrl+X, Ctrl+A)
 * - Print screen (Ctrl+P)
 * - Drag and drop of content
 *
 * NOTE: This is a deterrent, not DRM. Determined users can bypass
 * client-side protections. For true protection, use server-side
 * rendering or watermarking (which we already do for free users).
 */
export function ContentProtection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+P, Ctrl+S
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase()
        if (['c', 'x', 'a', 'p', 's'].includes(key)) {
          e.preventDefault()
          return false
        }
      }
      // Block PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        return false
      }
    }

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      return false
    }

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    el.addEventListener('contextmenu', handleContextMenu)
    el.addEventListener('keydown', handleKeyDown)
    el.addEventListener('copy', handleCopy)
    el.addEventListener('cut', handleCopy)
    el.addEventListener('dragstart', handleDragStart)
    el.addEventListener('selectstart', handleSelectStart)

    return () => {
      el.removeEventListener('contextmenu', handleContextMenu)
      el.removeEventListener('keydown', handleKeyDown)
      el.removeEventListener('copy', handleCopy)
      el.removeEventListener('cut', handleCopy)
      el.removeEventListener('dragstart', handleDragStart)
      el.removeEventListener('selectstart', handleSelectStart)
    }
  }, [])

  return (
    <div
      ref={ref}
      tabIndex={0}
      className="content-protected"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none' as unknown as undefined,
      }}
    >
      {children}
    </div>
  )
}
