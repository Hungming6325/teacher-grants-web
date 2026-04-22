import { promises as fs } from "node:fs"
import path from "node:path"
import { parseTeachersCsv } from "./teachers"

export async function loadTeachersCsvFromDisk() {
  const filePath = path.join(process.cwd(), "data", "teachers_114_2.csv")
  const csvText = await fs.readFile(filePath, "utf8")

  return parseTeachersCsv(csvText)
}
