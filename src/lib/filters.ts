import { GrantRecord } from "../types/grant"

export type FilterState = {
  year: string
  department: string
  teacher: string
}

export function getUniqueYears(records: GrantRecord[]) {
  return Array.from(new Set(records.map((record) => record.year))).sort()
}

export function getUniqueDepartments(records: GrantRecord[]) {
  return Array.from(new Set(records.map((record) => record.department))).sort()
}

export function getUniqueTeachers(records: GrantRecord[]) {
  return Array.from(new Set(records.map((record) => record.teacher))).sort()
}

export function filterRecords(records: GrantRecord[], filters: FilterState) {
  return records.filter((record) => {
    const matchYear = !filters.year || record.year === filters.year
    const matchDepartment =
      !filters.department || record.department === filters.department
    const matchTeacher = !filters.teacher || record.teacher === filters.teacher

    return matchYear && matchDepartment && matchTeacher
  })
}