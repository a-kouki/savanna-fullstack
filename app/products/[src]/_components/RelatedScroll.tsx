// app/[id]/_components/RelatedScroll.tsx
"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"

type Item = {
  src: string
  name: string
  price: number | null
  images: { url: string; public_id: string | null }[]
}

export function RelatedScroll({ items }: { items: Item[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white border border-zinc-200 shadow-sm transition-all"
        aria-label="Anterior"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto no-scrollbar px-10 scroll-smooth"
      >
        {items.map((item) => (
          <Link
            key={item.src}
            href={`/${item.src}`}
            className="flex flex-col gap-3 shrink-0 w-[240px] md:w-[280px] group"
          >
            <div className="relative w-full h-[260px] md:h-[300px] border-2 border-[#e8c300] overflow-hidden bg-zinc-100">
              <Image
                src={item.images?.[0]?.url ?? '/placeholder.png'}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="280px"
              />
            </div>
            <div>
              <p className="font-bebas text-black text-lg leading-tight">{item.name}</p>
              {item.price != null && (
                <p className="font-abeezee text-sm text-black">
                  R$ {item.price.toFixed(2).replace(".", ",")}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white border border-zinc-200 shadow-sm transition-all"
        aria-label="Próxima"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 2l5 5-5 5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}