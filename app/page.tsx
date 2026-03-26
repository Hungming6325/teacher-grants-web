"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import CountUp from "react-countup"
import SubcategoryBarChart from "../src/components/charts/SubcategoryBarChart"
import PanelCard from "../src/components/ui/PanelCard"
import { loadGrantCsv } from "../src/lib/csv"
import {
  getUniqueDepartments,
  getUniqueTeachers,
  getUniqueYears,
} from "../src/lib/filters"
import {
  getAverageAmountPerTeacher,
  getSubcategoryAmountData,
  getTeacherCount,
  getTotalAmount,
} from "../src/lib/stats"
import { GrantRecord } from "../src/types/grant"

type ExtendedFilterState = {
  year: string
  department: string
  teacher: string
  subcategory: string
}

type TeacherSearchItem = {
  name: string
  stroke: number
}

function getSurnameStroke(name: string) {
  const surname = name.trim().charAt(0)

  const strokeMap: Record<string, number> = {
    丁: 2,
    卜: 2,
    刁: 2,
    七: 2,
    九: 2,
    乃: 2,
    于: 3,
    干: 3,
    山: 3,
    川: 3,
    之: 3,
    口: 3,
    尹: 4,
    王: 4,
    尤: 4,
    文: 4,
    方: 4,
    毛: 4,
    孔: 4,
    史: 5,
    白: 5,
    石: 5,
    田: 5,
    包: 5,
    甘: 5,
    朱: 6,
    江: 6,
    任: 6,
    吳: 7,
    何: 7,
    呂: 7,
    李: 7,
    杜: 7,
    汪: 7,
    阮: 7,
    周: 8,
    林: 8,
    邱: 8,
    金: 8,
    季: 8,
    孟: 8,
    武: 8,
    姜: 9,
    洪: 9,
    胡: 9,
    范: 9,
    柯: 9,
    施: 9,
    侯: 9,
    柳: 9,
    唐: 10,
    孫: 10,
    徐: 10,
    袁: 10,
    高: 10,
    夏: 10,
    馬: 10,
    張: 11,
    曹: 11,
    梁: 11,
    陳: 16,
    黃: 12,
    曾: 12,
    彭: 12,
    程: 12,
    游: 12,
    馮: 12,
    葉: 12,
    楊: 13,
    廖: 14,
    趙: 14,
    劉: 15,
    鄭: 19,
    蔡: 17,
    蕭: 18,
    賴: 16,
    謝: 17,
    鍾: 17,
    戴: 17,
    簡: 18,
    羅: 19,
    蘇: 22,
    龔: 22,
  }

  return strokeMap[surname] ?? 999
}

export default function Home() {
  const [records, setRecords] = useState<GrantRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<ExtendedFilterState>({
    year: "",
    department: "",
    teacher: "",
    subcategory: "",
  })

  const [teacherKeyword, setTeacherKeyword] = useState("")
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false)
  const teacherBoxRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        teacherBoxRef.current &&
        !teacherBoxRef.current.contains(event.target as Node)
      ) {
        setTeacherDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const years = useMemo(() => getUniqueYears(records), [records])
  const departments = useMemo(() => getUniqueDepartments(records), [records])

  const teacherSourceRecords = useMemo(() => {
  return records.filter((record: any) => {
    const matchYear = !filters.year || record.year === filters.year
    const matchDepartment =
      !filters.department || record.department === filters.department
    const matchSubcategory =
      !filters.subcategory || record.subcategory === filters.subcategory

    return matchYear && matchDepartment && matchSubcategory
  })
}, [records, filters.year, filters.department, filters.subcategory])

const teachers = useMemo(() => {
  const teacherList = getUniqueTeachers(teacherSourceRecords)

  return teacherList
    .map((name) => ({
      name,
      stroke: getSurnameStroke(name),
    }))
    .sort((a, b) => {
      if (a.stroke !== b.stroke) return a.stroke - b.stroke
      return a.name.localeCompare(b.name, "zh-Hant")
    })
}, [teacherSourceRecords])

  const teacherOptions = useMemo(() => {
    const keyword = teacherKeyword.trim()

    if (!keyword) return teachers

    return teachers.filter((teacher) => teacher.name.includes(keyword))
  }, [teachers, teacherKeyword])

  const subcategories = useMemo(() => {
  const uniqueValues = Array.from(
    new Set(
      records
        .filter((record: any) => {
          const matchYear = !filters.year || record.year === filters.year
          const matchDepartment =
            !filters.department || record.department === filters.department
          const matchTeacher =
            !filters.teacher || record.teacher === filters.teacher

          return matchYear && matchDepartment && matchTeacher
        })
        .map((record: any) => record.subcategory)
        .filter(Boolean)
    )
  )

  return uniqueValues.sort((a, b) => a.localeCompare(b, "zh-Hant"))
}, [records, filters.year, filters.department, filters.teacher])

  const filteredRecords = useMemo(() => {
    return records.filter((record: any) => {
      const matchYear = !filters.year || record.year === filters.year
      const matchDepartment =
        !filters.department || record.department === filters.department
      const matchTeacher =
        !filters.teacher || record.teacher === filters.teacher
      const matchSubcategory =
        !filters.subcategory || record.subcategory === filters.subcategory

      return matchYear && matchDepartment && matchTeacher && matchSubcategory
    })
  }, [records, filters])

  const totalAmount = useMemo(() => getTotalAmount(filteredRecords), [filteredRecords])
  const allTotalAmount = useMemo(() => getTotalAmount(records), [records])
  const teacherCount = useMemo(() => getTeacherCount(filteredRecords), [filteredRecords])
  const averageAmountPerTeacher = useMemo(
    () => getAverageAmountPerTeacher(filteredRecords),
    [filteredRecords]
  )

  const filterRatio = useMemo(() => {
    if (!allTotalAmount) return 0
    return totalAmount / allTotalAmount
  }, [totalAmount, allTotalAmount])

  const chartData = useMemo(() => {
    if (filters.subcategory) {
      const teacherAmountMap = new Map<string, number>()

      filteredRecords.forEach((record: any) => {
        const current = teacherAmountMap.get(record.teacher) ?? 0
        teacherAmountMap.set(record.teacher, current + Number(record.amount || 0))
      })

      const subcategoryTotal = Array.from(teacherAmountMap.values()).reduce(
        (sum, value) => sum + value,
        0
      )

      return Array.from(teacherAmountMap.entries())
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: subcategoryTotal ? (amount / subcategoryTotal) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount)
    }

    return getSubcategoryAmountData(filteredRecords).map((item: any) => ({
      ...item,
      percentage: totalAmount ? (Number(item.amount || 0) / totalAmount) * 100 : 0,
    }))
  }, [filteredRecords, filters.subcategory, totalAmount])

function handleFilterChange(key: keyof ExtendedFilterState, value: string) {
  setFilters((prev) => {
    const next = { ...prev, [key]: value }

    const validTeachers = Array.from(
      new Set(
        records
          .filter((record: any) => {
            const matchYear = !next.year || record.year === next.year
            const matchDepartment =
              !next.department || record.department === next.department
            const matchSubcategory =
              !next.subcategory || record.subcategory === next.subcategory

            return matchYear && matchDepartment && matchSubcategory
          })
          .map((record: any) => record.teacher)
      )
    )

    if (next.teacher && !validTeachers.includes(next.teacher)) {
      next.teacher = ""
      setTeacherKeyword("")
    }

    const validSubcategories = Array.from(
      new Set(
        records
          .filter((record: any) => {
            const matchYear = !next.year || record.year === next.year
            const matchDepartment =
              !next.department || record.department === next.department
            const matchTeacher =
              !next.teacher || record.teacher === next.teacher

            return matchYear && matchDepartment && matchTeacher
          })
          .map((record: any) => record.subcategory)
          .filter(Boolean)
      )
    )

    if (next.subcategory && !validSubcategories.includes(next.subcategory)) {
      next.subcategory = ""
    }

    if (key === "teacher") {
      setTeacherKeyword(value)
    }

    if (key !== "teacher" && !next.teacher) {
      setTeacherKeyword("")
    }

    return next
  })
}

  function handleTeacherSelect(name: string) {
    handleFilterChange("teacher", name)
    setTeacherKeyword(name)
    setTeacherDropdownOpen(false)
  }

  function resetFilters() {
    setFilters({
      year: "",
      department: "",
      teacher: "",
      subcategory: "",
    })
    setTeacherKeyword("")
    setTeacherDropdownOpen(false)
  }

  return (
<main className="min-h-screen bg-[#12233f] px-4 py-8 text-white md:px-6 lg:px-8">
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
            <PanelCard className="relative z-30 overflow-visible">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
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

   <div ref={teacherBoxRef} className="relative z-40">
  <label className="mb-2 block text-sm text-slate-100">教師</label>

  <button
    type="button"
    onClick={() => setTeacherDropdownOpen((prev) => !prev)}
    className="flex w-full items-center justify-between rounded-2xl border border-slate-400/30 bg-white/8 px-4 py-3 text-left text-sm text-white outline-none transition hover:border-emerald-300 focus:border-emerald-300 md:text-base"
  >
    <span className={filters.teacher ? "text-white" : "text-slate-300"}>
      {filters.teacher || "全部教師"}
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
      <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>

  {teacherDropdownOpen && (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-400/20 bg-[#18304f] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="border-b border-slate-400/20 p-2">
        <input
          type="text"
          value={teacherKeyword}
          onChange={(e) => {
            setTeacherKeyword(e.target.value)
            if (filters.teacher) {
              handleFilterChange("teacher", "")
            }
          }}
          placeholder="輸入教師姓名篩選"
          className="w-full rounded-xl border border-slate-400/20 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-300/70 focus:border-emerald-300 md:text-base"
        />
      </div>

      <div className="max-h-64 overflow-y-auto p-2">
        <button
          type="button"
          onClick={() => {
            handleFilterChange("teacher", "")
            setTeacherKeyword("")
            setTeacherDropdownOpen(false)
          }}
          className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-white/10 md:text-base"
        >
          全部教師
        </button>

        {teacherOptions.length > 0 ? (
          teacherOptions.map((teacher: TeacherSearchItem) => (
            <button
              key={teacher.name}
              type="button"
              onClick={() => handleTeacherSelect(teacher.name)}
              className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-white/10 md:text-base"
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
                  <label className="mb-2 block text-sm text-slate-100">
                    獎補助項目
                  </label>
                  <select
                    value={filters.subcategory}
                    onChange={(e) =>
                      handleFilterChange("subcategory", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-400/30 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300 md:text-base"
                  >
                    <option value="" className="text-black">
                      全部項目
                    </option>
                    {subcategories.map((subcategory) => (
                      <option
                        key={subcategory}
                        value={subcategory}
                        className="text-black"
                      >
                        {subcategory}
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

            <section className="grid gap-4 md:grid-cols-3">
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

              <PanelCard className="border-violet-300/15">
                <p className="mb-2 text-sm text-slate-200">占比</p>
                <p className="text-2xl font-bold text-violet-200 md:text-3xl">
                  <CountUp
                    end={filterRatio * 100}
                    duration={1.2}
                    decimals={2}
                    suffix="%"
                  />
                </p>
              </PanelCard>
            </section>

            <section className="grid items-start gap-6 xl:grid-cols-[0.5fr_1.5fr]">
              <div className="space-y-4">
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
              </div>

              <SubcategoryBarChart
                data={chartData}
                mode={filters.subcategory ? "teacher" : "subcategory"}
                selectedSubcategory={filters.subcategory}
              />
            </section>
          </div>
        )}
      </div>
    </main>
  )
}