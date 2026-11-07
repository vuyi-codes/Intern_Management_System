import { cookies } from "next/headers"

import type { Intern, InternStatus } from "@/lib/interns"
import type { Programme, ProgrammeStatus } from "@/lib/programmes"
import { buildReportViews, type ReportView } from "@/lib/reports"
import { getDefaultSettings, type RoleSettings } from "@/lib/settings"
import type { Supervisor, SupervisorStatus } from "@/lib/supervisors"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"

export type NamedOption = { id: string; name: string }

export type AdminIntern = Intern & {
  programmeId: string | null
  supervisorId: string | null
}

export type AdminSupervisor = Supervisor & {
  programmeIds: string[]
}

export type AdminProgramme = Programme & {
  leadId: string | null
}

export type AdminOverview = {
  internCount: number
  activeInternCount: number
  supervisorCount: number
  activeProgrammeCount: number
  reportCount: number
  bar: { month: string; interns: number; supervisors: number }[]
  pie: { name: string; value: number }[]
  activity: { title: string; detail: string; time: string; href: string }[]
  enrolments: AdminIntern[]
}

function monthKey(value: string) {
  const date = new Date(value)
  return `${date.getFullYear()}-${date.getMonth()}`
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.max(0, Math.round(diff / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days === 1) return "Yesterday"
  return `${days}d ago`
}

async function db() {
  return createClient(await cookies())
}

export async function loadAdminInterns(): Promise<{
  interns: AdminIntern[]
  programmes: NamedOption[]
  supervisors: NamedOption[]
  error: string | null
}> {
  const supabase = await db()
  const [internsResult, programmesResult, supervisorsResult] = await Promise.all([
    supabase
      .from("interns")
      .select(
        "id, start_date, end_date, progress, status, programme_id, supervisor_id, profiles!interns_id_fkey(full_name, email), programme:programmes(name), mentor:profiles!interns_supervisor_id_fkey(full_name)"
      )
      .order("created_at", { ascending: false }),
    supabase.from("programmes").select("id, name, cohort").order("name"),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "supervisor")
      .order("full_name"),
  ])

  const error =
    internsResult.error?.message ??
    programmesResult.error?.message ??
    supervisorsResult.error?.message ??
    null

  const interns: AdminIntern[] = (internsResult.data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    const programme = Array.isArray(row.programme) ? row.programme[0] : row.programme
    const mentor = Array.isArray(row.mentor) ? row.mentor[0] : row.mentor
    return {
      id: row.id,
      name: profile?.full_name ?? "",
      email: profile?.email ?? "",
      programme: programme?.name ?? "Unassigned",
      supervisor: mentor?.full_name ?? "Unassigned",
      startDate: row.start_date ?? "",
      endDate: row.end_date ?? "",
      progress: row.progress ?? 0,
      status: row.status as InternStatus,
      programmeId: row.programme_id,
      supervisorId: row.supervisor_id,
    }
  })

  const programmes: NamedOption[] = (programmesResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.cohort ? `${row.name} · ${row.cohort}` : row.name,
  }))

  const supervisors: NamedOption[] = [
    { id: "", name: "Unassigned" },
    ...(supervisorsResult.data ?? []).map((row) => ({
      id: row.id,
      name: row.full_name,
    })),
  ]

  return { interns, programmes, supervisors, error }
}

export async function loadAdminSupervisors(): Promise<{
  supervisors: AdminSupervisor[]
  programmes: NamedOption[]
  assignedCounts: Record<string, number>
  error: string | null
}> {
  const supabase = await db()
  const [supervisorsResult, programmesResult, internsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, email, phone, title, department, capacity, supervisor_status, supervisor_start_date, supervisor_programmes(programme_id, programmes(name, cohort))"
      )
      .eq("role", "supervisor")
      .order("full_name"),
    supabase.from("programmes").select("id, name, cohort").order("name"),
    supabase.from("interns").select("supervisor_id, status"),
  ])

  const error =
    supervisorsResult.error?.message ??
    programmesResult.error?.message ??
    internsResult.error?.message ??
    null

  const assignedCounts: Record<string, number> = {}
  for (const intern of internsResult.data ?? []) {
    if (!intern.supervisor_id || intern.status === "Completed") continue
    assignedCounts[intern.supervisor_id] =
      (assignedCounts[intern.supervisor_id] ?? 0) + 1
  }

  const supervisors: AdminSupervisor[] = (supervisorsResult.data ?? []).map(
    (row) => {
      const links = row.supervisor_programmes ?? []
      const programmeIds = links
        .map((link) => link.programme_id)
        .filter((id): id is string => Boolean(id))
      const programmes = links
        .map((link) => {
          const programme = Array.isArray(link.programmes)
            ? link.programmes[0]
            : link.programmes
          if (!programme?.name) return null
          return programme.cohort
            ? `${programme.name} · ${programme.cohort}`
            : programme.name
        })
        .filter((name): name is string => Boolean(name))

      return {
        id: row.id,
        name: row.full_name,
        email: row.email,
        phone: row.phone,
        title: row.title,
        department: row.department,
        programmes,
        programmeIds,
        capacity: row.capacity ?? 0,
        startDate: row.supervisor_start_date ?? "",
        status: (row.supervisor_status ?? "Active") as SupervisorStatus,
      }
    }
  )

  const programmes: NamedOption[] = (programmesResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.cohort ? `${row.name} · ${row.cohort}` : row.name,
  }))

  return { supervisors, programmes, assignedCounts, error }
}

export async function loadAdminProgrammes(): Promise<{
  programmes: AdminProgramme[]
  leads: NamedOption[]
  enrolledCounts: Record<string, number>
  error: string | null
}> {
  const supabase = await db()
  const [programmesResult, leadsResult, internsResult] = await Promise.all([
    supabase
      .from("programmes")
      .select(
        "id, name, cohort, description, start_date, end_date, capacity, status, lead_supervisor_id, lead:profiles!programmes_lead_supervisor_id_fkey(full_name)"
      )
      .order("start_date", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "supervisor")
      .order("full_name"),
    supabase.from("interns").select("programme_id, status"),
  ])

  const error =
    programmesResult.error?.message ??
    leadsResult.error?.message ??
    internsResult.error?.message ??
    null

  const enrolledCounts: Record<string, number> = {}
  for (const intern of internsResult.data ?? []) {
    if (!intern.programme_id || intern.status === "Completed") continue
    enrolledCounts[intern.programme_id] =
      (enrolledCounts[intern.programme_id] ?? 0) + 1
  }

  const programmes: AdminProgramme[] = (programmesResult.data ?? []).map((row) => {
    const lead = Array.isArray(row.lead) ? row.lead[0] : row.lead
    return {
      id: row.id,
      name: row.name,
      cohort: row.cohort,
      description: row.description,
      leadSupervisor: lead?.full_name ?? "Unassigned",
      leadId: row.lead_supervisor_id,
      startDate: row.start_date ?? "",
      endDate: row.end_date ?? "",
      capacity: row.capacity,
      status: row.status as ProgrammeStatus,
    }
  })

  return {
    programmes,
    leads: (leadsResult.data ?? []).map((row) => ({
      id: row.id,
      name: row.full_name,
    })),
    enrolledCounts,
    error,
  }
}

export async function loadAdminReports(): Promise<{
  reports: ReportView[]
  error: string | null
}> {
  const [interns, supervisors, programmes] = await Promise.all([
    loadAdminInterns(),
    loadAdminSupervisors(),
    loadAdminProgrammes(),
  ])
  const error = interns.error ?? supervisors.error ?? programmes.error
  return {
    error,
    reports: buildReportViews({
      interns: interns.interns,
      supervisors: supervisors.supervisors.map((supervisor) => ({
        ...supervisor,
        assigned: supervisors.assignedCounts[supervisor.id] ?? 0,
      })),
      programmes: programmes.programmes.map((programme) => ({
        ...programme,
        enrolled: programmes.enrolledCounts[programme.id] ?? 0,
      })),
    }),
  }
}

export async function loadAdminOverview(): Promise<{
  overview: AdminOverview
  error: string | null
}> {
  const [interns, supervisors, programmes] = await Promise.all([
    loadAdminInterns(),
    loadAdminSupervisors(),
    loadAdminProgrammes(),
  ])
  const error = interns.error ?? supervisors.error ?? programmes.error
  const supabase = await db()
  const created = await supabase
    .from("interns")
    .select("created_at, profiles!interns_id_fkey(full_name), programme:programmes(name)")
    .order("created_at", { ascending: false })
    .limit(3)

  const now = new Date()
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    return date
  })

  const internCreated = await supabase.from("interns").select("created_at")
  const supervisorCreated = await supabase
    .from("profiles")
    .select("created_at")
    .eq("role", "supervisor")

  const bar = months.map((month) => {
    const key = `${month.getFullYear()}-${month.getMonth()}`
    return {
      month: month.toLocaleDateString("en-ZA", { month: "long" }),
      interns: (internCreated.data ?? []).filter(
        (row) => row.created_at && monthKey(row.created_at) === key
      ).length,
      supervisors: (supervisorCreated.data ?? []).filter(
        (row) => row.created_at && monthKey(row.created_at) === key
      ).length,
    }
  })

  const pieMap = new Map<string, number>()
  for (const intern of interns.interns) {
    if (intern.status !== "Active") continue
    pieMap.set(intern.programme, (pieMap.get(intern.programme) ?? 0) + 1)
  }

  const activity = (created.data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    const programme = Array.isArray(row.programme) ? row.programme[0] : row.programme
    return {
      title: "Intern enrolled",
      detail: `${profile?.full_name ?? "Intern"} — ${programme?.name ?? "Unassigned"}`,
      time: row.created_at ? relativeTime(row.created_at) : "",
      href: "/admin/interns",
    }
  })

  return {
    error: error ?? created.error?.message ?? internCreated.error?.message ?? supervisorCreated.error?.message ?? null,
    overview: {
      internCount: interns.interns.length,
      activeInternCount: interns.interns.filter((intern) => intern.status === "Active").length,
      supervisorCount: supervisors.supervisors.length,
      activeProgrammeCount: programmes.programmes.filter(
        (programme) => programme.status === "Active"
      ).length,
      reportCount: 4,
      bar,
      pie: Array.from(pieMap, ([name, value]) => ({ name, value })),
      activity,
      enrolments: interns.interns.slice(0, 12),
    },
  }
}

export async function loadAdminSettings(): Promise<{
  settings: RoleSettings
  error: string | null
}> {
  const profile = await requireRole("admin")
  const supabase = await db()
  const defaults = getDefaultSettings("admin")
  const [userSettings, orgSettings] = await Promise.all([
    supabase
      .from("user_settings")
      .select("notifications, preferences, privacy")
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase
      .from("org_settings")
      .select(
        "organisation_name, default_intern_capacity, require_enrolment_approval, log_reminder_hour, report_retention_days"
      )
      .eq("id", true)
      .maybeSingle(),
  ])
  const org = orgSettings.data
  return {
    error: userSettings.error?.message ?? orgSettings.error?.message ?? null,
    settings: {
      notifications: {
        ...defaults.notifications,
        ...((userSettings.data?.notifications ?? {}) as RoleSettings["notifications"]),
      },
      preferences: {
        ...defaults.preferences,
        ...((userSettings.data?.preferences ?? {}) as RoleSettings["preferences"]),
      },
      privacy: {
        ...defaults.privacy,
        ...((userSettings.data?.privacy ?? {}) as RoleSettings["privacy"]),
      },
      organisation: {
        organisationName:
          org?.organisation_name ?? defaults.organisation!.organisationName,
        defaultInternCapacity:
          org?.default_intern_capacity ??
          defaults.organisation!.defaultInternCapacity,
        requireEnrolmentApproval:
          org?.require_enrolment_approval ??
          defaults.organisation!.requireEnrolmentApproval,
        logReminderHour:
          org?.log_reminder_hour ?? defaults.organisation!.logReminderHour,
        reportRetentionDays:
          org?.report_retention_days ??
          defaults.organisation!.reportRetentionDays,
      },
    },
  }
}
