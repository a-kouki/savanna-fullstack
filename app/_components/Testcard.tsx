// app/_components/TestCard.tsx

import { AddToCartButton } from "./Addtocartbutton"

const MOCK_PRODUCT = {
  id: "camiseta-brasil-home",
  name: "Camiseta Brasil Home",
  price: 20,
  image: {url: '', puclic_id:''},
  attributes: {size: []}
}

export function TestCard() {
  return (
    <div className="border border-zinc-200 p-4 max-w-[280px] flex flex-col gap-4">

      {/* Imagem placeholder */}
      <div className="w-full h-48 border-2 border-[#e8c300] bg-zinc-100 flex items-center justify-center">
        <span className="font-bebas text-zinc-400 text-lg">IMG</span>
      </div>

      {/* Info */}
      <div>
        <p className="font-bebas text-xl text-black leading-tight">{MOCK_PRODUCT.name}</p>
        <p className="font-abeezee text-sm text-black/60">
          R${MOCK_PRODUCT.price.toFixed(2).replace(".", ",")}
        </p>
      </div>

      {/* Botão de carrinho isolado */}
      <AddToCartButton product={MOCK_PRODUCT} />

    </div>
  )
}