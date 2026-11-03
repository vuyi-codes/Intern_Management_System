import { interns, PROGRAMMES } from "@/lib/interns"

export type SupervisorStatus = "Active" | "On leave" | "Inactive"

export type Supervisor = {
  id: string
  name: string
  email: string
  phone: string
  title: string
  department: string
  programmes: string[]
  capacity: number
  startDate: string
  status: SupervisorStatus
}

export const SUPERVISOR_STATUS_STYLES: Record<SupervisorStatus, string> = {
  Active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  "On leave": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Inactive: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400",
}

export const DEPARTMENTS = [
  "Product Engineering",
  "People & Learning",
  "Design",
  "Operations",
] as const

export const supervisors: Supervisor[] = [
  {
    id: "sup-001",
    name: "Jordan Peters",
    email: "jordan.peters@inkdot.com",
    phone: "+27 82 555 0111",
    title: "Senior Engineering Mentor",
    department: "Product Engineering",
    programmes: ["Software Engineering", "Frontend Development", "Backend Development"],
    capacity: 6,
    startDate: "2024-03-01",
    status: "Active",
  },
  {
    id: "sup-002",
    name: "Aisha Naidoo",
    email: "aisha.naidoo@inkdot.com",
    phone: "+27 82 555 0112",
    title: "Frontend Lead Mentor",
    department: "Product Engineering",
    programmes: ["Frontend Development", "UI/UX Design"],
    capacity: 5,
    startDate: "2024-06-15",
    status: "Active",
  },
  {
    id: "sup-003",
    name: "Maya Chen",
    email: "maya.chen@inkdot.com",
    phone: "+27 82 555 0113",
    title: "Programme Supervisor",
    department: "People & Learning",
    programmes: ["Software Engineering", "UI/UX Design", "Frontend Development"],
    capacity: 5,
    startDate: "2023-11-20",
    status: "Active",
  },
  {
    id: "sup-004",
    name: "Samir Patel",
    email: "samir.patel@inkdot.com",
    phone: "+27 82 555 0114",
    title: "Backend Mentor",
    department: "Product Engineering",
    programmes: ["Backend Development"],
    capacity: 4,
    startDate: "2025-01-10",
    status: "On leave",
  },
  {
    id: "sup-005",
    name: "Naledi Molefe",
    email: "naledi.molefe@inkdot.com",
    phone: "+27 82 555 0115",
    title: "Design Mentor",
    department: "Design",
    programmes: ["UI/UX Design"],
    capacity: 4,
    startDate: "2025-02-03",
    status: "Active",
  },
  {
    id: "sup-006",
    name: "Chris Okonkwo",
    email: "chris.okonkwo@inkdot.com",
    phone: "+27 82 555 0116",
    title: "Internship Supervisor",
    department: "Operations",
    programmes: ["Software Engineering"],
    capacity: 3,
    startDate: "2024-09-01",
    status: "Inactive",
  },
]

export function formatSupervisorDate(value: string) {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function getSupervisorInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function getAssignedInternCount(supervisorName: string) {
  return interns.filter(
    (intern) =>
      intern.supervisor === supervisorName &&
      intern.status !== "Completed"
  ).length
}

export { PROGRAMMES }
