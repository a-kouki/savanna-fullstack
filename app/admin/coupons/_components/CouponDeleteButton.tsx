//   /admin/coupons/_components/CouponDeleteButton.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { deleteCoupon } from '@/lib/api/coupons';

import { IconTrash } from '@/app/ui/Icons';
import { useAsyncAction } from '@/lib/hooks/useAsyncAction'

import { ExclusemodalCoupons } from './ExcluseModalCoupons';
import { ButtonSpinner } from '@/app/ui/ButtonSpinner'

type Prop = {
  id: string;
  code: string;
  onDeleted: (id: string) => void;
  onDeletingChange:(id: string) => void;

}

export default function CouponDeleteButton({
  id,
  code,
  onDeleted,
  onDeletingChange,
}: Prop
) {
  const [confirming, setConfirming] = useState(false);

  const {run, loading} = useAsyncAction(async () => {
    onDeletingChange(id)
    try {
        await deleteCoupon(id);
        toast.success(`Cupom ${code} removido`);
        onDeleted(id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao deletar cupom');
      } finally {
        setConfirming(false);
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
      className={`text-xs uppercase tracking-wide transition-colors disabled:opacity-50 text-neutral-500 hover:text-red-400`}
    >
      {loading ? <ButtonSpinner /> : <IconTrash />}
    </button>

    {confirming && (
      <ExclusemodalCoupons
        message={`Excluir "${name}"? Essa ação não pode ser desfeita.`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
        />
    )}
    </>
  );
}
