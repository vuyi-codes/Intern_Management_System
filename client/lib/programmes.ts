import { interns, PROGRAMMES as PROGRAMME_NAMES } from "@/lib/interns"
import { supervisors } from "@/lib/supervisors"

export type ProgrammeStatus = "Active" | "Upcoming" | "Completed" | "Paused"

export type Programme = {
  id: string
  name: string
  cohort: string
  description: string
  leadSupervisor: string
  startDate: string
  endDate: string
  capacity: number
  status: ProgrammeStatus
}

export const PROGRAMME_STATUS_STYLES: Record<ProgrammeStatus, string> = {
  Active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Upcoming: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  Completed: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400",
  Paused: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
}

export const programmes: Programme[] = [
  {
    id: "prg-001",
    name: "Software Engineering",
    cohort: "Winter 2026",
    description: "Full-stack engineering track covering APIs, databases, and delivery.",
    leadSupervisor: "Jordan Peters",
    startDate: "2026-01-12",
    endDate: "2026-07-12",
    capacity: 12,
    status: "Active",
  },
  {
    id: "prg-002",
    name: "Frontend Development",
    cohort: "Winter 2026",
    description: "UI engineering with React, accessibility, and design systems.",
    leadSupervisor: "Aisha Naidoo",
    startDate: "2026-01-20",
    endDate: "2026-07-20",
    capacity: 10,
    status: "Active",
  },
  {
    id: "prg-003",
    name: "Backend Development",
    cohort: "Winter 2026",
    description: "Services, auth, data modelling, and API design.",
    leadSupervisor: "Jordan Peters",
    startDate: "2026-02-03",
    endDate: "2026-08-03",
    capacity: 8,
    status: "Active",
  },
  {
    id: "prg-004",
    name: "UI/UX Design",
    cohort: "Winter 2026",
    description: "Product design, research, and high-fidelity prototyping.",
    leadSupervisor: "Maya Chen",
    startDate: "2026-02-17",
    endDate: "2026-08-17",
    capacity: 8,
    status: "Active",
  },
  {
    id: "prg-005",
    name: "Software Engineering",
    cohort: "Summer 2025",
    description: "Completed summer cohort for software engineering interns.",
    leadSupervisor: "Maya Chen",
    startDate: "2025-06-02",
    endDate: "2025-12-02",
    capacity: 10,
    status: "Completed",
  },
  {
    id: "prg-006",
    name: "Frontend Development",
    cohort: "Autumn 2026",
    description: "Next intake focused on advanced frontend delivery.",
    leadSupervisor: "Aisha Naidoo",
    startDate: "2026-09-07",
    endDate: "2027-03-07",
    capacity: 12,
    status: "Upcoming",
  },
  {
    id: "prg-007",
    name: "Backend Development",
    cohort: "Spring 2026",
    description: "Paused while supervisor coverage is rebalanced.",
    leadSupervisor: "Samir Patel",
    startDate: "2026-04-06",
    endDate: "2026-10-06",
    capacity: 6,
    status: "Paused",
  },
]

export function formatProgrammeDate(value: string) {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function getProgrammeInternCount(programmeName: string) {
  return interns.filter(
    (intern) =>
      intern.programme === programmeName && intern.status !== "Completed"
  ).length
}

export function getProgrammeLeadOptions() {
  const names = new Set(supervisors.map((supervisor) => supervisor.name))
  return Array.from(names)
}

export { PROGRAMME_NAMES }
