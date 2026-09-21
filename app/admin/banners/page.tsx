//admin/banners/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { fetchBanners } from '@/lib/api/banners';
import BannerStatusToggle from './_components/Bannerstatustoggle';
import BannerDeleteButton from './_components/Bannerdeletebutton';
import BannerForm from './_components/Bannerform';
import type { Banner } from '@/lib/types/banners';

import { rowDeletingClass } from '@/lib/ui-constants';
import { IconPen } from '@/app/ui/Icons';

import { getBannerMediaType } from '@/lib/utils';

function formatLink(banner: Banner) {
  if (banner.link_type === 'category') return banner.category_name ?? '—';
  if (banner.link_type === 'url') return banner.custom_url;
  return 'Sem link';
}

type EditingState = Banner | 'new' | null;

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingState>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadBanners() {
    try {
      const data = await fetchBanners();
      setBanners(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBanners();
  }, []);

  function handleDeleted(id: string) {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  function handleFormDone(shouldReload: boolean) {
    setEditing(null);
    if (shouldReload) loadBanners();
  }

  // ── Formulário aberto (criar ou editar) ──
  if (editing) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="font-bebas text-3xl sm:text-4xl tracking-wide mb-6 sm:mb-8">
          {editing === 'new' ? (
            'NOVO BANNER'
          ) : (
            <>
              EDITAR BANNER — <span className="text-[#e8c300]">{editing.title || 'Sem rótulo'}</span>
            </>
          )}
        </h1>
        <BannerForm
          banner={editing === 'new' ? undefined : editing}
          onDone={handleFormDone}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-bebas text-3xl sm:text-4xl tracking-wide">BANNERS</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {loading
              ? 'Carregando...'
              : `${banners.length} banner${banners.length !== 1 ? 's' : ''} no carrossel`}
          </p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="bg-[#e8c300] text-black font-bold px-6 py-3 uppercase text-sm tracking-wide hover:bg-[#d4b200] transition-colors text-center"
        >
          + Novo Banner
        </button>
      </div>

      {loading ? (
        <div className="border border-neutral-800 p-8 sm:p-12 text-center text-neutral-500">
          Carregando banners...
        </div>
      ) : banners.length === 0 ? (
        <div className="border border-neutral-800 p-8 sm:p-12 text-center text-neutral-500">
          Nenhum banner cadastrado ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`border border-neutral-800 p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${rowDeletingClass(deletingId === banner.id)}`}
            >
              <div className="relative w-full sm:w-32 aspect-[21/9] flex-shrink-0 border border-neutral-800 overflow-hidden">
                {banner.image_url ? 
                  ( getBannerMediaType(banner.image_url) === 'video' 
                  ? 
                  <video
                    src={banner.image_url}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  /> 
                  : 
                  <Image
                    src={banner.image_url ?? ''}
                    alt={banner.title ?? 'Banner'}
                    fill
                    className="object-cover"
                  />) 
                : 
                <img
                src={'/favicon.png'}
                className='w-full h-full object-cover'
                />
                }
                
              </div>

              <div className="flex-1 min-w-0">
                <button
                  onClick={() => setEditing(banner)}
                  className="font-semibold hover:text-[#e8c300] text-left"
                >
                  {banner.title || 'Sem rótulo'}
                </button>
                <p className="text-xs text-neutral-500 mt-0.5 truncate">
                  Link: {formatLink(banner)}
                </p>
              </div>

              <div className="flex items-center justify-between sm:contents">
                <BannerStatusToggle id={banner.id} active={banner.active} />
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setEditing(banner)}
                  className="text-xs uppercase tracking-wide text-neutral-400 hover:text-[#e8c300]"
                >
                  <IconPen/>
                </button>
                <BannerDeleteButton 
                id={banner.id} 
                name={banner.title} 
                onDeleted={handleDeleted} 
                onDeletingChange={setDeletingId}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}