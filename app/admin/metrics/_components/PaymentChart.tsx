// _components/PaymentChart.tsx
'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#000000', '#e8c300', '#8a8a80']
const LABELS: Record<string, string> = { pix: 'Pix', cartao: 'Cartão', dinheiro: 'Dinheiro' }

export default function PaymentChart({ data }: { data: { payment: string; count: number }[] }) {
  return (
    <div className="h-[240px] sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="payment"
            outerRadius="80%"
            label={(entry) => LABELS[entry.payload.payment] ?? entry.payload.payment}
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(value, _name, props: any) => [`${value} pedidos`, LABELS[props.payload.payment] ?? props.payload.payment]} />
          <Legend formatter={(value) => LABELS[value] ?? value} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}