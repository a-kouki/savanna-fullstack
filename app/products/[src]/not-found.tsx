// app/products/[id]/not-found.tsx

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">

      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="text-black/15">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
        <line x1="11" y1="8" x2="11" y2="11"/>
        <line x1="11" y1="14" x2="11.01" y2="14"/>
      </svg>

      <div className="flex flex-col gap-1">
        <p className="font-bebas text-3xl tracking-widest text-black/20">Produto não encontrado</p>
        <p className="font-abeezee text-xs text-black/35">
          O produto que você procura não existe ou foi removido.
        </p>
      </div>

    </div>
  )
}