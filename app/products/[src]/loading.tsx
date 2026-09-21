// loading.tsx
export function LoadingSkeleton() {
  return (
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-5xl mx-auto">

        {/* Imagem */}
        <div className="relative w-full sm:w-[45%] aspect-[4/3] rounded-2xl bg-black/8 shrink-0" />

        {/* Info */}
        <div className="flex flex-col w-full sm:w-[45%] gap-3">

          {/* Nome + ano */}
          <div>
            <div className="h-10 sm:h-14 w-3/4 rounded-lg bg-black/8 mb-2" />
            <div className="h-3.5 w-1/4 rounded bg-black/6" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {[80, 96, 72, 88, 64].map((w, i) => (
              <div key={i} className={`h-6 w-[${w}px] rounded-full bg-black/6`} />
            ))}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <div className="h-3.5 w-1/3 rounded bg-black/8" />
            <div className="h-3.5 w-full rounded bg-black/6" />
            <div className="h-3.5 w-[90%] rounded bg-black/6" />
            <div className="h-3.5 w-[75%] rounded bg-black/6" />
          </div>

          {/* CarActions */}
          <div className="flex gap-2 mt-auto pt-2">
            <div className="h-10 flex-1 rounded-full bg-black/8" />
            <div className="h-10 flex-1 rounded-full bg-black/6" />
          </div>

        </div>
      </div>
  )
}

export default function Loading() {
  return (
    <LoadingSkeleton />
  )
}