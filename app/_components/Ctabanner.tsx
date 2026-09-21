import { getAllBanners, getBannersFor } from "@/lib/data/banners";
import { BannerMedia } from "./BannerMedia";

export async function CTABanner() {
  const allBanners = await getAllBanners();
  const heroBanner = getBannersFor(allBanners, 'home', 'section_three')[0] ?? null;

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 h-screen">

        {/* Bloco vermelho — foto/imagem */}
        {heroBanner?.image_public_id ? 
        <div className="relative flex items-center justify-center  overflow-hidden">
          <BannerMedia 
          banner={heroBanner} 
          className={'object-cover object-top'}
          priority={false}/>
        </div>
        :
        <div className="relative bg-primary flex items-center justify-center  overflow-hidden">
          {/* Placeholder: trocar por <Image src="/cta_photo.jpg" fill className="object-cover" /> */}
          <div className="absolute inset-0 bg-red-800/30" />
          <span className="relative z-10 font-bebas text-white/40 text-4xl tracking-widest uppercase">
            FOTO
          </span>
        </div>
        }
        

        {/* Bloco amarelo — frase */}
        <div className="bg-secondary flex items-center justify-center px-8 py-12 md:py-0">
          <p className="font-bebas text-black text-4xl md:text-5xl leading-tight max-w-[340px]">
            JUST DO IT.
          </p>
        </div>

      </div>
    </section>
  )
}