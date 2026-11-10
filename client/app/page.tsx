import { Suspense } from "react"
import { connection } from "next/server"

import { HomeLanding } from "@/components/home-landing"
import { dashboardPathForRole, getCurrentProfile } from "@/lib/auth"

async function HomePageContent() {
  await connection()
  const profile = await getCurrentProfile()
  const dashboardHref = profile ? dashboardPathForRole(profile.role) : null

  return <HomeLanding dashboardHref={dashboardHref} />
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLanding />}>
      <HomePageContent />
    </Suspense>
  )
}
