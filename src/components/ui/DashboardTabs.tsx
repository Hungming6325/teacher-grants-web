"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { href: "/", label: "獎補助分析" },
  { href: "/papers", label: "論文發表" },
  { href: "/teaching", label: "教學精進" },
]

export default function DashboardTabs() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/35 p-1 backdrop-blur-md">
      {LINKS.map((link) => {
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 text-base font-medium transition ${
              isActive
                ? "bg-cyan-300/15 text-cyan-100"
                : "text-slate-300 hover:bg-white/8 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </div>
  )
}
