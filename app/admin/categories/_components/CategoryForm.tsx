//   /admin/categories/_components/CategoryForm.tsx

'use client';

import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import {
  createCategory,
  updateCategory,
  linkProductToCategory,
  unlinkProductFromCategory,
} from '@/lib/api/categories';
import { fetchAllProducts } from '@/lib/api/products';
import type { Category, CategoryFormInput } from '@/lib/types/category';

import { ProductSummary } from '@/lib/types/products';

import { ButtonSpinner } from '@/app/ui/ButtonSpinner';

const inputClass =
  'w-full bg-white border border-neutral-800 px-4 py-2.5 text-sm focus:border-[#e8c300] outline-none transition-colors';
const labelClass = 'block text-xs uppercase tracking-wide text-neutral-400 mb-1.5';

export default function CategoryForm({
  category,
  onSaved,
  onCancel,
}: {
  category?: Category;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEditing = !!category;
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<CategoryFormInput>({
    name: category?.name ?? '',
  });

  // --- todos os produtos (carregados uma vez, filtrados localmente) ---
  const [allProducts, setAllProducts] = useState<ProductSummary[]>([]);
  const [loadingAllProducts, setLoadingAllProducts] = useState(isEditing);

  const [linkedProducts, setLinkedProducts] = useState<ProductSummary[]>(category?.products ?? []);

  const [searchQuery, setSearchQuery] = useState('');
  const [linkingId, setLinkingId] = useState<number | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null);

  // busca única de todos os produtos ao abrir o form de edição
  useEffect(() => {
    if (!isEditing) return;
    fetchAllProducts()
      .then(setAllProducts)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Erro ao carregar produtos'))
      .finally(() => setLoadingAllProducts(false));
  }, [isEditing]);

  
  // debounce da busca
  //Considerar somente quando o volume dos produtos aumentar
  //futuramente para assim fazer busca um por um.
  /*
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(() => {
      searchProducts(searchQuery)
        .then((results: ProductSummary[]) => {
          const linkedIds = new Set(linkedProducts.map((p) => p.id));
          setSearchResults(results.filter((p) => !linkedIds.has(p.id)));
        })
        .catch((err) => toast.error(err instanceof Error ? err.message : 'Erro na busca'))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchQuery, linkedProducts]);
  */

  const linkedIds = new Set(linkedProducts.map((p) => p.id));
  const searchResults = searchQuery.trim()
    ? allProducts.filter(
        (p) => !linkedIds.has(p.id) && p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  function update<K extends keyof CategoryFormInput>(key: K, value: CategoryFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleLink(product: ProductSummary) {
    if (product.id == null || !category) return;
    setLinkingId(product.id);
    setLinkedProducts((prev) => [...prev, product]);
    try {
      await linkProductToCategory(category.id, product.id);
      toast.success('Produto vinculado');
    } catch (err) {
      setLinkedProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.error(err instanceof Error ? err.message : 'Erro ao vincular produto');
    } finally {
      setLinkingId(null);
    }
  }

  async function handleUnlink(product: ProductSummary) {
    if (product.id == null || !category) return;
    setUnlinkingId(product.id);
    const previous = linkedProducts;
    setLinkedProducts((prev) => prev.filter((p) => p.id !== product.id));
    try {
      await unlinkProductFromCategory(category.id, product.id);
      toast.success('Produto desvinculado');
    } catch (err) {
      setLinkedProducts(previous);
      toast.error(err instanceof Error ? err.message : 'Erro ao desvincular produto');
    } finally {
      setUnlinkingId(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Informe o nome da categoria');
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateCategory(category!.id, form);
          toast.success('Categoria atualizada');
        } else {
          await createCategory(form);
          toast.success('Categoria criada');
        }
        onSaved();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao salvar categoria');
      }
    });
  }


  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 sm:space-y-8">
      {/* Identificação */}
      <div>
        <label className={labelClass}>Nome da categoria</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Camisetas"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
        />
        {isEditing && (
          <p className="text-xs text-neutral-500 mt-2">
            Slug atual: <span className="font-mono">{category!.slug}</span>
          </p>
        )}
      </div>

      {/* Produtos vinculados*/}
      {isEditing && (
        <div className="border border-neutral-800 p-5 space-y-5">
          <div>
            <label className={labelClass}>
              Produtos vinculados
              {linkedProducts.length > 0 && ` (${linkedProducts.length})`}
            </label>

            {linkedProducts.length === 0 ? (
              <p className="text-sm text-neutral-500">Nenhum produto vinculado ainda.</p>
            ) : (
              <ul className="divide-y divide-neutral-900 border border-neutral-900">
                {linkedProducts.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 p-2.5">
                    {product.images?.[0]?.url && (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-9 h-9 object-cover flex-shrink-0"
                      />
                    )}
                    <span className="text-sm flex-1 truncate">{product.name}</span>
                    <button
                      type="button"
                      disabled={unlinkingId === product.id}
                      onClick={() => handleUnlink(product)}
                      className="text-xs uppercase text-neutral-400 hover:text-red-500 disabled:opacity-50 flex-shrink-0"
                    >
                      {unlinkingId === product.id ? 'Removendo...' : 'Remover'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className={labelClass}>Adicionar produto</label>
            <input
              type="text"
              className={inputClass}
              placeholder={loadingAllProducts ? 'Carregando produtos...' : 'Filtrar produto por nome...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loadingAllProducts}
            />

            {!loadingAllProducts && searchQuery.trim() && searchResults.length === 0 && (
              <p className="text-xs text-neutral-500 mt-2">Nenhum produto encontrado.</p>
            )}

            {
            searchResults.length === 0 && !searchQuery ? 
            <>
            <ul className="mt-2 border border-neutral-800 divide-y divide-neutral-900 max-h-56 overflow-y-auto">
                {allProducts.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 p-2.5">
                    {product.images?.[0]?.url && (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-9 h-9 object-cover flex-shrink-0"
                      />
                    )}
                    <span className="text-sm flex-1 truncate">{product.name}</span>
                    <button
                      type="button"
                      disabled={linkingId === product.id}
                      onClick={() => handleLink(product)}
                      className="text-xs uppercase text-[#e8c300] hover:text-[#d4b200] disabled:opacity-50 flex-shrink-0"
                    >
                      {linkingId === product.id ? 'Vinculando...' : 'Vincular'}
                    </button>
                  </li>
                ))}
              </ul>
            </>
            :
            searchResults.length > 0 && (
              <ul className="mt-2 border border-neutral-800 divide-y divide-neutral-900 max-h-56 overflow-y-auto">
                {searchResults.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 p-2.5">
                    {product.images?.[0]?.url && (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-9 h-9 object-cover flex-shrink-0"
                      />
                    )}
                    <span className="text-sm flex-1 truncate">{product.name}</span>
                    <button
                      type="button"
                      disabled={linkingId === product.id}
                      onClick={() => handleLink(product)}
                      className="text-xs uppercase text-[#e8c300] hover:text-[#d4b200] disabled:opacity-50 flex-shrink-0"
                    >
                      {linkingId === product.id ? 'Vinculando...' : 'Vincular'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-neutral-800">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 bg-[#e8c300] text-black font-bold px-6 py-3 uppercase text-sm tracking-wide hover:bg-[#d4b200] transition-colors disabled:opacity-50"
        >
          {isPending && <ButtonSpinner size={14} />}
          {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar categoria'}
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