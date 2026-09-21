export function Contact() {
  const year = 2026

  const socials = [
    {
      label: "@lorem",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 2H3v16l4-4h14V2zM8 10h8M8 6h5" />
        </svg>
      ),
      href: "https://wa.me/556699333085",
    },
    {
      label: "@lorem",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
      href: "https://instagram.com",
    },
    {
      label: "@lorem",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
      href: "https://facebook.com",
    },
  ]

  return (
    <>
      {/* ── CONTACT SECTION ── */}
      <section id="contato" className="bg-white py-16">
        <div className="flex justify-center">
          <div className="w-full max-w-widthGlobal px-4 md:px-pxGloabl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

              {/* Esquerda — contato */}
              <div>
                <h2 className="font-bebas text-5xl text-black tracking-wide mb-1 border-b border-zinc-200 pb-3">
                  Contact
                </h2>

                {/* Linhas placeholder */}
                <div className="flex flex-col gap-2 my-5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-2 bg-zinc-200 rounded-full w-3/4" />
                  ))}
                </div>

                {/* Ícones sociais */}
                <div className="flex gap-6 mt-6">
                  {socials.map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center gap-1 text-black hover:text-primary transition-colors duration-200"
                    >
                      {s.icon}
                      <span className="font-abeezee text-[11px] text-black/50">{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Direita — bloco preto */}
              <div className="bg-black min-h-[200px] md:min-h-[260px] flex items-center justify-center">
                <img
                src={'/savanna_map.jpg'}
                className="h-full w-full"
                />
                
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black flex flex-col pt-8">
        {/* Nome grande */}
        <div className="flex justify-center ">
            <div
                className="
                w-full max-w-widthGlobal px-4 md:px-pxGloabl 
                flex
                justify-between
                font-bebas
                text-white
                uppercase
                leading-none
                relative
                md:-translate-y-20
                -translate-y-12
                "
                style={{ fontSize: "clamp(60px, 18vw, 220px)" }}
            >
                {"SAVANNA".split("").map((letter, index) => (
                <span key={index}>{letter}</span>
                ))}
            </div>
        </div>

        {/* Crédito */}
        <div className="flex justify-center border-t border-zinc-100">
            <div className="w-full max-w-widthGlobal px-4 md:px-pxGloabl flex justify-end py-4">
            <a
                href="https://koukiwebservice.com"
                target="_blank"
                rel="noreferrer"
                className="font-abeezee text-xs text-white/40"
            >
                @{year}
            </a>
            </div>
        </div>
        </footer>
    </>
  )
}