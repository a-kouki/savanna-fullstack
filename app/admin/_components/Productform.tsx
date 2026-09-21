'use client'
// app/admin/_components/ProductForm.tsx

import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { LoadingOverlay } from '@/app/ui/LoadingOverlay'
import { ButtonSpinner } from '@/app/ui/ButtonSpinner'


import { useAdmin } from './AdminContext'
import { fetchCategories } from '@/lib/api/categories'
import type { Category } from '@/lib/types/category'

import { ProductFormData as Product } from '@/app/types/products'


const MAX_IMAGES = 6

type ImageItem =
  | { id: string; kind: 'existing'; url: string; public_id: string | null }
  | { id: string; kind: 'new-file'; url: string; file: File }
  | { id: string; kind: 'new-url'; url: string }


type ProductFormState = Omit<Product, 'id' | 'images'> & { id?: number }

const empty: ProductFormState = {
  id: undefined,
  name: '', src: '',
  price: null,
  description: '', in_stock: true,
  category_id: null,
  attributes: { sizes: [], tags: [], brand: '', ratio: '4x5' },
}

const ALL_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

const ratios = [
  { value: '1x1',    w: 1,    h: 1  },
  { value: '4x5',    w: 4,    h: 5  },
  { value: '1.91x1', w: 1.91, h: 1  },
  { value: '9x16',   w: 9,    h: 16 },
]

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

export function ProductForm({ initial, initialImages, index, onDone }: {
  initial?: Product
  initialImages?: { url: string; public_id: string | null }[]
  index?: number
  onDone?: () => void
}) {
  const { loadProducts } = useAdmin()

  const isEditing = index !== undefined

  const [product,    setProduct]    = useState<ProductFormState>(initial ?? empty)
  const [tagsInput,  setTagsInput]  = useState(initial?.attributes.tags.join(', ') ?? '')
  const [ratio,      setRatio]      = useState(initial?.attributes.ratio ?? '4x5')
  const [loading,    setLoading]    = useState(false)


  const [images, setImages] = useState<ImageItem[]>(
    (initialImages ?? []).map(img => ({ id: randomId(), kind: 'existing', ...img }))
  )
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => toast.error('Erro ao carregar categorias'))
      .finally(() => setLoadingCategories(false))
  }, [])

  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.kind === 'new-file') URL.revokeObjectURL(img.url)
      })
    }
  }, [])

  const fileRef = useRef<HTMLInputElement>(null)

  const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  async function checkUrl(url: string) {
    setStatus('checking')
    const res = await fetch('/api/admin/products/check-image-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    console.log("RESPOSNE --- ", res)
    const data = await res.json()
    console.log("DATA --- ", data)
    setStatus(data.valid ? 'valid' : 'invalid')
  }

  function checkImageLoadable(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
    })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    if (name === 'name') {
      setProduct(prev => ({
        ...prev,
        name: value,
        src: value
          .toLowerCase().trim()
          .replace(/\s+/g, '-')
          .replace(/\//g, '-')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
      }))
    } else {
      setProduct(prev => ({ ...prev, [name]: value }))
    }
  }

  function handleAttributeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setProduct(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [name]: value },
    }))
  }

  function toggleSize(s: string) {
    setProduct(prev => {
      const sizes = prev.attributes.sizes.includes(s)
        ? prev.attributes.sizes.filter(x => x !== s)
        : [...prev.attributes.sizes, s]
      return { ...prev, attributes: { ...prev.attributes, sizes } }
    })
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      toast.error(`Máximo de ${MAX_IMAGES} imagens por produto.`)
      return
    }

    const accepted = files.slice(0, remaining)
    if (files.length > remaining) {
      toast.error(`Só cabem mais ${remaining} imagem(ns). O restante foi ignorado.`)
    }

    const newItems: ImageItem[] = []
    for (const file of accepted) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" é muito grande. Máximo 10 MB.`)
        continue
      }
      newItems.push({ id: randomId(), kind: 'new-file', url: URL.createObjectURL(file), file })
    }
    setImages(prev => [...prev, ...newItems])
    e.target.value = '' 
  }

  async function addImageByUrl() {
    const url = urlInput.trim()
    if (!url) return
    const loadable = await checkImageLoadable(url)

    if (!loadable) {
      toast.error(`A URL não é válida`)
      return
    }
    if (images.length >= MAX_IMAGES) {
      toast.error(`Máximo de ${MAX_IMAGES} imagens por produto.`)
      return
    }
    setImages(prev => [...prev, { id: randomId(), kind: 'new-url', url }])
    setUrlInput('')
    setShowUrlInput(false)
  }

  function removeImage(id: string) {
    setImages(prev => {
      const item = prev.find(i => i.id === id)
      if (item?.kind === 'new-file') URL.revokeObjectURL(item.url)
      return prev.filter(i => i.id !== id)
    })
  }

  function moveImage(id: string, dir: -1 | 1) {
    setImages(prev => {
      const idx = prev.findIndex(i => i.id === id)
      const swapWith = idx + dir
      if (idx === -1 || swapWith < 0 || swapWith >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!product.name.trim()) {
      toast.error('Nome são obrigatórios.')
      return
    }
    setLoading(true)

    try {
      const formData = new FormData()

      const imagesMeta = images.map(img => {
        if (img.kind === 'existing') {
          return { type: 'existing' as const, url: img.url, public_id: img.public_id }
        }
        if (img.kind === 'new-url') {
          return { type: 'url' as const, url: img.url }
        }
        formData.append(`file_${img.id}`, img.file)
        return { type: 'new' as const, tempId: img.id }
      })

      const payload = {
        ...product,
        images: imagesMeta,
        attributes: {
          ...product.attributes,
          tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
          ratio,
        },
      }
      if (!product.id) delete payload.id
      formData.append('data', JSON.stringify(payload))

      const url    = product.id !== undefined ? `/api/auth/products/${product.id}` : '/api/auth/products'
      const method = product.id !== undefined ? 'PUT' : 'POST'

      const res    = await fetch(url, { method, body: formData })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error ?? 'Erro ao salvar')
        return
      }

      toast.success(isEditing ? 'Produto atualizado!' : 'Produto adicionado!')
      await loadProducts()
      onDone?.()

      if (!isEditing) {
        setProduct(empty)
        setTagsInput('')
        setImages([])
        setRatio('4x5')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-col gap-5 bg-white border border-black/[0.08] p-5 md:p-6"
    >

      {isEditing && (
        <div className="flex items-center justify-between">
          <h2 className="font-bebas text-lg tracking-widest text-black">Editar produto</h2>
          {onDone && (
            <button
              type="button" onClick={onDone}
              className="font-abeezee text-xs text-black/30 hover:text-black transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      )}

      {/* galeria de imagens múltiplas*/}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">
            Imagens ({images.length}/{MAX_IMAGES})
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowUrlInput(v => !v)}
              className="font-abeezee text-[10px] text-black/40 hover:text-black transition-colors"
            >
              + URL
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={images.length >= MAX_IMAGES}
              className="font-abeezee text-[10px] text-black/40 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              + Upload
            </button>
          </div>
        </div>
        <input
          ref={fileRef} type="file" accept="image/*" multiple
          className="hidden" onChange={handleImageSelect}
        />

        {showUrlInput && (
          <div className="flex gap-2">
            <input
              value={urlInput} onChange={e => setUrlInput(e.target.value)}
              placeholder="https://..."
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageByUrl() } }}
              className="flex-1 font-abeezee text-sm border-b border-black/[0.12] focus:border-[#e8c300] outline-none py-1.5 bg-transparent placeholder:text-black/20"
            />
            <button
              type="button" onClick={addImageByUrl}
              className="font-abeezee text-xs px-3 border border-black/[0.12] hover:border-black transition-colors"
            >
              Adicionar
            </button>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          {images.map((img, i) => (
            <div key={img.id} className="relative w-20 h-20 shrink-0">
              <div className={`w-full h-full border-2 overflow-hidden bg-zinc-50 ${
                i === 0 ? 'border-[#e8c300]' : 'border-black/[0.1]'
              }`}>
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>

              {i === 0 && (
                <span className="absolute -top-1.5 -left-1.5 bg-[#e8c300] text-black text-[8px] font-abeezee px-1 leading-4">
                  capa
                </span>
              )}

              <button
                type="button" onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 w-4 h-4 bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
                aria-label="Remover imagem"
              >
                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              <div className="absolute bottom-1 left-1 right-1 flex justify-between">
                <button
                  type="button" onClick={() => moveImage(img.id, -1)}
                  disabled={i === 0}
                  className="w-4 h-4 bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-0"
                  aria-label="Mover para esquerda"
                >
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <button
                  type="button" onClick={() => moveImage(img.id, 1)}
                  disabled={i === images.length - 1}
                  className="w-4 h-4 bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-0"
                  aria-label="Mover para direita"
                >
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {images.length === 0 && (
            <button
              type="button" onClick={() => fileRef.current?.click()}
              className="w-20 h-20 border-2 border-dashed border-black/[0.1] hover:border-[#e8c300] flex flex-col items-center justify-center gap-1 text-black/25 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span className="font-abeezee text-[9px]">adicionar</span>
            </button>
          )}
        </div>
      </div>

      {/* Nome + Slug + Preço */}
      <div className="flex-1 flex flex-col gap-3">
        <div>
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest block mb-1">
            Nome *
          </label>
          <input
            name="name" value={product.name} onChange={handleChange}
            placeholder="Ex: Camiseta Brasil Home" required maxLength={60}
            className="w-full font-abeezee text-sm border-b border-black/[0.12] focus:border-[#e8c300] outline-none py-1.5 transition-colors bg-transparent placeholder:text-black/20"
          />
        </div>

        <div>
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest block mb-1">
            Slug <span className="normal-case tracking-normal text-black/20">(auto)</span>
          </label>
          <input
            name="src" value={product.src} onChange={handleChange}
            placeholder="camiseta-brasil-home" maxLength={60}
            className="w-full font-abeezee text-sm border-b border-black/[0.08] outline-none py-1.5 bg-transparent text-black/35 placeholder:text-black/15"
          />
        </div>

        <div>
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest block mb-1">
            Preço *
          </label>
          <input
            type='number'
            name="price"
            step="0.01"
            placeholder="79,99"
            value={product.price ?? ''}
            onChange={handleChange}
            maxLength={20}
            className="w-full font-abeezee text-sm border-b border-black/[0.12] focus:border-[#e8c300] outline-none py-1.5 transition-colors bg-transparent placeholder:text-black/20"
          />
        </div>
      </div>

      {/* ── Marca / Categoria / Disponibilidade ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="flex flex-col gap-1">
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">Marca / Time</label>
          <input
            name="brand" value={product.attributes.brand} onChange={handleAttributeChange}
            placeholder="Nike, Adidas..." maxLength={40}
            className="border-b border-black/[0.12] focus:border-[#e8c300] outline-none py-1.5 font-abeezee text-sm text-black placeholder:text-black/20 bg-transparent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">Categoria</label>
          <select
            value={product.category_id ?? ''}
            onChange={e => setProduct(prev => ({ ...prev, category_id: e.target.value || null }))}
            disabled={loadingCategories}
            className="border-b border-black/[0.12] focus:border-[#e8c300] outline-none py-1.5 font-abeezee text-sm text-black bg-transparent transition-colors appearance-none cursor-pointer disabled:opacity-40"
          >
            <option value="">
              {loadingCategories ? 'Carregando...' : 'Sem categoria'}
            </option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">Disponibilidade</label>
          <select
            value={product.in_stock ? 'true' : 'false'}
            onChange={e => setProduct(prev => ({ ...prev, in_stock: e.target.value === 'true' }))}
            className="border-b border-black/[0.12] focus:border-[#e8c300] outline-none py-1.5 font-abeezee text-sm text-black bg-transparent transition-colors appearance-none cursor-pointer"
          >
            <option value="true">Em estoque</option>
            <option value="false">Não disponível</option>
          </select>
        </div>

      </div>

      {/* ── Tags ───────────────────────────────────────────────────────────── */}
      <div>
        <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest block mb-1">
          Tags
        </label>
        <input
          value={tagsInput} onChange={e => setTagsInput(e.target.value)}
          placeholder="manga curta, dry-fit, copa 2022..." maxLength={200}
          className="w-full font-abeezee text-sm border-b border-black/[0.12] focus:border-[#e8c300] outline-none py-1.5 transition-colors bg-transparent placeholder:text-black/20"
        />
      </div>

      {/* ── Descrição ──────────────────────────────────────────────────────── */}
      <div>
        <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest block mb-1">
          Descrição
        </label>
        <textarea
          name="description" value={product.description} onChange={handleChange}
          placeholder="Detalhes do produto..." rows={3} maxLength={450}
          className="w-full font-abeezee text-sm border border-black/[0.1] focus:border-[#e8c300] outline-none p-3 transition-colors bg-transparent resize-none placeholder:text-black/20"
        />
      </div>

      {/* ── Tamanhos disponíveis ────────────────────────────────────────────── */}
      <div>
        <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest block mb-2">
          Tamanhos disponíveis
        </label>
        <div className="flex gap-2 flex-wrap">
          {ALL_SIZES.map((s) => (
            <button
              key={s} type="button" onClick={() => toggleSize(s)}
              className={`w-10 h-10 font-bebas text-sm tracking-wide transition-all duration-150 border ${
                product.attributes.sizes.includes(s)
                  ? 'bg-[#e8c300] border-[#e8c300] text-black'
                  : 'border-black/[0.12] text-black/40 hover:border-black/30 hover:text-black'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Formato da imagem (ratio) ───────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">
          Formato da imagem
        </p>
        <div className="flex gap-5 items-end">
          {ratios.map(r => {
            const maxH  = 48
            const maxW  = 48
            const scale = Math.min(maxW / r.w, maxH / r.h)
            const pw    = Math.round(r.w * scale)
            const ph    = Math.round(r.h * scale)
            const active = ratio === r.value
            return (
              <button
                key={r.value} type="button"
                onClick={() => {
                  setRatio(r.value)
                  setProduct(prev => ({ ...prev, attributes: { ...prev.attributes, ratio: r.value } }))
                }}
                className={`flex flex-col items-center gap-1.5 transition-opacity cursor-pointer ${
                  active ? 'opacity-100' : 'opacity-30 hover:opacity-60'
                }`}
              >
                <div
                  style={{ width: pw, height: ph }}
                  className={`border-2 transition-colors ${
                    active ? 'border-black bg-[#e8c300]/20' : 'border-black/30'
                  }`}
                />
                <span className={`font-abeezee text-[10px] ${active ? 'text-black font-semibold' : 'text-black/40'}`}>
                  {r.value}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <button
        type="submit" disabled={loading}
        className={`
          w-full py-3 font-bebas text-lg tracking-widest transition-all duration-200
          disabled:opacity-40 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
          bg-black text-white hover:bg-[#e8c300] hover:text-black
        `}
      >
        {loading && <ButtonSpinner size={16} />}
        {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
      </button>

      <LoadingOverlay show={loading} />

    </form>
  )
}