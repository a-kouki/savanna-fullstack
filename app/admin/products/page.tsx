'use client'
// app/admin/products/page.tsx

import { useEffect, useState } from 'react'
import { ProductForm } from '../_components/Productform'
import { ProductList } from '../_components/Productlist'
import { useAdmin } from '../_components/AdminContext'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { SpinLoading } from '@/app/ui/SpinLoading'

export default function CarPage() {
  return (
    <Suspense fallback={<SpinLoading />}>
      <ProductsContents />
    </Suspense>
  )
}

export function ProductsContents() {
  const { products: products, loading } = useAdmin()

  const totalValue = products.reduce(
    (acc, p) => acc + Number(p.price),
    0
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  
  useEffect(() => {
      if (searchParams.get('scrollTo') === 'new-product-form') {
        const timer = setTimeout(() => {
          const el = document.getElementById('new-product-form')
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
        return () => clearTimeout(timer)
      }
    }, [searchParams, router])

  return (
    <div className="flex flex-col gap-8">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-3">

        <StatCard
          label="Cadastrados"
          value={loading ? '—' : String(products.length)}
          sub="produtos"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
            </svg>
          }
        />

        <StatCard
          label="Valor total"
          value={loading ? '—' : String('R$'+ totalValue)}
          sub="em catálogo"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          }
        />

        <StorageCard />

      </div>

      {/* ── Lista de produtos ── */}
      <ProductList />

      {/* ── Formulário novo produto — âncora para scroll ── */}
      <div id="new-product-form">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-bebas text-lg tracking-widest text-black">Novo produto</h2>
          <div className="flex-1 h-px bg-black/[0.08]" />
        </div>
        <ProductForm
          onDone={() => {
            document
              .getElementById('product-list-top')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        />
      </div>

    </div>
  )
}

// ── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
}) {
  return (
    <div className="relative overflow-hidden border border-black/[0.08] bg-white px-4 py-3">
      {/* Barra de destaque amarela no topo */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-[#e8c300]" />

      {/* Ícone decorativo */}
      <div
        className="absolute bottom-1 right-2 text-black/[0.06] pointer-events-none select-none"
        style={{ width: 44, height: 44 }}
        aria-hidden="true"
      >
        {icon}
      </div>

      <p className="font-abeezee text-[11px] text-black/40 mb-1">{label}</p>
      <p className="font-bebas text-2xl text-black tabular-nums leading-tight tracking-wide">
        {value}
      </p>
      <p className="font-abeezee text-[11px] text-black/40 mt-0.5">{sub}</p>
    </div>
  )
}

// ── StorageCard ───────────────────────────────────────────────────────────────
function StorageCard() {
  const [storage, setStorage] = useState<{
    usedMB: string
    availableGB: string
    maxGB: number
    percentUsed: string
  } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/storage')
        if (res.ok) setStorage(await res.json())
      } catch { /* silencioso */ }
    }
    load()
  }, [])

  const pct = storage ? Number(storage.percentUsed) : 0

  return (
    <div className="relative overflow-hidden border border-black/[0.08] bg-white px-4 py-3">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-[#e8c300]" />

      {/* Ícone */}
      <div
        className="absolute bottom-1 right-2 text-black/[0.06] pointer-events-none select-none"
        style={{ width: 44, height: 44 }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
      </div>

      <p className="font-abeezee text-[11px] text-black/40 mb-1">Armazenamento</p>
      <p className="font-bebas text-2xl text-black tabular-nums leading-tight tracking-wide">
        {storage ? `${storage.percentUsed}%` : '—'}
      </p>
      <p className="font-abeezee text-[11px] text-black/40 mt-0.5">
        {storage ? `${storage.usedMB} MB / ${storage.maxGB} GB` : 'carregando...'}
      </p>

      {/* Barra de progresso */}
      {storage && (
        <div className="mt-2 h-[3px] w-full bg-black/[0.06] overflow-hidden">
          <div
            className="h-full bg-[#e8c300] transition-all duration-700"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}