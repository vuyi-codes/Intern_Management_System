"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronDown, MoreHorizontal, Search } from "lucide-react"

import { updateOwnTaskStatus } from "@/app/actions/intern-records"
import type { InternTaskRecord } from "@/lib/intern-data"
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
  formatTaskDate,
  TASK_PRIORITY_STYLES,
  TASK_STATUS_STYLES,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 8

const STATUS_FILTERS: Array<"All" | TaskStatus> = [
  "All",
  "In progress",
  "Review",
  "Overdue",
  "Done",
]

const PRIORITY_FILTERS: Array<"All" | TaskPriority> = [
  "All",
  "High",
  "Medium",
  "Low",
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

export function InternTasksManager({
  tasks,
}: {
  tasks: InternTaskRecord[]
}) {
  const router = useRouter()
  const [taskList, setTaskList] = React.useState<InternTaskRecord[]>(tasks)
  const [notice, setNotice] = React.useState("")
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_FILTERS)[number]>("All")
  const [priorityFilter, setPriorityFilter] =
    React.useState<(typeof PRIORITY_FILTERS)[number]>("All")
  const [page, setPage] = React.useState(1)
  const [viewTask, setViewTask] = React.useState<InternTaskRecord | null>(null)

  React.useEffect(() => {
    setTaskList(tasks)
  }, [tasks])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return taskList.filter((task) => {
      const matchesQuery =
        !q ||
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter
      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter
      return matchesQuery && matchesStatus && matchesPriority
    })
  }, [priorityFilter, query, statusFilter, taskList])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [query, statusFilter, priorityFilter])

  const counts = React.useMemo(() => {
    return {
      total: taskList.length,
      open: taskList.filter((task) => task.status !== "Done").length,
      review: taskList.filter((task) => task.status === "Review").length,
      overdue: taskList.filter((task) => task.status === "Overdue").length,
    }
  }, [taskList])

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  async function updateStatus(id: string, status: TaskStatus) {
    setNotice("")
    const result = await updateOwnTaskStatus(id, status)
    if (result.error) {
      setNotice(result.error)
      return
    }
    router.refresh()
  }

  const triggerClass = cn(
    buttonVariants({ variant: "outline" }),
    "h-8 w-full justify-between rounded-sm px-2.5 font-normal"
  )

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold">My Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Track assigned work, update status, and send tasks for review.
        </p>
        {notice ? <p className="text-sm text-destructive">{notice}</p> : null}
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total tasks"
          value={counts.total}
          hint="Assigned to you"
        />
        <StatCard
          label="Open"
          value={counts.open}
          hint="Not marked done yet"
        />
        <StatCard
          label="In review"
          value={counts.review}
          hint="Awaiting supervisor feedback"
        />
        <StatCard
          label="Overdue"
          value={counts.overdue}
          hint="Needs attention"
        />
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>Task board</CardTitle>
            <CardDescription>
              Search by task title or description.
            </CardDescription>
          </div>
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tasks..."
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(triggerClass, "lg:w-36")}>
                <span className="truncate">
                  {priorityFilter === "All"
                    ? "All priorities"
                    : priorityFilter}
                </span>
                <ChevronDown className="size-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-36">
                {PRIORITY_FILTERS.map((priority) => (
                  <DropdownMenuItem
                    key={priority}
                    onClick={() => setPriorityFilter(priority)}
                    className="justify-between"
                  >
                    {priority === "All" ? "All priorities" : priority}
                    {priorityFilter === priority && (
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
          <Table className="min-w-[36rem]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-44 pl-4 sm:pl-0">Task</TableHead>
                <TableHead className="hidden sm:table-cell">Due</TableHead>
                <TableHead className="hidden md:table-cell">Priority</TableHead>
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
                    No tasks match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="max-w-[18rem] pl-4 sm:pl-0">
                      <div className="min-w-0 overflow-hidden">
                        <p className="truncate font-medium">{task.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {task.description || "No description"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap sm:table-cell">
                      {formatTaskDate(task.dueDate)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span
                        className={cn(
                          "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                          TASK_PRIORITY_STYLES[task.priority]
                        )}
                      >
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                          TASK_STATUS_STYLES[task.status]
                        )}
                      >
                        {task.status}
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
                          aria-label={`Actions for ${task.title}`}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewTask(task)}>
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus(task.id, "In progress")
                            }
                          >
                            Mark in progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(task.id, "Review")}
                          >
                            Send to review
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(task.id, "Done")}
                          >
                            Mark done
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
        open={Boolean(viewTask)}
        onOpenChange={(open) => {
          if (!open) setViewTask(null)
        }}
      >
        <DialogContent className="max-h-none w-[calc(100%-2rem)] max-w-md overflow-visible p-0">
          <DialogHeader className="px-4 py-2.5">
            <DialogTitle>Task details</DialogTitle>
            <DialogDescription>
              Assignment and status overview.
            </DialogDescription>
          </DialogHeader>
          {viewTask && (
            <div className="grid gap-4 p-4">
              <div className="min-w-0">
                <p className="font-medium wrap-break-word">{viewTask.title}</p>
                <p className="mt-1 text-sm text-muted-foreground wrap-break-word whitespace-pre-wrap">
                  {viewTask.description || "No description"}
                </p>
              </div>
              <div className="grid gap-3 rounded-sm border border-border p-3 text-sm">
                <DetailRow
                  label="Due date"
                  value={formatTaskDate(viewTask.dueDate)}
                />
                <DetailRow label="Priority" value={viewTask.priority} />
                <DetailRow label="Status" value={viewTask.status} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(viewTask.id, "In progress")}
                >
                  In progress
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(viewTask.id, "Review")}
                >
                  Send to review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(viewTask.id, "Done")}
                >
                  Mark done
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
