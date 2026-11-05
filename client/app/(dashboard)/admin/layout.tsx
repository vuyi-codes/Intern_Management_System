import { Suspense } from "react"
import { connection } from "next/server"

import { requireRole } from "@/lib/auth"

async function AdminGuard({ children }: { children: React.ReactNode }) {
  await connection()
  await requireRole("admin")
  return children
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={null}>
      <AdminGuard>{children}</AdminGuard>
    </Suspense>
  )
}
