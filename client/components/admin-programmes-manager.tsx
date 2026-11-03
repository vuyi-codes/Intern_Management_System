"use client"

import * as React from "react"
import {
  Check,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
  CalendarRange,
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
  formatProgrammeDate,
  getProgrammeInternCount,
  getProgrammeLeadOptions,
  PROGRAMME_NAMES,
  PROGRAMME_STATUS_STYLES,
  programmes as seedProgrammes,
  type Programme,
  type ProgrammeStatus,
} from "@/lib/programmes"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 8

const STATUS_FILTERS: Array<"All" | ProgrammeStatus> = [
  "All",
  "Active",
  "Upcoming",
  "Paused",
  "Completed",
]

const COHORTS = [
  "Winter 2026",
  "Spring 2026",
  "Summer 2026",
  "Autumn 2026",
  "Summer 2025",
] as const

const leadOptions = getProgrammeLeadOptions()

const emptyForm = {
  name: "",
  cohort: "",
  description: "",
  leadSupervisor: leadOptions[0] ?? "Jordan Peters",
  startDate: "",
  endDate: "",
  capacity: "10",
  status: "Upcoming" as ProgrammeStatus,
}

type ProgrammeForm = typeof emptyForm

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

export function AdminProgrammesManager() {
  const [programmeList, setProgrammeList] =
    React.useState<Programme[]>(seedProgrammes)
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_FILTERS)[number]>("All")
  const [cohortFilter, setCohortFilter] = React.useState("All")
  const [page, setPage] = React.useState(1)
  const [addOpen, setAddOpen] = React.useState(false)
  const [viewProgramme, setViewProgramme] = React.useState<Programme | null>(
    null
  )
  const [editProgramme, setEditProgramme] = React.useState<Programme | null>(
    null
  )
  const [form, setForm] = React.useState<ProgrammeForm>(emptyForm)

  const cohorts = React.useMemo(() => {
    const values = new Set<string>([
      ...COHORTS,
      ...programmeList.map((programme) => programme.cohort),
    ])
    return Array.from(values)
  }, [programmeList])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return programmeList.filter((programme) => {
      const matchesQuery =
        !q ||
        programme.name.toLowerCase().includes(q) ||
        programme.cohort.toLowerCase().includes(q) ||
        programme.leadSupervisor.toLowerCase().includes(q) ||
        programme.description.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === "All" || programme.status === statusFilter
      const matchesCohort =
        cohortFilter === "All" || programme.cohort === cohortFilter
      return matchesQuery && matchesStatus && matchesCohort
    })
  }, [cohortFilter, programmeList, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [query, statusFilter, cohortFilter])

  const counts = React.useMemo(() => {
    return {
      total: programmeList.length,
      active: programmeList.filter((p) => p.status === "Active").length,
      upcoming: programmeList.filter((p) => p.status === "Upcoming").length,
      paused: programmeList.filter((p) => p.status === "Paused").length,
    }
  }, [programmeList])

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  function openAdd() {
    setForm(emptyForm)
    setAddOpen(true)
  }

  function openEdit(programme: Programme) {
    setEditProgramme(programme)
    setForm({
      name: programme.name,
      cohort: programme.cohort,
      description: programme.description,
      leadSupervisor: programme.leadSupervisor,
      startDate: programme.startDate,
      endDate: programme.endDate,
      capacity: String(programme.capacity),
      status: programme.status,
    })
  }

  function updateStatus(id: string, status: ProgrammeStatus) {
    setProgrammeList((prev) =>
      prev.map((programme) =>
        programme.id === id ? { ...programme, status } : programme
      )
    )
  }

  function removeProgramme(id: string) {
    setProgrammeList((prev) =>
      prev.filter((programme) => programme.id !== id)
    )
    setViewProgramme((current) => (current?.id === id ? null : current))
  }

  function handleAdd(event: React.FormEvent) {
    event.preventDefault()
    if (
      !form.name.trim() ||
      !form.cohort.trim() ||
      !form.startDate ||
      !form.endDate
    ) {
      return
    }

    const next: Programme = {
      id: `prg-${Date.now()}`,
      name: form.name.trim(),
      cohort: form.cohort.trim(),
      description: form.description.trim(),
      leadSupervisor: form.leadSupervisor,
      startDate: form.startDate,
      endDate: form.endDate,
      capacity: Number(form.capacity) || 1,
      status: form.status,
    }

    setProgrammeList((prev) => [next, ...prev])
    setAddOpen(false)
    setForm(emptyForm)
    setStatusFilter("All")
    setCohortFilter("All")
    setQuery("")
    setPage(1)
  }

  function handleEdit(event: React.FormEvent) {
    event.preventDefault()
    if (!editProgramme) return

    setProgrammeList((prev) =>
      prev.map((programme) =>
        programme.id === editProgramme.id
          ? {
              ...programme,
              name: form.name.trim(),
              cohort: form.cohort.trim(),
              description: form.description.trim(),
              leadSupervisor: form.leadSupervisor,
              startDate: form.startDate,
              endDate: form.endDate,
              capacity: Number(form.capacity) || programme.capacity,
              status: form.status,
            }
          : programme
      )
    )
    setEditProgramme(null)
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold">Programmes</h1>
          <p className="text-sm text-muted-foreground">
            Plan cohorts, capacity, and programme timelines.
          </p>
        </div>
        <Button onClick={openAdd} className="w-full shrink-0 sm:w-auto">
          <Plus />
          Create programme
        </Button>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total programmes"
          value={counts.total}
          hint="Across all cohorts"
        />
        <StatCard
          label="Active"
          value={counts.active}
          hint="Currently running"
        />
        <StatCard
          label="Upcoming"
          value={counts.upcoming}
          hint="Scheduled intakes"
        />
        <StatCard
          label="Paused"
          value={counts.paused}
          hint="Temporarily on hold"
        />
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>All programmes</CardTitle>
            <CardDescription>
              Search by name, cohort, or lead supervisor.
            </CardDescription>
          </div>
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search programmes..."
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-8 w-full justify-between rounded-sm px-2.5 font-normal lg:w-44"
                )}
              >
                <span className="truncate">
                  {cohortFilter === "All" ? "All cohorts" : cohortFilter}
                </span>
                <ChevronDown className="size-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem
                  onClick={() => setCohortFilter("All")}
                  className="justify-between"
                >
                  All cohorts
                  {cohortFilter === "All" && <Check className="size-4" />}
                </DropdownMenuItem>
                {cohorts.map((cohort) => (
                  <DropdownMenuItem
                    key={cohort}
                    onClick={() => setCohortFilter(cohort)}
                    className="justify-between"
                  >
                    {cohort}
                    {cohortFilter === cohort && <Check className="size-4" />}
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
                <TableHead className="min-w-40 pl-4 sm:pl-0">
                  Programme
                </TableHead>
                <TableHead className="hidden md:table-cell">Cohort</TableHead>
                <TableHead className="hidden lg:table-cell">Lead</TableHead>
                <TableHead className="hidden sm:table-cell">Dates</TableHead>
                <TableHead>Enrolment</TableHead>
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
                    No programmes match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((programme) => {
                  const enrolled = getProgrammeInternCount(programme.name)
                  const load = Math.min(
                    100,
                    Math.round((enrolled / programme.capacity) * 100)
                  )

                  return (
                    <TableRow key={programme.id}>
                      <TableCell className="max-w-[12rem] pl-4 sm:max-w-[16rem] sm:pl-0 md:max-w-xs">
                        <div className="min-w-0 overflow-hidden">
                          <p className="truncate font-medium">
                            {programme.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground md:hidden">
                            {programme.cohort}
                          </p>
                          <p className="hidden truncate text-xs text-muted-foreground sm:block">
                            {programme.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {programme.cohort}
                      </TableCell>
                      <TableCell className="hidden max-w-[10rem] truncate lg:table-cell">
                        {programme.leadSupervisor}
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap sm:table-cell">
                        <div className="text-sm">
                          <p>{formatProgrammeDate(programme.startDate)}</p>
                          <p className="text-xs text-muted-foreground">
                            to {formatProgrammeDate(programme.endDate)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex w-20 min-w-0 flex-col gap-1 sm:w-28">
                          <span className="text-sm tabular-nums">
                            {enrolled}/{programme.capacity}
                          </span>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                load >= 100 ? "bg-amber-500" : "bg-primary"
                              )}
                              style={{ width: `${load}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                            PROGRAMME_STATUS_STYLES[programme.status]
                          )}
                        >
                          {programme.status}
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
                            aria-label={`Actions for ${programme.name}`}
                          >
                            <MoreHorizontal />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setViewProgramme(programme)}
                            >
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEdit(programme)}
                            >
                              Edit programme
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus(programme.id, "Active")
                              }
                            >
                              Mark active
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus(programme.id, "Upcoming")
                              }
                            >
                              Mark upcoming
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus(programme.id, "Paused")
                              }
                            >
                              Pause programme
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus(programme.id, "Completed")
                              }
                            >
                              Mark completed
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => removeProgramme(programme.id)}
                            >
                              Remove programme
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-4 py-2.5">
            <DialogTitle>Create programme</DialogTitle>
            <DialogDescription>
              Add a new programme track and cohort with capacity and a lead
              supervisor.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleAdd}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ProgrammeFormFields form={form} setForm={setForm} allowCustom />
            </div>
            <DialogFooter className="shrink-0 p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <CalendarRange />
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editProgramme)}
        onOpenChange={(open) => {
          if (!open) setEditProgramme(null)
        }}
      >
        <DialogContent className="max-h-none w-[calc(100%-2rem)] max-w-2xl overflow-visible p-0">
          <DialogHeader className="px-4 py-2.5">
            <DialogTitle>Edit programme</DialogTitle>
            <DialogDescription>
              Update timeline, capacity, or programme status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <ProgrammeFormFields form={form} setForm={setForm} allowCustom />
            <DialogFooter className="p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditProgramme(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewProgramme)}
        onOpenChange={(open) => {
          if (!open) setViewProgramme(null)
        }}
      >
        <DialogContent className="max-h-none w-[calc(100%-2rem)] max-w-md overflow-visible p-0">
          <DialogHeader className="px-4 py-2.5">
            <DialogTitle>Programme details</DialogTitle>
            <DialogDescription>
              Cohort timeline and enrolment overview.
            </DialogDescription>
          </DialogHeader>
          {viewProgramme && (
            <div className="grid gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{viewProgramme.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {viewProgramme.cohort}
                </p>
              </div>
              <div className="grid gap-3 rounded-sm border border-border p-3 text-sm">
                <DetailRow
                  label="Lead"
                  value={viewProgramme.leadSupervisor}
                />
                <DetailRow
                  label="Start"
                  value={formatProgrammeDate(viewProgramme.startDate)}
                />
                <DetailRow
                  label="End"
                  value={formatProgrammeDate(viewProgramme.endDate)}
                />
                <DetailRow
                  label="Enrolment"
                  value={`${getProgrammeInternCount(viewProgramme.name)}/${viewProgramme.capacity}`}
                />
                <DetailRow label="Status" value={viewProgramme.status} />
                <div className="grid min-w-0 gap-1">
                  <span className="text-muted-foreground">Description</span>
                  <p className="wrap-break-word whitespace-pre-wrap">
                    {viewProgramme.description || "—"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    openEdit(viewProgramme)
                    setViewProgramme(null)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateStatus(viewProgramme.id, "Paused")
                    setViewProgramme(null)
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
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

function ProgrammeFormFields({
  form,
  setForm,
  allowCustom = false,
}: {
  form: ProgrammeForm
  setForm: React.Dispatch<React.SetStateAction<ProgrammeForm>>
  allowCustom?: boolean
}) {
  const triggerClass = cn(
    buttonVariants({ variant: "outline" }),
    "h-8 w-full justify-between rounded-sm px-2.5 font-normal"
  )

  return (
    <div className="grid gap-3 px-4 py-3">
      <FieldGroup className="gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="programme-name">Programme name</FieldLabel>
            {allowCustom ? (
              <Input
                id="programme-name"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="e.g. Data Analytics"
                required
              />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className={triggerClass}>
                  <span className="truncate">{form.name}</span>
                  <ChevronDown className="size-4 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-52">
                  {PROGRAMME_NAMES.map((name) => (
                    <DropdownMenuItem
                      key={name}
                      onClick={() => setForm((prev) => ({ ...prev, name }))}
                      className="justify-between"
                    >
                      {name}
                      {form.name === name && <Check className="size-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="programme-cohort">Cohort</FieldLabel>
            {allowCustom ? (
              <Input
                id="programme-cohort"
                value={form.cohort}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, cohort: event.target.value }))
                }
                placeholder="e.g. Winter 2027"
                required
              />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className={triggerClass}>
                  <span className="truncate">{form.cohort}</span>
                  <ChevronDown className="size-4 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-44">
                  {COHORTS.map((cohort) => (
                    <DropdownMenuItem
                      key={cohort}
                      onClick={() => setForm((prev) => ({ ...prev, cohort }))}
                      className="justify-between"
                    >
                      {cohort}
                      {form.cohort === cohort && <Check className="size-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </Field>
          {allowCustom && (
            <Field className="sm:col-span-2">
              <FieldLabel>Quick fill</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {PROGRAMME_NAMES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, name }))}
                    className={cn(
                      buttonVariants({
                        variant: form.name === name ? "secondary" : "outline",
                        size: "sm",
                      }),
                      "rounded-sm"
                    )}
                  >
                    {name}
                  </button>
                ))}
                {COHORTS.slice(0, 4).map((cohort) => (
                  <button
                    key={cohort}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, cohort }))}
                    className={cn(
                      buttonVariants({
                        variant:
                          form.cohort === cohort ? "secondary" : "outline",
                        size: "sm",
                      }),
                      "rounded-sm"
                    )}
                  >
                    {cohort}
                  </button>
                ))}
              </div>
            </Field>
          )}
          <Field>
            <FieldLabel>Lead supervisor</FieldLabel>
            <DropdownMenu>
              <DropdownMenuTrigger className={triggerClass}>
                <span className="truncate">{form.leadSupervisor}</span>
                <ChevronDown className="size-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-52">
                {leadOptions.map((lead) => (
                  <DropdownMenuItem
                    key={lead}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, leadSupervisor: lead }))
                    }
                    className="justify-between"
                  >
                    {lead}
                    {form.leadSupervisor === lead && (
                      <Check className="size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Field>
          <Field>
            <FieldLabel htmlFor="programme-capacity">Capacity</FieldLabel>
            <Input
              id="programme-capacity"
              type="number"
              min={1}
              max={40}
              value={form.capacity}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, capacity: event.target.value }))
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="programme-start">Start date</FieldLabel>
            <Input
              id="programme-start"
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startDate: event.target.value }))
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="programme-end">End date</FieldLabel>
            <Input
              id="programme-end"
              type="date"
              value={form.endDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, endDate: event.target.value }))
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <DropdownMenu>
              <DropdownMenuTrigger className={triggerClass}>
                <span>{form.status}</span>
                <ChevronDown className="size-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-40">
                {STATUS_FILTERS.filter((status) => status !== "All").map(
                  (status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          status: status as ProgrammeStatus,
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
            <FieldLabel htmlFor="programme-description">Description</FieldLabel>
            <Textarea
              id="programme-description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              rows={3}
              className="max-h-28 min-h-16 resize-none overflow-y-auto rounded-sm field-sizing-fixed wrap-break-word"
              placeholder="Short summary of the programme focus"
            />
          </Field>
        </div>
      </FieldGroup>
    </div>
  )
}
