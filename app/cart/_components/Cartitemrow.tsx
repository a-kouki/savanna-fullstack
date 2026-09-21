"use client"
// app/cart/_components/CartItemRow.tsx

import { CartItem as CartItemType, useCartStore } from "@/lib/cart-store"
import { ProductsImgCoudinary } from "@/app/ui/ProductsImageCloudinary"

export function CartItemRow({ item }: { item: CartItemType }) {
  const { removeItem, updateQty, updateSize, itemDiscount } = useCartStore()

  const discount = itemDiscount(item)
  const hasDiscount = discount > 0
  const lineTotal = item.price * item.qty
  const lineTotalDiscounted = lineTotal - discount

  return (
    <div className="flex gap-4 md:gap-6 py-6 border-b border-zinc-100 items-start">

      {/* Imagem */}
      <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] shrink-0 border-2 border-[#e8c300] overflow-hidden bg-zinc-100 flex items-center justify-center relative">
        {item.public_id ? (
          <ProductsImgCoudinary
            public_id={item.public_id}
            name={item.name}
            clas="object-cover"
          />
        ) : item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-bebas text-zinc-400 text-xs text-center px-2">IMG</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bebas text-xl text-black leading-tight">{item.name}</p>
          {hasDiscount && (
            <span className="font-abeezee text-[9px] uppercase tracking-widest px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200">
              Cupom aplicado
            </span>
          )}
        </div>

        {/* Seletor de tamanho — usa availableSizes do item */}
        {item.availableSizes?.length > 0 ? (
          <div className="flex items-center gap-2 mt-2 mb-3 flex-wrap">
            <span className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">Tamanho:</span>
            {item.availableSizes.map((s) => (
              <button
                key={s}
                onClick={() => updateSize(item.id, item.size, s)}
                className={`
                  w-8 h-8 font-bebas text-sm transition-all duration-150 border
                  ${item.size === s
                    ? 'bg-[#e8c300] border-[#e8c300] text-black'
                    : 'border-black/[0.12] text-black/40 hover:border-black/30 hover:text-black'
                  }
                `}
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <p className="font-abeezee text-[11px] text-black/30 mt-1 mb-3">
            Tamanho: {item.size}
          </p>
        )}

        {/* Ações: lixeira + qty */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => removeItem(item.id, item.size)}
            className="text-black/30 hover:text-red-500 transition-colors duration-200"
            aria-label="Remover"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>

          {/* Qty */}
          <div className="flex items-center border border-black/[0.12] h-8">
            <button
              onClick={() => updateQty(item.id, item.size, item.qty - 1)}
              className="w-8 h-full flex items-center justify-center font-bebas text-lg hover:bg-zinc-100 transition-colors"
            >
              −
            </button>
            <span className="w-7 text-center font-abeezee text-sm">{item.qty}</span>
            <button
              onClick={() => updateQty(item.id, item.size, item.qty + 1)}
              className="w-8 h-full flex items-center justify-center font-bebas text-lg hover:bg-zinc-100 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Preço */}
      <div className="shrink-0 text-right">
        {hasDiscount ? (
          <>
            <p className="font-abeezee text-xs text-black/30 line-through">
              R$ {lineTotal.toFixed(2).replace(".", ",")}
            </p>
            <p className="font-bebas text-xl text-emerald-600 tracking-wide">
              R$ {lineTotalDiscounted.toFixed(2).replace(".", ",")}
            </p>
          </>
        ) : (
          <p className="font-bebas text-xl text-black tracking-wide">
            R$ {lineTotal.toFixed(2).replace(".", ",")}
          </p>
        )}
      </div>

    </div>
  )
}