import Papa from "papaparse"
import { GrantRecord } from "@/types/grant"

type CsvRow = {
  系所?: string
  項目?: string
  次項目?: string
  教師姓名?: string
  獎助金額?: string
}

export async function loadGrantCsv(): Promise<GrantRecord[]> {
  const response = await fetch("/data/grants_114.csv")
  const csvText = await response.text()

  const parsed = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  const records: GrantRecord[] = parsed.data
    .map((row) => {
      const rawAmount = row["獎助金額"] ?? "0"
      const amount = Number(rawAmount.toString().replace(/,/g, "").trim())

      return {
        year: "114",
        department: row["系所"]?.trim() ?? "",
        category: row["項目"]?.trim() ?? "",
        subcategory: row["次項目"]?.trim() ?? "",
        teacher: row["教師姓名"]?.trim() ?? "",
        amount: Number.isNaN(amount) ? 0 : amount,
      }
    })
    .filter(
      (row) =>
        row.department &&
        row.category &&
        row.subcategory &&
        row.teacher
    )

  return records
}