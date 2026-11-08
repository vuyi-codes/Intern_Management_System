"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"

import { AccountSettings } from "@/components/account-settings"
import { useTheme } from "@/hooks/use-theme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { signOut } from "@/app/actions/auth"
import { getRoleFromPathname, type Role } from "@/lib/nav"

type User = {
  name: string
  email: string
  avatar?: string
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function UserInfo({ user }: { user: User }) {
  return (
    <>
      <Avatar className="size-8 rounded-lg">
        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
        <AvatarFallback className="rounded-lg">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="truncate text-xs">{user.email}</span>
      </div>
    </>
  )
}

export function NavUser({ user }: { user: User }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile } = useSidebar()
  const role = (getRoleFromPathname(pathname) ?? "admin") as Role
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [accountOpen, setAccountOpen] = React.useState(false)
  const [avatar, setAvatar] = React.useState<string | undefined>(user.avatar)

  React.useEffect(() => {
    setAvatar(user.avatar)
  }, [user.avatar])

  React.useEffect(() => {
    function onAvatarChange(event: Event) {
      const detail = (event as CustomEvent<{ role: Role; src?: string }>).detail
      if (detail?.role === role) {
        setAvatar(detail.src)
      }
    }

    window.addEventListener("inkdot-avatar-change", onAvatarChange)
    return () =>
      window.removeEventListener("inkdot-avatar-change", onAvatarChange)
  }, [role])

  const displayUser = { ...user, avatar }

  async function handleLogout() {
    await signOut()
    router.push("/login")
  }

  function openAccount() {
    setMenuOpen(false)
    setAccountOpen(true)
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="rounded-sm aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
                />
              }
            >
              <UserInfo user={displayUser} />
              <ChevronsUpDown className="ml-auto size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={displayUser} />
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem onClick={openAccount}>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleTheme()}>
                  {theme === "dark" ? <Sun /> : <Moon />}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader>
            <DialogTitle>Account</DialogTitle>
            <DialogDescription>
              Manage your profile, avatar, and sign-in details.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto p-4">
            <AccountSettings role={role} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
