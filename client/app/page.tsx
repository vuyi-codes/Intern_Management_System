import { Suspense } from "react"
import { connection } from "next/server"
import { redirect } from "next/navigation"

import { dashboardPathForRole, getCurrentProfile } from "@/lib/auth"

export const instant = false

async function HomeRedirect() {
  await connection()
  const profile = await getCurrentProfile()
  if (!profile) redirect("/login")
  redirect(dashboardPathForRole(profile.role))
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Redirecting…</p>
        </main>
      }
    >
      <HomeRedirect />
    </Suspense>
  )
}
