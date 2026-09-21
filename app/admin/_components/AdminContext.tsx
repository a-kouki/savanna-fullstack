//admin/_components/AdminContext.tsx
'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'
import { AdminProduct as Product } from '@/app/types/products'

type AdminContextType = {
  products: Product []
  loading: boolean
  loadProducts: () => Promise<void>
  deleteProduct: (id: number) => Promise<void>
  deleting: number | null
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product []>([])
  const [loading,  setLoading]  = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  async function loadProducts() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products')
      if (!res.ok) throw new Error()
      const data = await res.json()

      const withCategoryId: Product [] = data.map((p: any) => ({
        ...p,
        category_id: p.category?.id ?? null,
      }))

      setProducts(withCategoryId)
    } catch {
      toast.error('Erro ao carregar produtos.')
    } finally {
      setLoading(false)
    }
  }

  async function deleteProduct(id: number) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/auth/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Produto excluído.')
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch(error) {
      console.log(error)
      toast.error('Erro ao excluir.')
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => { loadProducts() }, [])

  return (
    <AdminContext.Provider value={{ products, loading, loadProducts, deleteProduct, deleting }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin deve ser usado dentro de AdminProvider')
  return ctx
}