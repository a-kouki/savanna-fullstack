'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const PAYMENT_LABELS: Record<string, string> = { pix: 'Pix', cartao: 'Cartão', dinheiro: 'Dinheiro' }

export default function ActiveFilterChips() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const q = searchParams.get('q')
  const validated = searchParams.get('validated')
  const payment = searchParams.get('payment')
  const minTotal = searchParams.get('minTotal')
  const maxTotal = searchParams.get('maxTotal')

  function removeParams(keys: string[]) {
    const params = new URLSearchParams(searchParams.toString())
    keys.forEach(k => params.delete(k))
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const chips: { keys: string[]; label: string }[] = []
  if (from || to) chips.push({ keys: ['from', 'to'], label: `${from ?? '...'} até ${to ?? '...'}` })
  if (q) chips.push({ keys: ['q'], label: `"${q}"` })
  if (validated) chips.push({ keys: ['validated'], label: validated === 'true' ? 'Validados' : 'Pendentes' })
  if (payment) chips.push({ keys: ['payment'], label: PAYMENT_LABELS[payment] ?? payment })
  if (minTotal || maxTotal) chips.push({ keys: ['minTotal', 'maxTotal'], label: `R$ ${minTotal ?? '0'} – R$ ${maxTotal ?? '∞'}` })

  if (chips.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {chips.map(chip => (
        <span key={chip.keys.join('-')}
          className="flex items-center gap-2 bg-black/[0.04] text-black/70 text-xs px-3 py-1.5">
          {chip.label}
          <button onClick={() => removeParams(chip.keys)} className="text-black/40 hover:text-black">✕</button>
        </span>
      ))}
    </div>
  )
}