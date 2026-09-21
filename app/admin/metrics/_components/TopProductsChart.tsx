// _components/TopProductsChart.tsx
'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function TopProductsChart({ data }: { data: { product_name: string; quantity: number }[] }) {
  return (
    <div className="h-[220px] sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0 }}>
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="product_name" tick={{ fontSize: 10 }} width={90} />
          <Tooltip formatter={(value) => [`${value} un.`, 'Quantidade']} />
          <Bar dataKey="quantity" fill="#000000" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}