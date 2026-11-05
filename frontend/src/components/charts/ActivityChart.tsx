import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from 'recharts'

interface ActivityChartProps {
  data: { day_name: string; total: number; date: string }[]
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  // Fallback demo data if data is empty
  const chartData =
    data && data.length > 0
      ? data
      : [
          { day_name: 'Mon', total: 3, date: '2026-10-25' },
          { day_name: 'Tue', total: 5, date: '2026-10-26' },
          { day_name: 'Wed', total: 2, date: '2026-10-27' },
          { day_name: 'Thu', total: 7, date: '2026-10-28' },
          { day_name: 'Fri', total: 4, date: '2026-10-29' },
          { day_name: 'Sat', total: 6, date: '2026-10-30' },
          { day_name: 'Sun', total: 8, date: '2026-10-31' },
        ]

  return (
    <div className="w-full h-32">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="day_name"
            stroke="#555555"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload
                return (
                  <div className="bg-[#171717] border border-[rgba(255,255,255,0.15)] px-2.5 py-1.5 rounded text-xs shadow-lg">
                    <span className="font-semibold text-white">{item.total} events</span>
                    <span className="text-[#888888] block text-[10px] font-mono">{item.date}</span>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar
            dataKey="total"
            fill="rgba(255, 255, 255, 0.85)"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

