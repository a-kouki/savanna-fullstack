//admin/metrics/page.tsx
import {
  getPreviousRange, percentChange
} from './_lib/metrics'
import {
  fetchMetricsDashboard,
  normalizeOrdersByWeekday,
  normalizeOrdersByHour,
  normalizeRevenueByDay,
} from './_lib/metrics_rpc'
import MetricsDateFilter from './_components/MetricsDateFilter'
import RevenueChart from './_components/RevenueChart'
import TopProductsChart from './_components/TopProductsChart'
import SizesChart from './_components/SizesChart'
import PaymentChart from './_components/PaymentChart'
import WeekdayChart from './_components/WeekdayChart'
import HourChart from './_components/HourChart'

type PageProps = {
  searchParams: Promise<{ from?: string; to?: string }>
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getDefaultRange() {
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - 29)
  return { from: toISODate(from), to: toISODate(to) }
}

export default async function MetricsPage({ searchParams }: PageProps) {
  const { from, to } = await searchParams
  const range = from && to ? { from, to } : getDefaultRange()
  const previousRange = getPreviousRange(range)

  const dashboard = await fetchMetricsDashboard(range, previousRange)

  const summary = dashboard.summary
  const previousSummary = dashboard.previous_summary

  const revenueChange = percentChange(summary.total_revenue, previousSummary.total_revenue)
  const ordersChange = percentChange(summary.total_orders, previousSummary.total_orders)
  const ticketChange = percentChange(summary.avg_ticket, previousSummary.avg_ticket)

  const revenueByDay = normalizeRevenueByDay(dashboard.revenue_by_day)
  const topProducts = dashboard.top_products
  const topSizes = dashboard.top_sizes
  const paymentBreakdown = dashboard.payment_breakdown
  const ordersByWeekday = normalizeOrdersByWeekday(dashboard.orders_by_weekday)
  const ordersByHour = normalizeOrdersByHour(dashboard.orders_by_hour)

  return (
    <div className="flex flex-col gap-5 sm:gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.08] pb-3">
        <h1 className="font-bebas text-2xl tracking-widest text-black">Métricas</h1>
        <MetricsDateFilter />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <MetricCard label="Receita" value={`R$ ${summary.total_revenue.toFixed(2).replace('.', ',')}`} change={revenueChange} />
        <MetricCard label="Pedidos" value={String(summary.total_orders)} change={ordersChange} />
        <MetricCard
          label="Ticket médio"
          value={summary.total_orders ? `R$ ${summary.avg_ticket.toFixed(2).replace('.', ',')}` : '—'}
          change={ticketChange}
        />
        <MetricCard label="Itens por pedido" value={summary.avg_items_per_order.toFixed(1)} />
      </div>

      <Section title="Receita ao longo do tempo">
        <RevenueChart data={revenueByDay} />
      </Section>

      <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
        <Section title="Produtos mais vendidos">
          <TopProductsChart data={topProducts} />
        </Section>
        <Section title="Tamanhos mais vendidos">
          <SizesChart data={topSizes} />
        </Section>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
        <Section title="Forma de pagamento">
          <PaymentChart data={paymentBreakdown} />
        </Section>
        <Section title="Pedidos por dia da semana">
          <WeekdayChart data={ordersByWeekday} />
        </Section>
      </div>

      <Section title="Pedidos por horário">
        <HourChart data={ordersByHour} />
      </Section>
    </div>
  )
}

function MetricCard({ label, value, change }: { label: string; value: string; change?: number }) {
  return (
    <div className="border border-black/[0.08] bg-white p-3 sm:p-4">
      <p className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest mb-1">{label}</p>
      <p className="font-bebas text-xl sm:text-2xl text-black tracking-wide break-words">{value}</p>
      {change !== undefined && (
        <p className={`font-abeezee text-[11px] mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs período anterior
        </p>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-black/[0.08] bg-white p-3 sm:p-4">
      <h2 className="font-abeezee text-[11px] uppercase tracking-widest text-black/40 mb-3">{title}</h2>
      {children}
    </div>
  )
}