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
  deleteIntern,
  enrolIntern,
  updateIntern,
  updateInternStatus,
} from "@/app/actions/admin-records"
import type { AdminIntern, NamedOption } from "@/lib/admin-data"
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

type InternForm = {
  name: string
  email: string
  programmeId: string
  supervisorId: string
  startDate: string
  endDate: string
  status: InternStatus
}

const emptyForm: InternForm = {
  name: "",
  email: "",
  programmeId: "",
  supervisorId: "",
  startDate: "",
  endDate: "",
  status: "Onboarding",
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

export function AdminInternsManager({
  interns,
  programmes,
  supervisors,
}: {
  interns: AdminIntern[]
  programmes: NamedOption[]
  supervisors: NamedOption[]
}) {
  const router = useRouter()
  const [internList, setInternList] = React.useState<AdminIntern[]>(interns)
  const [notice, setNotice] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_FILTERS)[number]>("All")
  const [programmeFilter, setProgrammeFilter] = React.useState("All")
  const [page, setPage] = React.useState(1)
  const [enrolOpen, setEnrolOpen] = React.useState(false)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [viewIntern, setViewIntern] = React.useState<AdminIntern | null>(null)
  const [editIntern, setEditIntern] = React.useState<AdminIntern | null>(null)
  const [form, setForm] = React.useState<InternForm>(emptyForm)

  React.useEffect(() => {
    setInternList(interns)
  }, [interns])

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

  function openEdit(intern: AdminIntern) {
    setEditIntern(intern)
    setForm({
      name: intern.name,
      email: intern.email,
      programmeId: intern.programmeId ?? "",
      supervisorId: intern.supervisorId ?? "",
      startDate: intern.startDate,
      endDate: intern.endDate,
      status: intern.status,
    })
  }

  async function updateStatus(id: string, status: InternStatus) {
    setNotice("")
    const result = await updateInternStatus(id, status)
    if (result.error) {
      setNotice(result.error)
      return
    }
    router.refresh()
  }

  async function removeIntern(id: string) {
    setNotice("")
    const result = await deleteIntern(id)
    if (result.error) {
      setNotice(result.error)
      return
    }
    setViewIntern((current) => (current?.id === id ? null : current))
    router.refresh()
  }

  async function handleEnrol(event: React.FormEvent) {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.startDate) return
    setSaving(true)
    setNotice("")
    const result = await enrolIntern({
      name: form.name,
      email: form.email,
      programmeId: form.programmeId,
      supervisorId: form.supervisorId,
      startDate: form.startDate,
      endDate: form.endDate || form.startDate,
      status: form.status,
    })
    setSaving(false)
    if (result.error) {
      setNotice(result.error)
      return
    }
    setEnrolOpen(false)
    setForm(emptyForm)
    setNotice(
      result.temporaryPassword
        ? `Intern enrolled. Temporary password: ${result.temporaryPassword}`
        : "Intern enrolled."
    )
    router.refresh()
  }

  async function handleEdit(event: React.FormEvent) {
    event.preventDefault()
    if (!editIntern) return
    setSaving(true)
    setNotice("")
    const result = await updateIntern({
      id: editIntern.id,
      name: form.name,
      email: form.email,
      programmeId: form.programmeId,
      supervisorId: form.supervisorId,
      startDate: form.startDate,
      endDate: form.endDate || form.startDate,
      status: form.status,
    })
    setSaving(false)
    if (result.error) {
      setNotice(result.error)
      return
    }
    setEditIntern(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Interns</h1>
          <p className="text-sm text-muted-foreground">
            Enrol, assign, and track interns across all programmes.
          </p>
          {notice ? (
            <p className="text-sm text-destructive">{notice}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            onClick={() => setCreateOpen(true)}
            className="shrink-0"
          >
            <UserRoundPlus />
            Create intern account
          </Button>
          <Button onClick={openEnrol} className="shrink-0">
            <Plus />
            Enrol intern
          </Button>
        </div>
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
                {[...new Set(programmes.map((item) => item.name.split(" · ")[0]))].map(
                  (programme) => (
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
                  )
                )}
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-4 py-3">
            <DialogTitle>Create intern account</DialogTitle>
            <DialogDescription>
              Admins create auth accounts here. Public signup is disabled.
            </DialogDescription>
          </DialogHeader>
          {createOpen ? (
            <AdminCreateUserForm
              defaultRole="intern"
              fixedRole
              onCancel={() => setCreateOpen(false)}
              onSuccess={() => router.refresh()}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={enrolOpen} onOpenChange={setEnrolOpen}>
        <DialogContent className="max-w-lg overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-4 py-3">
            <DialogTitle>Enrol intern</DialogTitle>
            <DialogDescription>
              Add a new intern to a programme and assign a supervisor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnrol} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <InternFormFields
                form={form}
                setForm={setForm}
                programmes={programmes}
                supervisors={supervisors}
              />
            </div>
            <DialogFooter className="shrink-0 p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEnrolOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
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
        <DialogContent className="max-w-lg overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-4 py-3">
            <DialogTitle>Edit intern</DialogTitle>
            <DialogDescription>
              Update programme placement, supervisor, or status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <InternFormFields
                form={form}
                setForm={setForm}
                programmes={programmes}
                supervisors={supervisors}
              />
            </div>
            <DialogFooter className="shrink-0 p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditIntern(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>Save changes</Button>
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
  programmes,
  supervisors,
}: {
  form: InternForm
  setForm: React.Dispatch<React.SetStateAction<InternForm>>
  programmes: NamedOption[]
  supervisors: NamedOption[]
}) {
  const programmeLabel =
    programmes.find((item) => item.id === form.programmeId)?.name ??
    "Select programme"
  const supervisorLabel =
    supervisors.find((item) => item.id === form.supervisorId)?.name ??
    "Unassigned"
  const triggerClass = cn(
    buttonVariants({ variant: "outline" }),
    "h-8 w-full justify-between rounded-sm px-2.5 font-normal"
  )

  return (
    <div className="grid gap-3 px-4 pt-4 pb-3">
      <FieldGroup className="grid grid-cols-1 gap-4">
        <Field className="min-w-0 flex-col">
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
        <Field className="min-w-0 flex-col">
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
        <Field className="min-w-0 flex-col">
          <FieldLabel>Programme</FieldLabel>
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass}>
              <span className="truncate">{programmeLabel}</span>
              <ChevronDown className="size-4 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-52">
              {programmes.map((programme) => (
                <DropdownMenuItem
                  key={programme.id}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, programmeId: programme.id }))
                  }
                  className="justify-between"
                >
                  {programme.name}
                  {form.programmeId === programme.id && (
                    <Check className="size-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Field>
        <Field className="min-w-0 flex-col">
          <FieldLabel>Supervisor</FieldLabel>
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass}>
              <span className="truncate">{supervisorLabel}</span>
              <ChevronDown className="size-4 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-52">
              {supervisors.map((supervisor) => (
                <DropdownMenuItem
                  key={supervisor.id || "unassigned"}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      supervisorId: supervisor.id,
                    }))
                  }
                  className="justify-between"
                >
                  {supervisor.name}
                  {form.supervisorId === supervisor.id && (
                    <Check className="size-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Field>
        <Field className="min-w-0 flex-col">
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
        <Field className="min-w-0 flex-col">
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
      </FieldGroup>
    </div>
  )
}
