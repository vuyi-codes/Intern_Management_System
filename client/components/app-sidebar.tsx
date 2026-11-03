"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { GalleryVerticalEnd } from "lucide-react"

import { DashboardSettings } from "@/components/dashboard-settings"
import { NavUser } from "@/components/nav-user"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  getNavForRole,
  getRoleFromPathname,
  isNavItemActive,
  roleLabels,
} from "@/lib/nav"
import { getUserForRole } from "@/lib/users"

export function AppSidebar() {
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  // Role comes from the first URL segment, e.g. /supervisor/tasks -> supervisor.
  const role = getRoleFromPathname(pathname) ?? "admin"
  const items = getNavForRole(role)
  const user = getUserForRole(role)

  const mainItems = items.filter((item) => item.placement !== "bottom")
  const footerItems = items.filter((item) => item.placement === "bottom")
  const settingsNav = footerItems.find((item) => item.title === "Settings")
  const remainingFooter = footerItems.filter(
    (item) => item.title !== "Settings"
  )

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="rounded-sm"
                render={<Link href={`/${role}`} />}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">InkDot Inc.</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Intern Management
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{roleLabels[role]}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      className="rounded-sm"
                      render={<Link href={item.href} />}
                      tooltip={item.title}
                      isActive={isNavItemActive(item, pathname)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          {(settingsNav || remainingFooter.length > 0) && (
            <SidebarMenu className="gap-1">
              {remainingFooter.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    className="rounded-sm"
                    render={<Link href={item.href} />}
                    tooltip={item.title}
                    isActive={isNavItemActive(item, pathname)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {settingsNav && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="rounded-sm"
                    tooltip={settingsNav.title}
                    isActive={settingsOpen}
                    onClick={() => setSettingsOpen(true)}
                  >
                    <settingsNav.icon />
                    <span>{settingsNav.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          )}
          <NavUser user={user} />
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl p-0">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage notifications, preferences, and privacy for your{" "}
              {roleLabels[role].toLowerCase()} workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <DashboardSettings role={role} embedded />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
