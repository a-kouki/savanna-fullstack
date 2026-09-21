"use client"

import { useEffect, useRef, useState } from "react"
import { AddToCartButton } from "@/app/_components/Addtocartbutton"
import { IconShare, IconCopy } from "@/app/ui/Icons"

export type Product = {
  id: number
  name: string
  src: string
  price: number | null
  images: { url: string; public_id: string | null }[]
  description: string
  in_stock: boolean
  //category_id: string | null
  attributes: {
    sizes: string[]
    tags: string[]
    brand: string
    ratio: string
  }
}

export function ProductInfo({ product }: { product: Product }) {
  const [descOpen, setDescOpen] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareRef = useRef<HTMLDivElement | null>(null)

  const priceFormatted = Number(product.price).toFixed(2).replace(".", ",")

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false)
      }
    }
    if (shareOpen) document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [shareOpen])

  function getProductUrl() {
    return typeof window !== "undefined" ? window.location.href : ""
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(getProductUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement("input")
      input.value = getProductUrl()
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || product.name,
          url: getProductUrl(),
        })
      } catch {
        // usuário cancelou o share nativo
      }
    }
    setShareOpen(false)
  }

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share

  return (
    <div className="flex flex-col pt-2">

      {/* Título + menu de compartilhamento */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="font-bebas text-5xl md:text-6xl text-black leading-none tracking-tight">
            {product.name}
          </h1>
          
        </div>

        <div className="relative" ref={shareRef}>
          <button
            onClick={() => setShareOpen((o) => !o)}
            className="flex flex-col gap-[4px] items-center justify-center w-9 h-9 mt-2 hover:cursor-pointer"
            aria-label="Compartilhar"
          >
            {[...Array(3)].map((_, i) => (
              <span key={i} className="w-[5px] h-[5px] rounded-full bg-black/40" />
            ))}
          </button>

          {shareOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-zinc-200 shadow-lg z-50">
              <ul className="divide-y divide-zinc-100">
                {hasNativeShare && (
                  <li>
                    <button
                      onClick={handleNativeShare}
                      className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm font-abeezee text-black hover:bg-zinc-50 transition-colors"
                    >
                      <IconShare />
                      Compartilhar...
                    </button>
                  </li>
                )}
                <li>
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm font-abeezee text-black hover:bg-zinc-50 transition-colors"
                  >
                    <IconCopy copied={copied} />
                    {copied ? "Link copiado!" : "Copiar link"}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Preço */}
      <p className="font-bebas text-2xl text-black mt-3 tracking-wide">
        {priceFormatted ? <>R$ {priceFormatted}</> : ''}
      </p>

      {/* Estoque */}
      {!product.in_stock && (
        <p className="font-abeezee text-xs text-red-500 mt-1">Fora de estoque</p>
      )}

      {/* ADD TO CART */}
      <div className="mt-5">
        <AddToCartButton product={{ ...product, price: Number(product.price) }} />
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-200 mt-8" />

      {/* Accordion descrição */}
      <button
        onClick={() => setDescOpen((o) => !o)}
        className="flex items-center justify-between w-full py-4 font-abeezee text-sm text-black/60 hover:text-black transition-colors"
      >
        <span>Descrição</span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          className={`transition-transform duration-200 ${descOpen ? "rotate-180" : ""}`}
        >
          <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {descOpen && (
        <p className="font-abeezee text-sm text-black/60 leading-relaxed pb-4">
          {product.description ?? "Camiseta oficial com tecido leve e respirável."}
        </p>
      )}

    </div>
  )
}