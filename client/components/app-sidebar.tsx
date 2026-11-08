"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, GalleryVerticalEnd } from "lucide-react"

import { DashboardSettings } from "@/components/dashboard-settings"
import { CountBadge, useInbox } from "@/components/inbox-provider"
import { NavUser } from "@/components/nav-user"
import { NotificationsPanel } from "@/components/notifications-panel"
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
  isNavItemActive,
  roleLabels,
  type Role,
} from "@/lib/nav"

type SidebarUser = {
  name: string
  email: string
  avatar?: string
}

type AppSidebarProps = {
  role: Role
  user: SidebarUser
}

export function AppSidebar({ role, user }: AppSidebarProps) {
  const pathname = usePathname()
  const { unreadNotifications, refreshInbox } = useInbox()
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)

  const items = getNavForRole(role)

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
            <SidebarMenuItem>
              <SidebarMenuButton
                className="rounded-sm"
                tooltip={
                  unreadNotifications > 0
                    ? `Notifications (${unreadNotifications})`
                    : "Notifications"
                }
                isActive={notificationsOpen}
                onClick={() => setNotificationsOpen(true)}
              >
                <span className="relative">
                  <Bell />
                  <CountBadge count={unreadNotifications} />
                </span>
                <span>Notifications</span>
                {unreadNotifications > 0 ? (
                  <span className="ml-auto text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                    {unreadNotifications}
                  </span>
                ) : null}
              </SidebarMenuButton>
            </SidebarMenuItem>
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
          <NavUser user={user} />
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <Dialog
        open={notificationsOpen}
        onOpenChange={(next) => {
          setNotificationsOpen(next)
          if (!next) void refreshInbox()
        }}
      >
        <DialogContent className="max-w-md p-0">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              Recent updates for your {roleLabels[role].toLowerCase()}{" "}
              workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto">
            <NotificationsPanel role={role} />
          </div>
        </DialogContent>
      </Dialog>

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
