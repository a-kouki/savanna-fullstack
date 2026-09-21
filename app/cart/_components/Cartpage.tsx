// app/cart/CartPage.tsx
"use client"
import { useCartStore } from "@/lib/cart-store"
import { CartItemRow } from "./Cartitemrow"
import { CheckoutForm } from "./Checkoutform"

export function CartPage() {
  const { items, total } = useCartStore()

  const year = 2026

  return (
    <div className="bg-white min-h-screen">

      {/* ── LISTA DE ITENS ── */}
      <main className="flex justify-center pt-24">
        <div className="w-full max-w-widthGlobal px-4 md:px-pxGloabl">

          {/* Cabeçalho */}
          <div className="flex items-baseline justify-between mb-2 py-4">
            <h1 className="font-bebas text-3xl text-black tracking-wide">Lista Salvos</h1>
            <span className="font-abeezee text-sm text-black/40">{items.length} itens</span>
          </div>

          <div className="border-t border-zinc-200" />

          {/* Itens */}
          {items.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-bebas text-2xl text-zinc-300 tracking-wide">Carrinho vazio</p>
              <a
                href="/products"
                className="inline-block mt-4 font-abeezee text-sm text-black underline underline-offset-4 hover:text-primary transition-colors"
              >
                Ver camisetas
              </a>
            </div>
          ) : (
            <>
              {items.map((item: any) => (
                <CartItemRow key={`${item.id}-${item.size}`} item={item} />
              ))}

              {/* Total */}
              <div className="flex justify-end items-baseline gap-3 py-6 border-t border-zinc-200">
                <span className="font-bebas text-xl text-black/50 tracking-wide">Total:</span>
                <span className="font-bebas text-3xl text-black tracking-wide">
                  ${total().toFixed(2).replace(".", ",")}
                </span>
              </div>
            </>
          )}

        </div>
      </main>

      {/* ── FORMULÁRIO + WHATSAPP ── */}
      <div className="border-t-4 border-zinc-100">
        <div className="flex justify-center">
          <div className="w-full max-w-widthGlobal px-4 md:px-pxGloabl">
            <CheckoutForm />
          </div>
        </div>
      </div>

      {/* ── CARROSSEL RELACIONADOS ── */}
      <div className="border-t-4 border-zinc-100">
        <div className="flex justify-center">
          <div className="w-full max-w-widthGlobal px-4 md:px-pxGloabl">
            {/*<RelatedCarousel />*/}
          </div>
        </div>
      </div>

      {/* ── SAVANNA FOOTER ── */}
      <footer className="bg-black flex flex-col pt-8 ">
        {/* Nome grande */}
        <div className="flex justify-center ">
            <div
                className="
                w-full max-w-widthGlobal px-4 md:px-pxGloabl 
                flex
                justify-between
                font-bebas
                text-white
                uppercase
                leading-none
                pointer-events-none
                relative
                md:-translate-y-20
                -translate-y-12
                "
                style={{ fontSize: "clamp(60px, 18vw, 220px)" }}
            >
                {"SAVANNA".split("").map((letter, index) => (
                <span key={index}>{letter}</span>
                ))}
            </div>
        </div>

        {/* Crédito */}
        <div className="flex justify-center border-t border-zinc-100">
            <div className="w-full max-w-widthGlobal px-4 md:px-pxGloabl flex justify-end py-4">
            <a
                href="https://koukiwebservice.com"
                target="_blank"
                rel="noreferrer"
                className="font-abeezee text-xs text-white/40"
            >
                @{year}
            </a>
            </div>
        </div>
        </footer>

    </div>
  )
}