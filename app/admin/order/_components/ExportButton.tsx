// app/admin/orders/_components/ExportButton.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function ExportButton() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
        const params = new URLSearchParams()
        ;['from', 'to', 'q', 'validated', 'payment', 'minTotal', 'maxTotal'].forEach(key => {
        const value = searchParams.get(key)
        if (value) params.set(key, value)
        })

      const res = await fetch(`/api/order/?${params.toString()}`, 
        {method: 'GET'}
      )
      if (!res.ok) throw new Error('Falha ao exportar')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Erro ao exportar os pedidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="font-abeezee text-xs uppercase tracking-widest bg-black text-white px-4 py-2 border border-black hover:bg-[#e8c300] hover:text-black transition-colors disabled:opacity-50"
    >
      {loading ? 'Exportando...' : 'Exportar Excel'}
    </button>
  )
}