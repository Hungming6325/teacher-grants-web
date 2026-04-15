"use client"

import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import CountUp from "react-countup"
import PanelCard from "../ui/PanelCard"
import DashboardTabs from "../ui/DashboardTabs"
import {
  dedupePaperPublications,
  DEFAULT_PAPER_FILTERS,
  filterPaperPublications,
  getPaperDepartments,
  getPaperJournalCategories,
  getPaperSchoolYears,
  getPaperTeachers,
  getPaperTrendSeries,
  getPublicationCountByCategory,
} from "../../lib/papers"
import { PaperFilters, PaperPublication, PaperRecord } from "../../types/paper"

type Props = {
  records: PaperRecord[]
}

type TeacherSearchItem = {
  name: string
}

type SummaryCardProps = {
  title: string
  value: number
  accent: string
}

type DistributionDatum = {
  name: string
  value: number
}

type TrendDatum = {
  year: string
  totalPapers: number
  firstAuthorPapers: number
  correspondingAuthorPapers: number
  firstOrCorrespondingPapers: number
  internalCoauthorPapers: number
}

const CHART_COLORS = [
  "#4fd1c5",
  "#60a5fa",
  "#f59e0b",
  "#f472b6",
  "#34d399",
  "#818cf8",
  "#fb7185",
  "#22d3ee",
]

function SummaryCard({ title, value, accent }: SummaryCardProps) {
  return (
    <PanelCard className="border-white/10">
      <p className="mb-2 text-sm text-slate-200">{title}</p>
      <div className="flex items-end justify-between gap-3">
        <p className="text-2xl font-bold text-white md:text-3xl">
          <CountUp end={value} duration={1.1} separator="," />
        </p>
        <span
          className="h-3 w-10 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </div>
    </PanelCard>
  )
}

function TrendChart({ data }: { data: TrendDatum[] }) {
  const series = [
    { key: "totalPapers", label: "去重後論文篇數", color: "#4fd1c5" },
    { key: "firstAuthorPapers", label: "第一作者篇數", color: "#60a5fa" },
    { key: "correspondingAuthorPapers", label: "通訊作者篇數", color: "#f59e0b" },
    {
      key: "firstOrCorrespondingPapers",
      label: "第一/通訊作者篇數",
      color: "#f472b6",
    },
    { key: "internalCoauthorPapers", label: "校內合著篇數", color: "#34d399" },
  ]

  return (
    <PanelCard className="min-w-0 border-cyan-300/12">
      <h2 className="mb-4 text-lg font-semibold text-white md:text-xl">
        近三年趨勢
      </h2>

      <div className="min-w-0 h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
            <XAxis
              dataKey="year"
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              formatter={(value, name) => {
                const seriesItem = series.find((item) => item.key === name)
                return [value, seriesItem?.label ?? String(name)]
              }}
              labelFormatter={(label) => `${label} 年`}
              contentStyle={{
                backgroundColor: "rgba(2, 6, 23, 0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "18px",
                color: "#fff",
              }}
            />
            {series.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={900}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  )
}

function CategoryDistributionChart({
  data,
  activeCategory,
  onSelectCategory,
}: {
  data: DistributionDatum[]
  activeCategory: string
  onSelectCategory: (category: string) => void
}) {
  return (
    <PanelCard className="min-w-0 border-emerald-300/12">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white md:text-xl">
          收錄分類分布
        </h2>
        {activeCategory ? (
          <button
            type="button"
            onClick={() => onSelectCategory("")}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
          >
            清除分類
          </button>
        ) : null}
      </div>

      <div className="min-w-0 h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 10, left: 10, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fill: "#e2e8f0", fontSize: 13 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => `${value} 篇`}
              labelFormatter={() => ""}
              itemStyle={{ color: "#f8fafc" }}
              labelStyle={{ color: "#f8fafc" }}
              cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
              contentStyle={{
                backgroundColor: "rgba(2, 6, 23, 0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "18px",
                color: "#fff",
              }}
            />
            <Bar
              dataKey="value"
              radius={[0, 12, 12, 0]}
              barSize={26}
              onClick={(entry) => {
                if (!entry || typeof entry.name !== "string") return
                onSelectCategory(entry.name === activeCategory ? "" : entry.name)
              }}
              style={{ cursor: "pointer" }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`category-${entry.name}-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  fillOpacity={
                    !activeCategory || activeCategory === entry.name ? 1 : 0.3
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  )
}

function CollaborationChart({
  data,
  selectedTeacher,
}: {
  data: DistributionDatum[]
  selectedTeacher: string
}) {
  return (
    <PanelCard className="min-w-0 border-violet-300/12">
      <h2 className="mb-4 text-lg font-semibold text-white md:text-xl">
        校內合著情形
      </h2>

      {selectedTeacher ? (
        <div className="min-w-0 h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 10, left: 10, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fill: "#cbd5e1", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={180}
                tick={{ fill: "#e2e8f0", fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => `${value} 篇`}
                labelFormatter={() => ""}
                itemStyle={{ color: "#f8fafc" }}
                labelStyle={{ color: "#f8fafc" }}
                cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                contentStyle={{
                  backgroundColor: "rgba(2, 6, 23, 0.92)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "18px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={26}>
                {data.map((entry, index) => (
                  <Cell
                    key={`collaboration-${entry.name}-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-full min-h-[404px] items-center justify-center rounded-2xl border border-white/6 bg-white/[0.04] px-6 text-center text-sm leading-7 text-slate-300">
          選擇某位教師後，這裡會顯示該教師的校內合著情形。
        </div>
      )}
    </PanelCard>
  )
}

function formatApaAuthors(teacherNames: string[]) {
  if (teacherNames.length === 0) return ""
  if (teacherNames.length === 1) return teacherNames[0]
  if (teacherNames.length === 2) return `${teacherNames[0]} & ${teacherNames[1]}`

  return `${teacherNames.slice(0, -1).join(", ")}, & ${teacherNames.at(-1)}`
}

function formatApaReference(publication: PaperPublication) {
  const authors = formatApaAuthors(publication.teacherNames)
  return `${authors}. (${publication.publicationYear}). ${publication.title}. ${publication.journalName}.`
}

function PublicationList({
  publications,
}: {
  publications: PaperPublication[]
}) {
  return (
    <div className="space-y-3">
      {publications.map((publication, index) => (
        <div
          key={publication.paperKey}
          className="rounded-2xl border border-white/6 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-slate-100"
        >
          <span className="mr-2 text-slate-400">{index + 1}.</span>
          {formatApaReference(publication)}
        </div>
      ))}
    </div>
  )
}

function filterRecordsByPaperFilters(records: PaperRecord[], filters: PaperFilters) {
  return records.filter((record) => {
    const matchYear = !filters.schoolYear || record.schoolYear === filters.schoolYear
    const matchDepartment =
      !filters.department || record.department === filters.department
    const matchTeacher =
      !filters.teacherName || record.teacherName === filters.teacherName
    const matchCategory =
      !filters.journalCategory ||
      record.journalCategories.includes(filters.journalCategory)

    return matchYear && matchDepartment && matchTeacher && matchCategory
  })
}

function getCollaborationData(
  publications: PaperPublication[],
  selectedTeacher: string
) {
  const counts = new Map<string, number>()

  publications.forEach((publication) => {
    if (!publication.teacherNames.includes(selectedTeacher)) return

    publication.teacherNames
      .filter((teacher) => teacher !== selectedTeacher)
      .forEach((teacher) => {
        counts.set(teacher, (counts.get(teacher) ?? 0) + 1)
      })
  })

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

export default function PaperPublicationsDashboard({ records }: Props) {
  const [filters, setFilters] = useState<PaperFilters>(DEFAULT_PAPER_FILTERS)
  const [teacherKeyword, setTeacherKeyword] = useState("")
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false)
  const teacherBoxRef = useRef<HTMLDivElement | null>(null)

  const teacherSearch = useDeferredValue(teacherKeyword)
  const onPointerDownOutside = useEffectEvent((event: MouseEvent) => {
    if (
      teacherBoxRef.current &&
      !teacherBoxRef.current.contains(event.target as Node)
    ) {
      setTeacherDropdownOpen(false)
    }
  })

  useEffect(() => {
    document.addEventListener("mousedown", onPointerDownOutside)
    return () => document.removeEventListener("mousedown", onPointerDownOutside)
  }, [])

  const fullTimeRecords = useMemo(
    () => records.filter((record) => record.appointmentType === "專任"),
    [records]
  )

  const schoolYears = useMemo(
    () => getPaperSchoolYears(fullTimeRecords),
    [fullTimeRecords]
  )
  const departments = useMemo(
    () => getPaperDepartments(fullTimeRecords),
    [fullTimeRecords]
  )

  const teacherSourceRecords = useMemo(() => {
    return filterRecordsByPaperFilters(fullTimeRecords, {
      ...filters,
      teacherName: "",
    })
  }, [fullTimeRecords, filters])

  const categorySourceRecords = useMemo(() => {
    return filterRecordsByPaperFilters(fullTimeRecords, {
      ...filters,
      journalCategory: "",
    })
  }, [fullTimeRecords, filters])

  const teachers = useMemo<TeacherSearchItem[]>(
    () => getPaperTeachers(teacherSourceRecords).map((name) => ({ name })),
    [teacherSourceRecords]
  )
  const teacherOptions = useMemo(() => {
    const keyword = teacherSearch.trim()
    if (!keyword) return teachers

    return teachers.filter((teacher) => teacher.name.includes(keyword))
  }, [teachers, teacherSearch])
  const journalCategories = useMemo(
    () => getPaperJournalCategories(categorySourceRecords),
    [categorySourceRecords]
  )

  const filteredPublications = useMemo(() => {
    const publications = dedupePaperPublications(fullTimeRecords)
    return filterPaperPublications(publications, filters)
  }, [fullTimeRecords, filters])

  const firstAuthorPaperCount = useMemo(
    () =>
      filteredPublications.filter(
        (publication) => publication.firstAuthors.length > 0
      ).length,
    [filteredPublications]
  )

  const correspondingPaperCount = useMemo(
    () =>
      filteredPublications.filter(
        (publication) => publication.correspondingAuthors.length > 0
      ).length,
    [filteredPublications]
  )

  const firstOrCorrespondingPaperCount = useMemo(
    () =>
      filteredPublications.filter((publication) =>
        publication.firstAuthors.some((author) =>
          publication.correspondingAuthors.includes(author)
        )
      ).length,
    [filteredPublications]
  )

  const internalCoauthorCount = useMemo(
    () =>
      filteredPublications.filter((publication) => publication.hasInternalCoauthor)
        .length,
    [filteredPublications]
  )

  const categoryDistribution = useMemo(
    () => getPublicationCountByCategory(filteredPublications),
    [filteredPublications]
  )

  const trendSeries = useMemo(
    () => getPaperTrendSeries(filteredPublications),
    [filteredPublications]
  )

  const collaborationData = useMemo(
    () =>
      filters.teacherName
        ? getCollaborationData(filteredPublications, filters.teacherName)
        : [],
    [filteredPublications, filters.teacherName]
  )

  const selectedTeacherPublications = useMemo(() => {
    if (!filters.teacherName) return []

    return filteredPublications
      .filter((publication) => publication.teacherNames.includes(filters.teacherName))
      .sort((a, b) => b.publicationYear - a.publicationYear)
  }, [filteredPublications, filters.teacherName])

  function handleFilterChange(key: keyof PaperFilters, value: string) {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }

      const validTeachers = getPaperTeachers(
        filterRecordsByPaperFilters(fullTimeRecords, {
          ...next,
          teacherName: "",
        })
      )

      if (next.teacherName && !validTeachers.includes(next.teacherName)) {
        next.teacherName = ""
        setTeacherKeyword("")
      }

      const validCategories = getPaperJournalCategories(
        filterRecordsByPaperFilters(fullTimeRecords, {
          ...next,
          journalCategory: "",
        })
      )

      if (
        next.journalCategory &&
        !validCategories.includes(next.journalCategory)
      ) {
        next.journalCategory = ""
      }

      if (key === "teacherName") {
        setTeacherKeyword(value)
      }

      if (key !== "teacherName" && !next.teacherName) {
        setTeacherKeyword("")
      }

      return next
    })
  }

  function handleTeacherSelect(name: string) {
    handleFilterChange("teacherName", name)
    setTeacherKeyword(name)
    setTeacherDropdownOpen(false)
  }

  function resetFilters() {
    setFilters(DEFAULT_PAPER_FILTERS)
    setTeacherKeyword("")
    setTeacherDropdownOpen(false)
  }

  return (
    <main className="min-h-screen bg-[#12233f] px-4 py-4 text-white md:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_30%)] blur-3xl" />

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-cyan-200/80 md:text-sm">
              Publications Analytic Dashboard
            </p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl xl:text-4xl">
              期刊論文發表概況
            </h1>
          </div>

          <DashboardTabs />
        </div>

        <div className="space-y-4">
          <PanelCard className="relative z-30 overflow-visible border-white/10">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <div>
                <label className="mb-2 block text-sm text-slate-100">年度</label>
                <select
                  value={filters.schoolYear}
                  onChange={(event) =>
                    handleFilterChange("schoolYear", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-400/30 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 md:text-base"
                >
                  <option value="" className="text-black">
                    全部年度
                  </option>
                  {schoolYears.map((year) => (
                    <option key={year} value={year} className="text-black">
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-100">系所</label>
                <select
                  value={filters.department}
                  onChange={(event) =>
                    handleFilterChange("department", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-400/30 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-300 md:text-base"
                >
                  <option value="" className="text-black">
                    全部系所
                  </option>
                  {departments.map((department) => (
                    <option key={department} value={department} className="text-black">
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <div ref={teacherBoxRef} className="relative z-40">
                <label className="mb-2 block text-sm text-slate-100">教師</label>

                <button
                  type="button"
                  onClick={() => setTeacherDropdownOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-400/30 bg-white/8 px-4 py-3 text-left text-sm text-white outline-none transition hover:border-emerald-300 focus:border-emerald-300 md:text-base"
                >
                  <span className={filters.teacherName ? "text-white" : "text-slate-300"}>
                    {filters.teacherName || "全部教師"}
                  </span>
                  <svg
                    className={`h-5 w-5 text-white transition-transform ${
                      teacherDropdownOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {teacherDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-400/20 bg-[#18304f] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                    <div className="border-b border-slate-400/20 p-2">
                      <input
                        type="text"
                        value={teacherKeyword}
                        onChange={(event) => {
                          setTeacherKeyword(event.target.value)
                          if (filters.teacherName) {
                            handleFilterChange("teacherName", "")
                          }
                        }}
                        placeholder="搜尋教師姓名"
                        className="w-full rounded-xl border border-slate-400/20 bg-white/10 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-300/70 focus:border-emerald-300 md:text-base"
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto p-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleFilterChange("teacherName", "")
                          setTeacherKeyword("")
                          setTeacherDropdownOpen(false)
                        }}
                        className="w-full rounded-xl px-3 py-3 text-left text-sm text-slate-100 transition hover:bg-white/10 md:text-base"
                      >
                        全部教師
                      </button>

                      {teacherOptions.length > 0 ? (
                        teacherOptions.map((teacher) => (
                          <button
                            key={teacher.name}
                            type="button"
                            onClick={() => handleTeacherSelect(teacher.name)}
                            className="w-full rounded-xl px-3 py-3 text-left text-sm text-slate-100 transition hover:bg-white/10 md:text-base"
                          >
                            {teacher.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-slate-300">
                          找不到符合的教師
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-100">收錄分類</label>
                <select
                  value={filters.journalCategory}
                  onChange={(event) =>
                    handleFilterChange("journalCategory", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-400/30 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300 md:text-base"
                >
                  <option value="" className="text-black">
                    全部收錄分類
                  </option>
                  {journalCategories.map((category) => (
                    <option key={category} value={category} className="text-black">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20 md:text-base"
                >
                  重設篩選
                </button>
              </div>
            </div>
          </PanelCard>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              title="去重後論文篇數"
              value={filteredPublications.length}
              accent="#4fd1c5"
            />
            <SummaryCard
              title="第一作者篇數"
              value={firstAuthorPaperCount}
              accent="#60a5fa"
            />
            <SummaryCard
              title="通訊作者篇數"
              value={correspondingPaperCount}
              accent="#f59e0b"
            />
            <SummaryCard
              title="第一/通訊作者篇數"
              value={firstOrCorrespondingPaperCount}
              accent="#f472b6"
            />
            <SummaryCard
              title="校內合著篇數"
              value={internalCoauthorCount}
              accent="#34d399"
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <TrendChart data={trendSeries} />
            <CategoryDistributionChart
              data={categoryDistribution}
              activeCategory={filters.journalCategory}
              onSelectCategory={(category) =>
                handleFilterChange("journalCategory", category)
              }
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <CollaborationChart
              data={collaborationData}
              selectedTeacher={filters.teacherName}
            />

            {filters.teacherName ? (
              <PanelCard className="border-white/10">
                <h2 className="mb-4 text-lg font-semibold text-white md:text-xl">
                  著作清單（簡式）
                </h2>
                <PublicationList publications={selectedTeacherPublications} />
              </PanelCard>
            ) : (
              <PanelCard className="border-white/10">
                <h2 className="mb-4 text-lg font-semibold text-white md:text-xl">
                  著作清單（簡式）
                </h2>
                <div className="flex h-full min-h-[404px] items-center justify-center rounded-2xl border border-white/6 bg-white/[0.04] px-6 text-center text-sm leading-7 text-slate-300">
                  選擇某位教師後，這裡會顯示該教師的著作清單，並以 APA 格式列出。
                </div>
              </PanelCard>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
