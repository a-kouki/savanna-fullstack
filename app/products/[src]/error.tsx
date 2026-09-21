// /[id]/error.tsx
'use client'

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-xl font-semibold">Algo deu errado</h2>
      <p className="text-black/50 text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="px-6 py-2 rounded-full bg-black text-white text-sm hover:bg-black/80 transition"
      >
        Tentar novamente
      </button>
    </div>
  )
}