"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

import { NavbarSearch } from "@/components/navbar-search"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getRoleFromPathname } from "@/lib/nav"

// Client-only: these widgets touch Date.now() / DayPicker "today".
const CalendarDropdown = dynamic(
  () =>
    import("@/components/calendar-dropdown").then((mod) => mod.CalendarDropdown),
  { ssr: false }
)
const MessagesDrawer = dynamic(
  () =>
    import("@/components/messages-drawer").then((mod) => mod.MessagesDrawer),
  { ssr: false }
)

export function DashboardHeader() {
  const pathname = usePathname()
  const role = getRoleFromPathname(pathname)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <div className="ml-auto flex min-w-0 items-center gap-4">
        {role && <NavbarSearch role={role} />}
        {role && (
          <div className="shrink-0">
            <CalendarDropdown role={role} />
          </div>
        )}
        {role && (role === "intern" || role === "supervisor") && (
          <div className="shrink-0">
            <MessagesDrawer role={role} />
          </div>
        )}
      </div>
    </header>
  )
}
