"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import PanelCard from "../ui/PanelCard"

type ChartItem = {
  name: string
  amount: number
  percentage?: number
}

type Props = {
  data: ChartItem[]
  mode?: "subcategory" | "teacher"
  selectedSubcategory?: string
}

const COLORS = [
  "#22d3ee",
  "#a855f7",
  "#34d399",
  "#f472b6",
  "#60a5fa",
  "#f59e0b",
  "#2dd4bf",
  "#c084fc",
  "#4ade80",
  "#fb7185",
]

export default function SubcategoryBarChart({
  data,
  mode = "subcategory",
  selectedSubcategory = "",
}: Props) {
  const chartHeight =
    mode === "teacher"
      ? Math.max(620, data.length * 58)
      : Math.max(620, data.length * 52)

  const title =
    mode === "teacher" && selectedSubcategory
      ? `${selectedSubcategory}教師金額分布`
      : "子項目金額分布"

  return (
    <PanelCard className="flex h-full flex-col border-emerald-300/15">
      <h2 className="mb-4 text-2xl font-semibold text-white">{title}</h2>

      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 12, right: 12, left: 8, bottom: 12 }}
            barCategoryGap="22%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#314158" />
            <XAxis
              type="number"
              tick={{ fill: "#ffffff", fontSize: 16 }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={260}
              interval={0}
              tick={{ fill: "#ffffff", fontSize: 18, fontWeight: 600 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null

                const item = payload[0]?.payload
                const amount = Number(item?.amount ?? 0)
                const percentage = Number(item?.percentage ?? 0)

                return (
                  <div
                    className="rounded-2xl border border-slate-300/30 bg-[#18304f] px-4 py-3 shadow-xl"
                    style={{ minWidth: 180 }}
                  >
                    <p className="text-lg font-bold text-white">
                      金額：${amount.toLocaleString()}
                    </p>
                    <p className="mt-1 text-base font-semibold text-cyan-200">
                      占比：{percentage.toFixed(2)}%
                    </p>
                  </div>
                )
              }}
              cursor={{ fill: "rgba(148, 163, 184, 0.10)" }}
            />
            <Bar
              dataKey="amount"
              radius={[0, 10, 10, 0]}
              animationDuration={900}
              barSize={40}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  )
}