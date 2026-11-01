"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GalleryVerticalEnd } from "lucide-react"

import { NavUser } from "@/components/nav-user"
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

// Placeholder until real auth is added.
const usersByRole = {
  intern: {
    name: "Intern User",
    email: "intern@inkdot.com",
  },
  supervisor: {
    name: "Supervisor User",
    email: "supervisor@inkdot.com",
  },
  admin: {
    name: "Admin User",
    email: "admin@inkdot.com",
  },
} as const

export function AppSidebar() {
  const pathname = usePathname()

  // Role comes from the first URL segment, e.g. /supervisor/tasks -> supervisor.
  const role = getRoleFromPathname(pathname) ?? "admin"
  const items = getNavForRole(role)
  const user = usersByRole[role]

  // Split the links: normal ones go in the main list, "bottom" ones
  // (like Settings) go in the footer above the user menu.
  const mainItems = items.filter((item) => item.placement !== "bottom")
  const bottomItems = items.filter((item) => item.placement === "bottom")

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="rounded-sm"
              render={<Link href={`/${role}`} />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
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
        {bottomItems.length > 0 && (
          <SidebarMenu className="gap-1">
            {bottomItems.map((item) => (
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
        )}
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}