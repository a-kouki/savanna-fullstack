// _components/SizesChart.tsx
'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function SizesChart({ data }: { data: { size: string; quantity: number }[] }) {
  return (
    <div className="h-[220px] sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="size" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => [`${value} un.`, 'Quantidade']} />
          <Bar dataKey="quantity" fill="#e8c300" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}