import { promises as fs } from "node:fs"
import path from "node:path"
import { parsePaperCsv } from "./papers"

export async function loadPaperCsvFromDisk() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "papers_20250415.cleaned.csv"
  )
  const csvText = await fs.readFile(filePath, "utf8")

  return parsePaperCsv(csvText)
}
