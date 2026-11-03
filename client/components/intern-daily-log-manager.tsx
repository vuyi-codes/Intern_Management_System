"use client"

import * as React from "react"
import {
  MoreHorizontal,
  NotebookPen,
  Plus,
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
  getDailyLogsForIntern,
  type DailyLog,
  type DailyLogStatus,
} from "@/lib/daily-logs"
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

const emptyForm = {
  date: SEED_TODAY,
  hours: "7.5",
  summary: "",
  blockers: "",
  tomorrow: "",
}

type LogForm = typeof emptyForm

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: number | string
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

function canEditLog(log: DailyLog) {
  return log.status === "Submitted" || log.status === "Flagged"
}

export function InternDailyLogManager() {
  const intern = getUserForRole("intern")
  const [logList, setLogList] = React.useState<DailyLog[]>(() =>
    getDailyLogsForIntern(intern.name)
  )
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_FILTERS)[number]>("All")
  const [page, setPage] = React.useState(1)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editLog, setEditLog] = React.useState<DailyLog | null>(null)
  const [viewLog, setViewLog] = React.useState<DailyLog | null>(null)
  const [form, setForm] = React.useState<LogForm>(emptyForm)
  const [formError, setFormError] = React.useState("")

  React.useEffect(() => {
    setLogList(getDailyLogsForIntern(intern.name))
  }, [intern.name])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return logList.filter((log) => {
      const matchesQuery =
        !q ||
        log.summary.toLowerCase().includes(q) ||
        log.blockers.toLowerCase().includes(q) ||
        log.tomorrow.toLowerCase().includes(q) ||
        log.mentorNote.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === "All" || log.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [logList, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [query, statusFilter])

  const counts = React.useMemo(() => {
    const todayLogs = logList.filter((log) => log.date === SEED_TODAY)
    return {
      entries: logList.length,
      todayHours: todayLogs.reduce((sum, log) => sum + log.hours, 0),
      awaiting: logList.filter((log) => log.status === "Submitted").length,
      flagged: logList.filter((log) => log.status === "Flagged").length,
    }
  }, [logList])

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  function openCreate() {
    setFormError("")
    setForm({ ...emptyForm })
    setCreateOpen(true)
  }

  function openEdit(log: DailyLog) {
    if (!canEditLog(log)) return
    setFormError("")
    setEditLog(log)
    setForm({
      date: log.date,
      hours: String(log.hours),
      summary: log.summary,
      blockers: log.blockers,
      tomorrow: log.tomorrow,
    })
  }

  function removeLog(id: string) {
    setLogList((prev) => prev.filter((log) => log.id !== id))
    setViewLog((current) => (current?.id === id ? null : current))
    setEditLog((current) => (current?.id === id ? null : current))
  }

  function parseHours(value: string) {
    const hours = Number(value)
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) return null
    return Math.round(hours * 10) / 10
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    const hours = parseHours(form.hours)
    if (!form.date || !form.summary.trim() || hours === null) {
      setFormError("Date, summary, and valid hours (0–24) are required.")
      return
    }

    const next: DailyLog = {
      id: `log-${Date.now()}`,
      intern: intern.name,
      date: form.date,
      hours,
      summary: form.summary.trim(),
      blockers: form.blockers.trim() || "None.",
      tomorrow: form.tomorrow.trim(),
      status: "Submitted",
      mentorNote: "",
    }

    setLogList((prev) =>
      [next, ...prev].sort(
        (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
      )
    )
    setCreateOpen(false)
    setForm(emptyForm)
    setFormError("")
    setStatusFilter("All")
    setQuery("")
    setPage(1)
  }

  function handleEdit(event: React.FormEvent) {
    event.preventDefault()
    if (!editLog) return
    const hours = parseHours(form.hours)
    if (!form.date || !form.summary.trim() || hours === null) {
      setFormError("Date, summary, and valid hours (0–24) are required.")
      return
    }

    setLogList((prev) =>
      prev
        .map((log) =>
          log.id === editLog.id
            ? {
                ...log,
                date: form.date,
                hours,
                summary: form.summary.trim(),
                blockers: form.blockers.trim() || "None.",
                tomorrow: form.tomorrow.trim(),
                status: "Submitted" as DailyLogStatus,
              }
            : log
        )
        .sort(
          (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
        )
    )
    setEditLog(null)
    setFormError("")
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl font-semibold">Daily Log</h1>
          <p className="text-sm text-muted-foreground">
            Record what you worked on, blockers, and plans for tomorrow.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full shrink-0 sm:w-auto">
          <Plus />
          New entry
        </Button>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Entries"
          value={counts.entries}
          hint="All of your logs"
        />
        <StatCard
          label="Hours today"
          value={counts.todayHours}
          hint={formatLogDate(SEED_TODAY)}
        />
        <StatCard
          label="Awaiting review"
          value={counts.awaiting}
          hint="Submitted to supervisor"
        />
        <StatCard
          label="Flagged"
          value={counts.flagged}
          hint="Needs your update"
        />
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>My entries</CardTitle>
            <CardDescription>
              Search by summary, blockers, plans, or mentor notes.
            </CardDescription>
          </div>
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search logs..."
              className="pl-8"
            />
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
          <Table className="min-w-[36rem]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-28 pl-4 sm:pl-0">Date</TableHead>
                <TableHead className="min-w-44">Summary</TableHead>
                <TableHead className="hidden sm:table-cell">Hours</TableHead>
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
                    colSpan={5}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No log entries match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap pl-4 sm:pl-0">
                      {formatLogDate(log.date)}
                    </TableCell>
                    <TableCell className="max-w-[18rem]">
                      <div className="min-w-0 overflow-hidden">
                        <p className="truncate font-medium">{log.summary}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {log.blockers || "No blockers"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden tabular-nums sm:table-cell">
                      {log.hours}
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
                          aria-label={`Actions for ${log.date} log`}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewLog(log)}>
                            View details
                          </DropdownMenuItem>
                          {canEditLog(log) && (
                            <DropdownMenuItem onClick={() => openEdit(log)}>
                              Edit entry
                            </DropdownMenuItem>
                          )}
                          {canEditLog(log) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => removeLog(log.id)}
                              >
                                Delete entry
                              </DropdownMenuItem>
                            </>
                          )}
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-4 py-2.5">
            <DialogTitle>New daily log</DialogTitle>
            <DialogDescription>
              Submit today’s work summary for your supervisor.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleCreate}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <LogFormFields
                form={form}
                setForm={setForm}
                formError={formError}
              />
            </div>
            <DialogFooter className="shrink-0 p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <NotebookPen />
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editLog)}
        onOpenChange={(open) => {
          if (!open) setEditLog(null)
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-4 py-2.5">
            <DialogTitle>Edit daily log</DialogTitle>
            <DialogDescription>
              Update and resubmit this entry for review.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleEdit}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <LogFormFields
                form={form}
                setForm={setForm}
                formError={formError}
              />
            </div>
            <DialogFooter className="shrink-0 p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditLog(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewLog)}
        onOpenChange={(open) => {
          if (!open) setViewLog(null)
        }}
      >
        <DialogContent className="max-h-none w-[calc(100%-2rem)] max-w-md overflow-visible p-0">
          <DialogHeader className="px-4 py-2.5">
            <DialogTitle>Log details</DialogTitle>
            <DialogDescription>
              Entry overview and mentor feedback.
            </DialogDescription>
          </DialogHeader>
          {viewLog && (
            <div className="grid gap-4 p-4">
              <div className="min-w-0">
                <p className="font-medium wrap-break-word">{viewLog.summary}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatLogDate(viewLog.date)} · {viewLog.hours} hours
                </p>
              </div>
              <div className="grid gap-3 rounded-sm border border-border p-3 text-sm">
                <DetailRow label="Status" value={viewLog.status} />
                <DetailBlock label="Blockers" value={viewLog.blockers} />
                <DetailBlock label="Tomorrow" value={viewLog.tomorrow} />
                <DetailBlock
                  label="Mentor note"
                  value={viewLog.mentorNote || "No feedback yet."}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {canEditLog(viewLog) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      openEdit(viewLog)
                      setViewLog(null)
                    }}
                  >
                    Edit
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewLog(null)}
                >
                  Close
                </Button>
              </div>
            </div>
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

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground">{label}</span>
      <p className="font-medium wrap-break-word whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function LogFormFields({
  form,
  setForm,
  formError,
}: {
  form: LogForm
  setForm: React.Dispatch<React.SetStateAction<LogForm>>
  formError: string
}) {
  return (
    <div className="grid gap-3 px-4 py-3">
      <FieldGroup className="gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="log-date">Date</FieldLabel>
            <Input
              id="log-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="log-hours">Hours</FieldLabel>
            <Input
              id="log-hours"
              type="number"
              min={0.5}
              max={24}
              step={0.5}
              value={form.hours}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, hours: event.target.value }))
              }
              required
            />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="log-summary">What I worked on</FieldLabel>
            <Textarea
              id="log-summary"
              value={form.summary}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, summary: event.target.value }))
              }
              rows={3}
              className="max-h-28 min-h-16 resize-none overflow-y-auto rounded-sm field-sizing-fixed wrap-break-word"
              placeholder="Summarise today’s progress…"
              required
            />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="log-blockers">Blockers</FieldLabel>
            <Textarea
              id="log-blockers"
              value={form.blockers}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, blockers: event.target.value }))
              }
              rows={2}
              className="max-h-24 min-h-14 resize-none overflow-y-auto rounded-sm field-sizing-fixed wrap-break-word"
              placeholder="Anything slowing you down?"
            />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="log-tomorrow">Plan for tomorrow</FieldLabel>
            <Textarea
              id="log-tomorrow"
              value={form.tomorrow}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, tomorrow: event.target.value }))
              }
              rows={2}
              className="max-h-24 min-h-14 resize-none overflow-y-auto rounded-sm field-sizing-fixed wrap-break-word"
              placeholder="What will you focus on next?"
            />
          </Field>
          {formError && (
            <p className="sm:col-span-2 text-sm text-destructive">{formError}</p>
          )}
        </div>
      </FieldGroup>
    </div>
  )
}
