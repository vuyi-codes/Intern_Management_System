import { cookies } from "next/headers"

import { requireRole } from "@/lib/auth"
import type { DailyLog, DailyLogStatus } from "@/lib/daily-logs"
import type { Intern, InternStatus } from "@/lib/interns"
import type {
  ReviewOutcome,
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
import { createClient } from "@/utils/supabase/server"

export type NamedIntern = { id: string; name: string }

export type SupervisorIntern = Intern & {
  openTasks: number
  pendingReviews: number
  lastLog: string
  focus: string
}

export type SupervisorTaskRecord = SupervisorTask & {
  internId: string
}

export type SupervisorLogRecord = DailyLog & {
  internId: string
}

export type SupervisorReviewRecord = SupervisorReview & {
  internId: string
}

export type SupervisorOverview = {
  internCount: number
  openTaskCount: number
  pendingReviewCount: number
  logsTodayCount: number
  bar: { month: string; tasks: number; reviews: number }[]
  pie: { name: string; value: number }[]
  activity: { title: string; detail: string; time: string; href: string }[]
  recentTasks: SupervisorTaskRecord[]
  supervisorName: string
}

function monthKey(value: string) {
  const date = new Date(value)
  return `${date.getFullYear()}-${date.getMonth()}`
}

function relativeTime(value: string) {
  const start = new Date(value)
  const now = new Date()
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayDiff = Math.round(
    (today.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000)
  )
  if (dayDiff <= 0) return "Today"
  if (dayDiff === 1) return "Yesterday"
  if (dayDiff < 7) return `${dayDiff} days ago`
  return start.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  })
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

async function db() {
  return createClient(await cookies())
}

async function assignedInternIds(supervisorId: string) {
  const supabase = await db()
  const { data, error } = await supabase
    .from("interns")
    .select("id")
    .eq("supervisor_id", supervisorId)
  if (error) return { ids: [] as string[], error: error.message }
  return { ids: (data ?? []).map((row) => row.id), error: null as string | null }
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
  names: Record<string, string>
): SupervisorTaskRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    intern: names[row.intern_id] ?? "Unknown",
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
  names: Record<string, string>
): SupervisorLogRecord {
  return {
    id: row.id,
    intern: names[row.intern_id] ?? "Unknown",
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

function mapReview(
  row: {
    id: string
    title: string
    summary: string
    type: string
    submitted_at: string | null
    due_date: string | null
    status: string
    outcome: string
    feedback: string
    intern_id: string
  },
  names: Record<string, string>
): SupervisorReviewRecord {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? "",
    intern: names[row.intern_id] ?? "Unknown",
    internId: row.intern_id,
    type: row.type as ReviewType,
    submittedAt: row.submitted_at ?? "",
    dueDate: row.due_date ?? "",
    status: row.status as ReviewStatus,
    outcome: row.outcome as ReviewOutcome,
    feedback: row.feedback ?? "",
  }
}

function namesFromInternRows(
  rows: {
    id: string
    profiles?:
      | { full_name?: string }
      | { full_name?: string }[]
      | null
  }[]
) {
  const names: Record<string, string> = {}
  for (const row of rows) {
    const person = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    names[row.id] = person?.full_name ?? "Unknown"
  }
  return names
}

export async function loadSupervisorInterns(): Promise<{
  interns: SupervisorIntern[]
  supervisorName: string
  error: string | null
}> {
  const profile = await requireRole("supervisor")
  const supabase = await db()
  const [internsResult, tasksResult, reviewsResult, logsResult] =
    await Promise.all([
      supabase
        .from("interns")
        .select(
          "id, start_date, end_date, progress, status, profiles!interns_id_fkey(full_name, email), programme:programmes(name)"
        )
        .eq("supervisor_id", profile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("id, title, status, intern_id, updated_at"),
      supabase.from("reviews").select("id, status, intern_id"),
      supabase
        .from("daily_logs")
        .select("intern_id, log_date, created_at")
        .order("log_date", { ascending: false }),
    ])

  const error =
    internsResult.error?.message ??
    tasksResult.error?.message ??
    reviewsResult.error?.message ??
    logsResult.error?.message ??
    null

  const internIds = new Set((internsResult.data ?? []).map((row) => row.id))
  const openTasksByIntern: Record<string, { count: number; title: string }> = {}
  for (const task of tasksResult.data ?? []) {
    if (!internIds.has(task.intern_id) || task.status === "Done") continue
    const current = openTasksByIntern[task.intern_id]
    openTasksByIntern[task.intern_id] = {
      count: (current?.count ?? 0) + 1,
      title: current?.title ?? task.title,
    }
  }

  const pendingReviewsByIntern: Record<string, number> = {}
  for (const review of reviewsResult.data ?? []) {
    if (!internIds.has(review.intern_id) || review.status === "Completed") continue
    pendingReviewsByIntern[review.intern_id] =
      (pendingReviewsByIntern[review.intern_id] ?? 0) + 1
  }

  const lastLogByIntern: Record<string, string> = {}
  for (const log of logsResult.data ?? []) {
    if (!internIds.has(log.intern_id) || lastLogByIntern[log.intern_id]) continue
    lastLogByIntern[log.intern_id] = relativeTime(log.log_date)
  }

  const interns: SupervisorIntern[] = (internsResult.data ?? []).map((row) => {
    const person = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    const programme = Array.isArray(row.programme) ? row.programme[0] : row.programme
    const open = openTasksByIntern[row.id]
    return {
      id: row.id,
      name: person?.full_name ?? "",
      email: person?.email ?? "",
      programme: programme?.name ?? "Unassigned",
      supervisor: profile.full_name,
      startDate: row.start_date ?? "",
      endDate: row.end_date ?? "",
      progress: row.progress ?? 0,
      status: row.status as InternStatus,
      openTasks: open?.count ?? 0,
      pendingReviews: pendingReviewsByIntern[row.id] ?? 0,
      lastLog:
        row.status === "Completed"
          ? "Completed"
          : (lastLogByIntern[row.id] ?? "—"),
      focus: open?.title ?? "General programme work",
    }
  })

  return { interns, supervisorName: profile.full_name, error }
}

export async function loadSupervisorTasks(): Promise<{
  tasks: SupervisorTaskRecord[]
  interns: NamedIntern[]
  supervisorName: string
  error: string | null
}> {
  const profile = await requireRole("supervisor")
  const supabase = await db()
  const { ids, error: idsError } = await assignedInternIds(profile.id)
  if (idsError) {
    return { tasks: [], interns: [], supervisorName: profile.full_name, error: idsError }
  }
  if (ids.length === 0) {
    return { tasks: [], interns: [], supervisorName: profile.full_name, error: null }
  }

  const [tasksResult, internsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, description, due_date, priority, status, intern_id")
      .in("intern_id", ids)
      .order("due_date", { ascending: true }),
    supabase
      .from("interns")
      .select("id, status, profiles!interns_id_fkey(full_name)")
      .eq("supervisor_id", profile.id)
      .order("created_at", { ascending: false }),
  ])

  const error =
    tasksResult.error?.message ?? internsResult.error?.message ?? null
  const names = namesFromInternRows(internsResult.data ?? [])
  const tasks = (tasksResult.data ?? []).map((row) => mapTask(row, names))
  const interns: NamedIntern[] = (internsResult.data ?? [])
    .filter((row) => row.status !== "Completed")
    .map((row) => ({
      id: row.id,
      name: names[row.id] ?? "Unknown",
    }))

  return { tasks, interns, supervisorName: profile.full_name, error }
}

export async function loadSupervisorLogs(): Promise<{
  logs: SupervisorLogRecord[]
  interns: NamedIntern[]
  supervisorName: string
  today: string
  error: string | null
}> {
  const profile = await requireRole("supervisor")
  const supabase = await db()
  const { ids, error: idsError } = await assignedInternIds(profile.id)
  const today = todayIso()
  if (idsError) {
    return {
      logs: [],
      interns: [],
      supervisorName: profile.full_name,
      today,
      error: idsError,
    }
  }
  if (ids.length === 0) {
    return {
      logs: [],
      interns: [],
      supervisorName: profile.full_name,
      today,
      error: null,
    }
  }

  const [logsResult, internsResult] = await Promise.all([
    supabase
      .from("daily_logs")
      .select(
        "id, log_date, hours, summary, blockers, tomorrow, status, mentor_note, intern_id"
      )
      .in("intern_id", ids)
      .order("log_date", { ascending: false }),
    supabase
      .from("interns")
      .select("id, status, profiles!interns_id_fkey(full_name)")
      .eq("supervisor_id", profile.id),
  ])

  const error =
    logsResult.error?.message ?? internsResult.error?.message ?? null
  const names = namesFromInternRows(internsResult.data ?? [])

  return {
    logs: (logsResult.data ?? []).map((row) => mapLog(row, names)),
    interns: (internsResult.data ?? [])
      .filter((row) => row.status !== "Completed")
      .map((row) => ({ id: row.id, name: names[row.id] ?? "Unknown" })),
    supervisorName: profile.full_name,
    today,
    error,
  }
}

export async function loadSupervisorReviews(): Promise<{
  reviews: SupervisorReviewRecord[]
  interns: NamedIntern[]
  supervisorName: string
  error: string | null
}> {
  const profile = await requireRole("supervisor")
  const supabase = await db()
  const { ids, error: idsError } = await assignedInternIds(profile.id)
  if (idsError) {
    return {
      reviews: [],
      interns: [],
      supervisorName: profile.full_name,
      error: idsError,
    }
  }
  if (ids.length === 0) {
    return {
      reviews: [],
      interns: [],
      supervisorName: profile.full_name,
      error: null,
    }
  }

  const [reviewsResult, internsResult] = await Promise.all([
    supabase
      .from("reviews")
      .select(
        "id, title, summary, type, submitted_at, due_date, status, outcome, feedback, intern_id"
      )
      .in("intern_id", ids)
      .order("due_date", { ascending: true }),
    supabase
      .from("interns")
      .select("id, status, profiles!interns_id_fkey(full_name)")
      .eq("supervisor_id", profile.id),
  ])

  const error =
    reviewsResult.error?.message ?? internsResult.error?.message ?? null
  const names = namesFromInternRows(internsResult.data ?? [])

  return {
    reviews: (reviewsResult.data ?? []).map((row) => mapReview(row, names)),
    interns: (internsResult.data ?? [])
      .filter((row) => row.status !== "Completed")
      .map((row) => ({ id: row.id, name: names[row.id] ?? "Unknown" })),
    supervisorName: profile.full_name,
    error,
  }
}

export async function loadSupervisorOverview(): Promise<{
  overview: SupervisorOverview
  error: string | null
}> {
  const profile = await requireRole("supervisor")
  const [interns, tasks, reviews, logs] = await Promise.all([
    loadSupervisorInterns(),
    loadSupervisorTasks(),
    loadSupervisorReviews(),
    loadSupervisorLogs(),
  ])
  const error =
    interns.error ?? tasks.error ?? reviews.error ?? logs.error ?? null

  const supabase = await db()
  const { ids } = await assignedInternIds(profile.id)
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, index) => {
    return new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
  })

  let taskCreated: { created_at: string | null }[] = []
  let reviewCreated: { created_at: string | null }[] = []
  if (ids.length > 0) {
    const [taskResult, reviewResult] = await Promise.all([
      supabase.from("tasks").select("created_at").in("intern_id", ids),
      supabase.from("reviews").select("created_at").in("intern_id", ids),
    ])
    taskCreated = taskResult.data ?? []
    reviewCreated = reviewResult.data ?? []
  }

  const bar = months.map((month) => {
    const key = `${month.getFullYear()}-${month.getMonth()}`
    return {
      month: month.toLocaleDateString("en-ZA", { month: "long" }),
      tasks: taskCreated.filter(
        (row) => row.created_at && monthKey(row.created_at) === key
      ).length,
      reviews: reviewCreated.filter(
        (row) => row.created_at && monthKey(row.created_at) === key
      ).length,
    }
  })

  const statusCounts: Record<string, number> = {
    "In progress": 0,
    Review: 0,
    Overdue: 0,
    Done: 0,
  }
  for (const task of tasks.tasks) {
    statusCounts[task.status] = (statusCounts[task.status] ?? 0) + 1
  }

  const pie = [
    { name: "In progress", value: statusCounts["In progress"] },
    { name: "Review", value: statusCounts.Review },
    { name: "Overdue", value: statusCounts.Overdue },
    { name: "Done", value: statusCounts.Done },
  ].filter((item) => item.value > 0)

  const activity: SupervisorOverview["activity"] = []
  for (const log of logs.logs.slice(0, 3)) {
    activity.push({
      title: `${log.intern} submitted a daily log`,
      detail: log.summary.slice(0, 80) || "Daily log update",
      time: relativeTime(log.date),
      href: "/supervisor/logs",
    })
  }
  for (const task of tasks.tasks
    .filter((item) => item.status === "Review")
    .slice(0, 2)) {
    activity.push({
      title: "Task ready for review",
      detail: `${task.title} — ${task.intern}`,
      time: relativeTime(task.dueDate || todayIso()),
      href: "/supervisor/reviews",
    })
  }

  return {
    error,
    overview: {
      internCount: interns.interns.filter((intern) => intern.status !== "Completed")
        .length,
      openTaskCount: tasks.tasks.filter((task) => task.status !== "Done").length,
      pendingReviewCount: reviews.reviews.filter(
        (review) => review.status !== "Completed"
      ).length,
      logsTodayCount: logs.logs.filter((log) => log.date === logs.today).length,
      bar,
      pie,
      activity: activity.slice(0, 3),
      recentTasks: tasks.tasks.slice(0, 12),
      supervisorName: profile.full_name,
    },
  }
}

export async function loadSupervisorSettings(): Promise<{
  settings: RoleSettings
  error: string | null
}> {
  const profile = await requireRole("supervisor")
  const supabase = await db()
  const defaults = getDefaultSettings("supervisor")
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
