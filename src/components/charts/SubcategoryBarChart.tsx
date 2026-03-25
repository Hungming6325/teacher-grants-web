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
  "#4ade80",
  "#fb7185",
]

export default function SubcategoryBarChart({ data }: Props) {
  return (
    <PanelCard className="flex h-full flex-col border-emerald-300/15">
      <h2 className="mb-4 text-2xl font-semibold text-white">子項目金額分布</h2>

      <div className="h-[620px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
            barCategoryGap="26%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#314158" />
            <XAxis
              type="number"
              tick={{ fill: "#ffffff", fontSize: 14 }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={210}
              tick={{ fill: "#ffffff", fontSize: 16 }}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              labelFormatter={() => ""}
              contentStyle={{
                backgroundColor: "#18304f",
                border: "1px solid rgba(148, 163, 184, 0.35)",
                borderRadius: "12px",
                color: "#ffffff",
                fontSize: "15px",
              }}
              itemStyle={{
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 600,
              }}
              labelStyle={{ display: "none" }}
              cursor={{ fill: "rgba(148, 163, 184, 0.10)" }}
            />
            <Bar
              dataKey="amount"
              radius={[0, 10, 10, 0]}
              animationDuration={900}
              barSize={34}
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