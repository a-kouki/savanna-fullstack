'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)

  function close() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace('/')
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) close()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="
        fixed inset-0 z-50
        bg-black/50 backdrop-blur-[3px]
        flex items-end sm:items-center justify-center
      "
    >
      {/* Sheet mobile — sobe do bottom com borda amarela no topo */}
      {/* Desktop — centralizado, borda reta */}
      <div className="
        relative bg-white
        w-full sm:w-[90%] sm:max-w-3xl
        max-h-[92vh] sm:max-h-[88vh]
        overflow-y-auto no-scrollbar
        border-t-2 border-t-[#e8c300] sm:border-t-2
        sm:border sm:border-black/[0.08]
        shadow-2xl
      ">

        {/* Barra de fechamento mobile — indicador visual */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 bg-black/15" />
        </div>

        {/* Botão fechar — desktop */}
        <button
          onClick={close}
          className="
            hidden sm:flex
            absolute top-4 right-4
            w-8 h-8 items-center justify-center
            border border-black/[0.1] text-black/40
            hover:border-black/30 hover:text-black
            transition-colors duration-150
          "
          aria-label="Fechar"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Botão fechar — mobile (tap área generosa) */}
        <button
          onClick={close}
          className="
            sm:hidden
            absolute top-3 right-4
            p-2 text-black/30 hover:text-black
            transition-colors
          "
          aria-label="Fechar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="p-5 sm:p-7">
          {children}
        </div>

      </div>
    </div>
  )
}