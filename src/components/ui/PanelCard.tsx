import { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

export default function PanelCard({ children, className = "" }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_28%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}