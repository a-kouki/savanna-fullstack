// app/ui/ProductDetail.tsx
import Image from 'next/image'
import { getRationclass } from '../lib/ratio'
import { ProductActions } from './Productactions'
import { ProductsImgCoudinary } from './ProductsImageCloudinary'
import { getProductsBySrc } from '../lib/queries'

export async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductsBySrc(id)

  if (!product?.name) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/20">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="font-bebas text-2xl tracking-widest text-black/30">Produto não encontrado</p>
        <p className="font-abeezee text-xs text-black/30">
          O produto que você procura não existe ou foi removido.
        </p>
      </div>
    )
  }

  const hasTags = product.attributes?.tags?.length > 0
  const hasSizes = product.attributes?.sizes?.length > 0

  return (
    <div className="flex flex-col sm:flex-row gap-5 sm:gap-7">

      {/* ── Imagem ──────────────────────────────────────────────────────── */}
      <div className={`
        relative w-full sm:w-[42%] shrink-0
        ${getRationclass(product.attributes?.ratio)}
        overflow-hidden bg-zinc-100
      `}>
        {product.public_id ? (
          <ProductsImgCoudinary
            public_id={product.public_id}
            name={product.name}
            clas="object-cover"
          />
        ) : (
          <Image
            src="/favicon.png"
            alt={product.name}
            fill
            loading="lazy"
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 42vw"
          />
        )}

        {/* Preço sobreposto na imagem */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent">
          <p className="font-bebas text-3xl text-white leading-none">{product.price}</p>
        </div>
      </div>

      {/* ── Info ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">

        {/* Nome + meta */}
        <div>
          <p className="font-bebas text-4xl sm:text-5xl text-black leading-tight">{product.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {product.attributes?.brand && (
              <span className="font-abeezee text-[11px] text-black/40">{product.attributes.brand}</span>
            )}
            {product.attributes?.brand && product.attributes?.category && (
              <span className="text-black/20 text-[11px]">·</span>
            )}
            {product.attributes?.category && (
              <span className="font-abeezee text-[11px] text-black/40">{product.attributes.category}</span>
            )}
            <span className={`
              font-abeezee text-[10px] px-2 py-0.5 ml-auto
              ${product.in_stock
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-black/[0.04] text-black/40'
              }
            `}>
              {product.in_stock ? 'Em estoque' : 'Indisponível'}
            </span>
          </div>
        </div>

        {/* Tamanhos */}
        {hasSizes && (
          <div>
            <p className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest mb-2">
              Tamanhos disponíveis
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {product.attributes.sizes.map((s: string) => (
                <span
                  key={s}
                  className="font-bebas text-sm w-9 h-9 flex items-center justify-center border border-black/[0.12] text-black/60"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {hasTags && (
          <div className="flex flex-wrap gap-1.5">
            {product.attributes.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="font-abeezee text-[11px] text-black/50 bg-black/[0.04] border border-black/[0.06] px-2.5 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Descrição */}
        {product.description && (
          <div>
            <p className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest mb-1">
              Descrição
            </p>
            <p className="font-abeezee text-sm text-black/70 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="mt-auto pt-2">
          <ProductActions
            name={product.name}
            price={product.price}
            src={product.src}
            description={product.description}
          />
        </div>

      </div>
    </div>
  )
}