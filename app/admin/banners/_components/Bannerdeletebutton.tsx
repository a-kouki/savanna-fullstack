'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { deleteBanner } from '@/lib/api/banners';

import { IconTrash } from '@/app/ui/Icons';

import { useAsyncAction } from '@/lib/hooks/useAsyncAction';
import { ExcluseModalBanner } from './ExcluseModalBanner';
import { ButtonSpinner } from '@/app/ui/ButtonSpinner';

type Prop = {
  id: string
  name:string | null
  onDeleted: (id: string) => void
  onDeletingChange: (id: string | null) => void
}

export default function BannerDeleteButton({
  id,
  name,
  onDeleted,
  onDeletingChange,
}: Prop
) {
  const [confirming, setConfirming] = useState(false);

  const { run, loading } = useAsyncAction(async () => {
      onDeletingChange(id)
      try {
        await deleteBanner(id)
        toast.success('Banner excluída')
        onDeleted(id)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao excluir categoria')
      } finally {
        onDeletingChange(null)
      }
    })
  
  function handleClick() {
    setConfirming(false)
    run()
  }


  return (
    <>
    <button
      onClick={() => setConfirming(true)}
      disabled={loading}
      className={`text-xs uppercase tracking-wide transition-colors disabled:opacity-50 ${
        confirming ? 'text-red-400 font-semibold' : 'text-neutral-500 hover:text-red-400'
      }`}
    >
      {loading ? <ButtonSpinner /> : <IconTrash />}
    </button>

    {confirming && (
      <ExcluseModalBanner
        message={`Excluir "${name ? name : 'Sem rótulo'}"? Essa ação não pode ser desfeita.`}
        onConfirm={handleClick}
        onCancel={() => setConfirming(false)}
      />
    )}
  </>
  );
}