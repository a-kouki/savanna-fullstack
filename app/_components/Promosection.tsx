import { getAllBanners, getBannersFor } from "@/lib/data/banners";
import { ProductsImgCoudinary } from "../ui/ProductsImageCloudinary"

export async function PromoSection() {
  const allBanners = await getAllBanners();
  const heroBanner = getBannersFor(allBanners, "home", "section_four")[0] ?? null;

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">

        {/* Direita — imagem
            No mobile fica em cima
            No desktop volta para a direita */}
        {heroBanner?.image_public_id ? (
          <div className="relative min-h-[280px] overflow-hidden flex items-center justify-center order-1 md:order-2">
            <ProductsImgCoudinary
              public_id={heroBanner.image_public_id}
              name={heroBanner.title ?? ""}
              clas="object-cover object-top"
            />
          </div>
        ) : (
          <div className="relative bg-zinc-900 min-h-[280px] overflow-hidden flex items-center justify-center order-1 md:order-2">
            <div className="flex flex-col items-center gap-2 opacity-50">
              <div className="w-28 h-36 bg-zinc-700 border border-zinc-600 flex items-center justify-center">
                <span className="font-bebas text-white text-2xl">CBF</span>
              </div>

              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-yellow-400 rounded-full"
                  />
                ))}
              </div>
            </div>

            <div className="absolute bottom-4 right-4">
              <p className="font-bebas text-white/30 text-5xl tracking-widest">
                SAVANNA
              </p>
            </div>
          </div>
        )}

        {/* Esquerda — texto + CTA
            No mobile fica embaixo
            No desktop fica na esquerda */}
        <div className="bg-secondary flex flex-col justify-center px-8 md:px-16 py-12 md:py-0 order-2 md:order-1">
          <h2 className="font-bebas text-black text-4xl md:text-5xl leading-tight mb-4">
            Encontre sua <br />
            camiseta favorita
          </h2>

          <p className="font-abeezee text-sm text-black/70 leading-relaxed mb-8 max-w-[320px]">
            Explore nossa coleção completa com os melhores times do Brasil e do mundo.
          </p>

          <a
            href="#camisetas"
            className="bg-black text-white font-bebas tracking-widest text-lg px-10 py-3 w-fit hover:bg-secondary transition-colors duration-200"
          >
            Ver coleção
          </a>
        </div>

      </div>
    </section>
  )
}