import {
  BarChart3,
  CalendarRange,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  NotebookPen,
  ScrollText,
  Settings,
  TrendingUp,
  User,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react"

export type Role = "intern" | "supervisor" | "admin"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  // Items marked "bottom" are shown in the sidebar footer, above the user menu.
  placement?: "bottom"
}

export const roleLabels: Record<Role, string> = {
  intern: "Intern",
  supervisor: "Supervisor",
  admin: "Admin",
}

export const navByRole: Record<Role, NavItem[]> = {
  intern: [
    { title: "Overview", href: "/intern", icon: LayoutDashboard },
    { title: "My Tasks", href: "/intern/tasks", icon: ListTodo },
    { title: "Daily Log", href: "/intern/daily-log", icon: NotebookPen },
    { title: "Progress", href: "/intern/progress", icon: TrendingUp },
    { title: "Profile", href: "/intern/profile", icon: User },
    {
      title: "Settings",
      href: "/intern/settings",
      icon: Settings,
      placement: "bottom",
    },
  ],
  supervisor: [
    { title: "Overview", href: "/supervisor", icon: LayoutDashboard },
    { title: "My Interns", href: "/supervisor/interns", icon: Users },
    { title: "Tasks", href: "/supervisor/tasks", icon: ListTodo },
    { title: "Reviews", href: "/supervisor/reviews", icon: ClipboardCheck },
    { title: "Daily Logs", href: "/supervisor/logs", icon: ScrollText },
    {
      title: "Settings",
      href: "/supervisor/settings",
      icon: Settings,
      placement: "bottom",
    },
  ],
  admin: [
    { title: "Overview", href: "/admin", icon: LayoutDashboard },
    { title: "Interns", href: "/admin/interns", icon: GraduationCap },
    { title: "Supervisors", href: "/admin/supervisors", icon: UserCog },
    { title: "Programmes", href: "/admin/programmes", icon: CalendarRange },
    { title: "Reports", href: "/admin/reports", icon: BarChart3 },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
      placement: "bottom",
    },
  ],
}

export function getNavForRole(role: Role): NavItem[] {
  return navByRole[role]
}

// The first segment of the URL tells us which dashboard we're in,
// e.g. "/supervisor/tasks" -> "supervisor". Returns null for anything else.
export function getRoleFromPathname(pathname: string): Role | null {
  const segment = pathname.split("/")[1]
  return segment === "intern" || segment === "supervisor" || segment === "admin"
    ? segment
    : null
}

// Overview links (/intern, /supervisor, /admin) should only be active on an
// exact match, otherwise they'd be highlighted on every page in that section.
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const isOverview = item.href.split("/").length === 2
  return isOverview
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`)
}