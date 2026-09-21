// app/_components/CategoryPageClient.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { ProductCard } from "./Productcard"
import { ProductBase as Product } from "../types/products"

type SearchProduct = {
  id: number
  name: string
  src: string
  price: number | null
  images: { url: string; public_id: string | null }[]
}

type CategoryLite = { id: string; name: string; slug: string }

export function CategoryPageClient({
  currentSlug,
  categoryName,
  categoryProducts,
  categories,
}: {
  currentSlug: string
  categoryName: string
  categoryProducts: Product[]
  categories: CategoryLite[]
}) {
  const [query, setQuery] = useState("")
  const [globalProducts, setGlobalProducts] = useState<SearchProduct[]>([])
  const [loadedGlobal, setLoadedGlobal] = useState(false)
  const [loadingGlobal, setLoadingGlobal] = useState(false)

  const isSearching = query.trim().length > 0

  // busca a lista completa só na primeira vez que o campo é usado
  function ensureGlobalLoaded() {
    if (loadedGlobal || loadingGlobal) return
    setLoadingGlobal(true)
    fetch('/api/search/products')
      .then((res) => res.json())
      .then((data: SearchProduct[]) => {
        setGlobalProducts(data)
        setLoadedGlobal(true)
      })
      .finally(() => setLoadingGlobal(false))
  }

  const searchResults = isSearching
    ? globalProducts.filter((p) =>
        p.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : []

  return (
    <div>
      {/* nav de categorias + busca global lado a lado */}
      <div className="flex justify-center border-b border-zinc-100">
        <div className="w-full max-w-widthGlobal px-4 md:px-pxGloabl flex items-center justify-between gap-4 py-4">
          <nav className="flex gap-6 overflow-x-auto">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}`}
                scroll={false}
                className={`font-abeezee text-sm whitespace-nowrap pb-1 border-b-2 transition-colors ${
                  c.slug === currentSlug
                    ? 'border-black text-black'
                    : 'border-transparent text-zinc-400 hover:text-black'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <input
            type="text"
            value={query}
            onFocus={ensureGlobalLoaded}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full max-w-[220px] border border-zinc-300 px-3 py-1.5 text-sm font-abeezee focus:border-black outline-none transition-colors flex-shrink-0"
          />
        </div>
      </div>

      <div className="flex justify-center py-10">
        <div className="w-full max-w-widthGlobal px-4 md:px-pxGloabl">
          <h1 className="font-bebas text-4xl md:text-5xl text-black mb-6 tracking-wide">
            {isSearching ? `Resultados para "${query}"` : categoryName}
          </h1>

          {isSearching ? (
            loadingGlobal ? (
              <p className="font-abeezee text-sm text-zinc-500">Carregando...</p>
            ) : searchResults.length === 0 ? (
              <p className="font-abeezee text-sm text-zinc-500">
                Nenhum produto encontrado para "{query}".
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {searchResults.map((product) => (
                  <Link key={product.id} href={`/${product.name}`} className="block">
                    <div className="aspect-square bg-zinc-100 mb-2 overflow-hidden">
                      {product.images?.[0]?.url && (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <p className="font-abeezee text-sm text-black truncate">{product.name}</p>
                    {product.price != null && (
                      <p className="font-abeezee text-sm text-zinc-500">
                        R$ {product.price.toFixed(2)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )
          ) : categoryProducts.length === 0 ? (
            <p className="font-abeezee text-sm text-zinc-500">
              Nenhum produto nesta categoria ainda.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}