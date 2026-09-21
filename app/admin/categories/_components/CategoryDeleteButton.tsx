'use client'
// app/admin/categories/_components/CategoryDeleteButton.tsx

import { useState } from 'react'
import { toast } from 'sonner'
import { ExclusemodalCategorie } from './ExcluseModalCategorie'
import { ButtonSpinner } from '@/app/ui/ButtonSpinner'
import { IconTrash } from '@/app/ui/Icons'
import { useAsyncAction } from '@/lib/hooks/useAsyncAction'
import { deleteCategory } from '@/lib/api/categories'

type Props = {
  id: string
  name: string
  onDeleted: (id: string) => void
  onDeletingChange: (id: string | null) => void
}

export default function CategoryDeleteButton({ id, name, onDeleted, onDeletingChange }: Props) {
  const [confirming, setConfirming] = useState(false)

  const { run, loading } = useAsyncAction(async () => {
    onDeletingChange(id)
    try {
      await deleteCategory(id)
      toast.success('Categoria excluída')
      onDeleted(id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir categoria')
    } finally {
      onDeletingChange(null)
    }
  })

  function handleConfirm() {
    setConfirming(false) 
    run()
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        disabled={loading}
        className="text-neutral-400 hover:text-red-500 disabled:opacity-50"
        aria-label="Excluir"
      >
        {loading ? <ButtonSpinner /> : <IconTrash />}
      </button>

      {confirming && (
        <ExclusemodalCategorie
          message={`Excluir "${name}"? Essa ação não pode ser desfeita.`}
          onConfirm={handleConfirm}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  )
}