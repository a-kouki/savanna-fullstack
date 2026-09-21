// _components/WeekdayChart.tsx
'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function WeekdayChart({ data }: { data: { day: string; count: number }[] }) {
  return (
    <div className="h-[220px] sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => [`${value} pedidos`, 'Pedidos']} />
          <Bar dataKey="count" fill="#000000" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}