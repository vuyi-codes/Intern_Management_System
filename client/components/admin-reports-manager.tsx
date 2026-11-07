"use client"

import * as React from "react"
import {
  Check,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  BarChart3,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  EXPORT_OPTIONS,
  exportReport,
  type ExportFormat,
} from "@/lib/export-report"
import {
  type ReportId,
  type ReportView,
} from "@/lib/reports"
import { cn } from "@/lib/utils"

const categoryStyles: Record<string, string> = {
  People: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  Programmes: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Operations: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: number
  hint: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

export function AdminReportsManager({ reports }: { reports: ReportView[] }) {
  const [selectedId, setSelectedId] = React.useState<ReportId>(
    reports[0]?.id ?? "interns-overview"
  )
  const [exporting, setExporting] = React.useState<ExportFormat | null>(null)
  const [lastExport, setLastExport] = React.useState<string | null>(null)

  const selected = reports.find((report) => report.id === selectedId) ?? reports[0]
  const rows = selected?.rows ?? []

  const categories = React.useMemo(
    () => Array.from(new Set(reports.map((report) => report.category))),
    [reports]
  )

  if (!selected) {
    return (
      <p className="text-sm text-muted-foreground">No reports available.</p>
    )
  }

  function handleExport(format: ExportFormat) {
    setExporting(format)
    try {
      exportReport({
        format,
        title: selected.title,
        columns: selected.columns,
        rows,
      })
      const option = EXPORT_OPTIONS.find((item) => item.format === format)
      setLastExport(
        `Exported “${selected.title}” as ${option?.label ?? format}.`
      )
    } finally {
      window.setTimeout(() => setExporting(null), 400)
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Preview operational reports and export them as PDF, Excel, XML, and
          more.
        </p>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Available reports"
          value={reports.length}
          hint="Ready to preview and export"
        />
        <StatCard
          label="Selected rows"
          value={rows.length}
          hint={selected.title}
        />
        <StatCard
          label="Export formats"
          value={EXPORT_OPTIONS.length}
          hint="PDF, Excel, XML, CSV, JSON…"
        />
        <StatCard
          label="Categories"
          value={categories.length}
          hint={categories.join(" · ")}
        />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Report library</CardTitle>
            <CardDescription>
              Choose a report to preview before exporting.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {reports.map((report) => {
              const active = report.id === selectedId
              return (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(report.id)
                    setLastExport(null)
                  }}
                  className={cn(
                    "rounded-sm border border-border p-3 text-left transition-colors hover:bg-muted/50",
                    active && "border-primary bg-muted/40 ring-1 ring-primary/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{report.title}</p>
                    <span
                      className={cn(
                        "inline-flex shrink-0 rounded-sm px-1.5 py-0.5 text-[11px] font-medium",
                        categoryStyles[report.category]
                      )}
                    >
                      {report.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {report.description}
                  </p>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="gap-4">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-4" />
                  {selected.title}
                </CardTitle>
                <CardDescription>{selected.description}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "w-full shrink-0 rounded-sm sm:w-auto"
                  )}
                  disabled={rows.length === 0 || exporting !== null}
                >
                  <Download />
                  {exporting ? "Exporting..." : "Export"}
                  <ChevronDown className="size-4 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  {EXPORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.format}
                      onClick={() => handleExport(option.format)}
                      className="justify-between"
                    >
                      <span className="flex items-center gap-2">
                        {option.format === "excel" ||
                        option.format === "csv" ||
                        option.format === "tsv" ? (
                          <FileSpreadsheet className="size-4" />
                        ) : (
                          <FileText className="size-4" />
                        )}
                        {option.label}
                      </span>
                      {exporting === option.format && (
                        <Check className="size-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap gap-2">
              {EXPORT_OPTIONS.slice(0, 4).map((option) => (
                <Button
                  key={option.format}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-sm"
                  disabled={rows.length === 0 || exporting !== null}
                  onClick={() => handleExport(option.format)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="min-w-0 px-0 sm:px-(--card-spacing)">
            <Table className="min-w-[36rem]">
              <TableHeader>
                <TableRow>
                  {selected.columns.map((column, index) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        index === 0 && "pl-4 sm:pl-0",
                        index === selected.columns.length - 1 &&
                          "pr-4 sm:pr-0"
                      )}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={selected.columns.length}
                      className="h-28 text-center text-muted-foreground"
                    >
                      No rows available for this report.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, rowIndex) => (
                    <TableRow key={`${selected.id}-${rowIndex}`}>
                      {selected.columns.map((column, index) => (
                        <TableCell
                          key={column.key}
                          className={cn(
                            "max-w-[14rem] truncate",
                            index === 0 && "pl-4 font-medium sm:pl-0",
                            index === selected.columns.length - 1 &&
                              "pr-4 sm:pr-0"
                          )}
                        >
                          {row[column.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>

          <CardFooter className="flex-col items-start justify-between gap-2 border-t bg-transparent sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              {rows.length} row{rows.length === 1 ? "" : "s"} ·{" "}
              {selected.columns.length} columns
            </p>
            <p className="text-sm text-muted-foreground">
              {lastExport ?? "Select a format to download this report."}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
