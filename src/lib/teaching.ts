import * as Papa from "papaparse"
import {
  TeachingFilters,
  TeachingHierarchySelection,
  TeachingRecord,
  TeachingSummary,
} from "../types/teaching"

type TeachingCsvRow = Record<string, string>

export const DEFAULT_TEACHING_FILTERS: TeachingFilters = {
  department: "",
  teacherName: "",
  category1: "",
  category2: "",
  category3: "",
}

function cleanText(value: string | undefined) {
  return (value ?? "")
    .replace(/^\ufeff/u, "")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function parseNumber(value: string | undefined) {
  const cleaned = cleanText(value).replace(/,/g, "").replace(/[^0-9.-]/g, "")
  return cleaned ? Number(cleaned) : 0
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "zh-Hant")
  )
}

function extractTeachingCode(value: string) {
  return cleanText(value).match(/^[A-D][0-9]+(?:-[0-9]+)?/)?.[0] ?? ""
}

function sortTeachingCategoryLabel(a: string, b: string) {
  const aCode = extractTeachingCode(a) || cleanText(a)
  const bCode = extractTeachingCode(b) || cleanText(b)

  if (aCode !== bCode) {
    return aCode.localeCompare(bCode, "en")
  }

  return cleanText(a).localeCompare(cleanText(b), "zh-Hant")
}

function normalizeCategory3(category2: string, category3: string) {
  const normalizedCategory3 = cleanText(category3)
  if (!normalizedCategory3) return ""

  if (extractTeachingCode(normalizedCategory3)) {
    return normalizedCategory3
  }

  const category2Code = extractTeachingCode(category2)
  if (!category2Code) {
    return normalizedCategory3
  }

  return `${category2Code}-0${normalizedCategory3}`
}

function getRowValueByIndex(row: TeachingCsvRow, index: number) {
  const values = Object.values(row) as string[]
  return cleanText(values[index])
}

export function parseTeachingCsv(csvText: string): TeachingRecord[] {
  const parsed = Papa.parse<TeachingCsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length > 0) {
    console.error("Teaching CSV parse errors:", parsed.errors)
  }

  return parsed.data
    .map((row) => {
      const applicationId = getRowValueByIndex(row, 0)
      const applicationTypeRaw = getRowValueByIndex(row, 1)
      const category1 = getRowValueByIndex(row, 2)
      const category2 = getRowValueByIndex(row, 3)
      const category3 = normalizeCategory3(category2, getRowValueByIndex(row, 4))
      const outcomeSummary = getRowValueByIndex(row, 5)
      const department = getRowValueByIndex(row, 7)
      const teacherName = getRowValueByIndex(row, 8)
      const sharePercent = parseNumber(getRowValueByIndex(row, 9))
      const points = parseNumber(getRowValueByIndex(row, 10))
      const amount = parseNumber(getRowValueByIndex(row, 11))

      return {
        applicationId,
        applicationType:
          applicationTypeRaw === "共同" ? "共同" : "單獨",
        category1,
        category2,
        category3,
        outcomeSummary,
        department,
        teacherName,
        sharePercent,
        points,
        amount,
      } satisfies TeachingRecord
    })
    .filter(
      (row) =>
        row.applicationId &&
        row.category1 &&
        row.category2 &&
        row.category3 &&
        row.department &&
        row.teacherName
    )
}

export function getTeachingDepartments(records: TeachingRecord[]) {
  return uniqueSorted(records.map((record) => record.department))
}

export function getTeachingTeachers(records: TeachingRecord[]) {
  return uniqueSorted(records.map((record) => record.teacherName))
}

export function getTeachingCategory1(records: TeachingRecord[]) {
  return uniqueSorted(records.map((record) => record.category1))
}

export function getTeachingCategory2(records: TeachingRecord[], category1?: string) {
  return uniqueSorted(
    records
      .filter((record) => !category1 || record.category1 === category1)
      .map((record) => record.category2)
  )
}

export function getTeachingCategory3(
  records: TeachingRecord[],
  category1?: string,
  category2?: string
) {
  return uniqueSorted(
    records
      .filter(
        (record) =>
          (!category1 || record.category1 === category1) &&
          (!category2 || record.category2 === category2)
      )
      .map((record) => record.category3)
  )
}

export function filterTeachingRecords(
  records: TeachingRecord[],
  filters: TeachingFilters
) {
  return records.filter((record) => {
    const matchDepartment =
      !filters.department || record.department === filters.department
    const matchTeacher =
      !filters.teacherName || record.teacherName === filters.teacherName
    const matchCategory1 =
      !filters.category1 || record.category1 === filters.category1
    const matchCategory2 =
      !filters.category2 || record.category2 === filters.category2
    const matchCategory3 =
      !filters.category3 || record.category3 === filters.category3

    return (
      matchDepartment &&
      matchTeacher &&
      matchCategory1 &&
      matchCategory2 &&
      matchCategory3
    )
  })
}

export function getTeachingSummary(records: TeachingRecord[]): TeachingSummary {
  const applicationIds = new Set(records.map((record) => record.applicationId))
  const collaborativeIds = new Set(
    records
      .filter((record) => record.applicationType === "共同")
      .map((record) => record.applicationId)
  )

  return {
    totalPoints: records.reduce((sum, record) => sum + record.points, 0),
    totalAmount: records.reduce((sum, record) => sum + record.amount, 0),
    teacherCount: new Set(records.map((record) => record.teacherName)).size,
    departmentCount: new Set(records.map((record) => record.department)).size,
    applicationCount: applicationIds.size,
    collaborativeApplicationCount: collaborativeIds.size,
  }
}

function matchesHierarchySelection(
  record: TeachingRecord,
  selection: TeachingHierarchySelection
) {
  return (
    (!selection.category1 || record.category1 === selection.category1) &&
    (!selection.category2 || record.category2 === selection.category2) &&
    (!selection.category3 || record.category3 === selection.category3)
  )
}

export function filterTeachingBySelection(
  records: TeachingRecord[],
  selection: TeachingHierarchySelection
) {
  return records.filter((record) => matchesHierarchySelection(record, selection))
}

export function getCategory1PointShare(records: TeachingRecord[]) {
  const totalPoints = records.reduce((sum, record) => sum + record.points, 0)
  const counts = new Map<string, number>()

  records.forEach((record) => {
    counts.set(record.category1, (counts.get(record.category1) ?? 0) + record.points)
  })

  return Array.from(counts.entries())
    .map(([name, points]) => ({
      name,
      points,
      percentage: totalPoints > 0 ? (points / totalPoints) * 100 : 0,
    }))
    .sort((a, b) => sortTeachingCategoryLabel(a.name, b.name))
}

export function getCategory2PointShare(records: TeachingRecord[], category1?: string) {
  const source = records.filter(
    (record) => !category1 || record.category1 === category1
  )
  const totalPoints = source.reduce((sum, record) => sum + record.points, 0)
  const counts = new Map<string, number>()

  source.forEach((record) => {
    counts.set(record.category2, (counts.get(record.category2) ?? 0) + record.points)
  })

  return Array.from(counts.entries())
    .map(([name, points]) => ({
      name,
      points,
      percentage: totalPoints > 0 ? (points / totalPoints) * 100 : 0,
    }))
    .sort((a, b) => sortTeachingCategoryLabel(a.name, b.name))
}

export function getCategory3PointShare(
  records: TeachingRecord[],
  category1?: string,
  category2?: string
) {
  const source = records.filter(
    (record) =>
      (!category1 || record.category1 === category1) &&
      (!category2 || record.category2 === category2)
  )
  const totalPoints = source.reduce((sum, record) => sum + record.points, 0)
  const counts = new Map<string, number>()

  source.forEach((record) => {
    counts.set(record.category3, (counts.get(record.category3) ?? 0) + record.points)
  })

  return Array.from(counts.entries())
    .map(([name, points]) => ({
      name,
      points,
      percentage: totalPoints > 0 ? (points / totalPoints) * 100 : 0,
    }))
    .sort((a, b) => {
      if (category2) {
        return sortTeachingCategoryLabel(a.name, b.name)
      }

      return b.points - a.points
    })
}

export function getTopDepartmentsByPoints(records: TeachingRecord[], limit = 12) {
  const counts = new Map<string, { points: number; amount: number }>()

  records.forEach((record) => {
    const current = counts.get(record.department) ?? { points: 0, amount: 0 }
    current.points += record.points
    current.amount += record.amount
    counts.set(record.department, current)
  })

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, points: value.points, amount: value.amount }))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
}

export function getTeachingCollaborations(records: TeachingRecord[], limit = 12) {
  const grouped = new Map<string, TeachingRecord[]>()

  records.forEach((record) => {
    const current = grouped.get(record.applicationId) ?? []
    current.push(record)
    grouped.set(record.applicationId, current)
  })

  const pairs = new Map<string, { pair: string; count: number; points: number }>()

  grouped.forEach((group) => {
    const teachers = uniqueSorted(group.map((record) => record.teacherName))
    if (teachers.length < 2) return

    const applicationPoints = group.reduce((sum, record) => sum + record.points, 0)

    for (let index = 0; index < teachers.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < teachers.length; nextIndex += 1) {
        const pair = `${teachers[index]} × ${teachers[nextIndex]}`
        const current = pairs.get(pair) ?? { pair, count: 0, points: 0 }
        current.count += 1
        current.points += applicationPoints
        pairs.set(pair, current)
      }
    }
  })

  return Array.from(pairs.values())
    .sort((a, b) => b.count - a.count || b.points - a.points)
    .slice(0, limit)
}

export function getTeachingApplicationRows(records: TeachingRecord[]) {
  const grouped = new Map<string, TeachingRecord[]>()

  records.forEach((record) => {
    const current = grouped.get(record.applicationId) ?? []
    current.push(record)
    grouped.set(record.applicationId, current)
  })

  return Array.from(grouped.entries())
    .map(([applicationId, group]) => {
      const first = group[0]
      return {
        applicationId,
        applicationType: first.applicationType,
        category1: first.category1,
        category2: first.category2,
        category3: first.category3,
        department: first.department,
        teachers: uniqueSorted(group.map((record) => record.teacherName)),
        totalPoints: group.reduce((sum, record) => sum + record.points, 0),
        totalAmount: group.reduce((sum, record) => sum + record.amount, 0),
        outcomeSummary: first.outcomeSummary,
      }
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
}
