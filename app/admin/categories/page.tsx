//   /admin/categories/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchCategories } from '@/lib/api/categories';
import CategoryDeleteButton from './_components/CategoryDeleteButton';
import CategoryForm from './_components/CategoryForm';
import { IconPen } from '@/app/ui/Icons';
import type { Category } from '@/lib/types/category';
import { rowDeletingClass } from '@/lib/ui-constants';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadCategories() {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function handleDeleted(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  function handleSaved() {
    setEditing(null);
    setCreating(false);
    loadCategories();
  }

  const isFormOpen = creating || !!editing;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-bebas text-3xl sm:text-4xl tracking-wide">CATEGORIAS</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {loading ? 'Carregando...' : `${categories.length} categoria${categories.length !== 1 ? 's' : ''} cadastrada${categories.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setCreating(true)}
            className="bg-[#e8c300] text-black font-bold px-6 py-3 uppercase text-sm tracking-wide hover:bg-[#d4b200] transition-colors text-center"
          >
            + Nova Categoria
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="font-bebas text-2xl tracking-wide">
              {editing ? 'EDITAR CATEGORIA' : 'NOVA CATEGORIA'}
            </h2>
            {editing && <p className="text-sm text-neutral-400 mt-1">{editing.name}</p>}
          </div>
          <CategoryForm
            category={editing ?? undefined}
            onSaved={handleSaved}
            onCancel={() => {
              setEditing(null);
              setCreating(false);
            }}
          />
        </div>
      ) : loading ? (
        <div className="border border-neutral-800 p-8 sm:p-12 text-center text-neutral-500">
          Carregando categorias...
        </div>
      ) : categories.length === 0 ? (
        <div className="border border-neutral-800 p-8 sm:p-12 text-center text-neutral-500">
          Nenhuma categoria cadastrada ainda.
        </div>
      ) : (
        <div className="border border-neutral-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-left uppercase text-xs tracking-wider text-neutral-400">
                <th className="p-3 sm:p-4">Nome</th>
                <th className="p-3 sm:p-4 hidden sm:table-cell">Slug</th>
                <th className="p-3 sm:p-4">Produtos</th>
                <th className="p-3 sm:p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className={`border-b border-neutral-900 last:border-0 ${rowDeletingClass(deletingId === category.id)}`}
                >
                  <td className="p-3 sm:p-4">
                    <button
                      onClick={() => setEditing(category)}
                      className="font-semibold hover:text-[#e8c300] text-left"
                    >
                      {category.name}
                    </button>
                  </td>
                  <td className="p-3 sm:p-4 font-mono text-neutral-400 hidden sm:table-cell">{category.slug}</td>
                  <td className="p-3 sm:p-4 font-mono">{category.total_products ?? 0}</td>
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center justify-end gap-3 sm:gap-4">
                      <button
                        onClick={() => setEditing(category)}
                        className="text-neutral-400 hover:text-[#e8c300]"
                        aria-label="Editar"
                      >
                        <IconPen />
                      </button>
                      <CategoryDeleteButton
                        id={category.id}
                        name={category.name}
                        onDeleted={handleDeleted}
                        onDeletingChange={setDeletingId}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}