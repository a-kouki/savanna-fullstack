// app/api/order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { OrderFilters } from '@/app/admin/order/_lib/applyFilters'
import { revalidateTag } from 'next/cache'
import { calculateDiscount } from '@/lib/coupons/calculateDiscount'
import { gatekeeper } from '@/app/lib/security/gatekeeper';
import { orderRateLimit } from '@/app/utils/redis';
import { verifyItems } from '@/lib/products/verifyItems'


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
  honeypot?: string
  form_mounted_at? : number
}

function fakeOrderId() {
  return `ORD-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
}

export async function POST(req: Request) {
 
  let body: OrderPayload
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { name, address, payment, phone, email, coupon_code, items, honeypot, form_mounted_at  } = body

  
  const isSuspicious =
  !!honeypot ||
  !form_mounted_at ||
  (Date.now() - form_mounted_at) < 1500
  if (isSuspicious) {
    // mesma resposta genérica de sucesso (nunca revele o motivo pro bot)
    return NextResponse.json({ order_id: fakeOrderId() }, { status: 200 })
  }

  const supabase = await createClient()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
  const blocked = await gatekeeper({ ip, honeypot, limiter: orderRateLimit })
  if (blocked) return blocked


  if (!name?.trim() || !address?.trim() || !payment?.trim() || !phone?.trim()) {
    return Response.json({ error: 'Dados do cliente incompletos' }, { status: 400 })
  }

  if (name.length > limits.name) {
    return Response.json({ error: 'Nome inválido' }, { status: 400 })
  }
  if (address.length > limits.address) {
    return Response.json({ error: 'Endereço inválido' }, { status: 400 })
  }
  if (payment.length > limits.payment) {
    return Response.json({ error: 'Forma de pagamento inválida' }, { status: 400 })
  }
  if (phone.length > limits.phone) {
    return Response.json({ error: 'Telefone inválido' }, { status: 400 })
  }
  if (email && email.length > limits.email) {
    return Response.json({ error: 'E-mail inválido' }, { status: 400 })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'Carrinho vazio' }, { status: 400 })
  }

  if (items.length > limits.maxItems) {
    return Response.json({ error: 'Carrinho excede o limite de itens' }, { status: 400 })
  }

  for (const item of items) {
    if (
      typeof item.product_id !== 'number' ||
      !Number.isFinite(item.product_id) ||
      item.product_id <= 0
    ) {
      return Response.json({ error: 'Produto inválido no carrinho' }, { status: 400 })
    }
    if (
      typeof item.product_name !== 'string' ||
      !item.product_name.trim() ||
      item.product_name.length > limits.item.product_name
    ) {
      return Response.json({ error: 'Nome de produto inválido no carrinho' }, { status: 400 })
    }
    if (
      typeof item.selected_size !== 'string' ||
      item.selected_size.length > limits.item.selected_size
    ) {
      return Response.json({ error: 'Tamanho inválido no carrinho' }, { status: 400 })
    }
    if (
      typeof item.unit_price !== 'number' ||
      !Number.isFinite(item.unit_price) ||
      item.unit_price < 0
    ) {
      return Response.json({ error: 'Preço inválido no carrinho' }, { status: 400 })
    }
    if (
      typeof item.quantity !== 'number' ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0 ||
      item.quantity > 999
    ) {
      return Response.json({ error: 'Quantidade inválida no carrinho' }, { status: 400 })
    }
  }

  const verification = await verifyItems(items)
  if (!verification.ok) {
    return Response.json({ error: verification.error }, { status: verification.status })
  }
  const verifiedItems = verification.items

  const subtotal = verifiedItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0)

  // revalida o cupom no servidor
  let discount_amount = 0
  let coupon_code_applied: string | null = null
  let coupon_id: string | null = null 
  let free_shipping = false

  if (coupon_code?.trim()) {
    const couponResult = await calculateDiscount(
      coupon_code,
      phone,
      email,
      verifiedItems.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    )

    if (!couponResult.ok) {
      return Response.json({ error: couponResult.error }, { status: couponResult.status })
    }

    discount_amount = couponResult.discount_amount
    coupon_code_applied = couponResult.code
    coupon_id = couponResult.coupon_id
    free_shipping = couponResult.free_shipping
  }

  const total = Math.max(0, subtotal - discount_amount)

  const { data, error: orderError } = await supabase
    .from('orders')
    .insert({
      name,
      address,
      payment,
      phone,
      email: email || null,
      subtotal,
      discount_amount,
      total,
      coupon_code: coupon_code_applied, 
    })
    .select('order_id')
    .single()

  if (orderError) {
    return Response.json({ error: orderError.message }, { status: 500 })
  }

  const order_id = data.order_id

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(
      verifiedItems.map((item) => ({
        order_id,
        product_id:    item.product_id,
        product_name:  item.product_name,
        unit_price:    item.unit_price,
        selected_size: item.selected_size,
        quantity:      item.quantity,
      }))
    )

  if (itemsError) {
    await supabase.from('orders').delete().eq('order_id', order_id)
    return Response.json({ error: itemsError.message }, { status: 500 })
  }

  // registra o resgate do cupom (só se um cupom foi de fato aplicado)
  if (coupon_id) {
    const { error: redemptionError } = await supabase
      .from('coupon_redemptions')
      .insert({
        coupon_id,
        customer_phone: phone,
        customer_email: email || null,
        order_id,
        discount_applied: discount_amount,
      })

    if (redemptionError) {
      console.error('Falha ao registrar coupon_redemption:', redemptionError.message)
    }
  }

  revalidateTag('orders-metrics', 'max')

  return Response.json({ ok: true, order_id, total, discount_amount, free_shipping })
}