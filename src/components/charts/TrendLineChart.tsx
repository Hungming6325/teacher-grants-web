"use client"

import { useState } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import PanelCard from "../ui/PanelCard"

type TrendRow = {
  year: string
  [key: string]: string | number
}

type TrendLineChartProps = {
  data: TrendRow[]
  mode: "subcategory" | "teacher"
  selectedSubcategory: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-TW").format(value)
}

type CustomTooltipProps = {
  active?: boolean
  payload?: Array<{
    value?: number
    dataKey?: string
    name?: string
    color?: string
    payload?: TrendRow
  }>
  label?: string
  activeKey?: string | null
}

const COLORS = [
  "#67e8f9",
  "#c084fc",
  "#34d399",
  "#60a5fa",
  "#f472b6",
  "#fbbf24",
  "#a78bfa",
  "#fb7185",
  "#22d3ee",
  "#818cf8",
]

function CustomTooltip({
  active,
  payload,
  label,
  mode,
  activeKey,
}: CustomTooltipProps & {
  mode: "subcategory" | "teacher"
  activeKey?: string | null
}) {
  if (!active || !payload || payload.length === 0) return null

  const current =
    payload.find(
      (item) =>
        String(item.name || item.dataKey || "") === String(activeKey || "")
    ) || payload[0]

  if (!current || current.value == null) return null

  return (
    <div className="rounded-2xl border border-slate-400/20 bg-[#18304f] px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-1 text-sm text-slate-300">年度：{label}</div>
      <div
        className="mb-1 text-sm font-medium"
        style={{ color: current.color || "#fff" }}
      >
        {mode === "teacher" ? "教師" : "項目"}：
        {String(current.name || current.dataKey || "")}
      </div>
      <div className="text-sm text-white">
        金額：${formatCurrency(Number(current.value))}
      </div>
    </div>
  )
}

export default function TrendLineChart({
  data,
  mode,
  selectedSubcategory,
}: TrendLineChartProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const seriesKeys =
    data.length > 0
      ? Object.keys(data[0]).filter((key) => key !== "year")
      : []

  const title =
    mode === "teacher"
      ? `${selectedSubcategory || "教師"}三年度趨勢`
      : "項目三年度趨勢"

  return (
    <PanelCard className="border-fuchsia-300/15">
      <div className="mb-4">
        <h2 className="text-lg font-semibold md:text-xl">{title}</h2>
      </div>

      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 16, right: 24, left: 4, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,0.18)"
            />

            <XAxis
              dataKey="year"
              tick={{ fill: "#e2e8f0", fontSize: 14 }}
              axisLine={{ stroke: "rgba(148,163,184,0.35)" }}
              tickLine={{ stroke: "rgba(148,163,184,0.35)" }}
            />

            <YAxis tick={false} axisLine={false} tickLine={false} />

            <Tooltip content={<CustomTooltip mode={mode} activeKey={activeKey} />} />

            {seriesKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
                animationDuration={1600}
                animationEasing="ease-out"
                onMouseEnter={() => setActiveKey(key)}
                onMouseMove={() => setActiveKey(key)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-start">
        <div className="grid w-full grid-cols-5 gap-x-4 gap-y-2">
          {seriesKeys.map((key, index) => (
            <div
              key={key}
              className="flex min-w-0 items-center justify-start gap-2"
            >
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span
                className="leading-tight text-slate-200"
                style={{ fontSize: "15px" }}
              >
                {key}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PanelCard>
  )
}