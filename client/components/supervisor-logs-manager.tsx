"use client"

import * as React from "react"
import {
  Check,
  ChevronDown,
  MoreHorizontal,
  NotebookPen,
  Search,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  DAILY_LOG_STATUS_STYLES,
  formatLogDate,
  getDailyLogsForSupervisor,
  type DailyLog,
  type DailyLogStatus,
} from "@/lib/daily-logs"
import { getInternsForSupervisor } from "@/lib/interns"
import { getUserForRole } from "@/lib/users"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 8
/** Demo “today” aligned with seed log dates. */
const SEED_TODAY = "2026-04-03"

const STATUS_FILTERS: Array<"All" | DailyLogStatus> = [
  "All",
  "Submitted",
  "Reviewed",
  "Flagged",
]

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

export function SupervisorLogsManager() {
  const supervisor = getUserForRole("supervisor")
  const internNames = React.useMemo(
    () =>
      getInternsForSupervisor(supervisor.name).map((intern) => intern.name),
    [supervisor.name]
  )

  const [logList, setLogList] = React.useState<DailyLog[]>(() =>
    getDailyLogsForSupervisor(supervisor.name)
  )
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_FILTERS)[number]>("All")
  const [internFilter, setInternFilter] = React.useState("All")
  const [page, setPage] = React.useState(1)
  const [activeLog, setActiveLog] = React.useState<DailyLog | null>(null)
  const [mentorNote, setMentorNote] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    setLogList(getDailyLogsForSupervisor(supervisor.name))
  }, [supervisor.name])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return logList.filter((log) => {
      const matchesQuery =
        !q ||
        log.intern.toLowerCase().includes(q) ||
        log.summary.toLowerCase().includes(q) ||
        log.blockers.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === "All" || log.status === statusFilter
      const matchesIntern =
        internFilter === "All" || log.intern === internFilter
      return matchesQuery && matchesStatus && matchesIntern
    })
  }, [internFilter, logList, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [query, statusFilter, internFilter])

  const counts = React.useMemo(() => {
    const todayLogs = logList.filter((log) => log.date === SEED_TODAY)
    return {
      today: todayLogs.length,
      submitted: logList.filter((log) => log.status === "Submitted").length,
      flagged: logList.filter((log) => log.status === "Flagged").length,
      reviewed: logList.filter((log) => log.status === "Reviewed").length,
    }
  }, [logList])

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  function openLog(log: DailyLog) {
    setActiveLog(log)
    setMentorNote(log.mentorNote)
  }

  function updateStatus(id: string, status: DailyLogStatus) {
    setLogList((prev) =>
      prev.map((log) => (log.id === id ? { ...log, status } : log))
    )
  }

  function handleSaveNote(event: React.FormEvent) {
    event.preventDefault()
    if (!activeLog) return

    setSaving(true)
    window.setTimeout(() => {
      setLogList((prev) =>
        prev.map((log) =>
          log.id === activeLog.id
            ? {
                ...log,
                mentorNote: mentorNote.trim(),
                status:
                  log.status === "Submitted" ? "Reviewed" : log.status,
              }
            : log
        )
      )
      setSaving(false)
      setActiveLog(null)
    }, 400)
  }

  const triggerClass = cn(
    buttonVariants({ variant: "outline" }),
    "h-8 w-full justify-between rounded-sm px-2.5 font-normal"
  )

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold">Daily Logs</h1>
        <p className="text-sm text-muted-foreground">
          Review daily submissions from interns assigned to {supervisor.name}.
        </p>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Submitted today"
          value={counts.today}
          hint={formatLogDate(SEED_TODAY)}
        />
        <StatCard
          label="Awaiting review"
          value={counts.submitted}
          hint="Newly submitted logs"
        />
        <StatCard
          label="Flagged"
          value={counts.flagged}
          hint="Needs follow-up"
        />
        <StatCard
          label="Reviewed"
          value={counts.reviewed}
          hint="Feedback already left"
        />
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>Log inbox</CardTitle>
            <CardDescription>
              Search by intern, summary, or blockers.
            </CardDescription>
          </div>
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search daily logs..."
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(triggerClass, "lg:w-44")}>
                <span className="truncate">
                  {internFilter === "All" ? "All interns" : internFilter}
                </span>
                <ChevronDown className="size-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem
                  onClick={() => setInternFilter("All")}
                  className="justify-between"
                >
                  All interns
                  {internFilter === "All" && <Check className="size-4" />}
                </DropdownMenuItem>
                {internNames.map((name) => (
                  <DropdownMenuItem
                    key={name}
                    onClick={() => setInternFilter(name)}
                    className="justify-between"
                  >
                    {name}
                    {internFilter === name && <Check className="size-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  buttonVariants({
                    variant: statusFilter === status ? "secondary" : "outline",
                    size: "sm",
                  }),
                  "rounded-sm"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="min-w-0 px-0 sm:px-(--card-spacing)">
          <Table className="min-w-[44rem]">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4 sm:pl-0">Intern</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="min-w-48">Summary</TableHead>
                <TableHead className="hidden md:table-cell">Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12 pr-4 text-right sm:pr-0">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No daily logs match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="max-w-[10rem] truncate pl-4 font-medium sm:pl-0">
                      {log.intern}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap sm:table-cell">
                      {formatLogDate(log.date)}
                    </TableCell>
                    <TableCell className="max-w-[18rem]">
                      <div className="min-w-0 overflow-hidden">
                        <p className="truncate">{log.summary}</p>
                        <p className="truncate text-xs text-muted-foreground sm:hidden">
                          {formatLogDate(log.date)} · {log.hours}h
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden tabular-nums md:table-cell">
                      {log.hours}h
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                          DAILY_LOG_STATUS_STYLES[log.status]
                        )}
                      >
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-4 text-right sm:pr-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "icon-sm",
                            }),
                            "rounded-sm"
                          )}
                          aria-label={`Actions for ${log.intern} log`}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openLog(log)}>
                            View log
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => updateStatus(log.id, "Reviewed")}
                          >
                            Mark reviewed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(log.id, "Flagged")}
                          >
                            Flag log
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(log.id, "Submitted")}
                          >
                            Mark submitted
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex-col items-stretch justify-between gap-3 border-t bg-transparent sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            {filtered.length === 0
              ? "No results"
              : `Showing ${startIndex + 1}–${Math.min(
                  startIndex + PAGE_SIZE,
                  filtered.length
                )} of ${filtered.length}`}
          </p>
          <Pagination className="mx-0 w-full justify-center sm:w-auto sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={safePage === 1}
                  className={
                    safePage === 1
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                  onClick={(event) => {
                    event.preventDefault()
                    goToPage(safePage - 1)
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={safePage === pageNumber}
                      onClick={(event) => {
                        event.preventDefault()
                        goToPage(pageNumber)
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={safePage === totalPages}
                  className={
                    safePage === totalPages
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                  onClick={(event) => {
                    event.preventDefault()
                    goToPage(safePage + 1)
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      <Dialog
        open={Boolean(activeLog)}
        onOpenChange={(open) => {
          if (!open) setActiveLog(null)
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-lg flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-4 py-2.5">
            <DialogTitle>Daily log</DialogTitle>
            <DialogDescription>
              {activeLog
                ? `${activeLog.intern} · ${formatLogDate(activeLog.date)}`
                : "Intern daily submission"}
            </DialogDescription>
          </DialogHeader>

          {activeLog && (
            <form
              onSubmit={handleSaveNote}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                <div className="grid gap-3 rounded-sm border border-border p-3 text-sm">
                  <DetailRow label="Hours" value={`${activeLog.hours}h`} />
                  <DetailRow label="Status" value={activeLog.status} />
                  <div className="grid min-w-0 gap-1">
                    <span className="text-muted-foreground">Summary</span>
                    <p className="wrap-break-word whitespace-pre-wrap">
                      {activeLog.summary}
                    </p>
                  </div>
                  <div className="grid min-w-0 gap-1">
                    <span className="text-muted-foreground">Blockers</span>
                    <p className="wrap-break-word whitespace-pre-wrap">
                      {activeLog.blockers}
                    </p>
                  </div>
                  <div className="grid min-w-0 gap-1">
                    <span className="text-muted-foreground">Tomorrow</span>
                    <p className="wrap-break-word whitespace-pre-wrap">
                      {activeLog.tomorrow}
                    </p>
                  </div>
                </div>

                <FieldGroup className="gap-3">
                  <Field>
                    <FieldLabel htmlFor="mentor-note">Mentor note</FieldLabel>
                    <Textarea
                      id="mentor-note"
                      value={mentorNote}
                      onChange={(event) => setMentorNote(event.target.value)}
                      rows={4}
                      className="max-h-36 min-h-20 resize-none overflow-y-auto rounded-sm field-sizing-fixed wrap-break-word"
                      placeholder="Leave a short note for the intern."
                    />
                  </Field>
                </FieldGroup>
              </div>

              <DialogFooter className="shrink-0 flex-wrap gap-2 p-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    updateStatus(activeLog.id, "Flagged")
                    setActiveLog(null)
                  }}
                >
                  Flag
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveLog(null)}
                >
                  Close
                </Button>
                <Button type="submit" disabled={saving}>
                  <NotebookPen />
                  {saving ? "Saving..." : "Save & mark reviewed"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium wrap-break-word">
        {value}
      </span>
    </div>
  )
}
