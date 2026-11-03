import type { Role } from "@/lib/nav"

export type AppUser = {
  name: string
  email: string
  phone: string
  title: string
  department: string
  avatar?: string
}

// Placeholder until real auth is added.
export const usersByRole: Record<Role, AppUser> = {
  intern: {
    name: "Intern User",
    email: "intern@inkdot.com",
    phone: "+27 82 555 0142",
    title: "Software Engineering Intern",
    department: "Product Engineering",
  },
  supervisor: {
    name: "Jordan Peters",
    email: "jordan.peters@inkdot.com",
    phone: "+27 82 555 0198",
    title: "Senior Engineering Mentor",
    department: "Product Engineering",
  },
  admin: {
    name: "Admin User",
    email: "admin@inkdot.com",
    phone: "+27 82 555 0101",
    title: "Programme Administrator",
    department: "Operations",
  },
}

export function getUserForRole(role: Role): AppUser {
  return usersByRole[role]
}
