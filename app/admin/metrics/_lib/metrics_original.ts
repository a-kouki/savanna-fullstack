//admin/metrics/_lib/metrics.tsx

import { unstable_cache } from 'next/cache'
import { supabasePublic } from '@/app/utils/supabase/public'

export type DateRange = { from: string; to: string }

type OrderRow = {
  id: number
  created_at: string
  payment: string
  validated: boolean
  order_items: { product_name: string; selected_size: string; unit_price: number; quantity: number }[]
}

export async function fetchOrdersFromDb(range: DateRange): Promise<OrderRow[]> {
  const supabase =  supabasePublic
  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, payment, validated, order_items(product_name, selected_size, unit_price, quantity)')
    .gte('created_at', `${range.from}T00:00:00`)
    .lte('created_at', `${range.to}T23:59:59`)

  if (error) throw new Error(error.message)
  return (data ?? []) as OrderRow[]
}

export const fetchOrdersForMetrics = unstable_cache(
  async (range: DateRange) => fetchOrdersFromDb(range),
  ['orders-metrics'],
  { revalidate: 300, tags: ['orders-metrics'] }
)

function orderTotal(order: OrderRow) {
  return order.order_items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
}

export function computeSummary(orders: OrderRow[]) {
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + orderTotal(o), 0)
  const validatedCount = orders.filter(o => o.validated).length
  const avgTicket = totalOrders ? totalRevenue / totalOrders : 0
  const avgItemsPerOrder = totalOrders
    ? orders.reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.quantity, 0), 0) / totalOrders
    : 0

  return { totalOrders, totalRevenue, validatedCount, avgTicket, avgItemsPerOrder }
}

export function computeRevenueByDay(orders: OrderRow[]) {
  const map = new Map<string, number>()
  for (const order of orders) {
    const day = order.created_at.slice(0, 10)
    map.set(day, (map.get(day) ?? 0) + orderTotal(order))
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue: Number(revenue.toFixed(2)) }))
}

export function computeTopProducts(orders: OrderRow[], limit = 10) {
  const map = new Map<string, { quantity: number; revenue: number }>()
  for (const order of orders) {
    for (const item of order.order_items) {
      const current = map.get(item.product_name) ?? { quantity: 0, revenue: 0 }
      current.quantity += item.quantity
      current.revenue += item.unit_price * item.quantity
      map.set(item.product_name, current)
    }
  }
  return Array.from(map.entries())
    .map(([product_name, stats]) => ({ product_name, ...stats }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
}

export function computeTopSizes(orders: OrderRow[]) {
  const map = new Map<string, number>()
  for (const order of orders) {
    for (const item of order.order_items) {
      map.set(item.selected_size, (map.get(item.selected_size) ?? 0) + item.quantity)
    }
  }
  return Array.from(map.entries())
    .map(([size, quantity]) => ({ size, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
}

export function computePaymentBreakdown(orders: OrderRow[]) {
  const map = new Map<string, { count: number; revenue: number }>()
  for (const order of orders) {
    const current = map.get(order.payment) ?? { count: 0, revenue: 0 }
    current.count += 1
    current.revenue += orderTotal(order)
    map.set(order.payment, current)
  }
  return Array.from(map.entries()).map(([payment, stats]) => ({ payment, ...stats }))
}

export function computeOrdersByWeekday(orders: OrderRow[]) {
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const counts = new Array(7).fill(0)
  for (const order of orders) {
    counts[new Date(order.created_at).getDay()] += 1
  }
  return labels.map((label, i) => ({ day: label, count: counts[i] }))
}

export function computeOrdersByHour(orders: OrderRow[]) {
  const counts = new Array(24).fill(0)
  for (const order of orders) {
    counts[new Date(order.created_at).getHours()] += 1
  }
  return counts.map((count, hour) => ({ hour: `${hour}h`, count }))
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function getPreviousRange(range: DateRange): DateRange {
  const from = new Date(`${range.from}T00:00:00`)
  const to = new Date(`${range.to}T00:00:00`)
  const diffDays = Math.round((to.getTime() - from.getTime()) / 86400000) + 1

  const prevTo = new Date(from)
  prevTo.setDate(prevTo.getDate() - 1)
  const prevFrom = new Date(prevTo)
  prevFrom.setDate(prevFrom.getDate() - diffDays + 1)

  return { from: toISODate(prevFrom), to: toISODate(prevTo) }
}

export function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}