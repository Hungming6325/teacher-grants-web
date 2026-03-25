"use client"

import { motion } from "framer-motion"
import CountUp from "react-countup"
import PanelCard from "../ui/PanelCard"

type Props = {
  value: number
  maxValue: number
  title?: string
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number
) {
  const rad = ((angle - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  }
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ")
}

export default function FundingGauge({
  value,
  maxValue,
  title = "總獎助金額儀表板",
}: Props) {
  const safeMax = maxValue <= 0 ? 1 : maxValue
  const ratio = Math.max(0, Math.min(value / safeMax, 1))

  const startAngle = -120
  const endAngle = 120
  const pointerAngle = startAngle + (endAngle - startAngle) * ratio

  const cx = 200
  const cy = 180
  const radius = 120

  const backgroundArc = describeArc(cx, cy, radius, startAngle, endAngle)
  const valueArc = describeArc(cx, cy, radius, startAngle, pointerAngle)

  return (
    <PanelCard className="border-cyan-400/15">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
          {Math.round(ratio * 100)}%
        </span>
      </div>

      <div className="relative mx-auto flex max-w-[420px] justify-center">
        <svg viewBox="0 0 400 260" className="w-full">
          <defs>
            <linearGradient id="gaugeTrack" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            <linearGradient id="gaugeValue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={backgroundArc}
            fill="none"
            stroke="url(#gaugeTrack)"
            strokeWidth="20"
            strokeLinecap="round"
          />

          <path
            d={valueArc}
            fill="none"
            stroke="url(#gaugeValue)"
            strokeWidth="20"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {[0, 0.25, 0.5, 0.75, 1].map((tick, index) => {
            const angle = startAngle + (endAngle - startAngle) * tick
            const outer = polarToCartesian(cx, cy, radius + 16, angle)
            const inner = polarToCartesian(cx, cy, radius - 8, angle)
            const label = polarToCartesian(cx, cy, radius + 34, angle)

            return (
              <g key={index}>
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
                <text
                  x={label.x}
                  y={label.y}
                  fill="#94a3b8"
                  fontSize="11"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {Math.round(safeMax * tick).toLocaleString()}
                </text>
              </g>
            )
          })}

          <motion.g
            animate={{ rotate: pointerAngle }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            style={{ originX: `${cx}px`, originY: `${cy}px` }}
          >
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - 95}
              stroke="#f8fafc"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </motion.g>

          <circle cx={cx} cy={cy} r="14" fill="#e2e8f0" />
          <circle cx={cx} cy={cy} r="7" fill="#0f172a" />
        </svg>

        <div className="pointer-events-none absolute bottom-2 left-1/2 w-full max-w-[260px] -translate-x-1/2 text-center">
          <p className="mb-1 text-sm text-slate-400">目前總金額</p>
          <p className="text-4xl font-bold text-cyan-400">
            $
            <CountUp end={value} duration={1.0} separator="," decimals={0} />
          </p>
        </div>
      </div>
    </PanelCard>
  )
}