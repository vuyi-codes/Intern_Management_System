"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HomeRedirect() {
  const router = useRouter()

  React.useEffect(() => {
    router.replace("/login")
  }, [router])

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 p-6">
      <p className="text-sm text-muted-foreground">Redirecting to sign in…</p>
      <Link href="/login" className={cn(buttonVariants())}>
        Continue to login
      </Link>
    </main>
  )
}
