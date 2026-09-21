export type OrderFilters = {
  from?: string
  to?: string
  q?: string
  validated?: string 
  payment?: string
  minTotal?: string
  maxTotal?: string
}

export function applyFilters<T>(builder: T, filters: OrderFilters): T {
  let query = builder as any

  if (filters.from) {
    query = query.gte('created_at', `${filters.from}T00:00:00`)
  }
  if (filters.to) {
    query = query.lte('created_at', `${filters.to}T23:59:59`)
  }
  if (filters.q?.trim()) {
    const search = filters.q.trim()
    query = query.or(`name.ilike.%${search}%,order_code.ilike.%${search}%`)
  }
  if (filters.validated === 'true') {
    query = query.eq('validated', true)
  } else if (filters.validated === 'false') {
    query = query.eq('validated', false)
  }
  if (filters.payment) {
    query = query.eq('payment', filters.payment)
  }
  if (filters.minTotal) {
    query = query.gte('total', Number(filters.minTotal))
  }
  if (filters.maxTotal) {
    query = query.lte('total', Number(filters.maxTotal))
  }

  return query
}