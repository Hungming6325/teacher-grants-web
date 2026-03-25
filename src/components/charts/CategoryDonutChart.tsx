"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import PanelCard from "../ui/PanelCard"

type ChartItem = {
  name: string
  amount: number
}

type Props = {
  data: ChartItem[]
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
]

export default function CategoryDonutChart({ data }: Props) {
  return (
    <PanelCard className="flex h-full flex-col border-fuchsia-300/15">
      <h2 className="mb-4 text-2xl font-semibold text-white">項目金額分布</h2>

      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="46%"
              innerRadius={85}
              outerRadius={150}
              paddingAngle={3}
              animationDuration={900}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, "金額"]}
              contentStyle={{
                backgroundColor: "#18304f",
                border: "1px solid rgba(148, 163, 184, 0.35)",
                borderRadius: "12px",
                color: "#ffffff",
                fontSize: "15px",
              }}
              labelStyle={{ color: "#ffffff", fontSize: "14px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 grid gap-3">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl bg-white/6 px-4 py-3 text-base"
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-lg font-medium text-slate-100">
                {item.name}
              </span>
            </div>
            <span className="text-lg font-semibold text-slate-100">
              ${item.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </PanelCard>
  )
}