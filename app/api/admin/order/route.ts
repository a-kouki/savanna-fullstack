// app/api/order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { OrderFilters } from '@/app/admin/order/_lib/applyFilters'
import { calculateDiscount } from '@/lib/coupons/calculateDiscount'
import { adminActionRateLimit } from '@/app/utils/redis' 

const limits = {
  name: 60,
  address: 200,
  payment: 30,
  phone: 20,
  email: 100,
  maxItems: 50,
  item: {
    product_name: 100,
    selected_size: 20,
  },
}

type OrderItem = {
  product_id: number
  product_name: string
  unit_price: number
  selected_size: string
  quantity: number
}

type OrderPayload = {
  name: string
  address: string
  payment: string
  phone: string
  email?: string | null
  
  coupon_code?: string | null
  total: number
  items: OrderItem[]
}

// app/admin/orders/export/route.ts
import * as XLSX from 'xlsx'
import { applyFilters } from '@/app/admin/order/_lib/applyFilters'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filters: OrderFilters = {
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    q: searchParams.get('q') ?? undefined,
    validated: searchParams.get('validated') ?? undefined,
    payment: searchParams.get('payment') ?? undefined,
    minTotal: searchParams.get('minTotal') ?? undefined,
    maxTotal: searchParams.get('maxTotal') ?? undefined,
  }
  
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitas exportações em sequência. Aguarde um instante.' }, { status: 429 })
  }

  const { data: orders, error } = await applyFilters(
    supabase.from('orders').select('*, order_items(*)'),
    filters
  ).order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (orders ?? []).flatMap((order: any) => {
    const base = {
      'Código do Pedido': order.order_id,
      'Data': new Date(order.created_at).toLocaleString('pt-BR'),
      'Cliente': order.name,
      'Endereço': order.address,
      'Pagamento': order.payment,
      'Validado': order.validated ? 'Sim' : 'Não',
      'Total do Pedido': order.total,
    }

    if (!order.order_items?.length) {
      return [{ ...base, 'Produto': '', 'Tamanho': '', 'Quantidade': '', 'Preço Unitário': '' }]
    }

    return order.order_items.map((item: any) => ({
      ...base,
      'Produto': item.product_name,
      'Tamanho': item.selected_size,
      'Quantidade': item.quantity,
      'Preço Unitário': item.unit_price,
    }))
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)
  worksheet['!cols'] = [
    { wch: 24 }, { wch: 18 }, { wch: 24 }, { wch: 30 }, { wch: 14 },
    { wch: 10 }, { wch: 14 }, { wch: 24 }, { wch: 10 }, { wch: 10 }, { wch: 14 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos')
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="pedidos-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  })
}


