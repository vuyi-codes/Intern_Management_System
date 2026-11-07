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

export type ReportView = {
  id: ReportId
  title: string
  description: string
  category: "People" | "Programmes" | "Operations"
  columns: ReportColumn[]
  rows: ReportRow[]
}

type ReportIntern = {
  name: string
  email: string
  programme: string
  supervisor: string
  startDate: string
  progress: number
  status: string
}

type ReportSupervisor = {
  name: string
  department: string
  capacity: number
  status: string
  assigned: number
}

type ReportProgramme = {
  name: string
  cohort: string
  leadSupervisor: string
  capacity: number
  startDate: string
  endDate: string
  status: string
  enrolled: number
}

export function buildReportViews(input: {
  interns: ReportIntern[]
  supervisors: ReportSupervisor[]
  programmes: ReportProgramme[]
}): ReportView[] {
  const internStatus = {
    Active: 0,
    Onboarding: 0,
    Paused: 0,
    Completed: 0,
  }
  for (const intern of input.interns) {
    if (intern.status in internStatus) {
      internStatus[intern.status as keyof typeof internStatus] += 1
    }
  }

  return [
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
      rows: input.interns.map((intern) => ({
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
      rows: input.supervisors.map((supervisor) => ({
        name: supervisor.name,
        department: supervisor.department,
        assigned: supervisor.assigned,
        capacity: supervisor.capacity,
        utilisation: Math.round(
          (supervisor.assigned / Math.max(supervisor.capacity, 1)) * 100
        ),
        status: supervisor.status,
      })),
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
      rows: input.programmes.map((programme) => ({
        name: programme.name,
        cohort: programme.cohort,
        leadSupervisor: programme.leadSupervisor,
        enrolled: programme.enrolled,
        capacity: programme.capacity,
        startDate: programme.startDate,
        endDate: programme.endDate,
        status: programme.status,
      })),
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
      rows: [
        { metric: "Total interns", value: input.interns.length, notes: "All statuses" },
        { metric: "Active interns", value: internStatus.Active, notes: "In programme" },
        { metric: "Onboarding interns", value: internStatus.Onboarding, notes: "Recently enrolled" },
        { metric: "Paused interns", value: internStatus.Paused, notes: "Needs attention" },
        { metric: "Completed interns", value: internStatus.Completed, notes: "Finished track" },
        {
          metric: "Active supervisors",
          value: input.supervisors.filter((supervisor) => supervisor.status === "Active").length,
          notes: "Currently mentoring",
        },
        {
          metric: "Active programmes",
          value: input.programmes.filter((programme) => programme.status === "Active").length,
          notes: "Running cohorts",
        },
        {
          metric: "Upcoming programmes",
          value: input.programmes.filter((programme) => programme.status === "Upcoming").length,
          notes: "Scheduled intakes",
        },
      ],
    },
  ]
}
