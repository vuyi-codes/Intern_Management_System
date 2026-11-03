import { interns, type Intern } from "@/lib/interns"
import { getTasksForIntern } from "@/lib/tasks"
import { supervisorReviews } from "@/lib/reviews"

export type ModuleStatus = "Completed" | "In progress" | "Upcoming" | "Blocked"

export type ProgrammeModule = {
  id: string
  title: string
  description: string
  progress: number
  status: ModuleStatus
  dueDate: string
}

export type ProgressMilestone = {
  id: string
  title: string
  detail: string
  date: string
  kind: "Module" | "Review" | "Task"
}

export const MODULE_STATUS_STYLES: Record<ModuleStatus, string> = {
  Completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  "In progress": "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  Upcoming: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400",
  Blocked: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
}

const modulesByIntern: Record<string, ProgrammeModule[]> = {
  "Nomsa Khumalo": [
    {
      id: "mod-001",
      title: "Onboarding & tooling",
      description: "Environment setup, repo access, and first-week checklist.",
      progress: 100,
      status: "Completed",
      dueDate: "2026-01-26",
    },
    {
      id: "mod-002",
      title: "Frontend foundations",
      description: "Layout systems, forms, and shared UI primitives.",
      progress: 100,
      status: "Completed",
      dueDate: "2026-02-20",
    },
    {
      id: "mod-003",
      title: "Dashboard delivery",
      description: "Intern overview, charts, and responsive task boards.",
      progress: 72,
      status: "In progress",
      dueDate: "2026-04-10",
    },
    {
      id: "mod-004",
      title: "API integration",
      description: "Connect dashboard views to programme and task endpoints.",
      progress: 35,
      status: "In progress",
      dueDate: "2026-05-08",
    },
    {
      id: "mod-005",
      title: "Testing & quality",
      description: "Component tests, accessibility checks, and QA walkthrough.",
      progress: 0,
      status: "Upcoming",
      dueDate: "2026-06-05",
    },
    {
      id: "mod-006",
      title: "Final showcase",
      description: "Demo prep, reflection notes, and programme close-out.",
      progress: 0,
      status: "Upcoming",
      dueDate: "2026-07-10",
    },
  ],
}

export const progressTrend = [
  { month: "Jan", completion: 12 },
  { month: "Feb", completion: 28 },
  { month: "Mar", completion: 48 },
  { month: "Apr", completion: 68 },
  { month: "May", completion: 68 },
  { month: "Jun", completion: 68 },
]

export function formatProgressDate(value: string) {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function getInternRecord(name: string): Intern | undefined {
  return interns.find((intern) => intern.name === name)
}

export function getModulesForIntern(name: string) {
  return modulesByIntern[name] ?? []
}

export function getProgressSummary(name: string) {
  const intern = getInternRecord(name)
  const modules = getModulesForIntern(name)
  const tasks = getTasksForIntern(name)
  const reviews = supervisorReviews.filter((review) => review.intern === name)

  const completedModules = modules.filter(
    (module) => module.status === "Completed"
  ).length
  const activeModules = modules.filter(
    (module) => module.status === "In progress"
  ).length
  const tasksDone = tasks.filter((task) => task.status === "Done").length
  const reviewsDone = reviews.filter(
    (review) => review.status === "Completed"
  ).length

  return {
    intern,
    modules,
    overall: intern?.progress ?? 0,
    completedModules,
    activeModules,
    moduleCount: modules.length,
    tasksDone,
    tasksTotal: tasks.length,
    reviewsDone,
    reviewsTotal: reviews.length,
  }
}

export function getMilestonesForIntern(name: string): ProgressMilestone[] {
  const modules = getModulesForIntern(name)
  const reviews = supervisorReviews.filter((review) => review.intern === name)
  const tasks = getTasksForIntern(name)

  const fromModules = modules
    .filter((module) => module.status === "Completed" || module.progress > 0)
    .map((module) => ({
      id: module.id,
      title: module.title,
      detail:
        module.status === "Completed"
          ? "Module completed"
          : `${module.progress}% complete`,
      date: module.dueDate,
      kind: "Module" as const,
    }))

  const fromReviews = reviews.map((review) => ({
    id: review.id,
    title: review.title,
    detail: `${review.type} · ${review.status}`,
    date: review.submittedAt,
    kind: "Review" as const,
  }))

  const fromTasks = tasks
    .filter((task) => task.status === "Done" || task.status === "Review")
    .slice(0, 4)
    .map((task) => ({
      id: task.id,
      title: task.title,
      detail: `Task · ${task.status}`,
      date: task.dueDate,
      kind: "Task" as const,
    }))

  return [...fromModules, ...fromReviews, ...fromTasks]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)
}
