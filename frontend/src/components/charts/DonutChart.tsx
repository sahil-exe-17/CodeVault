import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

interface DonutChartProps {
  data: { language: string; count: number }[]
}

const MONOCHROME_SHADES = [
  '#FFFFFF',
  '#D4D4D4',
  '#A3A3A3',
  '#737373',
  '#525252',
  '#333333',
]

export const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const chartData =
    data && data.length > 0
      ? data
      : [
          { language: 'python', count: 14 },
          { language: 'c', count: 9 },
          { language: 'cpp', count: 7 },
          { language: 'java', count: 5 },
          { language: 'javascript', count: 4 },
        ]

  const total = chartData.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full h-44 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey="count"
              stroke="#090909"
              strokeWidth={2}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={MONOCHROME_SHADES[index % MONOCHROME_SHADES.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload
                  return (
                    <div className="bg-[#171717] border border-[rgba(255,255,255,0.15)] px-2.5 py-1.5 rounded text-xs shadow-lg">
                      <span className="font-semibold text-white capitalize">{item.language}</span>
                      <span className="text-[#888888] block text-[10px]">
                        {item.count} experiments ({Math.round((item.count / total) * 100)}%)
                      </span>
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold font-['Manrope'] text-white">{total}</span>
          <span className="text-[10px] text-[#888888] uppercase tracking-wider">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs text-[#A1A1A1]">
        {chartData.map((item, idx) => (
          <div key={item.language} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: MONOCHROME_SHADES[idx % MONOCHROME_SHADES.length] }}
            />
            <span className="capitalize">{item.language}</span>
            <span className="text-[#666666] font-mono text-[10px]">({item.count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
