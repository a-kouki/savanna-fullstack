'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

export default function SearchInput() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [value, setValue] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      params.set('page', '1') 

      startTransition(() => {
        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 400) 

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <div className="relative flex-1 min-w-[200px]">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar por nome ou código do pedido..."
        className="font-abeezee text-sm border-b border-black/[0.12] focus:border-black w-full px-2 py-2 outline-none bg-transparent"
      />
      {isPending && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 font-abeezee text-[10px] text-black/30">
          buscando...
        </span>
      )}
    </div>
  )
}