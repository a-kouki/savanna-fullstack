import { getAllBanners, getBannersFor } from "@/lib/data/banners";

import { BannerMedia } from "./BannerMedia";

const links = [
  { label: "Ver Catálogo", href: "#camisetas" },
  { label: "Falar no WhatsApp", href: "https://wa.me/556699333085" },
  { label: "Ver no Instagram", href: "https://instagram.com" },
]

export async function AboutSection() {

  const allBanners = await getAllBanners();
  const heroBanner = getBannersFor(allBanners, 'category', 'fullwidth')[0] ?? null;

  return (
    <section id="sobre" className="bg-white py-16">
      <div className="flex justify-center">
        <div className="w-full max-w-widthGlobal px-4 md:px-pxGloabl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

            {/* Esquerda — texto + links */}
            <div>
              <h2 className="font-bebas text-3xl md:text-4xl text-black tracking-wide mb-3">
                Qualidade que você sente
              </h2>
              <p className="font-abeezee text-sm text-black/60 leading-relaxed mb-8 max-w-[360px]">
                Cada camiseta é selecionada com cuidado para garantir o melhor tecido,
                acabamento impecável e fidelidade ao escudo do seu time.
              </p>

              <ul className="flex flex-col gap-3">
                {links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="flex items-center justify-between border-b border-zinc-200 pb-3 group"
                    >
                      <span className="font-abeezee text-sm text-black group-hover:text-primary transition-colors duration-200">
                        {link.label}
                      </span>
                      <span className="text-black/40 group-hover:text-primary transition-colors duration-200 group-hover:translate-x-1 inline-block transition-transform">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direita — placeholder imagem produto */}

            {heroBanner?.image_public_id ? 
            <div className="relative h-72 md:h-full overflow-hidden">
              <BannerMedia 
              banner={heroBanner}
              className={'object-cover object-center'}
              priority={false}
              />
            </div>
            :
            <div className="relative h-72 md:h-96 bg-zinc-100 overflow-hidden">
              <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
              </div>
            </div>
            }

          </div>
        </div>
      </div>
    </section>
  )
}