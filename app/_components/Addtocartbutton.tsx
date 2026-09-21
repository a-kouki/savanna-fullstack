"use client"
// app/_components/AddToCartButton.tsx

import { useState } from "react"
import { useCartStore } from "@/lib/cart-store"

type Product = {
  id: number
  name: string
  price: number
  images: { url: string; public_id: string | null }[]
  attributes: {
    sizes: string[]
  }
}

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [feedback,     setFeedback]     = useState(false)
  const [error,        setError]        = useState(false)

  const sizes = product.attributes?.sizes ?? []
  const hasSizes = sizes.length > 0

  function handleAdd() {
    if (!selectedSize) {
      setError(true)
      setTimeout(() => setError(false), 1200)
      return
    }

    addItem({
      id: String(product.id),
      name: product.name,
      price: product.price,
      size: selectedSize,
      availableSizes: product.attributes.sizes,
      image: product.images?.[0]?.url,
      public_id: product.images?.[0]?.public_id ?? undefined
    })

    setFeedback(true)
    setTimeout(() => setFeedback(false), 1500)
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Seletor de tamanho */}
      {hasSizes ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">Tamanho:</span>
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => { setSelectedSize(s); setError(false) }}
                className={`
                  w-9 h-9 font-bebas text-sm transition-all duration-150 border
                  ${selectedSize === s
                    ? 'bg-[#e8c300] border-[#e8c300] text-black'
                    : error
                      ? 'border-red-400 text-red-400'
                      : 'text-black hover:bg-zinc-100 '
                  }
                `}
              >
                {s}
              </button>
            ))}
          </div>
          {error && (
            <p className="font-abeezee text-[11px] text-red-400">
              Selecione um tamanho
            </p>
          )}
        </div>
      ) : (
        <p className="font-abeezee text-[11px] text-black/30">
          Tamanhos não disponíveis para este produto.
        </p>
      )}

      {/* Botão */}
      <button
        onClick={handleAdd}
        disabled={!hasSizes}
        className={`
          w-full h-11 font-bebas text-lg tracking-widest transition-all duration-200
          disabled:opacity-30 disabled:cursor-not-allowed
          ${feedback
            ? 'bg-[#e8c300] text-black'
            : 'bg-black text-white hover:bg-[#e8c300] hover:text-black'
          }
        `}
      >
        {feedback ? 'Adicionado ✓' : 'Adicionar ao carrinho'}
      </button>

    </div>
  )
}