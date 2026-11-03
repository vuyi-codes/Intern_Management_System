"use client"

import * as React from "react"
import {
  Check,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
  UserPlus,
} from "lucide-react"

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
import {
  formatInternDate,
  getInternInitials,
  interns as seedInterns,
  PROGRAMMES,
  STATUS_STYLES,
  SUPERVISORS,
  type Intern,
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

const emptyForm = {
  name: "",
  email: "",
  programme: PROGRAMMES[0],
  supervisor: SUPERVISORS[0],
  startDate: "",
  endDate: "",
  status: "Onboarding" as InternStatus,
}

type InternForm = typeof emptyForm

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

export function AdminInternsManager() {
  const [internList, setInternList] = React.useState<Intern[]>(seedInterns)
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_FILTERS)[number]>("All")
  const [programmeFilter, setProgrammeFilter] = React.useState("All")
  const [page, setPage] = React.useState(1)
  const [enrolOpen, setEnrolOpen] = React.useState(false)
  const [viewIntern, setViewIntern] = React.useState<Intern | null>(null)
  const [editIntern, setEditIntern] = React.useState<Intern | null>(null)
  const [form, setForm] = React.useState<InternForm>(emptyForm)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return internList.filter((intern) => {
      const matchesQuery =
        !q ||
        intern.name.toLowerCase().includes(q) ||
        intern.email.toLowerCase().includes(q) ||
        intern.supervisor.toLowerCase().includes(q) ||
        intern.programme.toLowerCase().includes(q)
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
    return {
      total: internList.length,
      active: internList.filter((i) => i.status === "Active").length,
      onboarding: internList.filter((i) => i.status === "Onboarding").length,
      paused: internList.filter((i) => i.status === "Paused").length,
      unassigned: internList.filter((i) => i.supervisor === "Unassigned")
        .length,
    }
  }, [internList])

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  function openEnrol() {
    setForm(emptyForm)
    setEnrolOpen(true)
  }

  function openEdit(intern: Intern) {
    setEditIntern(intern)
    setForm({
      name: intern.name,
      email: intern.email,
      programme: intern.programme as InternForm["programme"],
      supervisor: intern.supervisor as InternForm["supervisor"],
      startDate: intern.startDate,
      endDate: intern.endDate,
      status: intern.status,
    })
  }

  function updateStatus(id: string, status: InternStatus) {
    setInternList((prev) =>
      prev.map((intern) => (intern.id === id ? { ...intern, status } : intern))
    )
  }

  function removeIntern(id: string) {
    setInternList((prev) => prev.filter((intern) => intern.id !== id))
    setViewIntern((current) => (current?.id === id ? null : current))
  }

  function handleEnrol(event: React.FormEvent) {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.startDate) return

    const next: Intern = {
      id: `int-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      programme: form.programme,
      supervisor: form.supervisor,
      startDate: form.startDate,
      endDate: form.endDate || form.startDate,
      progress: 0,
      status: form.status,
    }

    setInternList((prev) => [next, ...prev])
    setEnrolOpen(false)
    setForm(emptyForm)
    setStatusFilter("All")
    setProgrammeFilter("All")
    setQuery("")
    setPage(1)
  }

  function handleEdit(event: React.FormEvent) {
    event.preventDefault()
    if (!editIntern) return

    setInternList((prev) =>
      prev.map((intern) =>
        intern.id === editIntern.id
          ? {
              ...intern,
              name: form.name.trim(),
              email: form.email.trim(),
              programme: form.programme,
              supervisor: form.supervisor,
              startDate: form.startDate,
              endDate: form.endDate || form.startDate,
              status: form.status,
            }
          : intern
      )
    )
    setEditIntern(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Interns</h1>
          <p className="text-sm text-muted-foreground">
            Enrol, assign, and track interns across all programmes.
          </p>
        </div>
        <Button onClick={openEnrol} className="shrink-0">
          <Plus />
          Enrol intern
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total interns"
          value={counts.total}
          hint="Across all programmes"
        />
        <StatCard
          label="Active"
          value={counts.active}
          hint="Currently in programme"
        />
        <StatCard
          label="Onboarding"
          value={counts.onboarding}
          hint="Recently enrolled"
        />
        <StatCard
          label="Needs attention"
          value={counts.paused + counts.unassigned}
          hint={`${counts.paused} paused · ${counts.unassigned} unassigned`}
        />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>All interns</CardTitle>
            <CardDescription>
              Search by name, email, supervisor, or programme.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search interns..."
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
                {PROGRAMMES.map((programme) => (
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

        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Intern</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12 text-right">
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
                pageRows.map((intern) => (
                  <TableRow key={intern.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 rounded-lg">
                          <AvatarFallback className="rounded-lg text-xs">
                            {getInternInitials(intern.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{intern.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {intern.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{intern.programme}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          intern.supervisor === "Unassigned" &&
                            "text-amber-700 dark:text-amber-400"
                        )}
                      >
                        {intern.supervisor}
                      </span>
                    </TableCell>
                    <TableCell>{formatInternDate(intern.startDate)}</TableCell>
                    <TableCell>
                      <div className="flex min-w-24 items-center gap-2">
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-sm" }),
                            "rounded-sm"
                          )}
                          aria-label={`Actions for ${intern.name}`}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewIntern(intern)}>
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(intern)}>
                            Edit intern
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => removeIntern(intern.id)}
                          >
                            Remove intern
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

        <CardFooter className="justify-between gap-4 border-t bg-transparent">
          <p className="text-sm text-muted-foreground">
            {filtered.length === 0
              ? "No results"
              : `Showing ${startIndex + 1}–${Math.min(
                  startIndex + PAGE_SIZE,
                  filtered.length
                )} of ${filtered.length}`}
          </p>
          <Pagination className="mx-0 w-auto justify-end">
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

      <Dialog open={enrolOpen} onOpenChange={setEnrolOpen}>
        <DialogContent className="max-h-none max-w-2xl overflow-visible p-0">
          <DialogHeader className="px-4 py-2.5">
            <DialogTitle>Enrol intern</DialogTitle>
            <DialogDescription>
              Add a new intern to a programme and assign a supervisor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnrol}>
            <InternFormFields form={form} setForm={setForm} />
            <DialogFooter className="p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEnrolOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <UserPlus />
                Enrol
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editIntern)}
        onOpenChange={(open) => {
          if (!open) setEditIntern(null)
        }}
      >
        <DialogContent className="max-h-none max-w-2xl overflow-visible p-0">
          <DialogHeader className="px-4 py-2.5">
            <DialogTitle>Edit intern</DialogTitle>
            <DialogDescription>
              Update programme placement, supervisor, or status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <InternFormFields form={form} setForm={setForm} />
            <DialogFooter className="p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditIntern(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewIntern)}
        onOpenChange={(open) => {
          if (!open) setViewIntern(null)
        }}
      >
        <DialogContent className="max-w-md p-0">
          <DialogHeader>
            <DialogTitle>Intern details</DialogTitle>
            <DialogDescription>
              Placement and progress overview.
            </DialogDescription>
          </DialogHeader>
          {viewIntern && (
            <div className="grid gap-4 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {getInternInitials(viewIntern.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium">{viewIntern.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {viewIntern.email}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 rounded-sm border border-border p-3 text-sm">
                <DetailRow label="Programme" value={viewIntern.programme} />
                <DetailRow label="Supervisor" value={viewIntern.supervisor} />
                <DetailRow
                  label="Start date"
                  value={formatInternDate(viewIntern.startDate)}
                />
                <DetailRow
                  label="End date"
                  value={formatInternDate(viewIntern.endDate)}
                />
                <DetailRow label="Progress" value={`${viewIntern.progress}%`} />
                <DetailRow label="Status" value={viewIntern.status} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    openEdit(viewIntern)
                    setViewIntern(null)
                  }}
                >
                  Edit
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
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

function InternFormFields({
  form,
  setForm,
}: {
  form: InternForm
  setForm: React.Dispatch<React.SetStateAction<InternForm>>
}) {
  const triggerClass = cn(
    buttonVariants({ variant: "outline" }),
    "h-8 w-full justify-between rounded-sm px-2.5 font-normal"
  )

  return (
    <div className="grid gap-3 px-4 py-3">
      <FieldGroup className="gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="intern-name">Full name</FieldLabel>
            <Input
              id="intern-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="intern-email">Email</FieldLabel>
            <Input
              id="intern-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel>Programme</FieldLabel>
            <DropdownMenu>
              <DropdownMenuTrigger className={triggerClass}>
                <span className="truncate">{form.programme}</span>
                <ChevronDown className="size-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-52">
                {PROGRAMMES.map((programme) => (
                  <DropdownMenuItem
                    key={programme}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, programme }))
                    }
                    className="justify-between"
                  >
                    {programme}
                    {form.programme === programme && (
                      <Check className="size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Field>
          <Field>
            <FieldLabel>Supervisor</FieldLabel>
            <DropdownMenu>
              <DropdownMenuTrigger className={triggerClass}>
                <span className="truncate">{form.supervisor}</span>
                <ChevronDown className="size-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-52">
                {SUPERVISORS.map((supervisor) => (
                  <DropdownMenuItem
                    key={supervisor}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, supervisor }))
                    }
                    className="justify-between"
                  >
                    {supervisor}
                    {form.supervisor === supervisor && (
                      <Check className="size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Field>
          <Field>
            <FieldLabel htmlFor="intern-start">Start date</FieldLabel>
            <Input
              id="intern-start"
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startDate: event.target.value }))
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="intern-end">End date</FieldLabel>
            <Input
              id="intern-end"
              type="date"
              value={form.endDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, endDate: event.target.value }))
              }
            />
          </Field>
          <Field className="col-span-2 sm:col-span-1">
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
                          status: status as InternStatus,
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
        </div>
      </FieldGroup>
    </div>
  )
}
