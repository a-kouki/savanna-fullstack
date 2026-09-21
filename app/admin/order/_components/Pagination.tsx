'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function goToPage(pageNumber: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(pageNumber))
    router.push(`${pathname}?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="font-abeezee text-[11px] uppercase tracking-widest px-3 py-1.5 border border-black/[0.12] text-black/60 disabled:opacity-30 hover:border-black/30"
      >
        Anterior
      </button>

      <span className="font-abeezee text-[11px] text-black/40 uppercase tracking-widest">
        Página {currentPage} de {totalPages}
      </span>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="font-abeezee text-[11px] uppercase tracking-widest px-3 py-1.5 border border-black/[0.12] text-black/60 disabled:opacity-30 hover:border-black/30"
      >
        Próxima
      </button>
    </div>
  )
}