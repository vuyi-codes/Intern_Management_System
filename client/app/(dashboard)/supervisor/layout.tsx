import { Suspense } from "react"
import { connection } from "next/server"

import { requireRole } from "@/lib/auth"

async function SupervisorGuard({ children }: { children: React.ReactNode }) {
  await connection()
  await requireRole("supervisor")
  return children
}

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={null}>
      <SupervisorGuard>{children}</SupervisorGuard>
    </Suspense>
  )
}
