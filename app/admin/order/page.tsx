//admin/order/page.tsx
import { createClient } from '@/app/utils/supabase/server'
import OrdersList from './_components/OrdersList'
import SearchInput from './_components/SearchInput'
import Pagination from './_components/Pagination'
import { applyFilters, OrderFilters } from './_lib/applyFilters'
import ExportButton from './_components/ExportButton'
import ActiveFilterChips from './_components/ActiveFilterChips'
import FilterDrawer from './_components/FilterDrawer'

type OrderItem = {
  id: number
  product_id: number
  product_name: string
  unit_price: number
  selected_size: string
  quantity: number
}

type Order = {
  id: number
  order_id: string
  created_at: string
  name: string
  address: string
  payment: string
  
  email: string | null
  phone: string | null
  subtotal: number | null
  discount_amount: number
  coupon_code: string | null
  total: number
  validated: boolean
  order_items: OrderItem[]
}

type PageProps = {
  searchParams: Promise<{
    from?: string; to?: string; page?: string; q?: string
    validated?: string; payment?: string; minTotal?: string; maxTotal?: string
  }>
}

const PAGE_SIZE = 20

export default async function OrdersPage({ searchParams }: PageProps) {
  const { from, to, page, q, validated, payment, minTotal, maxTotal } = await searchParams
  const filters: OrderFilters = { from, to, q, validated, payment, minTotal, maxTotal }
  
  const currentPage = Math.max(1, Number(page) || 1)
  const rangeStart = (currentPage - 1) * PAGE_SIZE
  const rangeEnd = rangeStart + PAGE_SIZE - 1

  const supabase = await createClient()

  const { count, error: countError } = await applyFilters(
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    filters
  )

  const { data: orders, error } = await applyFilters(
    supabase.from('orders').select('*, order_items(*)'),
    filters
  )
    .order('created_at', { ascending: false })
    .range(rangeStart, rangeEnd)

  if (error) {
    return (
      <p className="font-abeezee text-sm text-red-500">Erro ao carregar pedidos: {error.message}</p>
    )
  }

  const typedOrders = (orders ?? []) as Order[]
  const totalOrders = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE))

  const { data: metricsData, error: metricsError } = await applyFilters(
    supabase.from('orders').select('validated, total'),
    filters
  )

  if (error || countError || metricsError) {
  return (
    <p className="font-abeezee text-sm text-red-500">
      Erro ao carregar pedidos: {(error ?? countError ?? metricsError)?.message}
    </p>
    )
  }

  const totalRevenue = (metricsData ?? []).reduce((sum, order) => sum + (order.total ?? 0), 0)

  const validatedCount = (metricsData ?? []).filter((o) => o.validated).length

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between border-b border-black/[0.08] pb-3">
        <div className="flex items-baseline gap-3">
          <h1 className="font-bebas text-2xl tracking-widest text-black">Pedidos</h1>
          <span className="font-abeezee text-[11px] text-black/40">{totalOrders} no total</span>
        </div>
        <ExportButton />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total de pedidos', value: String(totalOrders) },
          { label: 'Entregues', value: String(validatedCount) },
          { label: 'Receita total', value: `R$ ${totalRevenue.toFixed(2).replace('.', ',')}` },
          {
            label: 'Ticket médio',
            value: totalOrders ? `R$ ${(totalRevenue / totalOrders).toFixed(2).replace('.', ',')}` : '—'
          },
        ].map(({ label, value }) => (
          <div key={label} className="border border-black/[0.08] bg-white p-4">
            <p className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest mb-1">{label}</p>
            <p className="font-bebas text-2xl text-black tracking-wide">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput />
        <FilterDrawer />
      </div>

      <ActiveFilterChips />

      {typedOrders.length === 0 ? (
        <div className="py-16 text-center border border-black/[0.06] bg-white">
          <p className="font-bebas text-xl tracking-widest text-black/20">
            {q ? `Nenhum resultado para "${q}"` : (from || to) ? 'Nenhum pedido nesse período' : 'Nenhum pedido ainda'}
          </p>
        </div>
      ) : (
        <>
          <OrdersList orders={typedOrders} />
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </>
      )}

    </div>
  )
}