//admin/_components/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { SignOutButton } from './SignOutButton'
import { useAdmin } from './AdminContext'
import { useEffect, useState, useRef } from 'react'
import { scrollToNewForm } from './scrollToNewForm'

const IconShirt = ({ active }: { active?: boolean }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#000' : 'currentColor'}
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
  </svg>
)

const IconPlus = ({ active }: { active?: boolean }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#000' : 'currentColor'}
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const IconLock = ({ active }: { active?: boolean }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#000' : 'currentColor'}
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)

const IconExternalLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)

export const IconLogout = ({ active }: { active?: boolean }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#000' : 'currentColor'}
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const IconOrder = ({ active }: { active?: boolean }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke={active ? "#000" : "currentColor"}
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8.5L12 13 3 8.5" />
    <path d="M12 22V13" />
    <path d="M19 5.5L12 2 5 5.5" />
    <path d="M5 5.5L3 8.5V18l9 4 9-4V8.5l-2-3" />
  </svg>
)

const IconTag = ({ active }: { active?: boolean }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#000' : 'currentColor'}
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41L13.41 20.59a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)

const IconLayers = ({ active }: { active?: boolean }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#000' : 'currentColor'}
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
)

const IconChart = ({ active }: { active?: boolean }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#000' : 'currentColor'}
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)

const IconMore = ({ active }: { active?: boolean }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#000' : 'currentColor'}
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="19" cy="12" r="1"/>
    <circle cx="5" cy="12" r="1"/>
  </svg>
)

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const IconImage = ({ active }: { active?: boolean }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#000' : 'currentColor'}
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>
)

const NAV_ITEMS = ['products', 'new', 'order', 'more'] as const
type NavItem = typeof NAV_ITEMS[number]

// Rotas que vivem dentro do drawer "Mais"
const MORE_ROUTES = ['categories', 'coupons', 'metrics', 'banners', 'reset'] as const
type MoreRoute = typeof MORE_ROUTES[number]

// ── Geometria do notch — inalterada ──────────────────────────────────────────
const BAR_H   = 64
const NOTCH_R = 30
const LIFT    = 18
const CURVE_W = 24
const BAR_R   = 0

function buildNotchPath(W: number, cx: number): string {
  const top = LIFT
  const bot = LIFT + BAR_H
  const nr  = NOTCH_R + 4
  const cw  = CURVE_W
  const x0  = cx - nr - cw
  const x3  = cx + nr + cw
  const notchDepth = top + nr

  return [
    `M ${BAR_R} ${top}`,
    `L ${x0} ${top}`,
    `C ${x0 + cw} ${top}, ${cx - nr} ${notchDepth}, ${cx} ${notchDepth}`,
    `C ${cx + nr} ${notchDepth}, ${x3 - cw} ${top}, ${x3} ${top}`,
    `L ${W - BAR_R} ${top}`,
    `Q ${W} ${top} ${W} ${top + BAR_R}`,
    `L ${W} ${bot}`,
    `L 0 ${bot}`,
    `L 0 ${top + BAR_R}`,
    `Q 0 ${top} ${BAR_R} ${top}`,
    `Z`,
  ].join(' ')
}

// ── Hook scroll ativo — inalterado ───────────────────────────────────────────
function useActiveSection(pathname: string): 'products' | 'new' {
  const [section, setSection] = useState<'products' | 'new'>('products')

  useEffect(() => {
    if (pathname !== '/admin/products') return
    setSection('products')

    function getScrollContainer(): Element | null {
      return document.querySelector('main') ?? null
    }

    function check() {
      const formEl = document.getElementById('new-product-form')
      if (!formEl) { setSection('products'); return }

      const container = getScrollContainer()
      let scrollTop: number
      let formOffset: number

      if (container && container.scrollHeight > container.clientHeight) {
        scrollTop  = container.scrollTop
        formOffset = (formEl as HTMLElement).offsetTop - 120
      } else {
        scrollTop  = window.scrollY
        formOffset = formEl.getBoundingClientRect().top + window.scrollY - 120
      }

      setSection(scrollTop >= formOffset ? 'new' : 'products')
    }

    const init = setTimeout(check, 50)
    const container = getScrollContainer()
    const opts = { passive: true } as const

    if (container && container.scrollHeight > container.clientHeight) {
      container.addEventListener('scroll', check, opts)
    }
    window.addEventListener('scroll', check, opts)

    return () => {
      clearTimeout(init)
      container?.removeEventListener('scroll', check)
      window.removeEventListener('scroll', check)
    }
  }, [pathname])

  return section
}

// ── Sidebar principal ─────────────────────────────────────────────────────────
export function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { products } = useAdmin()

  const [barWidth, setBarWidth] = useState(0)
  const [moreOpen, setMoreOpen] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function measure() { setBarWidth(window.innerWidth) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Fecha o drawer ao trocar de rota
  useEffect(() => { setMoreOpen(false) }, [pathname])

  const activeSection = useActiveSection(pathname)

  const activeMoreRoute: MoreRoute | null = (() => {
    if (pathname.startsWith('/admin/categories')) return 'categories'
    if (pathname.startsWith('/admin/coupons'))    return 'coupons'
    if (pathname.startsWith('/admin/metrics'))    return 'metrics'
    if (pathname.startsWith('/admin/banners'))    return 'banners' 
    if (pathname.startsWith('/admin/reset'))      return 'reset'
    return null
  })()

  const activeItem: NavItem = (() => {
    if (activeMoreRoute)                         return 'more'
    if (pathname === '/admin/products')          return activeSection
    if (pathname.startsWith('/admin/order'))     return 'order'
    return 'products'
  })()

  const activeIndex = NAV_ITEMS.indexOf(activeItem)
  const slotW       = barWidth / NAV_ITEMS.length
  const bubbleCx    = slotW * activeIndex + slotW / 2
  const svgH        = BAR_H + LIFT

  const sidebarItemClass = (isActive: boolean) =>
    `flex items-center gap-2.5 px-3 py-2 text-[13px] font-abeezee transition-all duration-200 ${
      isActive
        ? 'bg-[#e8c300] text-black font-medium'
        : 'text-white/50 hover:bg-white/5 hover:text-white'
    }`

  const navItems: {
    id: NavItem
    icon: React.ReactNode
    label: string | null
    onClick: (() => void) | null
  }[] = [
    {
      id: 'products',
      icon: <IconShirt active={activeItem === 'products'} />,
      label: 'Produtos',
      onClick: () => router.push('/admin/products'),
    },
    {
      id: 'new',
      icon: <IconPlus active={activeItem === 'new'} />,
      label: 'Novo',
      onClick: () => scrollToNewForm(router, pathname),
    },
    {
      id: 'order',
      icon: <IconOrder active={activeItem === 'order'} />,
      label: 'Pedidos',
      onClick: () => router.push('/admin/order'),
    },
    {
      id: 'more',
      icon: moreOpen ? <IconX /> : <IconMore active={activeItem === 'more'} />,
      label: 'Mais',
      onClick: () => setMoreOpen((v) => !v),
    },
  ]

  return (
    <>
      <aside className="hidden md:flex flex-col sticky top-0 h-screen bg-black border-r border-white/[0.06] overflow-hidden">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06] shrink-0">
          <div className="relative w-8 h-8 overflow-hidden shrink-0">
            <Image src="/favicon.png" alt="Savanna" fill className="object-contain" />
          </div>
          <div className="min-w-0">
            <p className="font-bebas text-white text-lg leading-none tracking-widest truncate">
              SAVANNA
            </p>
            <p className="font-abeezee text-[10px] text-white/30 leading-tight">Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-2 py-4 flex-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[9px] uppercase tracking-[0.18em] text-white/20 font-abeezee">
            Catálogo
          </p>

          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className={sidebarItemClass(activeItem === 'products') + ' w-full text-left cursor-pointer'}
          >
            <IconShirt active={activeItem === 'products'} />
            Produtos
          </button>

          <button
            type="button"
            onClick={() => scrollToNewForm(router, pathname)}
            className={sidebarItemClass(activeItem === 'new') + ' w-full text-left cursor-pointer'}
          >
            <IconPlus active={activeItem === 'new'} />
            Novo produto
          </button>

          <Link href="/admin/categories" className={sidebarItemClass(activeMoreRoute === 'categories')}>
            <IconLayers active={activeMoreRoute === 'categories'} />
            Categorias
          </Link>

          <Link href="/admin/banners" className={sidebarItemClass(activeMoreRoute === 'banners')}>
            <IconImage active={activeMoreRoute === 'banners'} />
            Banners
          </Link>

          <p className="px-3 pt-4 pb-2 text-[9px] uppercase tracking-[0.18em] text-white/20 font-abeezee">
            Vendas
          </p>

          <Link href="/admin/order" className={sidebarItemClass(activeItem === 'order')}>
            <IconOrder active={activeItem === 'order'} />
            Pedidos
          </Link>

          <Link href="/admin/coupons" className={sidebarItemClass(activeMoreRoute === 'coupons')}>
            <IconTag active={activeMoreRoute === 'coupons'} />
            Cupons
          </Link>

          <p className="px-3 pt-4 pb-2 text-[9px] uppercase tracking-[0.18em] text-white/20 font-abeezee">
            Métricas
          </p>
          <Link href="/admin/metrics" className={sidebarItemClass(activeMoreRoute === 'metrics')}>
            <IconChart active={activeMoreRoute === 'metrics'} />
            Métricas
          </Link>

          <p className="px-3 pt-4 pb-2 text-[9px] uppercase tracking-[0.18em] text-white/20 font-abeezee">
            Conta
          </p>

          <Link href="/admin/reset" className={sidebarItemClass(activeMoreRoute === 'reset')}>
            <IconLock active={activeMoreRoute === 'reset'} />
            Mudar senha
          </Link>
        </nav>

        {/* Rodapé */}
        <div className="px-4 py-4 border-t border-white/[0.06] flex items-center justify-between shrink-0">
          <a
            href="/"
            className="flex items-center gap-1.5 font-abeezee text-[11px] text-white/30 hover:text-[#e8c300] transition-colors duration-200"
          >
            <IconExternalLink /> Ver loja
          </a>
          <SignOutButton />
        </div>
      </aside>

      {/* Stack "Mais" — mobile */}
      {moreOpen && (
        <MoreStack
          activeRoute={activeMoreRoute}
          onNavigate={(path) => { router.push(path); setMoreOpen(false) }}
          onClose={() => setMoreOpen(false)}
          slotCx={slotW * (NAV_ITEMS.length - 1) + slotW / 2} // posição X do último slot ("more")
        />
      )}

      {/* BottomNav mobile — só renderiza após medir barWidth */}
      {barWidth > 0 && (
        <BottomNav
          barRef={barRef}
          barWidth={barWidth}
          svgH={svgH}
          bubbleCx={bubbleCx}
          activeItem={activeItem}
          navItems={navItems}
        />
      )}
    </>
  )
}

// ── Drawer "Mais" — bottom sheet mobile ───────────────────────────────────────
// ── Stack "Mais" — círculos empilhados subindo com stagger ───────────────────
function MoreStack({
  activeRoute,
  onNavigate,
  onClose,
  slotCx,
}: {
  activeRoute: MoreRoute | null
  onNavigate: (path: string) => void
  onClose: () => void
  slotCx: number
}) {
  const items: { id: MoreRoute; icon: React.ReactNode; path: string }[] = [
    { id: 'categories', icon: <IconLayers active={activeRoute === 'categories'} />, path: '/admin/categories' },
    { id: 'coupons',    icon: <IconTag active={activeRoute === 'coupons'} />,       path: '/admin/coupons' },
    { id: 'metrics',    icon: <IconChart active={activeRoute === 'metrics'} />,     path: '/admin/metrics' },
    { id: 'banners',    icon: <IconImage active={activeRoute === 'banners'} />,     path: '/admin/banners' }, 
    { id: 'reset',      icon: <IconLock active={activeRoute === 'reset'} />,        path: '/admin/reset' },
  ]

  const CIRCLE_D  = 48
  const GAP       = 10
  const BASE_LIFT = 78

  return (
    <>
      <div className="md:hidden fixed inset-0 z-40" onClick={onClose} />

      <div
        className="md:hidden fixed z-50 flex flex-col items-center"
        style={{
          left: slotCx,
          bottom: BASE_LIFT,
          transform: 'translateX(-50%)',
          gap: GAP,
        }}
      >
        {items.map((item, i) => {
          const order = items.length - 1 - i
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.path)}
              className="flex items-center justify-center shrink-0 transition-transform active:scale-90"
              style={{
                width: CIRCLE_D,
                height: CIRCLE_D,
                borderRadius: '9999px',
                background: activeRoute === item.id ? '#e8c300' : '#000000',
                border: activeRoute === item.id ? 'none' : '1px solid rgba(255,255,255,0.12)',
                animation: `riseUp 280ms cubic-bezier(.34,1.56,.64,1) both`,
                animationDelay: `${order * 55}ms`,
              }}
            >
              <span style={{ color: activeRoute === item.id ? '#000' : 'rgba(255,255,255,0.7)' }}>
                {item.icon}
              </span>
            </button>
          )
        })}
      </div>

      <style jsx global>{`
        @keyframes riseUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.7);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}

// ── BottomNav — animação rAF inalterada, cores atualizadas ────────────────────
function BottomNav({
  barRef, barWidth, svgH, bubbleCx, activeItem, navItems,
}: {
  barRef: React.RefObject<HTMLDivElement | null>
  barWidth: number
  svgH: number
  bubbleCx: number
  activeItem: NavItem
  navItems: {
    id: NavItem
    icon: React.ReactNode
    label: string | null
    onClick: (() => void) | null
  }[]
}) {
  const [animCx, setAnimCx] = useState(bubbleCx)
  const animRef  = useRef<number>(0)
  const startRef = useRef<number>(0)
  const fromRef  = useRef<number>(bubbleCx)
  const toRef    = useRef<number>(bubbleCx)
  const DURATION = 380

  useEffect(() => {
    fromRef.current  = animCx
    toRef.current    = bubbleCx
    startRef.current = 0
    cancelAnimationFrame(animRef.current)

    function ease(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }
    function frame(ts: number) {
      if (!startRef.current) startRef.current = ts
      const t  = Math.min((ts - startRef.current) / DURATION, 1)
      const cx = fromRef.current + (toRef.current - fromRef.current) * ease(t)
      setAnimCx(cx)
      if (t < 1) animRef.current = requestAnimationFrame(frame)
    }
    animRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(animRef.current)
  }, [bubbleCx]) 

  const animPath = buildNotchPath(barWidth, animCx)

  return (
    <div
      ref={barRef}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ height: svgH }}
    >
      <svg
        width="100%"
        height={svgH}
        viewBox={`0 0 ${barWidth} ${svgH}`}
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full"
        style={{ overflow: 'visible' }}
      >
        <path d={animPath} fill="#000000" />
        <circle cx={animCx} cy={LIFT} r={NOTCH_R} fill="#e8c300" />
      </svg>

      <div className="absolute inset-0 flex items-end" style={{ paddingBottom: 10 }}>
        {navItems.map((item) => {
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick ?? undefined}
              className="flex-1 flex flex-col items-center gap-0 cursor-pointer"
            >
              <span style={{
                display: 'flex',
                transition: 'transform 380ms cubic-bezier(.65,0,.35,1)',
                transform: isActive ? `translateY(-${LIFT + 8}px)` : 'translateY(0)',
                color: isActive ? '#000000' : 'rgba(255,255,255,0.35)',
              }}>
                {item.icon}
              </span>
              <span
                className="font-abeezee"
                style={{
                  fontSize: 9,
                  marginTop: 3,
                  color: 'rgba(255,255,255,0.25)',
                  transition: 'opacity 220ms, transform 220ms',
                  opacity: isActive ? 0 : 1,
                  transform: isActive ? 'scale(0.75)' : 'scale(1)',
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}