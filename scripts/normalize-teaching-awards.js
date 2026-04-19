/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const sourceName = fs
  .readdirSync(process.cwd())
  .find((name) => name.endsWith(".xls") && name.includes("113學年獎勵申請清單20250523"));

if (!sourceName) {
  throw new Error("找不到 113學年獎勵申請清單20250523 的來源檔案。");
}

const sourcePath = path.join(process.cwd(), sourceName);
const workbook = XLSX.readFile(sourcePath);
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];
const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

const cleanedRows = [];

const outputHeaders = [
  "申請編號",
  "申請型態",
  "獎勵事項_1",
  "獎勵事項_2",
  "獎勵事項_3",
  "提昇教與學之具體成效",
  "主要負責人代碼",
  "系所",
  "姓名",
  "百分比",
  "點數",
  "金額",
];

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .trim();
}

function splitReward(value) {
  const parts = normalizeText(value)
    .split("-")
    .map((part) => part.trim())
    .filter(Boolean);

  return [
    parts[0] ?? "",
    parts[1] ?? "",
    parts.length > 2 ? parts.slice(2).join("-") : "",
  ];
}

function splitDepartment(value) {
  const [code = "", department = ""] = normalizeText(value)
    .split("-")
    .map((part) => part.trim());

  const normalizedDepartment =
    department === "護理系" && code.includes("嘉義") ? "嘉義分部護理系" : department;

  return [code, normalizedDepartment];
}

function splitMemberLine(line) {
  const parts = normalizeText(line)
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const amountText = (parts[3] ?? "").replace(/元$/u, "").replace(/,/g, "");

  return {
    name: parts[0] ?? "",
    percent: parts[1] ?? "",
    points: parts[2] ?? "",
    amount: amountText ? Number(amountText) : "",
  };
}

for (const row of rows.slice(1)) {
  const applicationId = normalizeText(row[0]);
  const [reward1, reward2, reward3] = splitReward(row[1]);
  const result = normalizeText(row[2]);
  const [ownerCode, ownerDepartment] = splitDepartment(row[3]);
  const memberLines = normalizeText(row[4])
    .split("\n")
    .map((line) => normalizeText(line))
    .filter(Boolean);
  const applicationType = memberLines.length > 1 ? "共同" : "單獨";

  for (const memberLine of memberLines) {
    const member = splitMemberLine(memberLine);

    cleanedRows.push([
      `="${applicationId}"`,
      applicationType,
      reward1,
      reward2,
      reward3,
      result,
      ownerCode,
      ownerDepartment,
      member.name,
      member.percent,
      member.points,
      member.amount,
    ]);
  }
}

const baseName = sourceName.replace(/\.xls$/i, "");
const outputCsvPath = path.join(process.cwd(), `${baseName}.normalized.csv`);
const csvSheet = XLSX.utils.aoa_to_sheet([outputHeaders, ...cleanedRows]);
fs.writeFileSync(outputCsvPath, "\ufeff" + XLSX.utils.sheet_to_csv(csvSheet), "utf8");

console.log(
  JSON.stringify(
    {
      source: sourceName,
      sheet: firstSheetName,
      sourceRows: Math.max(rows.length - 1, 0),
      outputRows: cleanedRows.length,
      outputCsvPath,
    },
    null,
    2,
  ),
);
