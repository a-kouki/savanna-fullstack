// app/_components/Fullwidthbannt.tsx
import { getAllBanners } from "@/lib/data/banners";
import { getBannersFor } from "@/lib/data/banners";
import { BannerMedia } from "./BannerMedia";

export async function FullwidthBanner() {

  const allBanners = await getAllBanners();
  const heroBanner = getBannersFor(allBanners, 'home', 'section_two')[0] ?? null;

  return (
    <section className="relative w-full h-screen overflow-hidden bg-zinc-900">
      {heroBanner ? (
        <div className="relative h-full overflow-hidden">
          <BannerMedia banner={heroBanner} className="object-cover object-top" />
          <div className="absolute bg-black/50 w-full h-full"/>
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center font-bold text-4xl">
              <p>SHOW THEM</p>
              <p>WHERE YOU STAND.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
        <div className="absolute inset-0 flex">
          <div className="w-2/3 bg-zinc-700" />
          <div className="w-2/3 bg-zinc-100" />
          <div className="w-2/3 bg-zinc-700" />
          <div className="w-2/3 bg-zinc-100" />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Texto centralizado */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="flex items-center gap-4">
            <h2 className="font-bebas text-white text-5xl md:text-7xl tracking-widest uppercase">
              Savanna
            </h2>
          </div>
        </div>
        </>
      )}
    </section>
  )
}