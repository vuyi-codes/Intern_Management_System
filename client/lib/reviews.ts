import { getInternsForSupervisor } from "@/lib/interns"

export type ReviewType = "Task" | "Daily log" | "Mid-programme" | "Final"
export type ReviewStatus = "Pending" | "In progress" | "Completed"
export type ReviewOutcome = "Approved" | "Needs changes" | "Pending"

export type SupervisorReview = {
  id: string
  title: string
  summary: string
  intern: string
  type: ReviewType
  submittedAt: string
  dueDate: string
  status: ReviewStatus
  outcome: ReviewOutcome
  feedback: string
}

export const REVIEW_STATUS_STYLES: Record<ReviewStatus, string> = {
  Pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  "In progress": "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  Completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
}

export const REVIEW_TYPE_STYLES: Record<ReviewType, string> = {
  Task: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  "Daily log": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  "Mid-programme": "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  Final: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
}

export const REVIEW_OUTCOME_STYLES: Record<ReviewOutcome, string> = {
  Approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  "Needs changes": "bg-red-500/15 text-red-700 dark:text-red-400",
  Pending: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400",
}

export const supervisorReviews: SupervisorReview[] = [
  {
    id: "rev-001",
    title: "API auth middleware",
    summary: "Route protection and usage notes submitted for mentor review.",
    intern: "Lerato Dlamini",
    type: "Task",
    submittedAt: "2026-04-01",
    dueDate: "2026-04-03",
    status: "Pending",
    outcome: "Pending",
    feedback: "",
  },
  {
    id: "rev-002",
    title: "Login form validation",
    summary: "Client and server validation updates ready for feedback.",
    intern: "Ethan Jacobs",
    type: "Task",
    submittedAt: "2026-04-02",
    dueDate: "2026-04-04",
    status: "Pending",
    outcome: "Pending",
    feedback: "",
  },
  {
    id: "rev-003",
    title: "Weekly progress notes",
    summary: "Mid-week reflection covering blockers and completed work.",
    intern: "Nomsa Khumalo",
    type: "Daily log",
    submittedAt: "2026-04-02",
    dueDate: "2026-04-03",
    status: "In progress",
    outcome: "Pending",
    feedback: "Solid progress notes. Add one concrete next step for Friday.",
  },
  {
    id: "rev-004",
    title: "Mid-programme checkpoint",
    summary: "Written feedback on frontend module progress and goals.",
    intern: "Nomsa Khumalo",
    type: "Mid-programme",
    submittedAt: "2026-03-28",
    dueDate: "2026-04-05",
    status: "Pending",
    outcome: "Pending",
    feedback: "",
  },
  {
    id: "rev-005",
    title: "Database seed script",
    summary: "Seed coverage and sample fixtures submitted after overdue push.",
    intern: "Zanele Botha",
    type: "Task",
    submittedAt: "2026-04-01",
    dueDate: "2026-04-02",
    status: "Pending",
    outcome: "Pending",
    feedback: "",
  },
  {
    id: "rev-006",
    title: "Onboarding checklist",
    summary: "First-week setup reflection and checklist evidence.",
    intern: "Lerato Dlamini",
    type: "Daily log",
    submittedAt: "2026-03-30",
    dueDate: "2026-04-01",
    status: "Completed",
    outcome: "Approved",
    feedback: "Clear checklist. Keep the same structure for next week.",
  },
  {
    id: "rev-007",
    title: "Frontend module wrap-up",
    summary: "Final module review before cohort completion.",
    intern: "Amina Ndlovu",
    type: "Final",
    submittedAt: "2026-03-18",
    dueDate: "2026-03-22",
    status: "Completed",
    outcome: "Approved",
    feedback: "Strong close-out. Ready for alumni showcase notes.",
  },
  {
    id: "rev-008",
    title: "Component library polish",
    summary: "Spacing and token alignment for shared UI components.",
    intern: "Ethan Jacobs",
    type: "Task",
    submittedAt: "2026-04-03",
    dueDate: "2026-04-06",
    status: "In progress",
    outcome: "Needs changes",
    feedback: "Tighten button padding examples and add one before/after screenshot.",
  },
  {
    id: "rev-009",
    title: "Integration tests coverage",
    summary: "Auth and enrolment edge cases ready for mentor sign-off.",
    intern: "Zanele Botha",
    type: "Task",
    submittedAt: "2026-04-03",
    dueDate: "2026-04-07",
    status: "Pending",
    outcome: "Pending",
    feedback: "",
  },
  {
    id: "rev-010",
    title: "Mid-programme checkpoint",
    summary: "Backend track progress and learning goals review.",
    intern: "Zanele Botha",
    type: "Mid-programme",
    submittedAt: "2026-04-01",
    dueDate: "2026-04-08",
    status: "Pending",
    outcome: "Pending",
    feedback: "",
  },
]

export function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function getReviewsForSupervisor(supervisorName: string) {
  const assignedNames = new Set(
    getInternsForSupervisor(supervisorName).map((intern) => intern.name)
  )
  return supervisorReviews.filter((review) => assignedNames.has(review.intern))
}
