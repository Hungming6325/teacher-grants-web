import * as Papa from "papaparse"
import { GrantRecord } from "../types/grant"

type CsvRow = {
  年度?: string
  系所?: string
  項目?: string
  次項目?: string
  教師姓名?: string
  獎助金額?: string
}

export async function loadGrantCsv(): Promise<GrantRecord[]> {
  const response = await fetch("/data/grants_112_114.csv")

  if (!response.ok) {
    throw new Error(`CSV 載入失敗：${response.status} ${response.statusText}`)
  }

  const csvText = await response.text()

  if (!csvText.trim()) {
    throw new Error("CSV 內容為空")
  }

  const parsed = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length > 0) {
    console.error("Papa Parse errors:", parsed.errors)
  }

  const records: GrantRecord[] = parsed.data
    .map((row) => {
      const rawAmount = row["獎助金額"] ?? "0"
      const amount = Number(
        rawAmount
          .toString()
          .replace(/[,元$]/g, "")
          .trim()
      )

      return {
        year: row["年度"]?.trim() ?? "",
        department: row["系所"]?.trim() ?? "",
        category: row["項目"]?.trim() ?? "",
        subcategory: row["次項目"]?.trim() ?? "",
        teacher: row["教師姓名"]?.trim() ?? "",
        amount: Number.isNaN(amount) ? 0 : amount,
      }
    })
    .filter(
      (row) =>
        row.year &&
        row.department &&
        row.category &&
        row.subcategory &&
        row.teacher
    )

  return records
}