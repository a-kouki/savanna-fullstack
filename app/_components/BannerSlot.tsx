// app/_components/BannerSlot.tsx
import Image from "next/image";
import { getAllBanners } from "@/lib/data/banners";

export async function BannerSlot() {
  const banners = await getAllBanners();

  if (banners.length === 0) {
    return <p className="text-white p-4">Nenhum banner encontrado.</p>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {banners.map((b) => (
        <div key={b.id} className="border border-neutral-700 p-2">
          <p className="text-white text-xs mb-1">
            page: {b.page ?? '—'} | position: {b.position ?? '—'} | active: {String(b.active)}
          </p>
          {b.custom_url ?
          <>
          <a href={b.custom_url || ''} target="_blank">
            <Image
            src={b.image_url ?? ''}
            alt={b.title ?? ''}
            width={800}
            height={300}
            className="w-full object-cover"
            />
          </a>
          </>
          :
          <>
          <Image
            src={b.image_url ?? ''}
            alt={b.title ?? ''}
            width={800}
            height={300}
            className="w-full object-cover"
          />
          </>
          }
        </div>
      ))}
    </div>
  );
}