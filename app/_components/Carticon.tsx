"use client"

import { useCartStore } from "@/lib/cart-store"
import { IconBag } from "@/app/ui/Icons"


export function CartIcon() {
  const items = useCartStore((s) => s.items)
  const count = items.reduce((acc, i) => acc + i.qty, 0)

  return (
    <a
      href="/cart"
      className="relative flex items-center justify-center text-white hover:text-secondary transition-colors duration-200"
      aria-label="Carrinho"
    >
      <IconBag/>

      {/* Badge quantidade */}
      {count > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[#e8c300] text-black font-bebas text-[11px] leading-none rounded-full flex items-center justify-center px-[3px]">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </a>
  )
}