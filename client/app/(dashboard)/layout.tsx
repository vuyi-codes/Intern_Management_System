import { Suspense } from "react"
import { connection } from "next/server"

import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { InboxProvider } from "@/components/inbox-provider"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireAuth } from "@/lib/auth"

function DashboardFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">Loading workspace…</p>
    </div>
  )
}

async function AuthenticatedDashboard({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth/session code (and supabase-js) may read the current time.
  // Opt this shell into request-time rendering for Cache Components.
  await connection()
  const profile = await requireAuth()

  return (
    <InboxProvider>
      <SidebarProvider>
        <AppSidebar
          role={profile.role}
          user={{
            name: profile.full_name || profile.email,
            email: profile.email,
            avatar: profile.avatar_url ?? undefined,
          }}
        />
        <SidebarInset className="min-w-0">
          <DashboardHeader />
          <main className="min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </InboxProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  )
}
