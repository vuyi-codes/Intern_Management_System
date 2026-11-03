import { interns } from "@/lib/interns"
import { programmes } from "@/lib/programmes"
import { supervisors } from "@/lib/supervisors"

export type ReportColumn = {
  key: string
  label: string
}

export type ReportRow = Record<string, string | number>

export type ReportId =
  | "interns-overview"
  | "supervisor-capacity"
  | "programme-enrolment"
  | "status-summary"

export type ReportDefinition = {
  id: ReportId
  title: string
  description: string
  category: "People" | "Programmes" | "Operations"
  columns: ReportColumn[]
  buildRows: () => ReportRow[]
}

function countByStatus() {
  const counts = {
    Active: 0,
    Onboarding: 0,
    Paused: 0,
    Completed: 0,
  }
  for (const intern of interns) {
    counts[intern.status] += 1
  }
  return counts
}

export const reportDefinitions: ReportDefinition[] = [
  {
    id: "interns-overview",
    title: "Interns overview",
    description: "All interns with programme, supervisor, progress, and status.",
    category: "People",
    columns: [
      { key: "name", label: "Intern" },
      { key: "email", label: "Email" },
      { key: "programme", label: "Programme" },
      { key: "supervisor", label: "Supervisor" },
      { key: "startDate", label: "Start date" },
      { key: "progress", label: "Progress %" },
      { key: "status", label: "Status" },
    ],
    buildRows: () =>
      interns.map((intern) => ({
        name: intern.name,
        email: intern.email,
        programme: intern.programme,
        supervisor: intern.supervisor,
        startDate: intern.startDate,
        progress: intern.progress,
        status: intern.status,
      })),
  },
  {
    id: "supervisor-capacity",
    title: "Supervisor capacity",
    description: "Supervisor load versus capacity across departments.",
    category: "People",
    columns: [
      { key: "name", label: "Supervisor" },
      { key: "department", label: "Department" },
      { key: "assigned", label: "Assigned interns" },
      { key: "capacity", label: "Capacity" },
      { key: "utilisation", label: "Utilisation %" },
      { key: "status", label: "Status" },
    ],
    buildRows: () =>
      supervisors.map((supervisor) => {
        const assigned = interns.filter(
          (intern) =>
            intern.supervisor === supervisor.name &&
            intern.status !== "Completed"
        ).length
        const utilisation = Math.round(
          (assigned / Math.max(supervisor.capacity, 1)) * 100
        )
        return {
          name: supervisor.name,
          department: supervisor.department,
          assigned,
          capacity: supervisor.capacity,
          utilisation,
          status: supervisor.status,
        }
      }),
  },
  {
    id: "programme-enrolment",
    title: "Programme enrolment",
    description: "Cohort enrolment against programme capacity.",
    category: "Programmes",
    columns: [
      { key: "name", label: "Programme" },
      { key: "cohort", label: "Cohort" },
      { key: "leadSupervisor", label: "Lead" },
      { key: "enrolled", label: "Enrolled" },
      { key: "capacity", label: "Capacity" },
      { key: "startDate", label: "Start" },
      { key: "endDate", label: "End" },
      { key: "status", label: "Status" },
    ],
    buildRows: () =>
      programmes.map((programme) => {
        const enrolled = interns.filter(
          (intern) =>
            intern.programme === programme.name &&
            intern.status !== "Completed"
        ).length
        return {
          name: programme.name,
          cohort: programme.cohort,
          leadSupervisor: programme.leadSupervisor,
          enrolled,
          capacity: programme.capacity,
          startDate: programme.startDate,
          endDate: programme.endDate,
          status: programme.status,
        }
      }),
  },
  {
    id: "status-summary",
    title: "Status summary",
    description: "High-level counts for interns, supervisors, and programmes.",
    category: "Operations",
    columns: [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value" },
      { key: "notes", label: "Notes" },
    ],
    buildRows: () => {
      const internStatus = countByStatus()
      return [
        {
          metric: "Total interns",
          value: interns.length,
          notes: "All statuses",
        },
        {
          metric: "Active interns",
          value: internStatus.Active,
          notes: "In programme",
        },
        {
          metric: "Onboarding interns",
          value: internStatus.Onboarding,
          notes: "Recently enrolled",
        },
        {
          metric: "Paused interns",
          value: internStatus.Paused,
          notes: "Needs attention",
        },
        {
          metric: "Completed interns",
          value: internStatus.Completed,
          notes: "Finished track",
        },
        {
          metric: "Active supervisors",
          value: supervisors.filter((s) => s.status === "Active").length,
          notes: "Currently mentoring",
        },
        {
          metric: "Active programmes",
          value: programmes.filter((p) => p.status === "Active").length,
          notes: "Running cohorts",
        },
        {
          metric: "Upcoming programmes",
          value: programmes.filter((p) => p.status === "Upcoming").length,
          notes: "Scheduled intakes",
        },
      ]
    },
  },
]

export function getReportById(id: ReportId) {
  return reportDefinitions.find((report) => report.id === id)
}
