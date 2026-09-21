"use client"

import { useEffect, useRef, useState } from "react"
import { ProductsImgCoudinary } from '@/app/ui/ProductsImageCloudinary'
import type { ProductBase } from "@/app/types/products"

type Props = {
  images: ProductBase['images']
  name: string
}

function GalleryImage({
  img,
  alt,
  priority = false,
}: {
  img: ProductBase['images'][number]
  alt: string
  priority?: boolean
}) {
  if (img.public_id) {
    return (
      <ProductsImgCoudinary
        public_id={img.public_id}
        name={alt}
        clas="absolute inset-0 w-full h-full object-cover"
      />
    )
  }

  if (img.url) {
    return (
      <img
        src={img.url}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
      />
    )
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-zinc-200 flex items-center justify-center">
      <span className="font-bebas text-zinc-400 text-xs">IMG</span>
    </div>
  )
}

export function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0)
  const mobileScrollRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const container = mobileScrollRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = slideRefs.current.findIndex((el) => el === entry.target)
            if (index !== -1) setActive(index)
          }
        })
      },
      { root: container, threshold: 0.6 }
    )

    slideRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [images])

  function handleThumbnailClick(i: number) {
    setActive(i)
    slideRefs.current[i]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    })
  }

  if (images.length === 0) {
    return (
      <div className="flex h-[420px] md:h-[480px] items-center justify-center bg-zinc-100 border-2 border-[#e8c300]">
        <span className="font-bebas text-zinc-400 text-sm">Sem imagens</span>
      </div>
    )
  }

  return (
    <div className="md:flex md:gap-3 md:h-[480px] ">

      {/* ═══ MOBILE: carrossel horizontal com scroll-snap, sem thumbnails ═══ */}
      <div
        ref={mobileScrollRef}
        className="
          md:hidden flex overflow-x-auto snap-x snap-mandatory
          h-[420px] gap-0 border-2 border-[#e8c300] no-scrollbar
        "
      >
        {images.map((img, i) => (
          <div
            key={i}
            ref={(el) => { slideRefs.current[i] = el }}
            className="relative w-full h-full shrink-0 snap-center bg-zinc-100"
          >
            <GalleryImage
              img={img}
              alt={`${name} - foto ${i + 1}`}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* ═══ DESKTOP: thumbnails à esquerda (hover troca), imagem grande à direita ═══ */}
      <div className="flex md:flex-col gap-2 pt-5 md:pt-0 shrink-0  h-full overflow-y-auto no-scrollbar">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => handleThumbnailClick(i)}
            onMouseEnter={() => setActive(i)}
            className={`relative w-[68px] h-[68px] shrink-0 overflow-hidden border-2 transition-colors duration-300 ${
              active === i ? "border-[#e8c300]" : "border-transparent"
            }`}
          >
            <GalleryImage img={img} alt={`${name} - foto ${i + 1}`} />
          </button>
        ))}
      </div>

      <div className="hidden md:block relative flex-1 border-2 border-[#e8c300] overflow-hidden bg-zinc-100">
        <GalleryImage img={images[active]} alt={name} priority />
      </div>

    </div>
  )
}