import { promises as fs } from "node:fs"
import path from "node:path"
import { parseTeachingCsv } from "./teaching"

export async function loadTeachingCsvFromDisk() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "teaching_awards_113_20250523.csv"
  )
  const csvText = await fs.readFile(filePath, "utf8")

  return parseTeachingCsv(csvText)
}
