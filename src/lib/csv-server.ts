import { promises as fs } from "node:fs"
import path from "node:path"
import { parseGrantCsv } from "./csv"

export async function loadGrantCsvFromDisk() {
  const filePath = path.join(process.cwd(), "data", "grants_112_114.csv")
  const csvText = await fs.readFile(filePath, "utf8")

  return parseGrantCsv(csvText)
}
