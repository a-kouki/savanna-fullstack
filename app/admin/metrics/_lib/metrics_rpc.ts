// admin/metrics/_lib/metrics_rpc.ts

import { unstable_cache } from 'next/cache'
import { supabasePublic } from '@/app/utils/supabase/public'
import type { DateRange } from './metrics'

type SummaryRow = {
  total_orders: number
  total_revenue: number
  validated_count: number
  avg_ticket: number
  avg_items_per_order: number
}

type PreviousSummaryRow = {
  total_orders: number
  total_revenue: number
  avg_ticket: number
}

type RevenueByDayRow = { date: string; revenue: number }
type TopProductRow = { product_name: string; quantity: number; revenue: number }
type TopSizeRow = { size: string; quantity: number }
type PaymentBreakdownRow = { payment: string; count: number; revenue: number }
type WeekdayRawRow = { dow: number; count: number }
type HourRawRow = { hour: number; count: number }

export type MetricsDashboard = {
  summary: SummaryRow
  previous_summary: PreviousSummaryRow
  revenue_by_day: RevenueByDayRow[]
  top_products: TopProductRow[]
  top_sizes: TopSizeRow[]
  payment_breakdown: PaymentBreakdownRow[]
  orders_by_weekday: WeekdayRawRow[]
  orders_by_hour: HourRawRow[]
}

async function fetchMetricsDashboardFromDb(
  range: DateRange,
  previousRange: DateRange
): Promise<MetricsDashboard> {
  const supabase = supabasePublic

  const { data, error } = await supabase.rpc('get_metrics_dashboard', {
    start_date: range.from,
    end_date: range.to,
    prev_start: previousRange.from,
    prev_end: previousRange.to,
  })

  if (error) throw new Error(error.message)
  return data as MetricsDashboard
}

export const fetchMetricsDashboard = unstable_cache(
  async (range: DateRange, previousRange: DateRange) =>
    fetchMetricsDashboardFromDb(range, previousRange),
  ['metrics-dashboard-rpc'],
  { revalidate: 300, tags: ['orders-metrics'] }
)

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function normalizeOrdersByWeekday(rows: WeekdayRawRow[]) {
  const counts = new Array(7).fill(0)
  for (const row of rows) counts[row.dow] = row.count
  return WEEKDAY_LABELS.map((label, i) => ({ day: label, count: counts[i] }))
}

export function normalizeOrdersByHour(rows: HourRawRow[]) {
  const counts = new Array(24).fill(0)
  for (const row of rows) counts[row.hour] = row.count
  return counts.map((count, hour) => ({ hour: `${hour}h`, count }))
}

export function normalizeRevenueByDay(rows: RevenueByDayRow[]) {
  return rows.map((r) => ({ date: String(r.date), revenue: Number(r.revenue) }))
}

export function normalizeNumericRows<T extends Record<string, unknown>>(rows: T[]): T[] {
  return rows.map((row) => {
    const copy: Record<string, unknown> = { ...row }
    for (const key of Object.keys(copy)) {
      const value = copy[key]
      if (typeof value === 'string' && !Number.isNaN(Number(value)) && value.trim() !== '') {
        copy[key] = Number(value)
      }
    }
    return copy as T
  })
}