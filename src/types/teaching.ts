export type TeachingRecord = {
  applicationId: string
  applicationType: "共同" | "單獨"
  category1: string
  category2: string
  category3: string
  outcomeSummary: string
  department: string
  teacherName: string
  sharePercent: number
  points: number
  amount: number
}

export type TeachingFilters = {
  department: string
  teacherName: string
  category1: string
  category2: string
  category3: string
}

export type TeachingHierarchySelection = {
  category1: string
  category2: string
  category3: string
}

export type TeachingSummary = {
  totalPoints: number
  totalAmount: number
  teacherCount: number
  departmentCount: number
  applicationCount: number
  collaborativeApplicationCount: number
}
