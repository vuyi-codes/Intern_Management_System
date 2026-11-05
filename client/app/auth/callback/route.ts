import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

import { dashboardPathForRole } from "@/lib/auth"
import type { Role } from "@/lib/nav"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next")

  if (code) {
    const supabase = createClient(await cookies())
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle()

      const role = profile?.role as Role | undefined
      const destination =
        next && next.startsWith("/")
          ? next
          : role === "admin" || role === "supervisor" || role === "intern"
            ? dashboardPathForRole(role)
            : "/login"

      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`)
}
