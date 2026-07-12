import { promises as fs } from "node:fs"
import path from "node:path"
import { parsePatentCsv, parseTransferCsv } from "./research-assets"

export async function loadPatentCsvFromDisk() {
  const filePath = path.join(process.cwd(), "data", "patent.csv")
  const csvText = await fs.readFile(filePath, "utf8")

  return parsePatentCsv(csvText)
}

export async function loadTransferCsvFromDisk() {
  const filePath = path.join(process.cwd(), "data", "transfer.csv")
  const csvText = await fs.readFile(filePath, "utf8")

  return parseTransferCsv(csvText)
}
