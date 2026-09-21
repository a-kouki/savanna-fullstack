// app/_components/AllProducts.tsx
"use client"

import { useState } from "react"
import { ProductCard } from "./Productcard"

import { ProductBase as Product } from "../types/products"

const PAGE_SIZE = 8

export function AllProducts({ products }: { products: Product[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const hasMore = visible < products.length + 20

  return (
    <section className="bg-white py-10 border-t border-zinc-100">
      <div className="flex justify-center">
        <div className="w-full max-w-widthGlobal px-4 md:px-pxGloabl">

          <h2 className="font-bebas text-4xl md:text-5xl text-black mb-6 tracking-wide">
            Camisetas
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {products.slice(0, 12).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="font-abeezee text-sm border border-black px-8 py-2 hover:bg-black hover:text-white transition-colors duration-200"
              >
                mais →
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  )
}