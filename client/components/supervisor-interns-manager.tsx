"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Check,
  ChevronDown,
  ClipboardCheck,
  ListTodo,
  MoreHorizontal,
  NotebookPen,
  Search,
} from "lucide-react"

import { updateAssignedInternStatus } from "@/app/actions/supervisor-records"
import { openMessagesDrawer } from "@/lib/messages"
import type { SupervisorIntern } from "@/lib/supervisor-data"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  formatInternDate,
  getInternInitials,
  STATUS_STYLES,
  type InternStatus,
} from "@/lib/interns"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 8

const STATUS_FILTERS: Array<"All" | InternStatus> = [
  "All",
  "Active",
  "Onboarding",
  "Paused",
  "Completed",
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

export function SupervisorInternsManager({
  interns,
  supervisorName,
}: {
  interns: SupervisorIntern[]
  supervisorName: string
}) {
  const router = useRouter()
  const [internList, setInternList] = React.useState<SupervisorIntern[]>(interns)
  const [notice, setNotice] = React.useState("")
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_FILTERS)[number]>("All")
  const [programmeFilter, setProgrammeFilter] = React.useState("All")
  const [page, setPage] = React.useState(1)
  const [viewIntern, setViewIntern] = React.useState<SupervisorIntern | null>(
    null
  )

  React.useEffect(() => {
    setInternList(interns)
  }, [interns])

  const programmes = React.useMemo(() => {
    const values = new Set(internList.map((intern) => intern.programme))
    return Array.from(values)
  }, [internList])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return internList.filter((intern) => {
      const matchesQuery =
        !q ||
        intern.name.toLowerCase().includes(q) ||
        intern.email.toLowerCase().includes(q) ||
        intern.programme.toLowerCase().includes(q) ||
        intern.focus.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === "All" || intern.status === statusFilter
      const matchesProgramme =
        programmeFilter === "All" || intern.programme === programmeFilter
      return matchesQuery && matchesStatus && matchesProgramme
    })
  }, [internList, programmeFilter, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [query, statusFilter, programmeFilter])

  const counts = React.useMemo(() => {
    const active = internList.filter((i) => i.status === "Active").length
    const onboarding = internList.filter((i) => i.status === "Onboarding").length
    const paused = internList.filter((i) => i.status === "Paused").length
    const openTasks = internList.reduce(
      (sum, intern) => sum + intern.openTasks,
      0
    )
    return {
      total: internList.filter((i) => i.status !== "Completed").length,
      active,
      onboarding,
      paused,
      openTasks,
    }
  }, [internList])

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  async function updateStatus(id: string, status: InternStatus) {
    setNotice("")
    const result = await updateAssignedInternStatus(id, status)
    if (result.error) {
      setNotice(result.error)
      return
    }
    router.refresh()
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold">My Interns</h1>
        <p className="text-sm text-muted-foreground">
          Track progress, logs, and follow-ups for interns assigned to{" "}
          {supervisorName}.
        </p>
        {notice ? <p className="text-sm text-destructive">{notice}</p> : null}
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assigned interns"
          value={counts.total}
          hint="Excluding completed"
        />
        <StatCard
          label="Active"
          value={counts.active}
          hint="Currently in programme"
        />
        <StatCard
          label="Onboarding"
          value={counts.onboarding}
          hint="Recently started"
        />
        <StatCard
          label="Open tasks"
          value={counts.openTasks}
          hint={`${counts.paused} paused intern${counts.paused === 1 ? "" : "s"}`}
        />
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>Assigned roster</CardTitle>
            <CardDescription>
              Search by name, programme, or current focus area.
            </CardDescription>
          </div>
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search my interns..."
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-8 w-full justify-between rounded-sm px-2.5 font-normal lg:w-52"
                )}
              >
                <span className="truncate">
                  {programmeFilter === "All"
                    ? "All programmes"
                    : programmeFilter}
                </span>
                <ChevronDown className="size-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuItem
                  onClick={() => setProgrammeFilter("All")}
                  className="justify-between"
                >
                  All programmes
                  {programmeFilter === "All" && <Check className="size-4" />}
                </DropdownMenuItem>
                {programmes.map((programme) => (
                  <DropdownMenuItem
                    key={programme}
                    onClick={() => setProgrammeFilter(programme)}
                    className="justify-between"
                  >
                    {programme}
                    {programmeFilter === programme && (
                      <Check className="size-4" />
                    )}
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
          <Table className="min-w-[40rem]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-40 pl-4 sm:pl-0">Intern</TableHead>
                <TableHead className="hidden md:table-cell">Programme</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="hidden sm:table-cell">Open work</TableHead>
                <TableHead className="hidden lg:table-cell">Last log</TableHead>
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
                    colSpan={7}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No interns match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((intern) => {
                  return (
                    <TableRow key={intern.id}>
                      <TableCell className="max-w-[14rem] pl-4 sm:pl-0">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="size-8 rounded-lg">
                            <AvatarFallback className="rounded-lg text-xs">
                              {getInternInitials(intern.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 overflow-hidden">
                            <p className="truncate font-medium">{intern.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {intern.email}
                            </p>
                            <p className="truncate text-xs text-muted-foreground md:hidden">
                              {intern.programme}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-[12rem] truncate md:table-cell">
                        {intern.programme}
                      </TableCell>
                      <TableCell>
                        <div className="flex w-20 min-w-0 items-center gap-2 sm:w-28">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${intern.progress}%` }}
                            />
                          </div>
                          <span className="w-8 text-xs tabular-nums text-muted-foreground">
                            {intern.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-col gap-0.5 text-sm">
                          <span className="tabular-nums">
                            {intern.openTasks} task
                            {intern.openTasks === 1 ? "" : "s"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {intern.pendingReviews} review
                            {intern.pendingReviews === 1 ? "" : "s"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap lg:table-cell">
                        {intern.lastLog}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                            STATUS_STYLES[intern.status]
                          )}
                        >
                          {intern.status}
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
                            aria-label={`Actions for ${intern.name}`}
                          >
                            <MoreHorizontal />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setViewIntern(intern)}
                            >
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              render={<Link href="/supervisor/tasks" />}
                            >
                              View tasks
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              render={<Link href="/supervisor/logs" />}
                            >
                              View daily logs
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              render={<Link href="/supervisor/reviews" />}
                            >
                              Open reviews
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openMessagesDrawer(intern.id)}
                            >
                              Message intern
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => updateStatus(intern.id, "Active")}
                            >
                              Mark active
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus(intern.id, "Onboarding")
                              }
                            >
                              Mark onboarding
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateStatus(intern.id, "Paused")}
                            >
                              Pause intern
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus(intern.id, "Completed")
                              }
                            >
                              Mark completed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
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
        open={Boolean(viewIntern)}
        onOpenChange={(open) => {
          if (!open) setViewIntern(null)
        }}
      >
        <DialogContent className="max-h-none w-[calc(100%-2rem)] max-w-md overflow-visible p-0">
          <DialogHeader className="px-4 py-2.5">
            <DialogTitle>Intern details</DialogTitle>
            <DialogDescription>
              Progress and follow-up overview.
            </DialogDescription>
          </DialogHeader>
          {viewIntern && (
            <div className="grid gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-12 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {getInternInitials(viewIntern.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 overflow-hidden">
                  <p className="truncate font-medium">{viewIntern.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {viewIntern.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 rounded-sm border border-border p-3 text-sm">
                <DetailRow label="Programme" value={viewIntern.programme} />
                <DetailRow
                  label="Start"
                  value={formatInternDate(viewIntern.startDate)}
                />
                <DetailRow
                  label="End"
                  value={formatInternDate(viewIntern.endDate)}
                />
                <DetailRow
                  label="Progress"
                  value={`${viewIntern.progress}%`}
                />
                <DetailRow label="Status" value={viewIntern.status} />
                <DetailRow label="Focus" value={viewIntern.focus} />
                <DetailRow label="Last log" value={viewIntern.lastLog} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <QuickStat
                  icon={ListTodo}
                  label="Tasks"
                  value={viewIntern.openTasks}
                />
                <QuickStat
                  icon={ClipboardCheck}
                  label="Reviews"
                  value={viewIntern.pendingReviews}
                />
                <QuickStat
                  icon={NotebookPen}
                  label="Logs"
                  value={viewIntern.lastLog === "Today" ? 1 : 0}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/supervisor/tasks"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-sm"
                  )}
                >
                  Tasks
                </Link>
                <Link
                  href="/supervisor/logs"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-sm"
                  )}
                >
                  Logs
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    openMessagesDrawer(viewIntern.id)
                    setViewIntern(null)
                  }}
                >
                  Message
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateStatus(viewIntern.id, "Paused")
                    setViewIntern(null)
                  }}
                >
                  Pause
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

function QuickStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ListTodo
  label: string
  value: number
}) {
  return (
    <div className="rounded-sm border border-border p-2 text-center">
      <Icon className="mx-auto size-4 text-muted-foreground" />
      <p className="mt-1 text-sm font-medium tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}
