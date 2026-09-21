//admin/banners/_components/Bannerform.tsx
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  createBanner,
  updateBanner,
} from '@/lib/api/banners';
import { fetchCategories } from '@/lib/api/categories';
import type { Banner, BannerFormInput, BannerLinkType } from '@/lib/types/banners';
import { BANNER_POSITIONS } from '@/lib/types/banners';
import { BANNER_PAGES } from '@/lib/types/banners';
import type { Category } from '@/lib/types/category';

import { LoadingOverlay } from '@/app/ui/LoadingOverlay';
import { ButtonSpinner } from '@/app/ui/ButtonSpinner';

import { getBannerMediaType } from '@/lib/utils';

const inputClass =
  'w-full bg-white border border-neutral-800 px-4 py-2.5 text-sm focus:border-[#e8c300] outline-none transition-colors';
const labelClass = 'block text-xs uppercase tracking-wide text-neutral-400 mb-1.5';

interface BannerFormProps{
  banner?:Banner;
  onDone: (shouldReload: boolean) => void;
}

export default function BannerForm({ banner, onDone }: BannerFormProps) {
  const router = useRouter();
  const isEditing = !!banner;
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(banner?.image_url ?? null);

  const [form, setForm] = useState<BannerFormInput>({
    title: banner?.title ?? '',
    image_url: banner?.image_url ?? '',
    image_public_id: banner?.image_public_id ?? '',
    link_type: banner?.link_type ?? 'none',
    category_id: banner?.category_id ?? null,
    custom_url: banner?.custom_url ?? '',
    page: banner?.page ?? null,
    position: banner?.position ?? null,
    sort_order: banner?.sort_order ?? 0,
    active: banner?.active ?? true,
  });


  const originalPublicId = useRef(banner?.image_public_id ?? null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => toast.error('Erro ao carregar categorias'));
  }, []);

  //URL.createObjectURL() cria uma URL temporária como:
  //blob:http://localhost:3000/72f4c6b2-a2f3-4df2-8dc9-4b6f...
  // Essa URL aponta para o arquivo na memória do navegador.
  //Mas existe um detalhe importante Essas URLs não são liberadas automaticamente.
  //Se o usuário trocar de imagem várias vezes: imagem1.jpg , imagem2.jpg , imagem3.jpg , imagem4.jpg ...
  //você pode acabar com várias URLs blob: ocupando memória, mesmo que não estejam mais sendo exibidas.
  //Isso é chamado de memory leak (vazamento de memória).
  //Como resolver? O navegador fornece: URL.revokeObjectURL(url);
  //Isso informa:
  //"Essa URL temporária não será mais utilizada. Pode liberar a memória."
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function update<K extends keyof BannerFormInput>(key: K, value: BannerFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const isPendingVideo = pendingFile?.type.startsWith('video/') ?? false;

  function handleCancel() {
      onDone(false); //
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!pendingFile && !form.image_url) {
      toast.error('Selecione uma imagem antes de salvar');
      return;
    }
    if (!form.position) {
      toast.error('Selecione onde o banner vai aparecer');
      return;
    }
    if (!form.page) {
      toast.error('Selecione a página do banner');
      return;
    }
    if (form.link_type === 'category' && !form.category_id) {
      toast.error('Selecione a categoria de destino');
      return;
    }
    if (form.link_type === 'url' && !form.custom_url?.trim()) {
      toast.error('Informe a URL de destino');
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        if (pendingFile) formData.append('file', pendingFile);
        formData.append('image_url', form.image_url ?? '');
        formData.append('image_public_id', form.image_public_id ?? '');
        formData.append('title', form.title ?? '');
        formData.append('description', form.description ?? '');
        formData.append('link_type', form.link_type);
        formData.append('category_id', form.category_id ?? '');
        formData.append('custom_url', form.custom_url ?? '');
        formData.append('page', form.page ?? '');
        formData.append('position', form.position ?? '');
        formData.append('active', String(form.active));

        if (isEditing) {
          await updateBanner(banner!.id, formData);
          toast.success('Banner atualizado');
        } else {
          await createBanner(formData);
          toast.success('Banner criado');
        }

        onDone(true)
      } catch (err) {
        alert(err)
        toast.error(err instanceof Error ? err.message : 'Erro ao salvar banner');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-xl space-y-6">
      {/* Upload de imagem */}
      <div>
        <label className={labelClass}>Imagem do banner</label>
        {previewUrl ? (
        <div className="relative w-full aspect-[21/9] border border-neutral-800 mb-3 overflow-hidden">
          {(isPendingVideo || getBannerMediaType(previewUrl) === 'video') ? (
            <video
              src={previewUrl}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              src={previewUrl}
              alt="Preview do banner"
              fill
              className="object-cover"
              unoptimized={previewUrl.startsWith('blob:')}
            />
          )}
        </div>
      ) : (
        <div className="w-full aspect-[21/9] border border-dashed border-neutral-800 mb-3 flex items-center justify-center text-neutral-600 text-sm">
          Nenhuma mídia selecionada
        </div>
      )}

      
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*, video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="border border-neutral-800 px-5 py-2.5 text-sm uppercase tracking-wide text-neutral-300 hover:border-[#e8c300] transition-colors"
        >
          {previewUrl ? 'Trocar imagem' : 'Selecionar imagem'}
        </button>
        <p className="text-xs text-neutral-500 mt-2"></p>
        {pendingFile && (
          <p className="text-xs text-[#e8c300] mt-1">
            Imagem será enviada ao salvar o banner.
          </p>
        )}
      </div>

      {/* Rótulo interno */}
      <div>
        <label className={labelClass}>Título - Rótulo interno (opcional, não aparece pro cliente)</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Banner Coleção Brasileirão"
          value={form.title ?? ''}
          onChange={(e) => update('title', e.target.value)}
        />
      </div>
      {/* Descrição */}
      <div>
        <label className={labelClass}>Descrição</label>
        <input
          type="text"
          className={inputClass}
          placeholder="SAVANA - homem de costa com camiseta da seleção"
          value={form.description ?? ''}
          onChange={(e) => update('description', e.target.value)}
        />
      </div>

      {/* Posição no site */}
      <div>
        <label className={labelClass}>Onde este banner aparece</label>
        <select
          className={inputClass}
          value={form.position ?? ''}
          onChange={(e) => update('position', e.target.value)}
        >
          <option value="" disabled>Selecione a posição</option>
          {BANNER_POSITIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {/* Paginação */}
      <div>
        <label className={labelClass}>Onde este banner aparece</label>
        <select
          className={inputClass}
          value={form.page ?? ''}
          onChange={(e) => update('page', e.target.value)}
        >
          <option value="" disabled>Selecione a posição</option>
          {BANNER_PAGES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Link de destino */}
      <div>
        <label className={labelClass}>Ao clicar, o banner leva para:</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          {(
            [
              { value: 'none', label: 'Nada' },
              { value: 'category', label: 'Categoria' },
              { value: 'url', label: 'URL' },
            ] as { value: BannerLinkType; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('link_type', opt.value)}
              className={`py-3 text-sm font-semibold uppercase tracking-wide border transition-colors ${
                form.link_type === opt.value
                  ? 'border-[#e8c300] bg-[#e8c300] text-black'
                  : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {form.link_type === 'category' && (
          <select
            className={inputClass}
            value={form.category_id ?? ''}
            onChange={(e) => update('category_id', e.target.value || null)}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {form.link_type === 'url' && (
          <input
            type="text"
            className={inputClass}
            placeholder="https://... ou /produtos/camisa-x"
            value={form.custom_url ?? ''}
            onChange={(e) => update('custom_url', e.target.value)}
          />
        )}
      </div>

      {/* Ativo */}
      <label className="flex items-center gap-3 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => update('active', e.target.checked)}
          className="w-4 h-4 accent-[#e8c300]"
        />
        <span className="text-sm">Banner ativo</span>
      </label>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-neutral-800">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#e8c300] text-black font-bold px-6 py-3 uppercase text-sm tracking-wide hover:bg-[#d4b200] transition-colors disabled:opacity-50"
        >
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 bg-[#e8c300] text-black font-bold px-6 py-3 uppercase text-sm tracking-wide hover:bg-[#d4b200] transition-colors disabled:opacity-50"
          >
            {isPending && <ButtonSpinner size={14} />}
            {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar banner'}
          </button>        
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="border border-neutral-800 px-6 py-3 uppercase text-sm tracking-wide text-neutral-400 hover:border-neutral-600"
        >
          Cancelar
        </button>
      </div>
      
      <LoadingOverlay show={isPending} />
    </form>
  );
}