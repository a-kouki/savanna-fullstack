'use client'
// app/ui/ProductActions.tsx

import { baseURL } from '@/services/api'

type Props = {
  name: string
  price: number | null
  src: string
  description: string
}

export function ProductActions({ name, price, src, description }: Props) {
  const productURL = `${baseURL}/products/${src}`

  const whatsappText = encodeURIComponent(
    `Olá! Tenho interesse nessa camiseta:\n\n*${name}*\n• ${price}\n\n${productURL}`
  )

  function handleShare() {
    navigator.share({
      title: name,
      text: description || name,
      url: productURL,
    }).catch(() => {})
  }

  return (
    <div className="flex gap-2 w-full">

      {/* WhatsApp */}
      <a
        href={`https://wa.me/556699333085?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="
          flex-1 flex items-center justify-center gap-2
          bg-black text-white
          py-3 px-4
          font-bebas text-base tracking-widest
          hover:bg-[#e8c300] hover:text-black
          transition-colors duration-200
        "
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.854L.057 23.885a.5.5 0 00.606.61l6.198-1.63A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 01-5.031-1.371l-.36-.214-3.733.981.998-3.648-.235-.374A9.86 9.86 0 012.1 12C2.1 6.534 6.534 2.1 12 2.1S21.9 6.534 21.9 12 17.466 21.9 12 21.9z"/>
        </svg>
        Tenho interesse
      </a>

      {/* Compartilhar */}
      <button
        onClick={handleShare}
        className="
          flex items-center justify-center
          w-12 border border-black/[0.12]
          text-black/40
          hover:border-black/30 hover:text-black
          transition-colors duration-200
          cursor-pointer
        "
        aria-label="Compartilhar"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>

    </div>
  )
}