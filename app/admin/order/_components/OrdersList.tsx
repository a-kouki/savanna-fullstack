// admin/order/_components/Orderslist.tsx

'use client'

import { useState, useTransition } from 'react'
import { toggleOrderValidation } from '../actions'

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

type Filter = 'all' | 'validated' | 'pending'

export default function OrdersList({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const validatedCount = orders.filter((o) => o.validated).length
  const pendingCount = orders.length - validatedCount

  const filteredOrders = orders.filter((order) => {
    if (filter === 'validated') return order.validated
    if (filter === 'pending') return !order.validated
    return true
  })

  function handleToggle(order: Order) {
    setPendingId(order.id)
    startTransition(async () => {
      try {
        await toggleOrderValidation(order.id, !order.validated)
      } finally {
        setPendingId(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: 'all' as Filter, label: 'Todos', count: orders.length },
          { key: 'validated' as Filter, label: 'Entregues', count: validatedCount },
          { key: 'pending' as Filter, label: 'Pendentes', count: pendingCount },
        ].map(({ key, label, count }) => {
          const active = filter === key
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`font-abeezee text-[11px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                active
                  ? 'bg-[#e8c300] border-[#e8c300] text-black'
                  : 'border-black/[0.12] text-black/50 hover:border-black/30'
              }`}
            >
              {label} · {count}
            </button>
          )
        })}
      </div>

      {/* Lista */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center border border-black/[0.06] bg-white">
          <p className="font-bebas text-xl tracking-widest text-black/20">Nenhum pedido nesse filtro</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredOrders.map((order) => {
            const itemsTotal = order.order_items.reduce(
              (acc, item) => acc + item.quantity * item.unit_price,
              0
            )
            const orderTotal = order.total ?? itemsTotal
            const hasCoupon = !!order.coupon_code

            const isTogglingThis = isPending && pendingId === order.id

            return (
              <div key={order.id} className="border border-black/[0.08] bg-white">

                {/* Cabeçalho do pedido */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.06] flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bebas text-base tracking-widest text-black">{order.order_id}</span>
                    <span className="font-abeezee text-[10px] text-black/30">
                      {new Date(order.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    
                    {hasCoupon && (
                      <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.coupon_code}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-2">
                      {hasCoupon && order.subtotal !== null && (
                        <span className="font-abeezee text-xs text-black/30 line-through">
                          R$ {order.subtotal.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                      <span className="font-bebas text-base text-black tracking-wide">
                        R$ {orderTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggle(order)}
                      disabled={isTogglingThis}
                      className={`font-abeezee text-[10px] uppercase tracking-widest px-3 py-1 border transition-colors disabled:opacity-40 ${
                        order.validated
                          ? 'bg-black text-white border-black'
                          : 'border-[#e8c300] text-black hover:bg-[#e8c300]'
                      }`}
                    >
                      {isTogglingThis ? '...' : order.validated ? 'Entregue ✓' : 'Marcar entregue'}
                    </button>
                  </div>
                </div>

                {/* Dados do cliente */}
                <div className="px-5 py-3 border-b border-black/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Cliente', value: order.name },
                    { label: 'Endereço', value: order.address },
                    { label: 'Pagamento', value: order.payment },

                    ...(order.phone ? [{ label: 'WhatsApp', value: order.phone }] : []),
                    ...(order.email ? [{ label: 'E-mail', value: order.email }] : []),
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="font-abeezee text-[10px] text-black/30 uppercase tracking-widest">{label}</p>
                      <p className="font-abeezee text-sm text-black">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Itens */}
                <div className="px-5 py-3 flex flex-col gap-1.5">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bebas text-sm text-black/40 shrink-0">{item.quantity}×</span>
                        <span className="font-abeezee text-sm text-black truncate">{item.product_name}</span>
                        <span className="font-abeezee text-[11px] text-black/30 shrink-0">({item.selected_size})</span>
                      </div>
                      <span className="font-abeezee text-sm text-black/60 shrink-0 tabular-nums">
                        R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}

                  {hasCoupon && order.discount_amount > 0 && (
                    <div className="flex items-center justify-between gap-2 pt-1.5 mt-1 border-t border-black/[0.06]">
                      <span className="font-abeezee text-sm text-emerald-600">
                        Desconto ({order.coupon_code})
                      </span>
                      <span className="font-abeezee text-sm text-emerald-600 tabular-nums">
                        − R$ {order.discount_amount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}