'use client'
// app/admin/_components/Drawer.tsx

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type DrawerProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Trava scroll do body enquanto aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (typeof window === 'undefined') return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`
          fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]
          transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* Painel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`
          fixed top-0 right-0 z-50
          h-full w-full sm:w-[480px]
          bg-white border-l border-black/[0.08]
          flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.08] shrink-0">
          {title && (
            <h2 className="font-bebas text-lg tracking-widest text-black">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 flex items-center justify-center text-black/30 hover:text-black hover:bg-black/[0.04] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>

      </div>
    </>,
    document.body
  )
}