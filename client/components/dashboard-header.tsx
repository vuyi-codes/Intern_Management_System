"use client"

import { usePathname } from "next/navigation"

import { MessagesDrawer } from "@/components/messages-drawer"
import { NavbarSearch } from "@/components/navbar-search"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getRoleFromPathname } from "@/lib/nav"

export function DashboardHeader() {
  const pathname = usePathname()
  const role = getRoleFromPathname(pathname)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <div className="ml-auto flex min-w-0 items-center gap-2">
        {role && <NavbarSearch role={role} />}
        {role && (role === "intern" || role === "supervisor") && (
          <div className="shrink-0">
            <MessagesDrawer role={role} />
          </div>
        )}
      </div>
    </header>
  )
}
