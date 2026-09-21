"use client"
import Link from 'next/link'
import { ProductsImgCoudinary } from '@/app/ui/ProductsImageCloudinary'
import { ProductBase as Product } from '../types/products'
import { useState } from 'react'
import { IconShare, IconBag } from '../ui/Icons'
import { useCartStore } from '@/lib/cart-store'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [hov, setHov] = useState(false)
  const [showSizes, setShowSizes] = useState(false)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const sizes = product.attributes?.sizes ?? []

  function resetHoverState() {
    setHov(false)
    setShowSizes(false)
  }

  function addToCart(size: string) {
    addItem({
      id: String(product.id),
      name: product.name,
      price: product.price ?? 0,
      size,
      availableSizes: sizes,
      image: product.images?.[0]?.url,
      public_id: product.images?.[0]?.public_id ?? undefined,
    })

    setShowSizes(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  function handleBuyClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (sizes.length > 1) {
      setShowSizes(true)
      return
    }
    addToCart(sizes[0] ?? 'ÚNICO')
  }

  function handleSizeClick(e: React.MouseEvent, size: string) {
    e.preventDefault()
    e.stopPropagation()
    addToCart(size)
  }

  function handleMobileBuyClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (sizes.length > 1) {
      window.location.href = `/${product.src}`
      return
    }
    addToCart(sizes[0] ?? 'ÚNICO')
  }

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || product.name,
        })
      } catch {
        // usuário cancelou
      }
    }
  }

  return (
    <Link
      href={`/products/${product.src}`}
      className="relative flex flex-col gap-4 group cursor-pointer min-w-0"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={resetHoverState}
    >

      {/* Container geral da moldura + imagem — TAMANHO CONTROLADO AQUI */}
      <div className="relative w-full aspect-[4/5] rounded-[15px] overflow-hidden">
        {/* MOLDURA AMARELA */}
        <svg
          className="absolute inset-0 w-full h-full rounded-2xl"
          style={{ backgroundColor: '#F3F3F3' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path d="M0,0 H100 V55 Q50,75 0,55 Z" fill="#FFE500" />
        </svg>

        {/* IMAGEM */}
        <div className="relative w-full h-full p-2">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            {(() => {
              const cover = product.images?.[0]

              if (cover?.public_id) {
                return (
                  <ProductsImgCoudinary
                    public_id={cover.public_id}
                    name={product.name}
                    clas="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                  />
                )
              }

              if (cover?.url) {
                return (
                  <img
                    src={cover.url}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-[15px] transition-transform duration-300 group-hover:scale-105"
                  />
                )
              }

              return (
                <div className="w-full h-full bg-zinc-200 rounded-[15px] flex items-center justify-center">
                  <span className="font-bebas text-zinc-400 text-xs">IMG</span>
                </div>
              )
            })()}

            {!product.in_stock && (
              <div className="absolute inset-0 bg-white/60 rounded-[15px] flex items-center justify-center">
                <span className="font-bebas text-sm tracking-widest text-black/40">
                  Indisponível
                </span>
              </div>
            )}
          </div>
        </div>

        {hov && (
          <>
            <div className="hidden sm:block absolute inset-0 rounded-2xl z-10" style={{ backgroundColor: '#FFE500', opacity: 0.5 }} />

            <div className="hidden sm:flex absolute inset-0 justify-center items-center z-10 px-4">
              {added ? (
                <div className="h-10 px-5 flex items-center justify-center rounded-full bg-black text-white font-bebas text-sm tracking-widest">
                  ✓
                </div>
              ) : showSizes ? (
                <div className="flex items-center gap-1.5 flex-wrap justify-center h-full w-full">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={(e) => handleSizeClick(e, s)}
                      className="h-9 w-9 flex items-center justify-center rounded-full bg-black text-white font-bebas text-sm hover:bg-[#e8c300] hover:text-black transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-zinc-800 transition-colors hover:cursor-pointer"
                  >
                    <IconShare />
                  </button>
                  <button
                    onClick={handleBuyClick}
                    className="h-10 px-5 flex items-center justify-center rounded-full bg-black text-white font-bebas text-sm tracking-widest hover:bg-zinc-800 transition-colors hover:cursor-pointer"
                  >
                    Comprar
                  </button>
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* INFORMAÇÕES */}
      <div className="flex flex-col px-1 -mt-1 w-[70%]">
        <h3 className="font-bebas text-xl tracking-tight text-black leading-none uppercase line-clamp-2">
          {product.name}
        </h3>
        <span className="font-bebas text-xl text-black leading-none mt-1">
          ${product.price}
        </span>

        {/* BOTÃO MOBILE — também dentro do container fixo */}
        <button
          onClick={handleMobileBuyClick}
          className="sm:hidden absolute bottom-2 right-0 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black text-white"
        >
          {added ? <>✓</> : <IconBag />}
        </button>
      </div>

    </Link>
  )
}