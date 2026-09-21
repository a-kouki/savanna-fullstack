'use client'
// app/admin/_components/ProductForm_2.tsx

import React, { useState, useRef } from 'react'
import { toast } from 'sonner'
import { SpinLoading } from '@/app/ui/SpinLoading'
import { useAdmin } from './AdminContext'

type Product = {
  id?: number
  name: string
  src: string           
  price: number | null
  image_url: string
  public_id: string
  description: string
  in_stock: boolean
  attributes: {
    sizes: string[]     
    tags: string[]      
    brand: string       
    category: string    
  }
}

const empty: Product = {
  id: undefined,
  name: '', src: '',
  price: null, image_url: '', public_id: '',
  description: '', in_stock: true,
  attributes: {
    sizes: [],
    tags: [],
    brand: '',
    category: '',
  },
}

const ALL_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

// Ratios de imagem — mantidos do CarForm
const ratios = [
  { value: '1x1',    w: 1,    h: 1  },
  { value: '4x5',    w: 4,    h: 5  },
  { value: '1.91x1', w: 1.91, h: 1  },
  { value: '9x16',   w: 9,    h: 16 },
]


export function ProductForm({ initial, index, onDone }: {
  initial?: Product
  index?: number
  onDone?: () => void
}) {
  const { loadProducts: loadProducts } = useAdmin()

  const [product,   setProduct]   = useState<Product>(initial ?? empty)
  const [tagsInput, setTagsInput] = useState(initial?.attributes.tags.join(', ') ?? '')
  const [ratio,     setRatio]     = useState('4x5')
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview,   setPreview]   = useState<string>(initial?.image_url ?? '')
  const [loading,   setLoading]   = useState(false)

  const isEditing = index !== undefined

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    if (name === 'price') {
      setProduct(prev => ({
        ...prev,
        price: value === '' ? null : Number(value)
      }))
      return
    }

    setProduct(prev => ({ ...prev, [name]: value }))

    // Slug automático pelo nome
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
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 10 MB.')
      return
    }

    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      /*
      const payload = {
        ...product,
        attributes: {
          ...product.attributes,
          tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
          ratio,
        },
      }*/

      const payload: Omit<Product, 'id'> & { id?: number } = {
        ...product,
        attributes: {
          ...product.attributes,
          tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        },
      }

      if (!product.id) delete payload.id
      formData.append('data', JSON.stringify(payload))

      if (imageMode === 'upload' && imageFile) {
        formData.append('file', imageFile)
      }

      const isNew = !product.id  // 0 e undefined são ambos falsy

      const url = isNew ? '/api/auth/cars' : `/api/auth/cars/${product.id}`
      const method = isNew ? 'POST' : 'PUT'

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
        setImageFile(null)
        setPreview('')
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
      className="relative flex flex-col gap-5 border border-black/[0.08] bg-white p-5 md:p-6"
    >
      {/* Cabeçalho (só no modo edição) */}
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

      {/* ── Campos principais — 2 colunas ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Nome + slug */}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">Nome *</label>
          <input
            name="name" value={product.name} onChange={handleChange}
            placeholder="Camiseta Brasil Home" required maxLength={60}
            className="border-b border-black/[0.12] focus:border-[#e8c300] outline-none py-1.5 font-abeezee text-sm text-black placeholder:text-black/20 bg-transparent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">
            Slug <span className="normal-case tracking-normal text-black/20">(gerado automaticamente)</span>
          </label>
          <input
            name="src" value={product.src} onChange={handleChange}
            placeholder="camiseta-brasil-home" required maxLength={60}
            className="border-b border-black/[0.08] outline-none py-1.5 font-abeezee text-sm text-black/35 placeholder:text-black/15 bg-transparent"
          />
        </div>

        {/* Preço + Marca */}
        <div className="flex flex-col gap-1">
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">Preço *</label>
          <input
            type='number'
            name="price"
            step="0.01"
            placeholder="79,99"
            value={product.price ?? ''} 
            onChange={handleChange}
            maxLength={20}
            className="border-b border-black/[0.12] focus:border-[#e8c300] outline-none py-1.5 font-abeezee text-sm text-black placeholder:text-black/20 bg-transparent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">Marca / Time</label>
          <input
            name="brand" value={product.attributes.brand} onChange={handleAttributeChange}
            placeholder="Nike, Adidas, Brasil..." maxLength={40}
            className="border-b border-black/[0.12] focus:border-[#e8c300] outline-none py-1.5 font-abeezee text-sm text-black placeholder:text-black/20 bg-transparent transition-colors"
          />
        </div>

        {/* Categoria + Disponibilidade */}
        <div className="flex flex-col gap-1">
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">Categoria</label>
          <input
            name="category" value={product.attributes.category} onChange={handleAttributeChange}
            placeholder="Seleção, Clube, Retrô..." maxLength={40}
            className="border-b border-black/[0.12] focus:border-[#e8c300] outline-none py-1.5 font-abeezee text-sm text-black placeholder:text-black/20 bg-transparent transition-colors"
          />
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

        {/* Tags */}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">Tags</label>
          <input
            value={tagsInput} onChange={e => setTagsInput(e.target.value)}
            placeholder="manga curta, dry-fit, copa 2022..." maxLength={200}
            className="border-b border-black/[0.12] focus:border-[#e8c300] outline-none py-1.5 font-abeezee text-sm text-black placeholder:text-black/20 bg-transparent transition-colors"
          />
        </div>

        {/* Descrição */}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">Descrição</label>
          <textarea
            name="description" value={product.description} onChange={handleChange}
            placeholder="Detalhes do produto..." rows={3} maxLength={300}
            className="border border-black/[0.1] focus:border-[#e8c300] outline-none p-3 font-abeezee text-sm text-black placeholder:text-black/20 bg-transparent resize-none transition-colors"
          />
        </div>

      </div>

      {/* ── Tamanhos disponíveis ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">
          Tamanhos disponíveis
        </p>
        <div className="flex gap-2 flex-wrap">
          {ALL_SIZES.map(s => (
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

      {/* ── Ratio da imagem — mantido do CarForm ───────────────────────────── */}
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
                onClick={() => setRatio(r.value)}
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

      {/* ── Imagem: Upload ou URL — mantido do CarForm ─────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest">Imagem</p>

        {/* Toggle upload / url */}
        <div className="flex gap-1.5">
          {(['upload', 'url'] as const).map(mode => (
            <button
              key={mode} type="button" onClick={() => setImageMode(mode)}
              className={`font-abeezee text-xs px-3 py-1.5 border transition-colors cursor-pointer ${
                imageMode === mode
                  ? 'bg-black text-white border-transparent'
                  : 'border-black/[0.1] text-black/50 hover:border-black/20'
              }`}
            >
              {mode === 'upload' ? 'Upload' : 'URL'}
            </button>
          ))}
        </div>

        {imageMode === 'upload' ? (
          <label className="flex items-center gap-2.5 border border-black/[0.1] px-3 py-2 cursor-pointer hover:border-[#e8c300] transition-colors bg-white">
            <span className="font-abeezee text-xs text-black/50 bg-black/[0.04] border border-black/[0.08] px-2.5 py-1 whitespace-nowrap shrink-0">
              Escolher arquivo
            </span>
            <span className="font-abeezee text-sm text-black/30 truncate">
              {imageFile ? imageFile.name : 'Nenhum arquivo selecionado'}
            </span>
            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </label>
        ) : (
          <input
            name="image_url" placeholder="https://..." value={product.image_url}
            onChange={handleChange}
            className="border-b border-black/[0.12] focus:border-[#e8c300] outline-none py-1.5 font-abeezee text-sm text-black placeholder:text-black/20 bg-transparent transition-colors"
          />
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative w-full h-44 overflow-hidden border border-black/[0.06]">
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => { setPreview(''); setImageFile(null) }}
            className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            aria-label="Remover imagem"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Submit ──────────────────────────────────────────────────────────── */}
      <button
        type="submit" disabled={loading}
        className="w-full py-3 font-bebas text-lg tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-black text-white hover:bg-[#e8c300] hover:text-black"
      >
        {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
      </button>

      {/* Overlay de loading — mantido do CarForm */}
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white/60">
          <SpinLoading />
        </div>
      )}

    </form>
  )
}