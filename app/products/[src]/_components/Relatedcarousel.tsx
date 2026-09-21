// SEM "use client" — Server Component

import Image from "next/image"
import { getProducts } from "@/app/lib/queries"
import { RelatedScroll } from "./RelatedScroll" 

type Props = {
  categorySlug: string | null
  currentSrc: string
}

export async function RelatedCarousel({ categorySlug, currentSrc }: Props) {
  if (!categorySlug) return null 
  const allProducts = await getProducts()

  const related = Object.values(allProducts).filter(
    (p) => p.category_slug === categorySlug && p.src !== currentSrc
  )

  if (related.length === 0) return null

  return (
    <section className="w-full py-12">
      <h2 className="font-bebas text-2xl text-black mb-6 tracking-wide">
        Você também pode gostar
      </h2>
      <RelatedScroll items={related} />
    </section>
  )
}