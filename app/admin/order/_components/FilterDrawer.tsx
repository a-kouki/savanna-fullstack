// app/admin/orders/_components/FilterDrawer.tsx
'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const PAYMENT_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Pix', value: 'pix' },
  { label: 'Cartão', value: 'cartao' },
  { label: 'Dinheiro', value: 'dinheiro' },
]

function toISODate(date: Date) {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

function getPresetRange(preset: 'today' | 'week' | 'month') {
  const now = new Date()

  if (preset === 'today') {
    const today = toISODate(now)
    return { from: today, to: today }
  }

  if (preset === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay()) 
    return { from: toISODate(start), to: toISODate(now) }
  }

  // month
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { from: toISODate(start), to: toISODate(now) }
}

export default function FilterDrawer() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const [from, setFrom] = useState(searchParams.get('from') ?? '')
  const [to, setTo] = useState(searchParams.get('to') ?? '')
  const [validated, setValidated] = useState(searchParams.get('validated') ?? 'all')
  const [payment, setPayment] = useState(searchParams.get('payment') ?? '')
  const [minTotal, setMinTotal] = useState(searchParams.get('minTotal') ?? '')
  const [maxTotal, setMaxTotal] = useState(searchParams.get('maxTotal') ?? '')

  const [activePreset, setActivePreset] = useState<'today' | 'week' | 'month' | null>(null)

  // trava scroll do body quando o drawer está aberto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // fecha com Esc
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const activeCount = [from, to, validated !== 'all' ? validated : '', payment, minTotal, maxTotal]
    .filter(Boolean).length

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString())

    from ? params.set('from', from) : params.delete('from')
    to ? params.set('to', to) : params.delete('to')
    validated !== 'all' ? params.set('validated', validated) : params.delete('validated')
    payment ? params.set('payment', payment) : params.delete('payment')
    minTotal ? params.set('minTotal', minTotal) : params.delete('minTotal')
    maxTotal ? params.set('maxTotal', maxTotal) : params.delete('maxTotal')
    params.set('page', '1')

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
    setIsOpen(false)
  }

  function applyPreset(preset: 'today' | 'week' | 'month') {
    const range = getPresetRange(preset)
    setFrom(range.from)
    setTo(range.to)
    setActivePreset(preset) 
  }

  function handleManualFromChange(value: string) {
    setFrom(value)
    setActivePreset(null)
  }
  
  function handleManualToChange(value: string) {
    setTo(value)
    setActivePreset(null)
  }

  function clearFilters() {
    setFrom(''); setTo(''); setValidated('all'); setPayment(''); setMinTotal(''); setMaxTotal('')
    setActivePreset(null)

    const params = new URLSearchParams(searchParams.toString())
    ;['from', 'to', 'validated', 'payment', 'minTotal', 'maxTotal'].forEach(key => params.delete(key))
    params.set('page', '1')

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="font-abeezee text-xs uppercase tracking-widest border border-black px-4 py-2 flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
      >
        Filtros
        {activeCount > 0 && (
          <span className="bg-[#e8c300] text-black text-[10px] w-4 h-4 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* painel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtrar pedidos"
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 border-l border-black/[0.08] transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-black/[0.08]">
          <h2 className="font-bebas text-xl tracking-widest text-black">Filtrar pedidos</h2>
          <button onClick={() => setIsOpen(false)} className="text-black/40 hover:text-black text-xl leading-none">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 p-4 overflow-y-auto flex-1">
          <div>
            <label className="font-abeezee text-[11px] uppercase tracking-widest text-black/40 block mb-2">
              Período
            </label>
            <div className="flex gap-2 mb-3">
                {[
                { label: 'Hoje', value: 'today' as const },
                { label: 'Esta semana', value: 'week' as const },
                { label: 'Este mês', value: 'month' as const },
                ].map(opt => (
                <button
                    key={opt.value}
                    onClick={() => applyPreset(opt.value)}
                    className={`text-xs px-3 py-2 border flex-1 ${
                    activePreset === opt.value ? 'bg-black text-white border-black' : 'border-black/[0.08] text-black/60'
                    }`}
                >
                    {opt.label}
                </button>
                ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="date" value={from} 
                onChange={e => handleManualFromChange(e.target.value)}
                className="border border-black/[0.08] px-3 py-2 text-sm flex-1" />
              <span className="text-black/40 text-xs">até</span>
              <input type="date" value={to} 
                onChange={e => handleManualToChange(e.target.value)}
                className="border border-black/[0.08] px-3 py-2 text-sm flex-1" />
            </div>
          </div>

          <div>
            <label className="font-abeezee text-[11px] uppercase tracking-widest text-black/40 block mb-2">
              Status
            </label>
            <div className="flex gap-2">
              {[
                { label: 'Todos', value: 'all' },
                { label: 'Validados', value: 'true' },
                { label: 'Pendentes', value: 'false' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setValidated(opt.value)}
                  className={`text-xs px-3 py-2 border flex-1 ${
                    validated === opt.value ? 'bg-black text-white border-black' : 'border-black/[0.08] text-black/60'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-abeezee text-[11px] uppercase tracking-widest text-black/40 block mb-2">
              Pagamento
            </label>
            <select value={payment} onChange={e => setPayment(e.target.value)}
              className="border border-black/[0.08] px-3 py-2 text-sm w-full">
              {PAYMENT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-abeezee text-[11px] uppercase tracking-widest text-black/40 block mb-2">
              Valor do pedido
            </label>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Mín." value={minTotal} onChange={e => setMinTotal(e.target.value)}
                className="border border-black/[0.08] px-3 py-2 text-sm flex-1" />
              <span className="text-black/40 text-xs">até</span>
              <input type="number" placeholder="Máx." value={maxTotal} onChange={e => setMaxTotal(e.target.value)}
                className="border border-black/[0.08] px-3 py-2 text-sm flex-1" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-black/[0.08]">
          <button onClick={clearFilters}
            className="flex-1 font-abeezee text-xs uppercase tracking-widest border border-black/[0.08] py-2 text-black/50">
            Limpar
          </button>
          <button onClick={applyFilters} disabled={isPending}
            className="flex-1 font-abeezee text-xs uppercase tracking-widest bg-black text-white py-2 hover:bg-[#e8c300] hover:text-black transition-colors disabled:opacity-50">
            {isPending ? 'Aplicando...' : 'Aplicar'}
          </button>
        </div>
      </div>
    </>
  )
}