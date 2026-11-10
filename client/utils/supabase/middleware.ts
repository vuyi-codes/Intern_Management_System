import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import type { Role } from "@/lib/nav"
import type { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

function dashboardPathForRole(role: Role) {
  return `/${role}`
}

function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/auth") ||
    pathname === "/"
  )
}

function roleFromPath(pathname: string): Role | null {
  const segment = pathname.split("/")[1]
  if (segment === "admin" || segment === "supervisor" || segment === "intern") {
    return segment
  }
  return null
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value)
        )
      },
    },
  })

  // Refresh / verify the session — do not replace with getSession().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  // Redirecting server-action / RSC POSTs breaks the flight response and
  // surfaces as: "An unexpected response was received from the server."
  const isServerAction = request.headers.has("next-action")
  const isMutableRequest = request.method !== "GET" && request.method !== "HEAD"

  if (!user && !isPublicPath(pathname) && !isServerAction) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // Keep `/` as the public homepage. Only bounce signed-in users off `/login`.
  if (user && pathname === "/login" && !isServerAction && !isMutableRequest) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    const role = profile?.role as Role | undefined
    const url = request.nextUrl.clone()
    url.pathname =
      role === "admin" || role === "supervisor" || role === "intern"
        ? dashboardPathForRole(role)
        : "/login"
    return NextResponse.redirect(url)
  }

  const pathRole = roleFromPath(pathname)
  if (user && pathRole && !isServerAction && !isMutableRequest) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    const role = profile?.role as Role | undefined
    if (
      role === "admin" ||
      role === "supervisor" ||
      role === "intern"
    ) {
      if (role !== pathRole) {
        const url = request.nextUrl.clone()
        url.pathname = dashboardPathForRole(role)
        return NextResponse.redirect(url)
      }
    } else {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
