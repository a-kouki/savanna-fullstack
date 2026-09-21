//   /admin/coupons/_components/CouponStatusToggle.tsx
'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { toggleCouponActive } from '@/lib/api/coupons';

export default function CouponStatusToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [isActive, setIsActive] = useState(active);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !isActive;
    setIsActive(next); // otimista

    startTransition(async () => {
      try {
        await toggleCouponActive(id, next);
        toast.success(next ? 'Cupom ativado' : 'Cupom desativado');
      } catch (err) {
        setIsActive(!next); // reverte se falhar
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar status');
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-3 py-1 text-xs uppercase tracking-wide font-semibold border transition-colors disabled:opacity-50 ${
        isActive
          ? 'border-green-700 text-green-400 hover:bg-green-950'
          : 'border-neutral-700 text-neutral-500 hover:bg-neutral-900'
      }`}
    >
      {isActive ? 'Ativo' : 'Inativo'}
    </button>
  );
}
