'use client'
// app/admin/_components/ProductList.tsx

import { useState, useMemo, useRef, useEffect } from 'react'
import { ProductForm } from './Productform'
import { ConfirmModal } from './ConfirmExcluseModal'
import { ProductsImgCoudinary } from '@/app/ui/ProductsImageCloudinary'
import { SpinLoading } from '@/app/ui/SpinLoading'
import { ButtonSpinner } from '@/app/ui/ButtonSpinner'
import { rowDeletingClass } from '@/lib/ui-constants'
import { useAdmin } from './AdminContext'
import { Drawer } from './Drawer'

const PER_PAGE = 10

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const Trash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
)
const Pen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
  </svg>
)

export function ProductList() {
  const { products, loading, loadProducts, deleteProduct, deleting } = useAdmin()

  const [editing, setEditing] = useState<(typeof products)[0] | null>(null)
  const [confirmProduct, setConfirmProduct] = useState<(typeof products)[0] | null>(null)
  const [search,       setSearch]       = useState('')
  const [page,         setPage]         = useState(1)
  const listTopRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return products
    return products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      (p.attributes?.brand ?? '').toLowerCase().includes(q) ||
      (p.category?.name ?? '').toLowerCase().includes(q)
    )
  }, [products, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  
  useEffect(() => {
    document.body.style.overflow = confirmProduct ? 'hidden' : ''
    return () => {document.body.style.overflow = ''}
  },[confirmProduct])

  
  function handleSearch(v: string) {
    setSearch(v)
    setPage(1)
  }

  function goPage(p: number) {
    setPage(p)
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="font-bebas text-lg tracking-widest text-black">Produtos</h2>
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border border-black/[0.06] animate-pulse bg-white">
              <div className="w-12 h-12 bg-black/[0.06] shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3 bg-black/[0.06] rounded w-2/3" />
                <div className="h-2.5 bg-black/[0.04] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {confirmProduct !== null && (
        <ConfirmModal
          message={`Excluir "${confirmProduct.name}"? Essa ação não pode ser desfeita.`}
          onConfirm={() => {
            deleteProduct(confirmProduct.id)
            setConfirmProduct(null)
          }}
          onCancel={() => setConfirmProduct(null)}
        />
      )}

      <div className="flex flex-col gap-4" id="product-list-top" ref={listTopRef}>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <h2 className="font-bebas text-lg tracking-widest text-black">Produtos</h2>
          <div className="flex-1 h-px bg-black/[0.08]" />
          {!loading && (
            <span className="font-abeezee text-[11px] text-black/40">
              {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
            </span>
          )}
        </div>

        {/* Busca + botão novo */}
        <div className="flex gap-2">
          <div className="flex items-center flex-1 gap-2 border border-black/[0.1] px-3 py-2 bg-white focus-within:border-[#e8c300] transition-colors">
            <span className="text-black/30 shrink-0"><IconSearch /></span>
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Buscar por nome, marca, categoria..."
              className="flex-1 font-abeezee text-sm text-black placeholder:text-black/25 bg-transparent outline-none"
            />
            {search && (
              <button onClick={() => handleSearch('')} className="text-black/25 hover:text-black transition-colors cursor-pointer" aria-label="Limpar busca">
                <IconX />
              </button>
            )}
          </div>
          
        </div>

        {/* Lista */}
        <div className="flex flex-col divide-y divide-black/[0.06] border border-black/[0.08] bg-white overflow-hidden">

          {paginated.length === 0 && (
            <p className="font-abeezee text-sm text-black/30 py-12 text-center">
              {search ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
            </p>
          )}

          {paginated.map((product) => {
            return (
              <div key={product.id}>
                  <div className={`relative flex items-center gap-4 px-4 py-3 group hover:bg-black/[0.015] ${rowDeletingClass(deleting === product.id)}`}>

                    {deleting === product.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                        <SpinLoading />
                      </div>
                    )}

                    {/* Thumbnail */}
                    <div
                      onClick={() => setEditing(product)}
                      className="relative w-12 h-12 shrink-0 border border-[#e8c300] overflow-hidden bg-zinc-100 flex items-center justify-center cursor-pointer"
                    >
                      {product.images?.[0]?.public_id ? (
                        <ProductsImgCoudinary
                          public_id={product.images[0].public_id}
                          name={product.name}
                          clas="w-12 h-12 object-cover"
                        />
                      ) : product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} className="w-12 h-12 object-cover" />
                      ) : (
                        <span className="font-bebas text-zinc-300 text-xs">IMG</span>
                      )}
                    </div>

                    {/* Info principal */}
                    <div
                      onClick={() => setEditing(product)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <p className="font-bebas text-base text-black leading-tight truncate">{product.name}</p>
                      <p className="font-abeezee text-[11px] text-black/40">R$ {product.price}</p>

                      {/* Tags de atributos — só visíveis se existirem */}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {product.attributes?.brand && (
                          <span className="font-abeezee text-[10px] text-black/40 bg-black/[0.04] px-1.5 py-0.5">
                            {product.attributes.brand}
                          </span>
                        )}
                        {product.category?.name && (
                          <span className="font-abeezee text-[10px] text-black/40 bg-black/[0.04] px-1.5 py-0.5">
                            {product.category.name}
                          </span>
                        )}
                        {product.attributes?.sizes?.length > 0 && (
                          <span className="font-abeezee text-[10px] text-black/30">
                            {product.attributes.sizes.join(' · ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <span className={`
                      hidden sm:inline-block font-abeezee text-[11px] px-2 py-0.5 whitespace-nowrap shrink-0
                      ${product.in_stock ? 'bg-emerald-50 text-emerald-700' : 'bg-black/[0.04] text-black/40'}
                    `}>
                      {product.in_stock ? 'Em estoque' : 'Indisponível'}
                    </span>

                    {/* Ações — visíveis no hover */}
                    <div className="flex items-center gap-0.5 shrink-0  transition-opacity duration-150">
                      <button
                        onClick={() => setConfirmProduct(product)}
                        disabled={deleting === product.id}
                        className="text-black/30 hover:text-red-600 px-2 py-1.5 hover:bg-black/[0.04] transition-colors disabled:opacity-40 cursor-pointer"
                        aria-label="Excluir"
                      >
                        {deleting === product.id ? <ButtonSpinner size={14} /> : <Trash />}
                      </button>
                      <button
                        onClick={() => setEditing(product)}
                        className="text-black/30 hover:text-black px-2 py-1.5 hover:bg-black/[0.04] transition-colors cursor-pointer"
                        aria-label="Editar"
                      >
                        <Pen />
                      </button>
                    </div>

                  </div>
              </div>
            )
          })}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <span className="font-abeezee text-xs text-black/30">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => goPage(page - 1)} disabled={page === 1}
                className="font-abeezee text-xs px-3 py-1.5 border border-black/[0.1] text-black/50 hover:bg-black/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >←</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p} onClick={() => goPage(p)}
                  className={`font-abeezee text-xs px-3 py-1.5 border transition-colors cursor-pointer ${
                    p === page ? 'bg-black text-white border-transparent' : 'border-black/[0.1] text-black/50 hover:bg-black/[0.04]'
                  }`}
                >{p}</button>
              ))}
              <button
                onClick={() => goPage(page + 1)} disabled={page === totalPages}
                className="font-abeezee text-xs px-3 py-1.5 border border-black/[0.1] text-black/50 hover:bg-black/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >→</button>
            </div>
          </div>
        )}

      </div>
      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Editar produto` : ''}
      >
        {editing && (
          <ProductForm
            initial={editing}
            initialImages={editing.images}
            index={products.indexOf(editing)}
            onDone={() => { setEditing(null); loadProducts() }}
          />
        )}
      </Drawer>

    </>
  )
}