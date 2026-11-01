"use client"

import { usePathname } from "next/navigation"

import { MessagesDrawer } from "@/components/messages-drawer"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getRoleFromPathname } from "@/lib/nav"

export function DashboardHeader() {
  const pathname = usePathname()
  const role = getRoleFromPathname(pathname)
  const showMessages = role === "intern" || role === "supervisor"

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      {showMessages && (
        <div className="ml-auto">
          <MessagesDrawer role={role} />
        </div>
      )}
    </header>
  )
}
