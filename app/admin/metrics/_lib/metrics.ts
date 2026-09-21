// admin/metrics/_lib/metrics.ts

export type DateRange = { from: string; to: string }

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