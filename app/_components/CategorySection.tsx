// app/_components/CategorySection.tsx

import Link from "next/link"
import { ProductCard } from "./Productcard"
import { ProductBase as Product } from "../types/products"
export function CategorySection({
  title,
  slug,
  products,
}: {
  title: string
  slug: string
  products: Product[]
}) {
  return (
    <section className="bg-white py-10 border-t border-zinc-100">
      <div className="flex justify-center">
        <div className="w-full max-w-widthGlobal px-4 md:px-pxGloabl">

          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bebas text-4xl md:text-5xl text-black tracking-wide">
              {title}
            </h2>
            <Link
              href={`/categoria/${slug}`}
              className="font-abeezee text-sm text-black hover:underline hidden sm:inline-block"
            >
              ver tudo →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="flex justify-center mt-8 sm:hidden">
            <Link
              href={`/categoria/${slug}`}
              className="font-abeezee text-sm border border-black px-8 py-2 hover:bg-black hover:text-white transition-colors duration-200 inline-block text-center"
            >
              mais →
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}