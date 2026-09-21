// _components/RevenueChart.tsx
'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <div className="h-[220px] sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#00000010" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
          <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']} labelFormatter={(l) => `Dia ${l}`} />
          <Line type="monotone" dataKey="revenue" stroke="#e8c300" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}