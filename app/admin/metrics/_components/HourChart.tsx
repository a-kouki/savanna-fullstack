// _components/HourChart.tsx
'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipPayload } from 'recharts'

export default function HourChart({ data }: { data: { hour: string; count: number }[] }) {
  return (
    <div className="h-[180px] sm:h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => [`${value} pedidos`, 'Pedidos']} />
          <Bar dataKey="count" fill="#e8c300" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}