"use client"

import { useEffect, useMemo, useState } from "react"
import CountUp from "react-countup"
import CategoryDonutChart from "../src/components/charts/CategoryDonutChart"
import SubcategoryBarChart from "../src/components/charts/SubcategoryBarChart"
import PanelCard from "../src/components/ui/PanelCard"
import { loadGrantCsv } from "../src/lib/csv"
import {
  FilterState,
  getUniqueDepartments,
  getUniqueTeachers,
  getUniqueYears,
} from "../src/lib/filters"
import {
  getAverageAmountPerTeacher,
  getCategoryAmountData,
  getCategoryCount,
  getSubcategoryAmountData,
  getSubcategoryCount,
  getTeacherCount,
  getTotalAmount,
} from "../src/lib/stats"
import { GrantRecord } from "../src/types/grant"

export default function Home() {
  const [records, setRecords] = useState<GrantRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    year: "",
    department: "",
    teacher: "",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await loadGrantCsv()
        setRecords(data)
      } catch (err) {
        console.error(err)
        setError("讀取 CSV 失敗")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const years = useMemo(() => getUniqueYears(records), [records])
  const departments = useMemo(() => getUniqueDepartments(records), [records])

  const filteredByYearAndDepartment = useMemo(() => {
    return records.filter((record) => {
      const matchYear = !filters.year || record.year === filters.year
      const matchDepartment =
        !filters.department || record.department === filters.department

      return matchYear && matchDepartment
    })
  }, [records, filters.year, filters.department])

  const teachers = useMemo(() => {
    return getUniqueTeachers(filteredByYearAndDepartment)
  }, [filteredByYearAndDepartment])

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchYear = !filters.year || record.year === filters.year
      const matchDepartment =
        !filters.department || record.department === filters.department
      const matchTeacher =
        !filters.teacher || record.teacher === filters.teacher

      return matchYear && matchDepartment && matchTeacher
    })
  }, [records, filters])

  const totalAmount = useMemo(() => getTotalAmount(filteredRecords), [filteredRecords])
  const teacherCount = useMemo(() => getTeacherCount(filteredRecords), [filteredRecords])
  const categoryCount = useMemo(() => getCategoryCount(filteredRecords), [filteredRecords])
  const subcategoryCount = useMemo(
    () => getSubcategoryCount(filteredRecords),
    [filteredRecords]
  )
  const averageAmountPerTeacher = useMemo(
    () => getAverageAmountPerTeacher(filteredRecords),
    [filteredRecords]
  )

  const categoryChartData = useMemo(
    () => getCategoryAmountData(filteredRecords),
    [filteredRecords]
  )

  const subcategoryChartData = useMemo(
    () => getSubcategoryAmountData(filteredRecords, 10),
    [filteredRecords]
  )

  function handleFilterChange(key: keyof FilterState, value: string) {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }

      if (key === "year") {
        next.department = ""
        next.teacher = ""
      }

      if (key === "department") {
        next.teacher = ""
      }

      return next
    })
  }

  function resetFilters() {
    setFilters({
      year: "",
      department: "",
      teacher: "",
    })
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#12233f] px-4 py-8 text-white md:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_30%)] blur-3xl" />

        <div className="mb-8">
          <p className="mb-3 text-sm uppercase tracking-[0.18em] text-cyan-200/90">
            Teacher Grants and Subsidies Analysis System
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl xl:text-5xl">
            教師獎補助金額分析系統
          </h1>
        </div>

        {loading && (
          <PanelCard>
            <p className="text-sm text-slate-100 md:text-base">資料讀取中...</p>
          </PanelCard>
        )}

        {error && (
          <PanelCard className="border-red-400/20">
            <p className="text-sm text-red-300 md:text-base">{error}</p>
          </PanelCard>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            <PanelCard>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
                <div>
                  <label className="mb-2 block text-sm text-slate-100">年度</label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange("year", e.target.value)}
                    className="w-full rounded-2xl border border-slate-400/30 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 md:text-base"
                  >
                    <option value="" className="text-black">
                      全部年度
                    </option>
                    {years.map((year) => (
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
                    onChange={(e) =>
                      handleFilterChange("department", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-400/30 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-300 md:text-base"
                  >
                    <option value="" className="text-black">
                      全部系所
                    </option>
                    {departments.map((department) => (
                      <option
                        key={department}
                        value={department}
                        className="text-black"
                      >
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-100">教師</label>
                  <select
                    value={filters.teacher}
                    onChange={(e) => handleFilterChange("teacher", e.target.value)}
                    className="w-full rounded-2xl border border-slate-400/30 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300 md:text-base"
                  >
                    <option value="" className="text-black">
                      全部教師
                    </option>
                    {teachers.map((teacher) => (
                      <option key={teacher} value={teacher} className="text-black">
                        {teacher}
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

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <PanelCard className="border-cyan-300/15">
                <p className="mb-2 text-sm text-slate-200">總獎助金額</p>
                <p className="text-2xl font-bold text-cyan-200 md:text-3xl">
                  $
                  <CountUp
                    end={totalAmount}
                    duration={1.2}
                    separator=","
                    decimals={0}
                  />
                </p>
              </PanelCard>

              <PanelCard className="border-fuchsia-300/15">
                <p className="mb-2 text-sm text-slate-200">教師人數</p>
                <p className="text-2xl font-bold text-fuchsia-200 md:text-3xl">
                  <CountUp end={teacherCount} duration={1.2} separator="," />
                </p>
              </PanelCard>

              <PanelCard className="border-emerald-300/15">
                <p className="mb-2 text-sm text-slate-200">項目數</p>
                <p className="text-2xl font-bold text-emerald-200 md:text-3xl">
                  <CountUp end={categoryCount} duration={1.2} separator="," />
                </p>
              </PanelCard>

              <PanelCard className="border-violet-300/15">
                <p className="mb-2 text-sm text-slate-200">子項目數</p>
                <p className="text-2xl font-bold text-violet-200 md:text-3xl">
                  <CountUp end={subcategoryCount} duration={1.2} separator="," />
                </p>
              </PanelCard>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <CategoryDonutChart data={categoryChartData} />
              <SubcategoryBarChart data={subcategoryChartData} />
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <PanelCard className="border-cyan-300/15">
                <h2 className="mb-2 text-lg font-semibold md:text-xl">
                  篩選後資料狀態
                </h2>
                <p className="text-sm text-slate-100 md:text-base">
                  目前共有{" "}
                  <span className="font-bold text-cyan-200">
                    {filteredRecords.length}
                  </span>{" "}
                  筆資料
                </p>
              </PanelCard>

              <PanelCard className="border-violet-300/15">
                <h2 className="mb-2 text-lg font-semibold md:text-xl">
                  平均每位教師金額
                </h2>
                <p className="text-2xl font-bold text-violet-200 md:text-3xl">
                  $
                  <CountUp
                    end={averageAmountPerTeacher}
                    duration={1.2}
                    separator=","
                    decimals={0}
                  />
                </p>
              </PanelCard>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}