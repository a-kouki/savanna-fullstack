'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10)
}

const PRESETS = [
  { label: '7 dias', days: 6 },
  { label: '30 dias', days: 29 },
  { label: '90 dias', days: 89 },
]

export default function MetricsDateFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [from, setFrom] = useState(searchParams.get('from') ?? '')
  const [to, setTo] = useState(searchParams.get('to') ?? '')

  function applyRange(newFrom: string, newTo: string) {
    const params = new URLSearchParams()
    params.set('from', newFrom)
    params.set('to', newTo)
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function applyPreset(days: number) {
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(toDate.getDate() - days)
    const newFrom = toISODate(fromDate)
    const newTo = toISODate(toDate)
    setFrom(newFrom)
    setTo(newTo)
    applyRange(newFrom, newTo)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap w-full sm:w-auto">
      <div className="flex items-center gap-2 flex-wrap">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.days)}
            className="font-abeezee text-xs uppercase tracking-widest border border-black/[0.08] px-3 py-2 hover:bg-black hover:text-white transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border border-black/[0.08] px-2 py-2 text-sm flex-1 min-w-0 sm:flex-none" />
        <span className="text-black/40 text-xs">até</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border border-black/[0.08] px-2 py-2 text-sm flex-1 min-w-0 sm:flex-none" />
        <button
          onClick={() => applyRange(from, to)}
          disabled={isPending}
          className="font-abeezee text-xs uppercase tracking-widest bg-black text-white px-4 py-2 hover:bg-[#e8c300] hover:text-black transition-colors disabled:opacity-50"
        >
          {isPending ? '...' : 'Aplicar'}
        </button>
      </div>
    </div>
  )
}