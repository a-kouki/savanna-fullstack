// app/_components/CategoryProductsGrid.tsx
"use client"

import { useState } from "react"
import { ProductCard } from "./Productcard"
import type { Product } from "../types/products"

export function CategoryProductsGrid({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("")

  const filtered = query.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : products

  return (
    <div>
      <div className="mb-6 max-w-xs">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar nesta categoria..."
          className="w-full border border-zinc-300 px-4 py-2.5 text-sm font-abeezee focus:border-black outline-none transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="font-abeezee text-sm text-zinc-500">
          {query.trim()
            ? `Nenhum produto encontrado para "${query}".`
            : "Nenhum produto nesta categoria ainda."}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
