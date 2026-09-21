// scripts/benchmark-metrics.ts
//
// Compara a abordagem antiga (.from() + compute em JS) vs a nova (RPC)
// usando as tabelas de teste orders_duplicate / order_items_duplicate
// e a função get_metrics_dashboard_test — sem tocar em dados reais.
//
// Uso:
//   npx tsx scripts/benchmark-metrics.ts
//
// Variáveis de ambiente esperadas (Project Settings → API no dashboard do Supabase):
//   SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=eyJh...
//   TENANT_SCHEMA=savana

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://qhhgryokquvpyrqjvdbd.supabase.co"
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_WUP5lJNXTqc9i1zOBpDZkg_2qeHEWPh"
const SCHEMA = process.env.SUPABASE_SCHEMA ?? 'savana'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltou SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no ambiente.')
  console.error('Pega os dois em: Project Settings → API no dashboard do Supabase.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: { schema: SCHEMA },
})

type DateRange = { from: string; to: string }

type OrderRow = {
  order_id: string
  created_at: string
  payment: string
  validated: boolean
  order_items_duplicate: {
    product_name: string
    selected_size: string
    unit_price: number
    quantity: number
  }[]
}

// --- Abordagem antiga: fetch cru (tabelas _duplicate) + compute em JS ---

async function fetchOrdersRaw(range: DateRange): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from('orders_duplicate')
    .select(
      'order_id, created_at, payment, validated, order_items_duplicate(product_name, selected_size, unit_price, quantity)'
    )
    .gte('created_at', `${range.from}T00:00:00`)
    .lte('created_at', `${range.to}T23:59:59`)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as OrderRow[]
}

function orderTotal(order: OrderRow) {
  return order.order_items_duplicate.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
}

function computeSummary(orders: OrderRow[]) {
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + orderTotal(o), 0)
  const validatedCount = orders.filter((o) => o.validated).length
  const avgTicket = totalOrders ? totalRevenue / totalOrders : 0
  const avgItemsPerOrder = totalOrders
    ? orders.reduce((sum, o) => sum + o.order_items_duplicate.reduce((s, i) => s + i.quantity, 0), 0) / totalOrders
    : 0
  return { totalOrders, totalRevenue, validatedCount, avgTicket, avgItemsPerOrder }
}

// summary "leve" do período anterior — só o que a RPC de fato devolve em previous_summary
// (total_orders, total_revenue, avg_ticket), pra não fazer trabalho a mais que a RPC não faz
function computePreviousSummary(orders: OrderRow[]) {
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + orderTotal(o), 0)
  const avgTicket = totalOrders ? totalRevenue / totalOrders : 0
  return { totalOrders, totalRevenue, avgTicket }
}

function computeRevenueByDay(orders: OrderRow[]) {
  const map = new Map<string, number>()
  for (const order of orders) {
    const day = order.created_at.slice(0, 10)
    map.set(day, (map.get(day) ?? 0) + orderTotal(order))
  }
  return Array.from(map.entries())
}

function computeTopProducts(orders: OrderRow[], limit = 10) {
  const map = new Map<string, { quantity: number; revenue: number }>()
  for (const order of orders) {
    for (const item of order.order_items_duplicate) {
      const current = map.get(item.product_name) ?? { quantity: 0, revenue: 0 }
      current.quantity += item.quantity
      current.revenue += item.unit_price * item.quantity
      map.set(item.product_name, current)
    }
  }
  return Array.from(map.entries()).sort((a, b) => b[1].quantity - a[1].quantity).slice(0, limit)
}

function computeTopSizes(orders: OrderRow[]) {
  const map = new Map<string, number>()
  for (const order of orders) {
    for (const item of order.order_items_duplicate) {
      map.set(item.selected_size, (map.get(item.selected_size) ?? 0) + item.quantity)
    }
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
}

function computePaymentBreakdown(orders: OrderRow[]) {
  const map = new Map<string, { count: number; revenue: number }>()
  for (const order of orders) {
    const current = map.get(order.payment) ?? { count: 0, revenue: 0 }
    current.count += 1
    current.revenue += orderTotal(order)
    map.set(order.payment, current)
  }
  return Array.from(map.entries())
}

function computeOrdersByWeekday(orders: OrderRow[]) {
  const counts = new Array(7).fill(0)
  for (const order of orders) counts[new Date(order.created_at).getDay()] += 1
  return counts
}

function computeOrdersByHour(orders: OrderRow[]) {
  const counts = new Array(24).fill(0)
  for (const order of orders) counts[new Date(order.created_at).getHours()] += 1
  return counts
}

async function runOldApproach(range: DateRange, previousRange: DateRange) {
  const [orders, previousOrders] = await Promise.all([
    fetchOrdersRaw(range),
    fetchOrdersRaw(previousRange),
  ])

  computeSummary(orders)
  computePreviousSummary(previousOrders)
  computeRevenueByDay(orders)
  computeTopProducts(orders)
  computeTopSizes(orders)
  computePaymentBreakdown(orders)
  computeOrdersByWeekday(orders)
  computeOrdersByHour(orders)

  return { orders: orders.length, previousOrders: previousOrders.length }
}

// --- Abordagem nova: RPC de teste consolidada ---
async function runNewApproach(range: DateRange, previousRange: DateRange) {
  const { data, error } = await supabase.rpc('get_metrics_dashboard_test', {
    start_date: range.from,
    end_date: range.to,
    prev_start: previousRange.from,
    prev_end: previousRange.to,
  })
  if (error) throw new Error(error.message)
  return data
}

// --- Benchmark runner ---
async function timeIt<T>(label: string, fn: () => Promise<T>, iterations = 5) {
  const times: number[] = []
  let lastResult: T | undefined

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    lastResult = await fn()
    const end = performance.now()
    times.push(end - start)
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length
  const min = Math.min(...times)
  const max = Math.max(...times)

  console.log(`\n${label}`)
  console.log(`  execuções: [${times.map((t) => t.toFixed(1)).join(', ')}] ms`)
  console.log(`  média: ${avg.toFixed(1)} ms | min: ${min.toFixed(1)} ms | max: ${max.toFixed(1)} ms`)

  return { avg, min, max, lastResult }
}

async function main() {
  const range: DateRange = { from: '2026-06-01', to: '2026-07-01' }
  const previousRange: DateRange = { from: '2026-05-01', to: '2026-06-01' }

  console.log(`Benchmark — schema: ${SCHEMA}`)
  console.log(`Tabelas: orders_duplicate / order_items_duplicate`)
  console.log(`Período: ${range.from} a ${range.to} (vs ${previousRange.from} a ${previousRange.to})`)

  const oldResult = await timeIt('Abordagem antiga (.from() + compute em JS)', () =>
    runOldApproach(range, previousRange)
  )

  const newResult = await timeIt('Abordagem nova (RPC get_metrics_dashboard_test)', () =>
    runNewApproach(range, previousRange)
  )

  const diff = oldResult.avg - newResult.avg
  const pct = (diff / oldResult.avg) * 100

  console.log('\n--- Resultado ---')
  if (diff > 0) {
    console.log(`RPC foi ${diff.toFixed(1)} ms mais rápido em média (${pct.toFixed(1)}%)`)
  } else {
    console.log(`RPC foi ${Math.abs(diff).toFixed(1)} ms mais lento em média (${Math.abs(pct).toFixed(1)}%)`)
  }

  console.log('\n(payload da abordagem antiga inclui todos os pedidos+itens crus;')
  console.log(' payload da RPC é só o JSON agregado — vale comparar também o tamanho da resposta)')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })