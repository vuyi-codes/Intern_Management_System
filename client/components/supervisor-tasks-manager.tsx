"use client"

import * as React from "react"
import {
  Check,
  ChevronDown,
  ListTodo,
  MoreHorizontal,
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
import { getInternsForSupervisor } from "@/lib/interns"
import {
  formatTaskDate,
  getTasksForSupervisor,
  TASK_PRIORITY_STYLES,
  TASK_STATUS_STYLES,
  type SupervisorTask,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks"
import { getUserForRole } from "@/lib/users"
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

const emptyForm = {
  title: "",
  description: "",
  intern: "",
  dueDate: "",
  priority: "Medium" as TaskPriority,
  status: "In progress" as TaskStatus,
}

type TaskForm = typeof emptyForm

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

export function SupervisorTasksManager() {
  const supervisor = getUserForRole("supervisor")
  const myInterns = React.useMemo(
    () => getInternsForSupervisor(supervisor.name),
    [supervisor.name]
  )
  const internNames = React.useMemo(
    () => myInterns.map((intern) => intern.name),
    [myInterns]
  )

  const [taskList, setTaskList] = React.useState<SupervisorTask[]>(() =>
    getTasksForSupervisor(supervisor.name)
  )
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_FILTERS)[number]>("All")
  const [priorityFilter, setPriorityFilter] =
    React.useState<(typeof PRIORITY_FILTERS)[number]>("All")
  const [internFilter, setInternFilter] = React.useState("All")
  const [page, setPage] = React.useState(1)
  const [assignOpen, setAssignOpen] = React.useState(false)
  const [viewTask, setViewTask] = React.useState<SupervisorTask | null>(null)
  const [editTask, setEditTask] = React.useState<SupervisorTask | null>(null)
  const [form, setForm] = React.useState<TaskForm>({
    ...emptyForm,
    intern: internNames[0] ?? "",
  })

  React.useEffect(() => {
    setTaskList(getTasksForSupervisor(supervisor.name))
  }, [supervisor.name])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return taskList.filter((task) => {
      const matchesQuery =
        !q ||
        task.title.toLowerCase().includes(q) ||
        task.intern.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter
      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter
      const matchesIntern =
        internFilter === "All" || task.intern === internFilter
      return matchesQuery && matchesStatus && matchesPriority && matchesIntern
    })
  }, [internFilter, priorityFilter, query, statusFilter, taskList])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [query, statusFilter, priorityFilter, internFilter])

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

  function openAssign() {
    setForm({
      ...emptyForm,
      intern: internNames[0] ?? "",
    })
    setAssignOpen(true)
  }

  function openEdit(task: SupervisorTask) {
    setEditTask(task)
    setForm({
      title: task.title,
      description: task.description,
      intern: task.intern,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
    })
  }

  function updateStatus(id: string, status: TaskStatus) {
    setTaskList((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status } : task))
    )
  }

  function removeTask(id: string) {
    setTaskList((prev) => prev.filter((task) => task.id !== id))
    setViewTask((current) => (current?.id === id ? null : current))
  }

  function handleAssign(event: React.FormEvent) {
    event.preventDefault()
    if (!form.title.trim() || !form.intern || !form.dueDate) return

    const next: SupervisorTask = {
      id: `tsk-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      intern: form.intern,
      dueDate: form.dueDate,
      priority: form.priority,
      status: form.status,
    }

    setTaskList((prev) => [next, ...prev])
    setAssignOpen(false)
    setForm({ ...emptyForm, intern: internNames[0] ?? "" })
    setStatusFilter("All")
    setPriorityFilter("All")
    setInternFilter("All")
    setQuery("")
    setPage(1)
  }

  function handleEdit(event: React.FormEvent) {
    event.preventDefault()
    if (!editTask) return

    setTaskList((prev) =>
      prev.map((task) =>
        task.id === editTask.id
          ? {
              ...task,
              title: form.title.trim(),
              description: form.description.trim(),
              intern: form.intern,
              dueDate: form.dueDate,
              priority: form.priority,
              status: form.status,
            }
          : task
      )
    )
    setEditTask(null)
  }

  const triggerClass = cn(
    buttonVariants({ variant: "outline" }),
    "h-8 w-full justify-between rounded-sm px-2.5 font-normal"
  )

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Assign and track work across interns mentored by {supervisor.name}.
          </p>
        </div>
        <Button onClick={openAssign} className="w-full shrink-0 sm:w-auto">
          <Plus />
          Assign task
        </Button>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total tasks"
          value={counts.total}
          hint="Across your interns"
        />
        <StatCard
          label="Open"
          value={counts.open}
          hint="Not marked done yet"
        />
        <StatCard
          label="In review"
          value={counts.review}
          hint="Awaiting your feedback"
        />
        <StatCard
          label="Overdue"
          value={counts.overdue}
          hint="Needs follow-up"
        />
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>Task board</CardTitle>
            <CardDescription>
              Search by task, intern, or description.
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
              <DropdownMenuTrigger
                className={cn(triggerClass, "lg:w-44")}
              >
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
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(triggerClass, "lg:w-36")}
              >
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
          <Table className="min-w-[42rem]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-44 pl-4 sm:pl-0">Task</TableHead>
                <TableHead>Intern</TableHead>
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
                    colSpan={6}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No tasks match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="max-w-[16rem] pl-4 sm:pl-0">
                      <div className="min-w-0 overflow-hidden">
                        <p className="truncate font-medium">{task.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {task.description || "No description"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[10rem] truncate">
                      {task.intern}
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
                          <DropdownMenuItem onClick={() => openEdit(task)}>
                            Edit task
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
                            onClick={() => updateStatus(task.id, "Overdue")}
                          >
                            Mark overdue
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(task.id, "Done")}
                          >
                            Mark done
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => removeTask(task.id)}
                          >
                            Remove task
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

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-4 py-2.5">
            <DialogTitle>Assign task</DialogTitle>
            <DialogDescription>
              Create a task for one of your assigned interns.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleAssign}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <TaskFormFields
                form={form}
                setForm={setForm}
                internNames={internNames}
              />
            </div>
            <DialogFooter className="shrink-0 p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssignOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <ListTodo />
                Assign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editTask)}
        onOpenChange={(open) => {
          if (!open) setEditTask(null)
        }}
      >
        <DialogContent className="max-h-none w-[calc(100%-2rem)] max-w-2xl overflow-visible p-0">
          <DialogHeader className="px-4 py-2.5">
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>
              Update assignment, due date, or status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <TaskFormFields
              form={form}
              setForm={setForm}
              internNames={internNames}
            />
            <DialogFooter className="p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTask(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                <DetailRow label="Intern" value={viewTask.intern} />
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
                  onClick={() => {
                    openEdit(viewTask)
                    setViewTask(null)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateStatus(viewTask.id, "Review")
                    setViewTask(null)
                  }}
                >
                  Send to review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateStatus(viewTask.id, "Done")
                    setViewTask(null)
                  }}
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

function TaskFormFields({
  form,
  setForm,
  internNames,
}: {
  form: TaskForm
  setForm: React.Dispatch<React.SetStateAction<TaskForm>>
  internNames: string[]
}) {
  const triggerClass = cn(
    buttonVariants({ variant: "outline" }),
    "h-8 w-full justify-between rounded-sm px-2.5 font-normal"
  )

  return (
    <div className="grid gap-3 px-4 py-3">
      <FieldGroup className="gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="task-title">Task title</FieldLabel>
            <Input
              id="task-title"
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="e.g. Fix login validation"
              required
            />
          </Field>
          <Field>
            <FieldLabel>Intern</FieldLabel>
            <DropdownMenu>
              <DropdownMenuTrigger className={triggerClass}>
                <span className="truncate">
                  {form.intern || "Select intern"}
                </span>
                <ChevronDown className="size-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-52">
                {internNames.map((name) => (
                  <DropdownMenuItem
                    key={name}
                    onClick={() => setForm((prev) => ({ ...prev, intern: name }))}
                    className="justify-between"
                  >
                    {name}
                    {form.intern === name && <Check className="size-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Field>
          <Field>
            <FieldLabel htmlFor="task-due">Due date</FieldLabel>
            <Input
              id="task-due"
              type="date"
              value={form.dueDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dueDate: event.target.value }))
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel>Priority</FieldLabel>
            <DropdownMenu>
              <DropdownMenuTrigger className={triggerClass}>
                <span>{form.priority}</span>
                <ChevronDown className="size-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-36">
                {PRIORITY_FILTERS.filter((item) => item !== "All").map(
                  (priority) => (
                    <DropdownMenuItem
                      key={priority}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          priority: priority as TaskPriority,
                        }))
                      }
                      className="justify-between"
                    >
                      {priority}
                      {form.priority === priority && (
                        <Check className="size-4" />
                      )}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </Field>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <DropdownMenu>
              <DropdownMenuTrigger className={triggerClass}>
                <span>{form.status}</span>
                <ChevronDown className="size-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-40">
                {STATUS_FILTERS.filter((item) => item !== "All").map(
                  (status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          status: status as TaskStatus,
                        }))
                      }
                      className="justify-between"
                    >
                      {status}
                      {form.status === status && <Check className="size-4" />}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="task-description">Description</FieldLabel>
            <Textarea
              id="task-description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              rows={3}
              className="max-h-28 min-h-16 resize-none overflow-y-auto rounded-sm field-sizing-fixed wrap-break-word"
              placeholder="What should the intern deliver?"
            />
          </Field>
        </div>
      </FieldGroup>
    </div>
  )
}
