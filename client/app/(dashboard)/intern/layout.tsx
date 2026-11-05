import { Suspense } from "react"
import { connection } from "next/server"

import { requireRole } from "@/lib/auth"

async function InternGuard({ children }: { children: React.ReactNode }) {
  await connection()
  await requireRole("intern")
  return children
}

export default function InternLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={null}>
      <InternGuard>{children}</InternGuard>
    </Suspense>
  )
}
