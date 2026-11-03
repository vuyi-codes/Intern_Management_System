import { getInternsForSupervisor } from "@/lib/interns"

export type TaskStatus = "In progress" | "Review" | "Overdue" | "Done"
export type TaskPriority = "High" | "Medium" | "Low"

export type SupervisorTask = {
  id: string
  title: string
  description: string
  intern: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
}

export const TASK_STATUS_STYLES: Record<TaskStatus, string> = {
  "In progress": "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  Review: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Overdue: "bg-red-500/15 text-red-700 dark:text-red-400",
  Done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
}

export const TASK_PRIORITY_STYLES: Record<TaskPriority, string> = {
  High: "bg-red-500/15 text-red-700 dark:text-red-400",
  Medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Low: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400",
}

export const supervisorTasks: SupervisorTask[] = [
  {
    id: "tsk-001",
    title: "API auth middleware",
    description: "Secure route handlers and document usage for the backend module.",
    intern: "Lerato Dlamini",
    dueDate: "2026-04-02",
    priority: "High",
    status: "Review",
  },
  {
    id: "tsk-002",
    title: "Build intern overview page",
    description: "Finish layout, stats cards, and activity feed for the intern dashboard.",
    intern: "Nomsa Khumalo",
    dueDate: "2026-04-02",
    priority: "High",
    status: "In progress",
  },
  {
    id: "tsk-003",
    title: "Database seed script",
    description: "Add seed data for programmes, interns, and sample tasks.",
    intern: "Zanele Botha",
    dueDate: "2026-03-30",
    priority: "High",
    status: "Overdue",
  },
  {
    id: "tsk-004",
    title: "Login form validation",
    description: "Improve client and server validation messaging on login.",
    intern: "Ethan Jacobs",
    dueDate: "2026-04-07",
    priority: "Low",
    status: "Review",
  },
  {
    id: "tsk-005",
    title: "Fix sidebar nav states",
    description: "Correct active states for nested supervisor and intern routes.",
    intern: "Nomsa Khumalo",
    dueDate: "2026-04-01",
    priority: "High",
    status: "Done",
  },
  {
    id: "tsk-006",
    title: "Write integration tests",
    description: "Cover auth middleware and enrolment edge cases.",
    intern: "Zanele Botha",
    dueDate: "2026-04-04",
    priority: "High",
    status: "In progress",
  },
  {
    id: "tsk-007",
    title: "Component library polish",
    description: "Align button and form spacing with the design system.",
    intern: "Ethan Jacobs",
    dueDate: "2026-04-03",
    priority: "Medium",
    status: "In progress",
  },
  {
    id: "tsk-008",
    title: "Onboarding checklist",
    description: "Complete first-week setup tasks and submit reflection notes.",
    intern: "Lerato Dlamini",
    dueDate: "2026-04-05",
    priority: "Medium",
    status: "In progress",
  },
  {
    id: "tsk-009",
    title: "Weekly progress notes",
    description: "Summarise blockers and wins for mid-week check-in.",
    intern: "Nomsa Khumalo",
    dueDate: "2026-04-03",
    priority: "Medium",
    status: "Review",
  },
  {
    id: "tsk-010",
    title: "Prepare demo walkthrough",
    description: "Script a short demo of the intern dashboard for review day.",
    intern: "Ethan Jacobs",
    dueDate: "2026-04-10",
    priority: "Medium",
    status: "In progress",
  },
  {
    id: "tsk-011",
    title: "Frontend module quiz",
    description: "Complete the frontend checkpoint quiz before the milestone sync.",
    intern: "Amina Ndlovu",
    dueDate: "2026-03-20",
    priority: "High",
    status: "Done",
  },
  {
    id: "tsk-012",
    title: "Document component patterns",
    description: "Write short usage notes for shared UI primitives.",
    intern: "Zanele Botha",
    dueDate: "2026-04-09",
    priority: "Low",
    status: "In progress",
  },
]

export function formatTaskDate(value: string) {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function getTasksForSupervisor(supervisorName: string) {
  const assignedNames = new Set(
    getInternsForSupervisor(supervisorName).map((intern) => intern.name)
  )
  return supervisorTasks.filter((task) => assignedNames.has(task.intern))
}
