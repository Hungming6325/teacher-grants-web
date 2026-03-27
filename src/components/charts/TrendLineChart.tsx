"use client"

import { useMemo, useState } from "react"
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

type TooltipPayloadItem = {
  value?: number
  dataKey?: string
  name?: string
  color?: string
  payload?: TrendRow
}

type CustomTooltipProps = {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  mode: "subcategory" | "teacher"
  lockedLegendKey?: string | null
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
  "#5eead4",
  "#f59e0b",
  "#38bdf8",
  "#e879f9",
  "#4ade80",
  "#fb7185",
  "#818cf8",
  "#f472b6",
  "#2dd4bf",
  "#a78bfa",
]

function CustomTooltip({
  active,
  payload,
  label,
  mode,
  lockedLegendKey,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const current =
    (lockedLegendKey
      ? payload.find(
          (item) =>
            String(item.name || item.dataKey || "") ===
            String(lockedLegendKey)
        )
      : null) || payload.find((item) => item.value != null) || payload[0]

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
  const [hoveredLegendKey, setHoveredLegendKey] = useState<string | null>(null)
  const [lockedLegendKey, setLockedLegendKey] = useState<string | null>(null)

  const activeLegendKey = lockedLegendKey || hoveredLegendKey

  const seriesKeys = useMemo(() => {
    return Array.from(
      new Set(
        data.flatMap((row) => Object.keys(row).filter((key) => key !== "year"))
      )
    )
  }, [data])

  const title =
    mode === "teacher"
      ? `${selectedSubcategory || "教師"}三年度趨勢`
      : "項目三年度趨勢"

  return (
    <div
      onClick={() => {
        setLockedLegendKey(null)
        setHoveredLegendKey(null)
      }}
    >
      <PanelCard className="border-fuchsia-300/15">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold md:text-xl">{title}</h2>

          {lockedLegendKey && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLockedLegendKey(null)
                setHoveredLegendKey(null)
              }}
              className="shrink-0 rounded-xl border border-slate-400/20 bg-white/5 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10"
            >
              顯示全部
            </button>
          )}
        </div>

        <div
          className="h-[360px] w-full"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
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

              <Tooltip
                content={
                  <CustomTooltip mode={mode} lockedLegendKey={lockedLegendKey} />
                }
              />

              {seriesKeys.map((key, index) => {
                const isActive = !activeLegendKey || activeLegendKey === key
                const isLockedOut = !!lockedLegendKey && lockedLegendKey !== key

                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={activeLegendKey === key ? 4 : 2.5}
                    strokeOpacity={isActive ? 1 : 0.12}
                    hide={isLockedOut}
                    dot={{
                      r: activeLegendKey === key ? 4 : 3,
                      opacity: isActive ? 1 : 0.12,
                    }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                    isAnimationActive={true}
                    animationDuration={1600}
                    animationEasing="ease-out"
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div
          className="mt-4 flex justify-start"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid w-full grid-cols-5 gap-x-4 gap-y-2">
            {seriesKeys.map((key, index) => {
              const isActive = !activeLegendKey || activeLegendKey === key

              return (
                <button
                  key={key}
                  type="button"
                  className="flex min-w-0 items-center justify-start gap-2 rounded-lg px-1 py-1 text-left transition hover:bg-white/5"
                  onMouseEnter={() => {
                    if (!lockedLegendKey) setHoveredLegendKey(key)
                  }}
                  onMouseLeave={() => {
                    if (!lockedLegendKey) setHoveredLegendKey(null)
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setLockedLegendKey((prev) => (prev === key ? null : key))
                    setHoveredLegendKey(null)
                  }}
                >
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                      opacity: isActive ? 1 : 0.25,
                    }}
                  />
                  <span
                    className="leading-tight"
                    style={{
                      fontSize: "15px",
                      color: isActive ? "#e2e8f0" : "rgba(226,232,240,0.35)",
                      fontWeight: lockedLegendKey === key ? 700 : 400,
                    }}
                  >
                    {key}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </PanelCard>
    </div>
  )
}