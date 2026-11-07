import { cookies } from "next/headers"

import { requireRole } from "@/lib/auth"
import type { DailyLog, DailyLogStatus } from "@/lib/daily-logs"
import type { InternProfileDetails } from "@/lib/intern-profile"
import type { Intern, InternStatus } from "@/lib/interns"
import type {
  ModuleStatus,
  ProgrammeModule,
  ProgressMilestone,
} from "@/lib/progress"
import type {
  ReviewStatus,
  ReviewType,
  SupervisorReview,
} from "@/lib/reviews"
import { getDefaultSettings, type RoleSettings } from "@/lib/settings"
import type {
  SupervisorTask,
  TaskPriority,
  TaskStatus,
} from "@/lib/tasks"
import type { AppUser } from "@/lib/users"
import { createClient } from "@/utils/supabase/server"

export type InternTaskRecord = SupervisorTask & {
  internId: string
}

export type InternLogRecord = DailyLog & {
  internId: string
}

export type InternProgressView = {
  intern: Intern | null
  modules: ProgrammeModule[]
  overall: number
  completedModules: number
  activeModules: number
  moduleCount: number
  tasksDone: number
  tasksTotal: number
  reviewsDone: number
  reviewsTotal: number
  milestones: ProgressMilestone[]
  tasks: InternTaskRecord[]
  trend: { month: string; completion: number }[]
  pie: { name: string; value: number }[]
  internName: string
}

export type InternOverview = {
  taskCount: number
  tasksDueThisWeek: number
  logsThisMonth: number
  progress: number
  pie: { name: string; value: number }[]
  activity: { title: string; detail: string; time: string; href: string }[]
  recentTasks: InternTaskRecord[]
  internName: string
}

export type InternProfileView = {
  user: AppUser
  placement: Intern | null
  details: InternProfileDetails
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function relativeTime(value: string) {
  const start = new Date(value)
  const now = new Date()
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayDiff = Math.round(
    (today.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000)
  )
  if (dayDiff <= 0) {
    const minutes = Math.max(
      0,
      Math.round((now.getTime() - start.getTime()) / 60000)
    )
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.round(minutes / 60)
    return `${hours}h ago`
  }
  if (dayDiff === 1) return "Yesterday"
  if (dayDiff < 7) return `${dayDiff} days ago`
  return start.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  })
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
}

async function db() {
  return createClient(await cookies())
}

function mapTask(
  row: {
    id: string
    title: string
    description: string
    due_date: string | null
    priority: string
    status: string
    intern_id: string
  },
  internName: string
): InternTaskRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    intern: internName,
    internId: row.intern_id,
    dueDate: row.due_date ?? "",
    priority: row.priority as TaskPriority,
    status: row.status as TaskStatus,
  }
}

function mapLog(
  row: {
    id: string
    log_date: string
    hours: number
    summary: string
    blockers: string
    tomorrow: string
    status: string
    mentor_note: string
    intern_id: string
  },
  internName: string
): InternLogRecord {
  return {
    id: row.id,
    intern: internName,
    internId: row.intern_id,
    date: row.log_date,
    hours: Number(row.hours ?? 0),
    summary: row.summary ?? "",
    blockers: row.blockers ?? "",
    tomorrow: row.tomorrow ?? "",
    status: row.status as DailyLogStatus,
    mentorNote: row.mentor_note ?? "",
  }
}

function mapModule(row: {
  id: string
  title: string
  description: string
  progress: number
  status: string
  due_date: string | null
}): ProgrammeModule {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    progress: row.progress ?? 0,
    status: row.status as ModuleStatus,
    dueDate: row.due_date ?? "",
  }
}

async function loadPlacement(internId: string): Promise<{
  placement: Intern | null
  error: string | null
}> {
  const supabase = await db()
  const { data, error } = await supabase
    .from("interns")
    .select(
      "id, start_date, end_date, progress, status, profiles!interns_id_fkey(full_name, email), programme:programmes(name), mentor:profiles!interns_supervisor_id_fkey(full_name)"
    )
    .eq("id", internId)
    .maybeSingle()

  if (error) return { placement: null, error: error.message }
  if (!data) return { placement: null, error: null }

  const person = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
  const programme = Array.isArray(data.programme) ? data.programme[0] : data.programme
  const mentor = Array.isArray(data.mentor) ? data.mentor[0] : data.mentor

  return {
    error: null,
    placement: {
      id: data.id,
      name: person?.full_name ?? "",
      email: person?.email ?? "",
      programme: programme?.name ?? "Unassigned",
      supervisor: mentor?.full_name ?? "Unassigned",
      startDate: data.start_date ?? "",
      endDate: data.end_date ?? "",
      progress: data.progress ?? 0,
      status: data.status as InternStatus,
    },
  }
}

export async function loadInternTasks(): Promise<{
  tasks: InternTaskRecord[]
  internName: string
  error: string | null
}> {
  const profile = await requireRole("intern")
  const supabase = await db()
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, description, due_date, priority, status, intern_id")
    .eq("intern_id", profile.id)
    .order("due_date", { ascending: true })

  return {
    internName: profile.full_name,
    error: error?.message ?? null,
    tasks: (data ?? []).map((row) => mapTask(row, profile.full_name)),
  }
}

export async function loadInternLogs(): Promise<{
  logs: InternLogRecord[]
  internName: string
  today: string
  error: string | null
}> {
  const profile = await requireRole("intern")
  const supabase = await db()
  const today = todayIso()
  const { data, error } = await supabase
    .from("daily_logs")
    .select(
      "id, log_date, hours, summary, blockers, tomorrow, status, mentor_note, intern_id"
    )
    .eq("intern_id", profile.id)
    .order("log_date", { ascending: false })

  return {
    internName: profile.full_name,
    today,
    error: error?.message ?? null,
    logs: (data ?? []).map((row) => mapLog(row, profile.full_name)),
  }
}

export async function loadInternProgress(): Promise<{
  progress: InternProgressView
  error: string | null
}> {
  const profile = await requireRole("intern")
  const supabase = await db()
  const [placementResult, modulesResult, tasksResult, reviewsResult] =
    await Promise.all([
      loadPlacement(profile.id),
      supabase
        .from("programme_modules")
        .select("id, title, description, progress, status, due_date")
        .eq("intern_id", profile.id)
        .order("due_date", { ascending: true }),
      supabase
        .from("tasks")
        .select("id, title, description, due_date, priority, status, intern_id")
        .eq("intern_id", profile.id)
        .order("due_date", { ascending: true }),
      supabase
        .from("reviews")
        .select(
          "id, title, summary, type, submitted_at, due_date, status, outcome, feedback, intern_id"
        )
        .eq("intern_id", profile.id)
        .order("submitted_at", { ascending: false }),
    ])

  const error =
    placementResult.error ??
    modulesResult.error?.message ??
    tasksResult.error?.message ??
    reviewsResult.error?.message ??
    null

  const modules = (modulesResult.data ?? []).map(mapModule)
  const tasks = (tasksResult.data ?? []).map((row) =>
    mapTask(row, profile.full_name)
  )
  const reviews = (reviewsResult.data ?? []).map(
    (row): SupervisorReview => ({
      id: row.id,
      title: row.title,
      summary: row.summary ?? "",
      intern: profile.full_name,
      type: row.type as ReviewType,
      submittedAt: row.submitted_at ?? "",
      dueDate: row.due_date ?? "",
      status: row.status as ReviewStatus,
      outcome: (row.outcome as SupervisorReview["outcome"]) ?? "Pending",
      feedback: row.feedback ?? "",
    })
  )

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

  const milestones = [...fromModules, ...fromReviews, ...fromTasks]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)

  const now = new Date()
  const months = Array.from({ length: 6 }, (_, index) => {
    return new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
  })
  const trend = months.map((month) => {
    const cutoff = endOfMonth(month)
    const relevant = modules.filter((module) => {
      if (!module.dueDate) return false
      return new Date(module.dueDate) <= cutoff
    })
    const completion =
      relevant.length === 0
        ? 0
        : Math.round(
            relevant.reduce((sum, module) => {
              if (module.status === "Completed") return sum + 100
              return sum + module.progress
            }, 0) / relevant.length
          )
    return {
      month: month.toLocaleDateString("en-ZA", { month: "short" }),
      completion,
    }
  })

  const statusCounts = {
    "In progress": 0,
    Review: 0,
    Overdue: 0,
    Done: 0,
  }
  for (const task of tasks) {
    statusCounts[task.status] = (statusCounts[task.status] ?? 0) + 1
  }

  return {
    error,
    progress: {
      intern: placementResult.placement,
      modules,
      overall: placementResult.placement?.progress ?? 0,
      completedModules,
      activeModules,
      moduleCount: modules.length,
      tasksDone,
      tasksTotal: tasks.length,
      reviewsDone,
      reviewsTotal: reviews.length,
      milestones,
      tasks,
      trend,
      pie: [
        { name: "In progress", value: statusCounts["In progress"] },
        { name: "Review", value: statusCounts.Review },
        { name: "Overdue", value: statusCounts.Overdue },
        { name: "Done", value: statusCounts.Done },
      ].filter((item) => item.value > 0),
      internName: profile.full_name,
    },
  }
}

export async function loadInternOverview(): Promise<{
  overview: InternOverview
  error: string | null
}> {
  const profile = await requireRole("intern")
  const [tasks, logs, placement] = await Promise.all([
    loadInternTasks(),
    loadInternLogs(),
    loadPlacement(profile.id),
  ])
  const error = tasks.error ?? logs.error ?? placement.error

  const today = new Date()
  const weekEnd = new Date(today)
  weekEnd.setDate(today.getDate() + 7)
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`

  const statusCounts = {
    "In progress": 0,
    Review: 0,
    Overdue: 0,
    Done: 0,
  }
  for (const task of tasks.tasks) {
    statusCounts[task.status] = (statusCounts[task.status] ?? 0) + 1
  }

  const activity: InternOverview["activity"] = []
  for (const task of tasks.tasks
    .filter((item) => item.status === "In progress" || item.status === "Review")
    .slice(0, 2)) {
    activity.push({
      title:
        task.status === "Review"
          ? "Task ready for review"
          : "Task marked in progress",
      detail: task.title,
      time: relativeTime(task.dueDate || todayIso()),
      href: "/intern/tasks",
    })
  }
  for (const log of logs.logs.slice(0, 2)) {
    activity.push({
      title: "Daily log submitted",
      detail: log.summary.slice(0, 80) || "Daily log update",
      time: relativeTime(log.date),
      href: "/intern/daily-log",
    })
  }
  if (placement.placement) {
    activity.push({
      title: "Progress updated",
      detail: `${placement.placement.programme} — ${placement.placement.progress}% complete`,
      time: relativeTime(placement.placement.startDate || todayIso()),
      href: "/intern/progress",
    })
  }

  return {
    error,
    overview: {
      taskCount: tasks.tasks.filter((task) => task.status !== "Done").length,
      tasksDueThisWeek: tasks.tasks.filter((task) => {
        if (!task.dueDate || task.status === "Done") return false
        const due = new Date(task.dueDate)
        return due >= today && due <= weekEnd
      }).length,
      logsThisMonth: logs.logs.filter((log) =>
        log.date.startsWith(monthKey)
      ).length,
      progress: placement.placement?.progress ?? 0,
      pie: [
        { name: "In progress", value: statusCounts["In progress"] },
        { name: "Review", value: statusCounts.Review },
        { name: "Overdue", value: statusCounts.Overdue },
        { name: "Done", value: statusCounts.Done },
      ].filter((item) => item.value > 0),
      activity: activity.slice(0, 3),
      recentTasks: tasks.tasks.filter((task) => task.status !== "Done").slice(0, 12),
      internName: profile.full_name,
    },
  }
}

export async function loadInternProfilePage(): Promise<{
  profile: InternProfileView
  error: string | null
}> {
  const user = await requireRole("intern")
  const supabase = await db()
  const [placement, detailsResult] = await Promise.all([
    loadPlacement(user.id),
    supabase
      .from("intern_profiles")
      .select(
        "bio, skills, location, university, linkedin, github, emergency_name, emergency_phone"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
  ])

  const row = detailsResult.data
  return {
    error: placement.error ?? detailsResult.error?.message ?? null,
    profile: {
      user: {
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        title: user.title,
        department: user.department,
        avatar: user.avatar_url ?? undefined,
      },
      placement: placement.placement,
      details: {
        bio: row?.bio ?? "",
        skills: row?.skills ?? [],
        location: row?.location ?? "",
        university: row?.university ?? "",
        linkedin: row?.linkedin ?? "",
        github: row?.github ?? "",
        emergencyName: row?.emergency_name ?? "",
        emergencyPhone: row?.emergency_phone ?? "",
      },
    },
  }
}

export async function loadInternSettings(): Promise<{
  settings: RoleSettings
  error: string | null
}> {
  const profile = await requireRole("intern")
  const supabase = await db()
  const defaults = getDefaultSettings("intern")
  const { data, error } = await supabase
    .from("user_settings")
    .select("notifications, preferences, privacy")
    .eq("user_id", profile.id)
    .maybeSingle()

  return {
    error: error?.message ?? null,
    settings: {
      notifications: {
        ...defaults.notifications,
        ...((data?.notifications ?? {}) as RoleSettings["notifications"]),
      },
      preferences: {
        ...defaults.preferences,
        ...((data?.preferences ?? {}) as RoleSettings["preferences"]),
      },
      privacy: {
        ...defaults.privacy,
        ...((data?.privacy ?? {}) as RoleSettings["privacy"]),
      },
    },
  }
}
