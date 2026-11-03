"use client"

import * as React from "react"
import {
  Check,
  ChevronDown,
  ClipboardCheck,
  MoreHorizontal,
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
  formatReviewDate,
  getReviewsForSupervisor,
  REVIEW_OUTCOME_STYLES,
  REVIEW_STATUS_STYLES,
  REVIEW_TYPE_STYLES,
  type ReviewOutcome,
  type ReviewStatus,
  type ReviewType,
  type SupervisorReview,
} from "@/lib/reviews"
import { getUserForRole } from "@/lib/users"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 8

const STATUS_FILTERS: Array<"All" | ReviewStatus> = [
  "All",
  "Pending",
  "In progress",
  "Completed",
]

const TYPE_FILTERS: Array<"All" | ReviewType> = [
  "All",
  "Task",
  "Daily log",
  "Mid-programme",
  "Final",
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

export function SupervisorReviewsManager() {
  const supervisor = getUserForRole("supervisor")
  const myInterns = React.useMemo(
    () => getInternsForSupervisor(supervisor.name),
    [supervisor.name]
  )
  const internNames = React.useMemo(
    () => myInterns.map((intern) => intern.name),
    [myInterns]
  )

  const [reviewList, setReviewList] = React.useState<SupervisorReview[]>(() =>
    getReviewsForSupervisor(supervisor.name)
  )
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_FILTERS)[number]>("All")
  const [typeFilter, setTypeFilter] =
    React.useState<(typeof TYPE_FILTERS)[number]>("All")
  const [internFilter, setInternFilter] = React.useState("All")
  const [page, setPage] = React.useState(1)
  const [activeReview, setActiveReview] =
    React.useState<SupervisorReview | null>(null)
  const [feedback, setFeedback] = React.useState("")
  const [outcome, setOutcome] = React.useState<ReviewOutcome>("Approved")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    setReviewList(getReviewsForSupervisor(supervisor.name))
  }, [supervisor.name])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return reviewList.filter((review) => {
      const matchesQuery =
        !q ||
        review.title.toLowerCase().includes(q) ||
        review.intern.toLowerCase().includes(q) ||
        review.summary.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === "All" || review.status === statusFilter
      const matchesType = typeFilter === "All" || review.type === typeFilter
      const matchesIntern =
        internFilter === "All" || review.intern === internFilter
      return matchesQuery && matchesStatus && matchesType && matchesIntern
    })
  }, [internFilter, query, reviewList, statusFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [query, statusFilter, typeFilter, internFilter])

  const counts = React.useMemo(() => {
    return {
      total: reviewList.length,
      pending: reviewList.filter((review) => review.status === "Pending")
        .length,
      inProgress: reviewList.filter(
        (review) => review.status === "In progress"
      ).length,
      completed: reviewList.filter((review) => review.status === "Completed")
        .length,
    }
  }, [reviewList])

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  function openReview(review: SupervisorReview) {
    setActiveReview(review)
    setFeedback(review.feedback)
    setOutcome(
      review.outcome === "Pending" ? "Approved" : review.outcome
    )
  }

  function updateStatus(id: string, status: ReviewStatus) {
    setReviewList((prev) =>
      prev.map((review) =>
        review.id === id
          ? {
              ...review,
              status,
              outcome:
                status === "Completed" && review.outcome === "Pending"
                  ? "Approved"
                  : review.outcome,
            }
          : review
      )
    )
  }

  function handleSubmitFeedback(event: React.FormEvent) {
    event.preventDefault()
    if (!activeReview || !feedback.trim()) return

    setSaving(true)
    window.setTimeout(() => {
      setReviewList((prev) =>
        prev.map((review) =>
          review.id === activeReview.id
            ? {
                ...review,
                feedback: feedback.trim(),
                outcome,
                status: "Completed",
              }
            : review
        )
      )
      setSaving(false)
      setActiveReview(null)
    }, 400)
  }

  const triggerClass = cn(
    buttonVariants({ variant: "outline" }),
    "h-8 w-full justify-between rounded-sm px-2.5 font-normal"
  )

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Give feedback on tasks, logs, and checkpoints for{" "}
          {supervisor.name}&apos;s interns.
        </p>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total reviews"
          value={counts.total}
          hint="Across your roster"
        />
        <StatCard
          label="Pending"
          value={counts.pending}
          hint="Awaiting your feedback"
        />
        <StatCard
          label="In progress"
          value={counts.inProgress}
          hint="Started but not finished"
        />
        <StatCard
          label="Completed"
          value={counts.completed}
          hint="Feedback submitted"
        />
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>Review queue</CardTitle>
            <CardDescription>
              Search by title, intern, or summary.
            </CardDescription>
          </div>
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search reviews..."
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
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(triggerClass, "lg:w-40")}>
                <span className="truncate">
                  {typeFilter === "All" ? "All types" : typeFilter}
                </span>
                <ChevronDown className="size-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                {TYPE_FILTERS.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className="justify-between"
                  >
                    {type === "All" ? "All types" : type}
                    {typeFilter === type && <Check className="size-4" />}
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
                <TableHead className="min-w-44 pl-4 sm:pl-0">Review</TableHead>
                <TableHead>Intern</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Outcome</TableHead>
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
                    No reviews match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="max-w-[16rem] pl-4 sm:pl-0">
                      <div className="min-w-0 overflow-hidden">
                        <p className="truncate font-medium">{review.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {review.summary}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[10rem] truncate">
                      {review.intern}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span
                        className={cn(
                          "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                          REVIEW_TYPE_STYLES[review.type]
                        )}
                      >
                        {review.type}
                      </span>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap sm:table-cell">
                      {formatReviewDate(review.dueDate)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                          REVIEW_STATUS_STYLES[review.status]
                        )}
                      >
                        {review.status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span
                        className={cn(
                          "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                          REVIEW_OUTCOME_STYLES[review.outcome]
                        )}
                      >
                        {review.outcome}
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
                          aria-label={`Actions for ${review.title}`}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openReview(review)}>
                            {review.status === "Completed"
                              ? "View feedback"
                              : "Write feedback"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus(review.id, "In progress")
                            }
                          >
                            Mark in progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(review.id, "Pending")}
                          >
                            Mark pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus(review.id, "Completed")
                            }
                          >
                            Mark completed
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
        open={Boolean(activeReview)}
        onOpenChange={(open) => {
          if (!open) setActiveReview(null)
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-lg flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-4 py-2.5">
            <DialogTitle>
              {activeReview?.status === "Completed"
                ? "Review feedback"
                : "Write feedback"}
            </DialogTitle>
            <DialogDescription>
              {activeReview
                ? `${activeReview.type} · ${activeReview.intern}`
                : "Submit mentor feedback"}
            </DialogDescription>
          </DialogHeader>

          {activeReview && (
            <form
              onSubmit={handleSubmitFeedback}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                <div className="min-w-0 rounded-sm border border-border p-3">
                  <p className="font-medium wrap-break-word">
                    {activeReview.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground wrap-break-word">
                    {activeReview.summary}
                  </p>
                  <div className="mt-3 grid gap-2 text-sm">
                    <DetailRow
                      label="Submitted"
                      value={formatReviewDate(activeReview.submittedAt)}
                    />
                    <DetailRow
                      label="Due"
                      value={formatReviewDate(activeReview.dueDate)}
                    />
                    <DetailRow label="Type" value={activeReview.type} />
                  </div>
                </div>

                <FieldGroup className="gap-3">
                  <Field>
                    <FieldLabel>Outcome</FieldLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={triggerClass}
                        disabled={activeReview.status === "Completed" && !feedback}
                      >
                        <span>{outcome}</span>
                        <ChevronDown className="size-4 opacity-60" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="min-w-40">
                        {(["Approved", "Needs changes"] as const).map(
                          (value) => (
                            <DropdownMenuItem
                              key={value}
                              onClick={() => setOutcome(value)}
                              className="justify-between"
                            >
                              {value}
                              {outcome === value && (
                                <Check className="size-4" />
                              )}
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="review-feedback">Feedback</FieldLabel>
                    <Textarea
                      id="review-feedback"
                      value={feedback}
                      onChange={(event) => setFeedback(event.target.value)}
                      rows={5}
                      required
                      className="max-h-40 min-h-24 resize-none overflow-y-auto rounded-sm field-sizing-fixed wrap-break-word"
                      placeholder="Share clear, actionable feedback for the intern."
                    />
                  </Field>
                </FieldGroup>
              </div>

              <DialogFooter className="shrink-0 p-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveReview(null)}
                >
                  Close
                </Button>
                <Button type="submit" disabled={saving || !feedback.trim()}>
                  <ClipboardCheck />
                  {saving ? "Saving..." : "Submit feedback"}
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
