import { promises as fs } from "node:fs"
import path from "node:path"
import { parseProjectContractsCsv } from "./projects"

export async function loadProjectContractsCsvFromDisk() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "projects_112_114.csv"
  )
  const csvText = await fs.readFile(filePath, "utf8")

  return parseProjectContractsCsv(csvText)
}
