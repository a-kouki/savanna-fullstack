'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'

type Preset = 'today' | '7d' | '30d' | 'month' | 'all' | 'custom'

function formatDateInput(date: Date) {
  return date.toISOString().split('T')[0] // YYYY-MM-DD
}

export default function DateFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentFrom = searchParams.get('from') ?? ''
  const currentTo = searchParams.get('to') ?? ''

  const [from, setFrom] = useState(currentFrom)
  const [to, setTo] = useState(currentTo)

  function applyRange(newFrom: string, newTo: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (newFrom) params.set('from', newFrom)
    else params.delete('from')

    if (newTo) params.set('to', newTo)
    else params.delete('to')

    router.push(`${pathname}?${params.toString()}`)
  }

  function applyPreset(preset: Preset) {
    const now = new Date()
    let start: Date | null = null
    let end: Date | null = now

    switch (preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case '7d':
        start = new Date(now)
        start.setDate(now.getDate() - 7)
        break
      case '30d':
        start = new Date(now)
        start.setDate(now.getDate() - 30)
        break
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'all':
        start = null
        end = null
        break
    }

    const newFrom = start ? formatDateInput(start) : ''
    const newTo = end ? formatDateInput(end) : ''

    setFrom(newFrom)
    setTo(newTo)
    applyRange(newFrom, newTo)
  }

  const activePreset = !currentFrom && !currentTo

  return (
    <div className="flex flex-col gap-3 border border-black/[0.08] bg-white p-4">

      {/* Presets rápidos */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: 'today' as Preset, label: 'Hoje' },
          { key: '7d' as Preset, label: 'Últimos 7 dias' },
          { key: '30d' as Preset, label: 'Últimos 30 dias' },
          { key: 'month' as Preset, label: 'Este mês' },
          { key: 'all' as Preset, label: 'Todos' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className={`font-abeezee text-[11px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
              key === 'all' && activePreset
                ? 'bg-[#e8c300] border-[#e8c300] text-black'
                : 'border-black/[0.12] text-black/50 hover:border-black/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Intervalo customizado */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="font-abeezee text-[10px] uppercase tracking-widest text-black/40">De</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="font-abeezee text-sm border border-black/[0.12] px-2 py-1 text-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-abeezee text-[10px] uppercase tracking-widest text-black/40">Até</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="font-abeezee text-sm border border-black/[0.12] px-2 py-1 text-black"
          />
        </div>

        <button
          onClick={() => applyRange(from, to)}
          className="font-abeezee text-[11px] uppercase tracking-widest px-3 py-1.5 bg-black text-white"
        >
          Aplicar
        </button>

        {(currentFrom || currentTo) && (
          <button
            onClick={() => {
              setFrom('')
              setTo('')
              applyRange('', '')
            }}
            className="font-abeezee text-[11px] uppercase tracking-widest px-3 py-1.5 text-black/40 hover:text-black"
          >
            Limpar
          </button>
        )}
      </div>
    </div>
  )
}