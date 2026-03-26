import { GrantRecord } from "../types/grant"

export function getTotalAmount(records: GrantRecord[]) {
  return records.reduce((sum, record) => sum + record.amount, 0)
}

export function getTeacherCount(records: GrantRecord[]) {
  return new Set(records.map((record) => record.teacher)).size
}

export function getCategoryCount(records: GrantRecord[]) {
  return new Set(records.map((record) => record.category)).size
}

export function getSubcategoryCount(records: GrantRecord[]) {
  return new Set(records.map((record) => record.subcategory)).size
}

export function getAverageAmountPerTeacher(records: GrantRecord[]) {
  const teacherCount = getTeacherCount(records)
  if (teacherCount === 0) return 0

  return getTotalAmount(records) / teacherCount
}

export function getCategoryAmountData(records: GrantRecord[]) {
  const map = new Map<string, number>()

  records.forEach((record) => {
    map.set(record.category, (map.get(record.category) ?? 0) + record.amount)
  })

  return Array.from(map.entries())
    .map(([name, amount]) => ({
      name,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function getSubcategoryAmountData(records: GrantRecord[], limit?) {
  const map = new Map<string, number>()

  records.forEach((record) => {
    map.set(record.subcategory, (map.get(record.subcategory) ?? 0) + record.amount)
  })

  return Array.from(map.entries())
    .map(([name, amount]) => ({
      name,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}