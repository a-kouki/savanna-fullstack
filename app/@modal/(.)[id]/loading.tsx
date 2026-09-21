// app/@modal/(.)products/[id]/loading.tsx

export function LoadingSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 animate-pulse">

      {/* Imagem */}
      <div className="w-full sm:w-[42%] aspect-[4/5] shrink-0 bg-black/[0.06]" />

      {/* Info */}
      <div className="flex flex-col gap-4 flex-1">

        {/* Nome */}
        <div className="flex flex-col gap-2">
          <div className="h-10 sm:h-12 w-3/4 bg-black/[0.08]" />
          <div className="h-3 w-1/3 bg-black/[0.05]" />
        </div>

        {/* Tamanhos */}
        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-24 bg-black/[0.05]" />
          <div className="flex gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-9 h-9 bg-black/[0.06]" />
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap">
          {[64, 80, 56, 72].map((w, i) => (
            <div key={i} style={{ width: w }} className="h-6 bg-black/[0.05]" />
          ))}
        </div>

        {/* Descrição */}
        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-16 bg-black/[0.05]" />
          <div className="h-3 w-full bg-black/[0.05]" />
          <div className="h-3 w-[85%] bg-black/[0.04]" />
          <div className="h-3 w-[70%] bg-black/[0.04]" />
        </div>

        {/* Botão ação */}
        <div className="mt-auto pt-2">
          <div className="h-12 w-full bg-black/[0.08]" />
        </div>

      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="
      fixed inset-0 z-50
      bg-black/50 backdrop-blur-[3px]
      flex items-end sm:items-center justify-center
    ">
      <div className="
        bg-white w-full sm:w-[90%] sm:max-w-3xl
        max-h-[92vh] sm:max-h-[88vh] overflow-y-auto no-scrollbar
        border-t-2 border-t-[#e8c300]
        sm:border sm:border-black/[0.08]
        p-5 sm:p-7
      ">
        <LoadingSkeleton />
      </div>
    </div>
  )
}