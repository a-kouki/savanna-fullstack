//   /admin/coupons/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchCoupons } from '@/lib/api/coupons';
import CouponStatusToggle from './_components/CouponStatusToggle';
import CouponDeleteButton from './_components/CouponDeleteButton';
import CouponForm from './_components/CouponForm';
import type { Coupon } from '@/lib/types/coupon';

import { IconPen } from '@/app/ui/Icons';
import { rowDeletingClass } from '@/lib/ui-constants';

function formatDiscount(coupon: Coupon) {
  if (coupon.type === 'percentage') return `${coupon.value}%`;
  if (coupon.type === 'fixed') return `R$ ${Number(coupon.value).toFixed(2)}`;
  return 'Frete grátis';
}

function formatUsage(coupon: Coupon) {
  const used = coupon.total_redemptions ?? 0;
  const limit = coupon.usage_limit_total;
  return limit ? `${used} / ${limit}` : `${used} / ∞`;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);


  async function loadCoupons() {
    try {
      const data = await fetchCoupons();
      setCoupons(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  function handleDeleted(id: string) {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  function handleSaved() {
    setEditing(null);
    setCreating(false);
    loadCoupons();
  }

  const isFormOpen = creating || !!editing;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-bebas text-3xl sm:text-4xl tracking-wide">
            {isFormOpen
              ? editing
                ? <>EDITAR CUPOM — <span className="text-[#e8c300]">{editing.code}</span></>
                : 'NOVO CUPOM'
              : 'CUPONS'}
          </h1>
          {!isFormOpen && (
            <p className="text-sm text-neutral-400 mt-1">
              {loading ? 'Carregando...' : `${coupons.length} cupom${coupons.length !== 1 ? 's' : ''} cadastrado${coupons.length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setCreating(true)}
            className="bg-[#e8c300] text-black font-bold px-6 py-3 uppercase text-sm tracking-wide hover:bg-[#d4b200] transition-colors text-center"
          >
            + Novo Cupom
          </button>
        )}
      </div>

      {isFormOpen ? (
        <CouponForm
          coupon={editing ?? undefined}
          onSaved={handleSaved}
          onCancel={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      ) : loading ? (
        <div className="border border-neutral-800 p-8 sm:p-12 text-center text-neutral-500">
          Carregando cupons...
        </div>
      ) : coupons.length === 0 ? (
        <div className="border border-neutral-800 p-8 sm:p-12 text-center text-neutral-500">
          Nenhum cupom cadastrado ainda.
        </div>
      ) : (
        <div className="border border-neutral-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-left uppercase text-xs tracking-wider text-neutral-400">
                <th className="p-3 sm:p-4">Código</th>
                <th className="p-3 sm:p-4">Desconto</th>
                <th className="p-3 sm:p-4 hidden md:table-cell">Usos</th>
                <th className="p-3 sm:p-4 hidden sm:table-cell">Validade</th>
                <th className="p-3 sm:p-4">Status</th>
                <th className="p-3 sm:p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const expired =
                  coupon.expires_at && new Date(coupon.expires_at) < new Date();
                const limitReached =
                  coupon.usage_limit_total !== null &&
                  (coupon.total_redemptions ?? 0) >= coupon.usage_limit_total;

                return (
                  <tr
                    key={coupon.id}
                    className={`border-b border-neutral-900 last:border-0 ${rowDeletingClass(deletingId === coupon.id)}`}
                  >
                    <td className="p-3 sm:p-4">
                      <button
                        onClick={() => setEditing(coupon)}
                        className="font-mono font-semibold hover:text-[#e8c300] text-left"
                      >
                        {coupon.code}
                      </button>
                      {coupon.description && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {coupon.description}
                        </p>
                      )}
                    </td>
                    <td className="p-3 sm:p-4">{formatDiscount(coupon)}</td>
                    <td className="p-3 sm:p-4 font-mono hidden md:table-cell">
                      {formatUsage(coupon)}
                      {limitReached && (
                        <span className="ml-2 text-xs text-red-400">esgotado</span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 text-neutral-400 hidden sm:table-cell">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString('pt-BR')
                        : 'Sem validade'}
                      {expired && (
                        <span className="ml-2 text-xs text-red-400">expirado</span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4">
                      <CouponStatusToggle id={coupon.id} active={coupon.active} />
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center justify-end gap-3 sm:gap-4">
                        <button
                          onClick={() => setEditing(coupon)}
                          className="text-xs uppercase tracking-wide text-neutral-400 hover:text-[#e8c300]"
                        >
                          <IconPen/>
                        </button>
                        <CouponDeleteButton
                          id={coupon.id}
                          code={coupon.code}
                          onDeleted={handleDeleted}
                          onDeletingChange={setDeletingId}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}