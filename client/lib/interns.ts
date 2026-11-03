export type InternStatus = "Active" | "Onboarding" | "Paused" | "Completed"

export type Intern = {
  id: string
  name: string
  email: string
  programme: string
  supervisor: string
  startDate: string
  endDate: string
  progress: number
  status: InternStatus
}

export const PROGRAMMES = [
  "Software Engineering",
  "Frontend Development",
  "Backend Development",
  "UI/UX Design",
] as const

export const SUPERVISORS = [
  "Jordan Peters",
  "Aisha Naidoo",
  "Maya Chen",
  "Unassigned",
] as const

export const STATUS_STYLES: Record<InternStatus, string> = {
  Active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Onboarding: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  Paused: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Completed: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400",
}

export const interns: Intern[] = [
  {
    id: "int-001",
    name: "Nomsa Khumalo",
    email: "nomsa.khumalo@inkdot.com",
    programme: "Software Engineering",
    supervisor: "Jordan Peters",
    startDate: "2026-01-12",
    endDate: "2026-07-12",
    progress: 68,
    status: "Active",
  },
  {
    id: "int-002",
    name: "Thabo Molefe",
    email: "thabo.molefe@inkdot.com",
    programme: "Frontend Development",
    supervisor: "Aisha Naidoo",
    startDate: "2026-01-20",
    endDate: "2026-07-20",
    progress: 54,
    status: "Active",
  },
  {
    id: "int-003",
    name: "Lerato Dlamini",
    email: "lerato.dlamini@inkdot.com",
    programme: "Backend Development",
    supervisor: "Jordan Peters",
    startDate: "2026-02-03",
    endDate: "2026-08-03",
    progress: 22,
    status: "Onboarding",
  },
  {
    id: "int-004",
    name: "Sipho Nkosi",
    email: "sipho.nkosi@inkdot.com",
    programme: "Software Engineering",
    supervisor: "Maya Chen",
    startDate: "2026-02-10",
    endDate: "2026-08-10",
    progress: 61,
    status: "Active",
  },
  {
    id: "int-005",
    name: "Ayanda Mokoena",
    email: "ayanda.mokoena@inkdot.com",
    programme: "UI/UX Design",
    supervisor: "Aisha Naidoo",
    startDate: "2026-02-17",
    endDate: "2026-08-17",
    progress: 47,
    status: "Active",
  },
  {
    id: "int-006",
    name: "Kagiso Petersen",
    email: "kagiso.petersen@inkdot.com",
    programme: "Frontend Development",
    supervisor: "Maya Chen",
    startDate: "2026-03-02",
    endDate: "2026-09-02",
    progress: 31,
    status: "Paused",
  },
  {
    id: "int-007",
    name: "Zanele Botha",
    email: "zanele.botha@inkdot.com",
    programme: "Backend Development",
    supervisor: "Jordan Peters",
    startDate: "2026-03-09",
    endDate: "2026-09-09",
    progress: 44,
    status: "Active",
  },
  {
    id: "int-008",
    name: "Dominic van Wyk",
    email: "dominic.vanwyk@inkdot.com",
    programme: "Software Engineering",
    supervisor: "Aisha Naidoo",
    startDate: "2026-03-16",
    endDate: "2026-09-16",
    progress: 18,
    status: "Onboarding",
  },
  {
    id: "int-009",
    name: "Refilwe Sithole",
    email: "refilwe.sithole@inkdot.com",
    programme: "UI/UX Design",
    supervisor: "Maya Chen",
    startDate: "2026-03-23",
    endDate: "2026-09-23",
    progress: 52,
    status: "Active",
  },
  {
    id: "int-010",
    name: "Ethan Jacobs",
    email: "ethan.jacobs@inkdot.com",
    programme: "Frontend Development",
    supervisor: "Jordan Peters",
    startDate: "2026-04-06",
    endDate: "2026-10-06",
    progress: 39,
    status: "Active",
  },
  {
    id: "int-011",
    name: "Palesa Moeketsi",
    email: "palesa.moeketsi@inkdot.com",
    programme: "Backend Development",
    supervisor: "Aisha Naidoo",
    startDate: "2026-04-13",
    endDate: "2026-10-13",
    progress: 41,
    status: "Active",
  },
  {
    id: "int-012",
    name: "Connor Naicker",
    email: "connor.naicker@inkdot.com",
    programme: "Software Engineering",
    supervisor: "Maya Chen",
    startDate: "2026-04-20",
    endDate: "2026-10-20",
    progress: 12,
    status: "Onboarding",
  },
  {
    id: "int-013",
    name: "Amina Ndlovu",
    email: "amina.ndlovu@inkdot.com",
    programme: "Frontend Development",
    supervisor: "Jordan Peters",
    startDate: "2025-10-01",
    endDate: "2026-04-01",
    progress: 100,
    status: "Completed",
  },
  {
    id: "int-014",
    name: "Lebo Maseko",
    email: "lebo.maseko@inkdot.com",
    programme: "UI/UX Design",
    supervisor: "Unassigned",
    startDate: "2026-05-04",
    endDate: "2026-11-04",
    progress: 8,
    status: "Onboarding",
  },
]

export function formatInternDate(value: string) {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function getInternInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
