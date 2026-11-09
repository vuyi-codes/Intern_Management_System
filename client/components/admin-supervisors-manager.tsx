"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Check,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
  UserPlus,
  UserRoundPlus,
} from "lucide-react"

import { AdminCreateUserForm } from "@/components/admin-create-user-form"
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
  addSupervisor,
  deleteSupervisor,
  updateSupervisor,
  updateSupervisorStatus,
} from "@/app/actions/admin-records"
import type { AdminSupervisor, NamedOption } from "@/lib/admin-data"
import {
  DEPARTMENTS,
  formatSupervisorDate,
  getSupervisorInitials,
  SUPERVISOR_STATUS_STYLES,
  type SupervisorStatus,
} from "@/lib/supervisors"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 8

const STATUS_FILTERS: Array<"All" | SupervisorStatus> = [
  "All",
  "Active",
  "On leave",
  "Inactive",
]

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  title: "",
  department: DEPARTMENTS[0] as string,
  programmes: [] as string[],
  capacity: "5",
  startDate: "",
  status: "Active" as SupervisorStatus,
}

type SupervisorForm = typeof emptyForm

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

function assignedCountFor(
  supervisor: { id: string },
  assignedCounts: Record<string, number>
) {
  return assignedCounts[supervisor.id] ?? 0
}

export function AdminSupervisorsManager({
  supervisors,
  programmes,
  assignedCounts,
}: {
  supervisors: AdminSupervisor[]
  programmes: NamedOption[]
  assignedCounts: Record<string, number>
}) {
  const router = useRouter()
  const [supervisorList, setSupervisorList] =
    React.useState<AdminSupervisor[]>(supervisors)
  const [notice, setNotice] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_FILTERS)[number]>("All")
  const [departmentFilter, setDepartmentFilter] = React.useState("All")
  const [page, setPage] = React.useState(1)
  const [addOpen, setAddOpen] = React.useState(false)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [viewSupervisor, setViewSupervisor] =
    React.useState<AdminSupervisor | null>(null)
  const [editSupervisor, setEditSupervisor] =
    React.useState<AdminSupervisor | null>(null)
  const [form, setForm] = React.useState<SupervisorForm>(emptyForm)

  React.useEffect(() => {
    setSupervisorList(supervisors)
  }, [supervisors])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return supervisorList.filter((supervisor) => {
      const matchesQuery =
        !q ||
        supervisor.name.toLowerCase().includes(q) ||
        supervisor.email.toLowerCase().includes(q) ||
        supervisor.department.toLowerCase().includes(q) ||
        supervisor.title.toLowerCase().includes(q) ||
        supervisor.programmes.some((programme) =>
          programme.toLowerCase().includes(q)
        )
      const matchesStatus =
        statusFilter === "All" || supervisor.status === statusFilter
      const matchesDepartment =
        departmentFilter === "All" ||
        supervisor.department === departmentFilter
      return matchesQuery && matchesStatus && matchesDepartment
    })
  }, [departmentFilter, query, statusFilter, supervisorList])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [query, statusFilter, departmentFilter])

  const counts = React.useMemo(() => {
    const active = supervisorList.filter((s) => s.status === "Active").length
    const onLeave = supervisorList.filter((s) => s.status === "On leave").length
    const nearCapacity = supervisorList.filter((supervisor) => {
      const assigned = assignedCountFor(supervisor, assignedCounts)
      return assigned >= supervisor.capacity
    }).length
    return {
      total: supervisorList.length,
      active,
      onLeave,
      nearCapacity,
    }
  }, [supervisorList, assignedCounts])

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  function openAdd() {
    setForm(emptyForm)
    setAddOpen(true)
  }

  function openEdit(supervisor: AdminSupervisor) {
    setEditSupervisor(supervisor)
    setForm({
      name: supervisor.name,
      email: supervisor.email,
      phone: supervisor.phone,
      title: supervisor.title,
      department: supervisor.department,
      programmes: supervisor.programmeIds,
      capacity: String(supervisor.capacity),
      startDate: supervisor.startDate,
      status: supervisor.status,
    })
  }

  async function updateStatus(id: string, status: SupervisorStatus) {
    setNotice("")
    const result = await updateSupervisorStatus(id, status)
    if (result.error) {
      setNotice(result.error)
      return
    }
    router.refresh()
  }

  async function removeSupervisor(id: string) {
    setNotice("")
    const result = await deleteSupervisor(id)
    if (result.error) {
      setNotice(result.error)
      return
    }
    setViewSupervisor((current) => (current?.id === id ? null : current))
    router.refresh()
  }

  function toggleProgramme(programme: string) {
    setForm((prev) => {
      const exists = prev.programmes.includes(programme)
      const next = exists
        ? prev.programmes.filter((item) => item !== programme)
        : [...prev.programmes, programme]
      return {
        ...prev,
        programmes: next.length > 0 ? next : [programme],
      }
    })
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.startDate) return
    setSaving(true)
    setNotice("")
    const result = await addSupervisor({
      name: form.name,
      email: form.email,
      phone: form.phone,
      title: form.title,
      department: form.department,
      programmeIds: form.programmes,
      capacity: Number(form.capacity) || 1,
      startDate: form.startDate,
      status: form.status,
    })
    setSaving(false)
    if (result.error) {
      setNotice(result.error)
      return
    }
    setAddOpen(false)
    setForm(emptyForm)
    setNotice(
      result.temporaryPassword
        ? `Supervisor added. Temporary password: ${result.temporaryPassword}`
        : "Supervisor added."
    )
    router.refresh()
  }

  async function handleEdit(event: React.FormEvent) {
    event.preventDefault()
    if (!editSupervisor) return
    setSaving(true)
    setNotice("")
    const result = await updateSupervisor({
      id: editSupervisor.id,
      name: form.name,
      email: form.email,
      phone: form.phone,
      title: form.title,
      department: form.department,
      programmeIds: form.programmes,
      capacity: Number(form.capacity) || 1,
      startDate: form.startDate,
      status: form.status,
    })
    setSaving(false)
    if (result.error) {
      setNotice(result.error)
      return
    }
    setEditSupervisor(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Supervisors</h1>
          <p className="text-sm text-muted-foreground">
            Manage mentors, capacity, and programme coverage.
          </p>
          {notice ? <p className="text-sm text-destructive">{notice}</p> : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            onClick={() => setCreateOpen(true)}
            className="shrink-0"
          >
            <UserRoundPlus />
            Create supervisor account
          </Button>
          <Button onClick={openAdd} className="shrink-0">
            <Plus />
            Add supervisor
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total supervisors"
          value={counts.total}
          hint="Across all departments"
        />
        <StatCard
          label="Active"
          value={counts.active}
          hint="Currently mentoring"
        />
        <StatCard
          label="On leave"
          value={counts.onLeave}
          hint="Temporarily unavailable"
        />
        <StatCard
          label="At capacity"
          value={counts.nearCapacity}
          hint="No open intern slots"
        />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>All supervisors</CardTitle>
            <CardDescription>
              Search by name, email, department, or programme.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search supervisors..."
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
                  {departmentFilter === "All"
                    ? "All departments"
                    : departmentFilter}
                </span>
                <ChevronDown className="size-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuItem
                  onClick={() => setDepartmentFilter("All")}
                  className="justify-between"
                >
                  All departments
                  {departmentFilter === "All" && <Check className="size-4" />}
                </DropdownMenuItem>
                {DEPARTMENTS.map((department) => (
                  <DropdownMenuItem
                    key={department}
                    onClick={() => setDepartmentFilter(department)}
                    className="justify-between"
                  >
                    {department}
                    {departmentFilter === department && (
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
                <TableHead>Supervisor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Programmes</TableHead>
                <TableHead>Interns</TableHead>
                <TableHead>Joined</TableHead>
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
                    No supervisors match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((supervisor) => {
                  const assigned = assignedCountFor(supervisor, assignedCounts)
                  const load = Math.min(
                    100,
                    Math.round((assigned / supervisor.capacity) * 100)
                  )

                  return (
                    <TableRow key={supervisor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 rounded-lg">
                            <AvatarFallback className="rounded-lg text-xs">
                              {getSupervisorInitials(supervisor.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {supervisor.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {supervisor.title}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{supervisor.department}</TableCell>
                      <TableCell>
                        <div className="flex max-w-56 flex-wrap gap-1">
                          {supervisor.programmes.slice(0, 2).map((programme) => (
                            <span
                              key={programme}
                              className="inline-flex rounded-sm bg-muted px-1.5 py-0.5 text-[11px]"
                            >
                              {programme}
                            </span>
                          ))}
                          {supervisor.programmes.length > 2 && (
                            <span className="inline-flex rounded-sm bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                              +{supervisor.programmes.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-28 flex-col gap-1">
                          <span className="text-sm tabular-nums">
                            {assigned}/{supervisor.capacity}
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
                        {formatSupervisorDate(supervisor.startDate)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                            SUPERVISOR_STATUS_STYLES[supervisor.status]
                          )}
                        >
                          {supervisor.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={cn(
                              buttonVariants({
                                variant: "ghost",
                                size: "icon-sm",
                              }),
                              "rounded-sm"
                            )}
                            aria-label={`Actions for ${supervisor.name}`}
                          >
                            <MoreHorizontal />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setViewSupervisor(supervisor)}
                            >
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEdit(supervisor)}
                            >
                              Edit supervisor
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus(supervisor.id, "Active")
                              }
                            >
                              Mark active
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus(supervisor.id, "On leave")
                              }
                            >
                              Mark on leave
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus(supervisor.id, "Inactive")
                              }
                            >
                              Mark inactive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => removeSupervisor(supervisor.id)}
                            >
                              Remove supervisor
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-4 py-3">
            <DialogTitle>Create supervisor account</DialogTitle>
            <DialogDescription>
              Creates a Supabase auth user and promotes their profile to
              supervisor.
            </DialogDescription>
          </DialogHeader>
          {createOpen ? (
            <AdminCreateUserForm
              defaultRole="supervisor"
              fixedRole
              onCancel={() => setCreateOpen(false)}
              onSuccess={() => router.refresh()}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-4 py-3">
            <DialogTitle>Add supervisor</DialogTitle>
            <DialogDescription>
              Create a mentor profile and set programme coverage.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleAdd}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <SupervisorFormFields
                form={form}
                setForm={setForm}
                toggleProgramme={toggleProgramme}
                programmes={programmes}
              />
            </div>
            <DialogFooter className="shrink-0 p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <UserPlus />
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editSupervisor)}
        onOpenChange={(open) => {
          if (!open) setEditSupervisor(null)
        }}
      >
        <DialogContent className="max-w-lg overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-4 py-3">
            <DialogTitle>Edit supervisor</DialogTitle>
            <DialogDescription>
              Update department, capacity, or programme coverage.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleEdit}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <SupervisorFormFields
                form={form}
                setForm={setForm}
                toggleProgramme={toggleProgramme}
                programmes={programmes}
              />
            </div>
            <DialogFooter className="shrink-0 p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditSupervisor(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewSupervisor)}
        onOpenChange={(open) => {
          if (!open) setViewSupervisor(null)
        }}
      >
        <DialogContent className="max-w-md p-0">
          <DialogHeader>
            <DialogTitle>Supervisor details</DialogTitle>
            <DialogDescription>
              Coverage and capacity overview.
            </DialogDescription>
          </DialogHeader>
          {viewSupervisor && (
            <div className="grid gap-4 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {getSupervisorInitials(viewSupervisor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium">{viewSupervisor.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {viewSupervisor.email}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 rounded-sm border border-border p-3 text-sm">
                <DetailRow label="Title" value={viewSupervisor.title} />
                <DetailRow
                  label="Department"
                  value={viewSupervisor.department}
                />
                <DetailRow label="Phone" value={viewSupervisor.phone || "—"} />
                <DetailRow
                  label="Joined"
                  value={formatSupervisorDate(viewSupervisor.startDate)}
                />
                <DetailRow
                  label="Interns"
                  value={`${assignedCountFor(viewSupervisor, assignedCounts)}/${viewSupervisor.capacity}`}
                />
                <DetailRow label="Status" value={viewSupervisor.status} />
                <div className="grid gap-1">
                  <span className="text-muted-foreground">Programmes</span>
                  <div className="flex flex-wrap gap-1">
                    {viewSupervisor.programmes.map((programme) => (
                      <span
                        key={programme}
                        className="inline-flex rounded-sm bg-muted px-1.5 py-0.5 text-[11px]"
                      >
                        {programme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    openEdit(viewSupervisor)
                    setViewSupervisor(null)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateStatus(viewSupervisor.id, "On leave")
                    setViewSupervisor(null)
                  }}
                >
                  Mark on leave
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

function SupervisorFormFields({
  form,
  setForm,
  toggleProgramme,
  programmes,
}: {
  form: SupervisorForm
  setForm: React.Dispatch<React.SetStateAction<SupervisorForm>>
  toggleProgramme: (programme: string) => void
  programmes: NamedOption[]
}) {
  const triggerClass = cn(
    buttonVariants({ variant: "outline" }),
    "h-8 w-full justify-between rounded-sm px-2.5 font-normal"
  )

  return (
    <div className="grid gap-3 px-4 pt-4 pb-3">
      <FieldGroup className="grid grid-cols-1 gap-4">
        <Field className="min-w-0 flex-col">
          <FieldLabel htmlFor="supervisor-name">Full name</FieldLabel>
          <Input
            id="supervisor-name"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            required
          />
        </Field>
        <Field className="min-w-0 flex-col">
          <FieldLabel htmlFor="supervisor-email">Email</FieldLabel>
          <Input
            id="supervisor-email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            required
          />
        </Field>
        <Field className="min-w-0 flex-col">
          <FieldLabel htmlFor="supervisor-phone">Phone</FieldLabel>
          <Input
            id="supervisor-phone"
            type="tel"
            value={form.phone}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, phone: event.target.value }))
            }
          />
        </Field>
        <Field className="min-w-0 flex-col">
          <FieldLabel htmlFor="supervisor-title">Job title</FieldLabel>
          <Input
            id="supervisor-title"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
          />
        </Field>
        <Field className="min-w-0 flex-col">
          <FieldLabel>Department</FieldLabel>
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass}>
              <span className="truncate">{form.department}</span>
              <ChevronDown className="size-4 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-52">
              {DEPARTMENTS.map((department) => (
                <DropdownMenuItem
                  key={department}
                  onClick={() => setForm((prev) => ({ ...prev, department }))}
                  className="justify-between"
                >
                  {department}
                  {form.department === department && (
                    <Check className="size-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Field>
        <Field className="min-w-0 flex-col">
          <FieldLabel htmlFor="supervisor-capacity">Capacity</FieldLabel>
          <Input
            id="supervisor-capacity"
            type="number"
            min={1}
            max={20}
            value={form.capacity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, capacity: event.target.value }))
            }
            required
          />
        </Field>
        <Field className="min-w-0 flex-col">
          <FieldLabel htmlFor="supervisor-start">Start date</FieldLabel>
          <Input
            id="supervisor-start"
            type="date"
            value={form.startDate}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, startDate: event.target.value }))
            }
            required
          />
        </Field>
        <Field className="min-w-0 flex-col">
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
                        status: status as SupervisorStatus,
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
        <Field className="min-w-0 flex-col">
          <FieldLabel>Programmes</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {programmes.map((programme) => {
              const selected = form.programmes.includes(programme.id)
              return (
                <button
                  key={programme.id}
                  type="button"
                  onClick={() => toggleProgramme(programme.id)}
                  className={cn(
                    buttonVariants({
                      variant: selected ? "secondary" : "outline",
                      size: "sm",
                    }),
                    "rounded-sm"
                  )}
                >
                  {selected && <Check className="size-3.5" />}
                  {programme.name}
                </button>
              )
            })}
          </div>
        </Field>
      </FieldGroup>
    </div>
  )
}
