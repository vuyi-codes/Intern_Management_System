import type { ReportColumn, ReportRow } from "@/lib/reports"

export type ExportFormat =
  | "pdf"
  | "excel"
  | "xml"
  | "csv"
  | "json"
  | "tsv"
  | "markdown"

export const EXPORT_OPTIONS: Array<{
  format: ExportFormat
  label: string
  extension: string
}> = [
  { format: "pdf", label: "PDF", extension: "pdf" },
  { format: "excel", label: "Excel (.xls)", extension: "xls" },
  { format: "xml", label: "XML", extension: "xml" },
  { format: "csv", label: "CSV", extension: "csv" },
  { format: "json", label: "JSON", extension: "json" },
  { format: "tsv", label: "TSV", extension: "tsv" },
  { format: "markdown", label: "Markdown", extension: "md" },
]

function escapeCsv(value: string | number) {
  const text = String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function escapeXml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function downloadBlob(filename: string, content: BlobPart, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function toMatrix(columns: ReportColumn[], rows: ReportRow[]) {
  return {
    headers: columns.map((column) => column.label),
    keys: columns.map((column) => column.key),
    values: rows.map((row) =>
      columns.map((column) => row[column.key] ?? "")
    ),
  }
}

function buildCsv(columns: ReportColumn[], rows: ReportRow[], separator = ",") {
  const { headers, values } = toMatrix(columns, rows)
  const lines = [
    headers.map(escapeCsv).join(separator),
    ...values.map((row) => row.map(escapeCsv).join(separator)),
  ]
  return `\uFEFF${lines.join("\r\n")}`
}

function buildJson(title: string, columns: ReportColumn[], rows: ReportRow[]) {
  return JSON.stringify(
    {
      title,
      generatedAt: new Date().toISOString(),
      columns: columns.map((column) => column.label),
      rows: rows.map((row) =>
        Object.fromEntries(
          columns.map((column) => [column.label, row[column.key] ?? ""])
        )
      ),
    },
    null,
    2
  )
}

function buildXml(title: string, columns: ReportColumn[], rows: ReportRow[]) {
  const rowXml = rows
    .map((row) => {
      const fields = columns
        .map(
          (column) =>
            `    <field name="${escapeXml(column.label)}">${escapeXml(
              row[column.key] ?? ""
            )}</field>`
        )
        .join("\n")
      return `  <row>\n${fields}\n  </row>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<report title="${escapeXml(title)}" generatedAt="${escapeXml(
    new Date().toISOString()
  )}">
${rowXml}
</report>
`
}

function buildExcel(title: string, columns: ReportColumn[], rows: ReportRow[]) {
  const { headers, values } = toMatrix(columns, rows)
  const headerCells = headers
    .map((header) => `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`)
    .join("")
  const bodyRows = values
    .map((row) => {
      const cells = row
        .map((value) => {
          const isNumber = typeof value === "number" || /^-?\d+(\.\d+)?$/.test(String(value))
          return `<Cell><Data ss:Type="${isNumber ? "Number" : "String"}">${escapeXml(
            value
          )}</Data></Cell>`
        })
        .join("")
      return `<Row>${cells}</Row>`
    })
    .join("")

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${escapeXml(title).slice(0, 31) || "Report"}">
  <Table>
   <Row>${headerCells}</Row>
   ${bodyRows}
  </Table>
 </Worksheet>
</Workbook>`
}

function buildMarkdown(
  title: string,
  columns: ReportColumn[],
  rows: ReportRow[]
) {
  const { headers, values } = toMatrix(columns, rows)
  const divider = headers.map(() => "---").join(" | ")
  const body = values
    .map((row) => `| ${row.map((cell) => String(cell)).join(" | ")} |`)
    .join("\n")
  return `# ${title}

Generated: ${new Date().toLocaleString()}

| ${headers.join(" | ")} |
| ${divider} |
${body}
`
}

function pdfEscape(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function buildPdf(title: string, columns: ReportColumn[], rows: ReportRow[]) {
  const lines: string[] = [
    title,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    columns.map((column) => column.label).join(" | "),
    "-".repeat(48),
  ]

  for (const row of rows) {
    lines.push(
      columns.map((column) => String(row[column.key] ?? "")).join(" | ")
    )
  }

  const pageWidth = 612
  const pageHeight = 792
  const margin = 40
  const lineHeight = 14
  const maxLines = Math.floor((pageHeight - margin * 2) / lineHeight)
  const pages: string[][] = []

  for (let i = 0; i < lines.length; i += maxLines) {
    pages.push(lines.slice(i, i + maxLines))
  }

  // Object layout:
  // 1: Catalog, 2: Pages, 3: Font, then content/page pairs
  const fontObject = 3
  const pageEntries = pages.map((pageLines, pageIndex) => {
    const contentObject = 4 + pageIndex * 2
    const pageObject = contentObject + 1
    const textCommands = pageLines
      .map((line, index) => {
        const y = pageHeight - margin - index * lineHeight
        return `BT /F1 10 Tf ${margin} ${y} Td (${pdfEscape(
          line.slice(0, 110)
        )}) Tj ET`
      })
      .join("\n")

    return {
      contentObject,
      pageObject,
      content: `<< /Length ${textCommands.length} >>\nstream\n${textCommands}\nendstream`,
      page: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObject} 0 R /Resources << /Font << /F1 ${fontObject} 0 R >> >> >>`,
    }
  })

  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageEntries
      .map((entry) => `${entry.pageObject} 0 R`)
      .join(" ")}] /Count ${pageEntries.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ]

  for (const entry of pageEntries) {
    objects.push(entry.content, entry.page)
  }

  let pdf = "%PDF-1.4\n"
  const offsets = [0]

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
  }

  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return pdf
}

export function exportReport(options: {
  format: ExportFormat
  title: string
  columns: ReportColumn[]
  rows: ReportRow[]
}) {
  const { format, title, columns, rows } = options
  const filenameBase = slugify(title) || "report"
  const stamp = new Date().toISOString().slice(0, 10)
  const filename = `${filenameBase}-${stamp}`

  switch (format) {
    case "csv":
      downloadBlob(
        `${filename}.csv`,
        buildCsv(columns, rows),
        "text/csv;charset=utf-8"
      )
      break
    case "tsv":
      downloadBlob(
        `${filename}.tsv`,
        buildCsv(columns, rows, "\t"),
        "text/tab-separated-values;charset=utf-8"
      )
      break
    case "json":
      downloadBlob(
        `${filename}.json`,
        buildJson(title, columns, rows),
        "application/json;charset=utf-8"
      )
      break
    case "xml":
      downloadBlob(
        `${filename}.xml`,
        buildXml(title, columns, rows),
        "application/xml;charset=utf-8"
      )
      break
    case "excel":
      downloadBlob(
        `${filename}.xls`,
        buildExcel(title, columns, rows),
        "application/vnd.ms-excel;charset=utf-8"
      )
      break
    case "markdown":
      downloadBlob(
        `${filename}.md`,
        buildMarkdown(title, columns, rows),
        "text/markdown;charset=utf-8"
      )
      break
    case "pdf":
      downloadBlob(
        `${filename}.pdf`,
        buildPdf(title, columns, rows),
        "application/pdf"
      )
      break
  }
}
