import type { useRouter } from 'next/navigation'

export function scrollToNewForm(router: ReturnType<typeof useRouter>, pathname: string) {
  const el = document.getElementById('new-product-form') // ID corrigido

  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  if (pathname === '/admin/products') {
    requestAnimationFrame(() => {
      document.getElementById('new-product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return
  }
  router.push('/admin/products?scrollTo=new-product-form')
}