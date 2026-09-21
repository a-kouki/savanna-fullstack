// app/_components/FeaturedProducts.tsx
import { ProductCard } from './Productcard'

import { ProductBase as Product } from '../types/products'

export function FeaturedProducts({ products }: { products: Product[] }) {
  const featured = products
    .filter((p) => p.in_stock)
    .slice(0, 10)

  if (featured.length === 0) return null

  return (
    <section id="camisetas" className="bg-white py-10">
      <div className="flex justify-center">
        <div className="w-full max-w-widthGlobal px-4 md:px-pxGloabl">
          <h2 className="font-bebas text-4xl md:text-5xl text-black mb-6 tracking-wide">
            Destaques
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-4 px-4 md:px-[calc((100%-1200px)/2+40px)] w-max items-start">
          {featured.slice(0,10).map((product) => (
          <div key={product.id} className="w-40 sm:w-44 shrink-0 min-w-0">
              <ProductCard product={product} />
            </div>
          ))}
          {featured.length > 5 && (
            <div className="self-center shrink-0">
              <a
                href=""
                className="font-abeezee text-sm px-8 py-2 hover:bg-black hover:text-white transition-colors duration-200"
              >
                mais →
              </a>
            </div>
          )}
          
        </div>
      </div>
    </section>
  )
}