//   /admin/coupons/_components/CouponForm.tsx

'use client';

import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import { createCoupon, updateCoupon } from '@/lib/api/coupons';
import { fetchCategories } from '@/lib/api/categories';
import type { Coupon, CouponFormInput, CouponType, CouponScope } from '@/lib/types/coupon';
import type { Category } from '@/lib/types/category';
import { ButtonSpinner } from '@/app/ui/ButtonSpinner';

const inputClass =
  'w-full bg-white border border-neutral-800 px-4 py-2.5 text-sm focus:border-[#e8c300] outline-none transition-colors';
const labelClass = 'block text-xs uppercase tracking-wide text-neutral-400 mb-1.5';

type ProductOption = { id: number; name: string };

export default function CouponForm({
  coupon,
  onSaved,
  onCancel,
}: {
  coupon?: Coupon;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEditing = !!coupon;
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<CouponFormInput>({
    code: coupon?.code ?? '',
    description: coupon?.description ?? '',
    type: coupon?.type ?? 'percentage',
    value: coupon?.value ?? undefined,
    min_order_value: coupon?.min_order_value ?? undefined,
    max_discount_value: coupon?.max_discount_value ?? undefined,
    usage_limit_total: coupon?.usage_limit_total ?? undefined,
    usage_limit_per_customer: coupon?.usage_limit_per_customer ?? 1,
    starts_at: coupon?.starts_at?.slice(0, 10) ?? '',
    expires_at: coupon?.expires_at?.slice(0, 10) ?? '',
    active: coupon?.active ?? true,

    scope: coupon?.scope ?? 'all',
    product_ids: coupon?.products?.map((p) => p.id) ?? [],
    category_ids: coupon?.categories?.map((c) => c.id) ?? [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetch('/api/products').then((res) => res.json()),
    ])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(Array.isArray(prods) ? prods.map((p: any) => ({ id: p.id, name: p.name })) : []);
      })
      .catch(() => toast.error('Erro ao carregar produtos/categorias'))
      .finally(() => setLoadingOptions(false));
  }, []);

  function update<K extends keyof CouponFormInput>(key: K, value: CouponFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleProduct(id: number) {
    setForm((f) => {
      const current = f.product_ids ?? [];
      const next = current.includes(id) ? current.filter((p) => p !== id) : [...current, id];
      return { ...f, product_ids: next };
    });
  }

  function toggleCategory(id: string) {
    setForm((f) => {
      const current = f.category_ids ?? [];
      const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
      return { ...f, category_ids: next };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error('Informe o código do cupom');
      return;
    }
    if (form.type !== 'free_shipping' && (!form.value || form.value <= 0)) {
      toast.error('Informe um valor de desconto válido');
      return;
    }
    if (form.type === 'percentage' && form.value! > 100) {
      toast.error('Desconto percentual não pode passar de 100%');
      return;
    }

    if (form.scope === 'products' && (!form.product_ids || form.product_ids.length === 0)) {
      toast.error('Selecione pelo menos um produto');
      return;
    }
    if (form.scope === 'categories' && (!form.category_ids || form.category_ids.length === 0)) {
      toast.error('Selecione pelo menos uma categoria');
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateCoupon(coupon!.id, form);
          toast.success('Cupom atualizado');
        } else {
          await createCoupon(form);
          toast.success('Cupom criado');
        }
        onSaved();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao salvar cupom');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 sm:space-y-8">
      {/* Identificação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-1 sm:col-span-2">
          <label className={labelClass}>Código do cupom</label>
          <input
            type="text"
            className={`${inputClass} font-mono uppercase`}
            placeholder="BEMVINDO10"
            value={form.code}
            onChange={(e) => update('code', e.target.value.toUpperCase())}
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <label className={labelClass}>Descrição interna (opcional)</label>
          <input
            type="text"
            className={inputClass}
            placeholder="Cupom de boas-vindas para novos clientes"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>
      </div>

      {/* Tipo de desconto */}
      <div>
        <label className={labelClass}>Tipo de desconto</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              { value: 'percentage', label: 'Percentual' },
              { value: 'fixed', label: 'Valor fixo' },
              { value: 'free_shipping', label: 'Frete grátis' },
            ] as { value: CouponType; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('type', opt.value)}
              className={`py-3 text-sm font-semibold uppercase tracking-wide border transition-colors ${
                form.type === opt.value
                  ? 'border-[#e8c300] bg-[#e8c300] text-black'
                  : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {form.type !== 'free_shipping' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Valor {form.type === 'percentage' ? '(%)' : '(R$)'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={form.type === 'percentage' ? 100 : undefined}
              className={inputClass}
              value={form.value ?? ''}
              onChange={(e) => update('value', parseFloat(e.target.value) || undefined)}
            />
          </div>
          {form.type === 'percentage' && (
            <div>
              <label className={labelClass}>Desconto máximo (R$, opcional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                placeholder="Sem teto"
                value={form.max_discount_value ?? ''}
                onChange={(e) =>
                  update('max_discount_value', parseFloat(e.target.value) || undefined)
                }
              />
            </div>
          )}
        </div>
      )}

      <div className="border border-neutral-800 p-4 sm:p-5">
        <p className="text-xs uppercase tracking-wide text-[#e8c300] mb-4">
          Aplicável a
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {(
            [
              { value: 'all', label: 'Pedido todo' },
              { value: 'products', label: 'Produtos' },
              { value: 'categories', label: 'Categorias' },
            ] as { value: CouponScope; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('scope', opt.value)}
              className={`py-3 text-sm font-semibold uppercase tracking-wide border transition-colors ${
                form.scope === opt.value
                  ? 'border-[#e8c300] bg-[#e8c300] text-black'
                  : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Seletor de produtos */}
        {form.scope === 'products' && (
          <div>
            <label className={labelClass}>
              Produtos elegíveis {form.product_ids?.length ? `(${form.product_ids.length} selecionado${form.product_ids.length !== 1 ? 's' : ''})` : ''}
            </label>
            {loadingOptions ? (
              <p className="text-xs text-neutral-500 py-3">Carregando produtos...</p>
            ) : products.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3">Nenhum produto cadastrado.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-neutral-800 divide-y divide-neutral-800">
                {products.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-neutral-950"
                  >
                    <input
                      type="checkbox"
                      checked={form.product_ids?.includes(p.id) ?? false}
                      onChange={() => toggleProduct(p.id)}
                      className="w-4 h-4 accent-[#e8c300] shrink-0"
                    />
                    <span className="text-sm">{p.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seletor de categorias */}
        {form.scope === 'categories' && (
          <div>
            <label className={labelClass}>
              Categorias elegíveis {form.category_ids?.length ? `(${form.category_ids.length} selecionada${form.category_ids.length !== 1 ? 's' : ''})` : ''}
            </label>
            {loadingOptions ? (
              <p className="text-xs text-neutral-500 py-3">Carregando categorias...</p>
            ) : categories.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3">Nenhuma categoria cadastrada.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-neutral-800 divide-y divide-neutral-800">
                {categories.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-neutral-950"
                  >
                    <input
                      type="checkbox"
                      checked={form.category_ids?.includes(c.id) ?? false}
                      onChange={() => toggleCategory(c.id)}
                      className="w-4 h-4 accent-[#e8c300] shrink-0"
                    />
                    <span className="text-sm">{c.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Regras de valor mínimo */}
      <div>
        <label className={labelClass}>Valor mínimo do pedido (R$, opcional)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className={inputClass}
          placeholder="Sem mínimo"
          value={form.min_order_value ?? ''}
          onChange={(e) => update('min_order_value', parseFloat(e.target.value) || undefined)}
        />
      </div>

      {/* Limites de uso */}
      <div className="border border-neutral-800 p-4 sm:p-5">
        <p className="text-xs uppercase tracking-wide text-[#e8c300] mb-4">Limites de uso</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Limite total de usos</label>
            <input
              type="number"
              min="1"
              className={inputClass}
              placeholder="Ilimitado"
              value={form.usage_limit_total ?? ''}
              onChange={(e) =>
                update('usage_limit_total', parseInt(e.target.value) || undefined)
              }
            />
          </div>
          <div>
            <label className={labelClass}>Limite por cliente</label>
            <input
              type="number"
              min="1"
              className={inputClass}
              value={form.usage_limit_per_customer ?? ''}
              onChange={(e) =>
                update('usage_limit_per_customer', parseInt(e.target.value) || undefined)
              }
            />
          </div>
        </div>
        {isEditing && (coupon?.total_redemptions ?? 0) > 0 && (
          <p className="text-xs text-neutral-500 mt-3">
            Este cupom já foi usado {coupon!.total_redemptions}x.
          </p>
        )}
      </div>

      {/* Validade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Início da validade (opcional)</label>
          <input
            type="date"
            className={inputClass}
            value={form.starts_at}
            onChange={(e) => update('starts_at', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Fim da validade (opcional)</label>
          <input
            type="date"
            className={inputClass}
            value={form.expires_at}
            onChange={(e) => update('expires_at', e.target.value)}
          />
        </div>
      </div>

      {/* Ativo */}
      <label className="flex items-center gap-3 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => update('active', e.target.checked)}
          className="w-4 h-4 accent-[#e8c300]"
        />
        <span className="text-sm">Cupom ativo</span>
      </label>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-neutral-800">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#e8c300] text-black font-bold px-6 py-3 uppercase text-sm tracking-wide hover:bg-[#d4b200] transition-colors disabled:opacity-50"
        >
          {isPending && <ButtonSpinner size={14} />}
          {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar cupom'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-neutral-800 px-6 py-3 uppercase text-sm tracking-wide text-neutral-400 hover:border-neutral-600"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}